// 범용 알림 전송 Cloud Function (ADMIN 전용)
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { requireAdmin } from "../../utils/auth";
import { sendPushNotification } from "../../utils/notifications";
import { REGION } from "../../config/environment";

export const sendNotification = onCall(
  { region: REGION },
  async (request) => {
    await requireAdmin(request);
    const { userId, type, title, body, data } = request.data;

    if (!userId || !type || !title || !body) {
      throw new HttpsError(
        "invalid-argument",
        "필수 정보가 누락되었습니다. (userId, type, title, body)"
      );
    }

    const notificationId = await sendPushNotification(
      userId,
      type,
      title,
      body,
      data
    );

    return {
      success: true,
      notificationId,
    };
  }
);
