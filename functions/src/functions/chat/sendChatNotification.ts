// 채팅 메시지 푸시 알림 전송
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { requireAuth } from "../../utils/auth";
import { sendPushNotification } from "../../utils/notifications";

export const sendChatNotification = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const uid = requireAuth(request);
    const { recipientId, senderName, message, chatId } = request.data;

    if (!recipientId || !senderName || !chatId) {
      throw new HttpsError(
        "invalid-argument",
        "recipientId, senderName, chatId는 필수입니다."
      );
    }

    // 자기 자신에게 알림 전송 방지
    if (recipientId === uid) {
      return { success: true, skipped: true };
    }

    const messageText = message || "새 메시지가 도착했습니다.";

    const notificationId = await sendPushNotification(
      recipientId,
      "chat_message",
      senderName,
      messageText,
      { chatId }
    );

    return { success: true, notificationId };
  }
);
