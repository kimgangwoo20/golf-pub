// 결제 취소 Cloud Function
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import { requireAuth } from "../../utils/auth";
import { TOSS_SECRET_KEY, REGION } from "../../config/environment";

export const paymentCancel = onCall(
  {
    region: REGION,
    secrets: [TOSS_SECRET_KEY],
  },
  async (request) => {
    const uid = requireAuth(request);
    const { paymentKey, cancelReason, cancelAmount } = request.data;

    if (!paymentKey || !cancelReason) {
      throw new HttpsError(
        "invalid-argument",
        "결제 키와 취소 사유가 필요합니다."
      );
    }

    const db = admin.firestore();

    // 결제 소유자 검증
    const paymentSnapshot = await db
      .collection("payments")
      .where("paymentKey", "==", paymentKey)
      .where("userId", "==", uid)
      .limit(1)
      .get();

    if (paymentSnapshot.empty) {
      throw new HttpsError(
        "not-found",
        "해당 결제를 찾을 수 없습니다."
      );
    }

    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    if (paymentData.status === "CANCELED") {
      throw new HttpsError(
        "failed-precondition",
        "이미 취소된 결제입니다."
      );
    }

    // Toss Payments API 결제 취소
    let tossResult: any;
    try {
      const secretKey = TOSS_SECRET_KEY.value();
      const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

      const cancelData: any = { cancelReason };
      if (cancelAmount) {
        cancelData.cancelAmount = cancelAmount;
      }

      const response = await axios.post(
        `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
        cancelData,
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
        error.response?.data?.message || "결제 취소에 실패했습니다.";
      throw new HttpsError("internal", message);
    }

    // 결제 상태 업데이트
    const actualCancelAmount = cancelAmount || paymentData.amount;
    const newStatus = cancelAmount && cancelAmount < paymentData.amount
      ? "PARTIAL_CANCELED"
      : "CANCELED";

    await paymentDoc.ref.update({
      status: newStatus,
      cancelReason,
      cancelAmount: actualCancelAmount,
      canceledAt: tossResult.cancels?.[0]?.canceledAt || new Date().toISOString(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      cancelAmount: actualCancelAmount,
      canceledAt: tossResult.cancels?.[0]?.canceledAt || new Date().toISOString(),
    };
  }
);
