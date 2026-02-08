// 포인트 차감 Cloud Function
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { requireAuth } from "../../utils/auth";
import { adjustPoints } from "../../utils/points";
import { REGION } from "../../config/environment";

export const pointsDeduct = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireAuth(request);
    const { amount, description } = request.data;

    if (!amount || amount <= 0) {
      throw new HttpsError(
        "invalid-argument",
        "사용할 포인트를 입력해주세요."
      );
    }

    if (!description) {
      throw new HttpsError(
        "invalid-argument",
        "사용 사유를 입력해주세요."
      );
    }

    const result = await adjustPoints(uid, amount, "subtract", description);

    return {
      success: true,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    };
  }
);
