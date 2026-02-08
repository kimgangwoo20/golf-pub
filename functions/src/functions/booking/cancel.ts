// 부킹 취소 Cloud Function (호스트 전용)
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAuth } from "../../utils/auth";
import { sendPushNotification } from "../../utils/notifications";
import { REGION } from "../../config/environment";

export const bookingCancel = onCall(
  { region: REGION },
  async (request) => {
    const callerUid = requireAuth(request);
    const { bookingId, reason } = request.data;

    if (!bookingId) {
      throw new HttpsError(
        "invalid-argument",
        "부킹 ID가 필요합니다."
      );
    }

    const db = admin.firestore();
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw new HttpsError("not-found", "부킹을 찾을 수 없습니다.");
    }

    const bookingData = bookingDoc.data()!;

    // 호스트 검증
    if (bookingData.hostId !== callerUid) {
      throw new HttpsError(
        "permission-denied",
        "호스트만 모임을 취소할 수 있습니다."
      );
    }

    // 이미 취소된 부킹 체크
    if (bookingData.status === "CANCELLED" || bookingData.status === "cancelled") {
      throw new HttpsError(
        "failed-precondition",
        "이미 취소된 모임입니다."
      );
    }

    // 부킹 취소 처리
    await bookingRef.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelReason: reason || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 참가자 목록
    const participantsList: string[] = bookingData.participants?.list || [];

    // 모든 참가 신청도 취소 처리
    const participantDocs = await db
      .collection("bookingParticipants")
      .where("bookingId", "==", bookingId)
      .get();

    const batch = db.batch();
    participantDocs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    // 참가자들에게 취소 알림 전송
    const title = bookingData.title || bookingData.course || "골프 모임";
    for (const participantId of participantsList) {
      if (participantId !== callerUid) {
        try {
          await sendPushNotification(
            participantId,
            "booking_cancelled",
            "모임 취소 안내",
            `"${title}" 모임이 호스트에 의해 취소되었습니다.${reason ? ` 사유: ${reason}` : ""}`,
            { bookingId }
          );
        } catch {
          // 개별 알림 실패 무시
        }
      }
    }

    return {
      success: true,
      message: "모임이 취소되었습니다.",
      notifiedCount: participantsList.filter((id) => id !== callerUid).length,
    };
  }
);
