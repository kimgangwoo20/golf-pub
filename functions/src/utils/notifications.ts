// 푸시 알림 유틸리티
import * as admin from "firebase-admin";

/**
 * 사용자에게 푸시 알림 전송 + Firestore 알림 기록 저장
 */
export async function sendPushNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string> {
  const db = admin.firestore();

  // 알림 기록 저장
  const notificationRef = await db
    .collection("users")
    .doc(userId)
    .collection("notifications")
    .add({
      type,
      title,
      body,
      data: data || {},
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  // FCM 토큰 조회 후 푸시 전송
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: {
          type,
          notificationId: notificationRef.id,
          ...data,
        },
      });
    }
  } catch (error) {
    // FCM 전송 실패해도 알림 기록은 유지
    console.warn("FCM 전송 실패:", error);
  }

  return notificationRef.id;
}
