// 포인트 적립 Cloud Function
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { requireAuth } from "../../utils/auth";
import { adjustPoints } from "../../utils/points";
import { REGION } from "../../config/environment";
import * as admin from "firebase-admin";

export const pointsEarn = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireAuth(request);
    const { amount, description, targetUserId } = request.data;

    if (!amount || amount <= 0) {
      throw new HttpsError(
        "invalid-argument",
        "적립할 포인트를 입력해주세요."
      );
    }

    if (!description) {
      throw new HttpsError(
        "invalid-argument",
        "적립 사유를 입력해주세요."
      );
    }

    // targetUserId 지정 시 ADMIN 권한 검증
    let actualUserId = uid;
    if (targetUserId && targetUserId !== uid) {
      const callerDoc = await admin.firestore()
        .collection("users")
        .doc(uid)
        .get();

      if (callerDoc.data()?.role !== "ADMIN") {
        throw new HttpsError(
          "permission-denied",
          "다른 사용자에게 포인트를 적립하려면 관리자 권한이 필요합니다."
        );
      }
      actualUserId = targetUserId;
    }

    const result = await adjustPoints(
      actualUserId,
      amount,
      "add",
      description
    );

    return {
      success: true,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    };
  }
);
