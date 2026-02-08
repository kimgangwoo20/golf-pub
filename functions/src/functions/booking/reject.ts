// 부킹 참가 거절 Cloud Function
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAuth } from "../../utils/auth";
import { sendPushNotification } from "../../utils/notifications";
import { REGION } from "../../config/environment";

export const bookingReject = onCall(
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
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      throw new HttpsError("not-found", "부킹을 찾을 수 없습니다.");
    }

    const bookingData = bookingDoc.data()!;
    if (bookingData.hostId !== callerUid) {
      throw new HttpsError(
        "permission-denied",
        "호스트만 참가를 거절할 수 있습니다."
      );
    }

    // 참가 신청 거절
    await db.collection("bookingParticipants").doc(requestId).update({
      status: "rejected",
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 알림 전송
    try {
      await sendPushNotification(
        userId,
        "booking_rejected",
        "참가 거절",
        `"${bookingData.title || bookingData.course}" 모임 참가가 거절되었습니다.`,
        { bookingId }
      );
    } catch {
      // 알림 실패해도 거절 처리에 영향 없음
    }

    return {
      success: true,
      message: "참가가 거절되었습니다.",
    };
  }
);
