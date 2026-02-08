// 결제 확인 Cloud Function (Toss Payments 서버 검증)
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import { requireAuth } from "../../utils/auth";
import { TOSS_SECRET_KEY, REGION } from "../../config/environment";

export const paymentConfirm = onCall(
  {
    region: REGION,
    secrets: [TOSS_SECRET_KEY],
  },
  async (request) => {
    const uid = requireAuth(request);
    const { paymentKey, orderId, amount, bookingId } = request.data;

    if (!paymentKey || !orderId || !amount) {
      throw new HttpsError(
        "invalid-argument",
        "결제 정보가 올바르지 않습니다."
      );
    }

    // Toss Payments API 결제 확인
    let tossResult: any;
    try {
      const secretKey = TOSS_SECRET_KEY.value();
      const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

      const response = await axios.post(
        "https://api.tosspayments.com/v1/payments/confirm",
        { paymentKey, orderId, amount },
        {
          headers: {
            Authorization: `Basic ${encodedKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      tossResult = response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "결제 확인에 실패했습니다.";
      throw new HttpsError("internal", message);
    }

    const db = admin.firestore();

    // 결제 기록 생성
    const paymentRef = await db.collection("payments").add({
      userId: uid,
      paymentKey,
      orderId,
      amount,
      method: tossResult.method || "card",
      status: "DONE",
      approvedAt: tossResult.approvedAt || new Date().toISOString(),
      bookingId: bookingId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // bookingId가 있으면 부킹 상태 업데이트
    if (bookingId) {
      await db.collection("bookings").doc(bookingId).update({
        paymentStatus: "DONE",
        paymentId: paymentRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      paymentId: paymentRef.id,
      approvedAt: tossResult.approvedAt || new Date().toISOString(),
    };
  }
);
