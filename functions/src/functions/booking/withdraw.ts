// 부킹 참가 철회 Cloud Function (참가자 전용)
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAuth } from "../../utils/auth";
import { sendPushNotification } from "../../utils/notifications";
import { REGION } from "../../config/environment";

export const bookingWithdraw = onCall(
  { region: REGION },
  async (request) => {
    const callerUid = requireAuth(request);
    const { bookingId } = request.data;

    if (!bookingId) {
      throw new HttpsError(
        "invalid-argument",
        "부킹 ID가 필요합니다."
      );
    }

    const db = admin.firestore();
    const bookingRef = db.collection("bookings").doc(bookingId);

    // Transaction으로 원자적 처리
    const bookingTitle = await db.runTransaction(async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);

      if (!bookingDoc.exists) {
        throw new HttpsError("not-found", "부킹을 찾을 수 없습니다.");
      }

      const data = bookingDoc.data()!;

      // 호스트는 참가 철회 불가
      if (data.hostId === callerUid) {
        throw new HttpsError(
          "failed-precondition",
          "호스트는 참가 철회가 불가합니다. 모임 취소를 이용해 주세요."
        );
      }

      // 참가자 목록에 있는지 확인
      const participantsList: string[] = data.participants?.list || [];
      if (!participantsList.includes(callerUid)) {
        throw new HttpsError(
          "failed-precondition",
          "참가 중인 모임이 아닙니다."
        );
      }

      // 참가자 제거 + 인원 감소
      const newCount = (data.participants?.current || 1) - 1;
      const updateData: Record<string, any> = {
        "participants.current": newCount,
        "participants.list": admin.firestore.FieldValue.arrayRemove(callerUid),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // full → open 상태로 복귀
      if (data.status === "full") {
        updateData.status = "open";
      }

      transaction.update(bookingRef, updateData);

      return data.title || data.course || "골프 모임";
    });

    // 참가 기록 상태 업데이트 (Transaction 밖)
    try {
      const participantSnapshot = await db
        .collection("bookingParticipants")
        .where("bookingId", "==", bookingId)
        .where("userId", "==", callerUid)
        .limit(1)
        .get();

      if (!participantSnapshot.empty) {
        await participantSnapshot.docs[0].ref.update({
          status: "withdrawn",
          withdrawnAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch {
      // 기록 업데이트 실패 무시
    }

    // 사용자 통계 감소
    try {
      await db.collection("users").doc(callerUid).update({
        "stats.joinedBookings": admin.firestore.FieldValue.increment(-1),
      });
    } catch {
      // 통계 업데이트 실패 무시
    }

    // 호스트에게 알림
    try {
      const bookingDoc = await bookingRef.get();
      const hostId = bookingDoc.data()?.hostId;
      if (hostId) {
        await sendPushNotification(
          hostId,
          "booking_cancelled",
          "참가 철회 알림",
          `"${bookingTitle}" 모임에서 참가자가 철회하였습니다.`,
          { bookingId }
        );
      }
    } catch {
      // 알림 실패 무시
    }

    return {
      success: true,
      message: "참가가 철회되었습니다.",
    };
  }
);
