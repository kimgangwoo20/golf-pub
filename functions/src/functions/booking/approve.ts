// 부킹 참가 승인 Cloud Function
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAuth } from "../../utils/auth";
import { sendPushNotification } from "../../utils/notifications";
import { REGION } from "../../config/environment";

export const bookingApprove = onCall(
  { region: REGION },
  async (request) => {
    const callerUid = requireAuth(request);
    const { requestId, bookingId, userId } = request.data;

    if (!requestId || !bookingId || !userId) {
      throw new HttpsError(
        "invalid-argument",
        "필수 정보가 누락되었습니다."
      );
    }

    const db = admin.firestore();

    // 호스트 검증
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw new HttpsError("not-found", "부킹을 찾을 수 없습니다.");
    }

    const bookingData = bookingDoc.data()!;
    if (bookingData.hostId !== callerUid) {
      throw new HttpsError(
        "permission-denied",
        "호스트만 참가를 승인할 수 있습니다."
      );
    }

    // Transaction: 참가자 승인 + 인원 업데이트
    await db.runTransaction(async (transaction) => {
      const freshBooking = await transaction.get(bookingRef);
      const data = freshBooking.data()!;

      const currentCount = data.participants?.current || 0;
      const maxCount = data.participants?.max || 4;

      if (currentCount >= maxCount) {
        throw new HttpsError(
          "failed-precondition",
          "이미 정원이 마감되었습니다."
        );
      }

      // 참가 신청 상태 변경
      const participantRef = db
        .collection("bookingParticipants")
        .doc(requestId);
      transaction.update(participantRef, {
        status: "approved",
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 부킹 참가자 수 증가 및 목록 추가
      const newCount = currentCount + 1;
      const updateData: any = {
        "participants.current": newCount,
        "participants.list": admin.firestore.FieldValue.arrayUnion(userId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // 정원 다 찼으면 상태 변경
      if (newCount >= maxCount) {
        updateData.status = "full";
      }

      transaction.update(bookingRef, updateData);
    });

    // 알림 전송
    try {
      await sendPushNotification(
        userId,
        "booking_approved",
        "참가 승인",
        `"${bookingData.title || bookingData.course}" 모임 참가가 승인되었습니다!`,
        { bookingId }
      );
    } catch {
      // 알림 실패해도 승인 처리에 영향 없음
    }

    return {
      success: true,
      message: "참가가 승인되었습니다.",
    };
  }
);
