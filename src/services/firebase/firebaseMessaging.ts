// 🔔 firebaseMessaging.ts
// Firebase Cloud Messaging (FCM) 푸시 알림

import { messaging, firestore, FirestoreTimestamp, handleFirebaseError } from './firebaseConfig';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

/**
 * 알림 타입
 */
export type NotificationType =
  | 'booking_new'          // 새 부킹 생성
  | 'booking_join'         // 부킹 참여 신청
  | 'booking_approved'     // 부킹 참여 승인
  | 'booking_rejected'     // 부킹 참여 거절
  | 'booking_reminder'     // 부킹 리마인더
  | 'chat_message'         // 새 메시지
  | 'friend_request'       // 친구 요청
  | 'friend_accepted'      // 친구 수락
  | 'marketplace_inquiry'  // 중고거래 문의
  | 'marketplace_sold'     // 상품 판매 완료
  | 'review_new'           // 새 리뷰
  | 'point_earned'         // 포인트 획득
  | 'coupon_issued'        // 쿠폰 발급
  | 'membership_upgrade'   // 멤버십 업그레이드
  | 'system_notice';       // 시스템 공지

/**
 * 알림 데이터 인터페이스
 */
export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  isRead: boolean;
  createdAt: any;
}

/**
 * Firebase Messaging Service
 */
class FirebaseMessagingService {
  /**
   * FCM 권한 요청 (iOS)
   *
   * @returns 권한 상태
   */
  async requestPermission(): Promise<FirebaseMessagingTypes.AuthorizationStatus> {
    try {
      console.log('🔔 FCM 권한 요청...');

      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ FCM 권한 승인됨:', authStatus);
      } else {
        console.log('❌ FCM 권한 거부됨:', authStatus);
      }

      return authStatus;
    } catch (error) {
      console.error('❌ FCM 권한 요청 실패:', error);
      return messaging.AuthorizationStatus.DENIED;
    }
  }

  /**
   * FCM 토큰 가져오기
   *
   * @returns FCM 토큰
   */
  async getToken(): Promise<string | null> {
    try {
      // iOS는 권한 요청 필요
      if (Platform.OS === 'ios') {
        await this.requestPermission();
      }

      const token = await messaging.getToken();

      if (token) {
        console.log('✅ FCM 토큰 가져오기 성공:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.log('❌ FCM 토큰 없음');
        return null;
      }
    } catch (error) {
      console.error('❌ FCM 토큰 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * FCM 토큰 Firestore에 저장
   *
   * @param userId - 사용자 ID
   * @param token - FCM 토큰
   */
  async saveToken(userId: string, token: string): Promise<void> {
    try {
      console.log('💾 FCM 토큰 저장 중...');

      await firestore.collection('users').doc(userId).update({
        fcmToken: token,
        fcmTokenUpdatedAt: FirestoreTimestamp.now(),
        platform: Platform.OS,
      });

      console.log('✅ FCM 토큰 저장 완료');
    } catch (error) {
      console.error('❌ FCM 토큰 저장 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * FCM 토큰 삭제
   *
   * @param userId - 사용자 ID
   */
  async deleteToken(userId: string): Promise<void> {
    try {
      console.log('🗑️ FCM 토큰 삭제 중...');

      await messaging.deleteToken();

      await firestore.collection('users').doc(userId).update({
        fcmToken: null,
        fcmTokenUpdatedAt: FirestoreTimestamp.now(),
      });

      console.log('✅ FCM 토큰 삭제 완료');
    } catch (error) {
      console.error('❌ FCM 토큰 삭제 실패:', error);
    }
  }

  /**
   * 포그라운드 메시지 리스너 등록
   *
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  onForegroundMessage(
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ): () => void {
    console.log('🔄 포그라운드 메시지 리스너 등록');

    const unsubscribe = messaging.onMessage(async (remoteMessage) => {
      console.log('📬 포그라운드 메시지 수신:', remoteMessage);

      // 로컬 알림 표시 (선택)
      // await this.displayLocalNotification(remoteMessage);

      callback(remoteMessage);
    });

    return unsubscribe;
  }

  /**
   * 백그라운드 메시지 핸들러 설정
   * (App.tsx에서 최상위에서 호출해야 함)
   */
  static setBackgroundMessageHandler(): void {
    messaging.setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📭 백그라운드 메시지 수신:', remoteMessage);

      // 백그라운드에서 메시지 처리
      // 예: 로컬 알림 표시, 데이터 동기화 등
    });
  }

  /**
   * 알림 탭 이벤트 리스너 등록
   *
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  onNotificationOpened(
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ): () => void {
    console.log('🔄 알림 탭 리스너 등록');

    // 앱이 백그라운드에 있을 때 알림 탭
    const unsubscribe = messaging.onNotificationOpenedApp((remoteMessage) => {
      console.log('👆 알림 탭 (백그라운드):', remoteMessage);
      callback(remoteMessage);
    });

    // 앱이 종료된 상태에서 알림 탭 (초기 알림)
    messaging
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('👆 알림 탭 (종료 상태):', remoteMessage);
          callback(remoteMessage);
        }
      });

    return unsubscribe;
  }

  /**
   * 토픽 구독
   *
   * @param topic - 토픽 이름
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      console.log('📢 토픽 구독:', topic);

      await messaging.subscribeToTopic(topic);

      console.log('✅ 토픽 구독 완료:', topic);
    } catch (error) {
      console.error('❌ 토픽 구독 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 토픽 구독 해제
   *
   * @param topic - 토픽 이름
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      console.log('🔕 토픽 구독 해제:', topic);

      await messaging.unsubscribeFromTopic(topic);

      console.log('✅ 토픽 구독 해제 완료:', topic);
    } catch (error) {
      console.error('❌ 토픽 구독 해제 실패:', error);
    }
  }

  /**
   * 알림 생성 (Firestore)
   *
   * @param userId - 사용자 ID
   * @param type - 알림 타입
   * @param title - 제목
   * @param body - 내용
   * @param data - 추가 데이터
   * @param imageUrl - 이미지 URL
   * @returns 알림 ID
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
    imageUrl?: string
  ): Promise<string> {
    try {
      console.log('🔔 알림 생성:', userId, type);

      const notificationRef = firestore
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc();

      const notification: NotificationData = {
        id: notificationRef.id,
        userId,
        type,
        title,
        body,
        data,
        imageUrl,
        isRead: false,
        createdAt: FirestoreTimestamp.now(),
      };

      await notificationRef.set(notification);

      console.log('✅ 알림 생성 완료:', notificationRef.id);

      return notificationRef.id;
    } catch (error) {
      console.error('❌ 알림 생성 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 알림 목록 가져오기
   *
   * @param userId - 사용자 ID
   * @param limit - 개수 제한
   * @returns 알림 목록
   */
  async getNotifications(
    userId: string,
    limit: number = 20
  ): Promise<NotificationData[]> {
    try {
      const snapshot = await firestore
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const notifications: NotificationData[] = [];

      snapshot.forEach((doc) => {
        notifications.push(doc.data() as NotificationData);
      });

      return notifications;
    } catch (error) {
      console.error('❌ 알림 목록 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 알림 실시간 구독
   *
   * @param userId - 사용자 ID
   * @param callback - 콜백 함수
   * @param limit - 개수 제한
   * @returns Unsubscribe function
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: NotificationData[]) => void,
    limit: number = 20
  ): () => void {
    console.log('🔄 알림 구독:', userId);

    const unsubscribe = firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .onSnapshot((snapshot) => {
        const notifications: NotificationData[] = [];

        snapshot.forEach((doc) => {
          notifications.push(doc.data() as NotificationData);
        });

        callback(notifications);
      });

    return unsubscribe;
  }

  /**
   * 알림 읽음 처리
   *
   * @param userId - 사용자 ID
   * @param notificationId - 알림 ID
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await firestore
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc(notificationId)
        .update({ isRead: true });

      console.log('✅ 알림 읽음 처리:', notificationId);
    } catch (error) {
      console.error('❌ 알림 읽음 처리 실패:', error);
    }
  }

  /**
   * 모든 알림 읽음 처리
   *
   * @param userId - 사용자 ID
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      console.log('📖 모든 알림 읽음 처리:', userId);

      const snapshot = await firestore
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .where('isRead', '==', false)
        .get();

      const batch = firestore.batch();

      snapshot.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();

      console.log('✅ 모든 알림 읽음 처리 완료');
    } catch (error) {
      console.error('❌ 모든 알림 읽음 처리 실패:', error);
    }
  }

  /**
   * 알림 삭제
   *
   * @param userId - 사용자 ID
   * @param notificationId - 알림 ID
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      await firestore
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc(notificationId)
        .delete();

      console.log('✅ 알림 삭제:', notificationId);
    } catch (error) {
      console.error('❌ 알림 삭제 실패:', error);
    }
  }

  /**
   * 모든 알림 삭제
   *
   * @param userId - 사용자 ID
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      console.log('🗑️ 모든 알림 삭제:', userId);

      const snapshot = await firestore
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .get();

      const batch = firestore.batch();

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log('✅ 모든 알림 삭제 완료');
    } catch (error) {
      console.error('❌ 모든 알림 삭제 실패:', error);
    }
  }

  /**
   * 읽지 않은 알림 개수 가져오기
   *
   * @param userId - 사용자 ID
   * @returns 읽지 않은 알림 개수
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const snapshot = await firestore
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .where('isRead', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('❌ 읽지 않은 알림 개수 가져오기 실패:', error);
      return 0;
    }
  }

  /**
   * 읽지 않은 알림 개수 실시간 구독
   *
   * @param userId - 사용자 ID
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void
  ): () => void {
    console.log('🔄 읽지 않은 알림 개수 구독:', userId);

    const unsubscribe = firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .where('isRead', '==', false)
      .onSnapshot((snapshot) => {
        callback(snapshot.size);
      });

    return unsubscribe;
  }

  /**
   * 배지 개수 업데이트 (iOS)
   *
   * @param count - 배지 개수
   */
  async updateBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await messaging.setAPNSToken(count.toString());
        console.log('✅ 배지 개수 업데이트:', count);
      } catch (error) {
        console.error('❌ 배지 개수 업데이트 실패:', error);
      }
    }
  }

  /**
   * 로컬 알림 표시 (선택적)
   *
   * @param remoteMessage - FCM 메시지
   */
  private async displayLocalNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      // React Native Notifee 또는 react-native-push-notification 사용
      // 여기서는 예시로 구현

      console.log('🔔 로컬 알림 표시:', remoteMessage.notification?.title);

      // TODO: 실제 로컬 알림 구현
      // import notifee from '@notifee/react-native';
      // await notifee.displayNotification({
      //   title: remoteMessage.notification?.title,
      //   body: remoteMessage.notification?.body,
      //   android: {
      //     channelId: 'default',
      //   },
      // });
    } catch (error) {
      console.error('❌ 로컬 알림 표시 실패:', error);
    }
  }

  /**
   * FCM 초기화 (앱 시작 시 호출)
   *
   * @param userId - 사용자 ID
   */
  async initialize(userId: string): Promise<void> {
    try {
      console.log('🚀 FCM 초기화 시작...');

      // 토큰 가져오기 및 저장
      const token = await this.getToken();
      if (token) {
        await this.saveToken(userId, token);
      }

      // 토큰 갱신 리스너
      messaging.onTokenRefresh(async (newToken) => {
        console.log('🔄 FCM 토큰 갱신:', newToken.substring(0, 20) + '...');
        await this.saveToken(userId, newToken);
      });

      console.log('✅ FCM 초기화 완료');
    } catch (error) {
      console.error('❌ FCM 초기화 실패:', error);
    }
  }
}

// 싱글톤 인스턴스 export
export const firebaseMessaging = new FirebaseMessagingService();

export default firebaseMessaging;