// 🔔 firebaseMessaging.ts
// Firebase Cloud Messaging (FCM) 푸시 알림

import { messaging, firestore, FirestoreTimestamp, handleFirebaseError } from './firebaseConfig';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { navigate } from '@/utils/navigationRef';

/**
 * 알림 타입
 */
export type NotificationType =
  | 'booking_new' // 새 부킹 생성
  | 'booking_join' // 부킹 참여 신청
  | 'booking_approved' // 부킹 참여 승인
  | 'booking_rejected' // 부킹 참여 거절
  | 'booking_reminder' // 부킹 리마인더
  | 'chat_message' // 새 메시지
  | 'friend_request' // 친구 요청
  | 'friend_accepted' // 친구 수락
  | 'marketplace_inquiry' // 중고거래 문의
  | 'marketplace_sold' // 상품 판매 완료
  | 'review_new' // 새 리뷰
  | 'point_earned' // 포인트 획득
  | 'coupon_issued' // 쿠폰 발급
  | 'membership_upgrade' // 멤버십 업그레이드
  | 'system_notice'; // 시스템 공지

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
  async requestPermission(): Promise<number> {
    try {
      const authStatus = await messaging.requestPermission();
      return authStatus;
    } catch (error) {
      // Return DENIED status (0)
      return 0;
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
      return token || null;
    } catch (error) {
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
      await firestore.collection('users').doc(userId).update({
        fcmToken: token,
        fcmTokenUpdatedAt: FirestoreTimestamp.now(),
        platform: Platform.OS,
      });
    } catch (error) {
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
      await messaging.deleteToken();

      await firestore.collection('users').doc(userId).update({
        fcmToken: null,
        fcmTokenUpdatedAt: FirestoreTimestamp.now(),
      });
    } catch (error) {
      // 토큰 삭제 실패 - 무시
    }
  }

  /**
   * 포그라운드 메시지 리스너 등록
   *
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  onForegroundMessage(
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  ): () => void {
    const unsubscribe = messaging.onMessage(async (remoteMessage) => {
      callback(remoteMessage);
    });

    return unsubscribe;
  }

  /**
   * 백그라운드 메시지 핸들러 설정
   * (App.tsx에서 최상위에서 호출해야 함)
   */
  static setBackgroundMessageHandler(): void {
    messaging.setBackgroundMessageHandler(async (_remoteMessage) => {
      // 백그라운드에서 메시지 처리
    });
  }

  /**
   * 알림 탭 이벤트 리스너 등록
   *
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  onNotificationOpened(
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  ): () => void {
    // 앱이 백그라운드에 있을 때 알림 탭
    const unsubscribe = messaging.onNotificationOpenedApp((remoteMessage) => {
      callback(remoteMessage);
    });

    // 앱이 종료된 상태에서 알림 탭 (초기 알림)
    messaging
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          callback(remoteMessage);
        }
      })
      .catch(() => {
        // 초기 알림 조회 실패 - 무시
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
      await messaging.subscribeToTopic(topic);
    } catch (error) {
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
      await messaging.unsubscribeFromTopic(topic);
    } catch (error) {
      // 구독 해제 실패 - 무시
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
    imageUrl?: string,
  ): Promise<string> {
    try {
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

      return notificationRef.id;
    } catch (error) {
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
  async getNotifications(userId: string, limit: number = 20): Promise<NotificationData[]> {
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
    limit: number = 20,
  ): () => void {
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
    } catch (error) {
      // 읽음 처리 실패 - 무시
    }
  }

  /**
   * 모든 알림 읽음 처리
   *
   * @param userId - 사용자 ID
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
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
    } catch (error) {
      // 모든 알림 읽음 처리 실패 - 무시
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
    } catch (error) {
      // 알림 삭제 실패 - 무시
    }
  }

  /**
   * 모든 알림 삭제
   *
   * @param userId - 사용자 ID
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
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
    } catch (error) {
      // 모든 알림 삭제 실패 - 무시
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
  subscribeToUnreadCount(userId: string, callback: (count: number) => void): () => void {
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
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch {
      // 배지 업데이트 실패 시 무시
    }
  }

  /**
   * Android 알림 채널 생성
   */
  async createAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Golf Pub 알림',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  }

  /**
   * 로컬 알림 표시 (포그라운드 FCM 수신 시)
   */
  async displayLocalNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'Golf Pub',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data as Record<string, unknown>,
        },
        trigger: null, // 즉시 표시
      });
    } catch {
      // 알림 표시 실패 시 무시
    }
  }

  /**
   * 알림 데이터 기반 딥링킹 네비게이션 처리
   *
   * @param data - 알림 데이터 (type, bookingId, chatId, productId 등)
   */
  handleNotificationNavigation(data: Record<string, any>): void {
    const { type } = data;

    switch (type) {
      // 부킹 관련 알림 → 부킹 상세
      case 'booking_join':
      case 'booking_approved':
      case 'booking_rejected':
        if (data.bookingId) {
          navigate('Bookings', {
            screen: 'BookingDetail',
            params: { bookingId: data.bookingId },
          });
        }
        break;

      // 채팅 메시지 알림 → 채팅방
      case 'chat_message':
        if (data.chatId) {
          navigate('Chat', {
            screen: 'ChatRoom',
            params: { chatId: data.chatId },
          });
        }
        break;

      // 친구 관련 알림 → 친구 목록
      case 'friend_request':
      case 'friend_accepted':
        navigate('MyHome', {
          screen: 'Friends',
        });
        break;

      // 중고거래 문의 알림 → 상품 상세
      case 'marketplace_inquiry':
        if (data.productId) {
          navigate('Marketplace', {
            screen: 'ProductDetail',
            params: { productId: data.productId },
          });
        }
        break;

      // 새 리뷰 알림 → 골프장 리뷰 화면
      case 'review_new':
        if (data.courseId) {
          navigate('GolfCourse', {
            screen: 'GolfCourseReview',
            params: { courseId: data.courseId },
          });
        }
        break;

      // 기본: 알림 목록으로 이동
      default:
        navigate('Home', {
          screen: 'NotificationList',
        });
        break;
    }
  }

  /**
   * FCM 초기화 (앱 시작 시 호출)
   *
   * @param userId - 사용자 ID
   */
  async initialize(userId: string): Promise<void> {
    try {
      // Android 알림 채널 생성
      if (Platform.OS === 'android') {
        await this.createAndroidChannel();
      }

      // 토큰 가져오기 및 저장
      const token = await this.getToken();
      if (token) {
        await this.saveToken(userId, token);
      }

      // 토큰 갱신 리스너
      messaging.onTokenRefresh(async (newToken) => {
        await this.saveToken(userId, newToken);
      });

      // 포그라운드 메시지 수신 시 로컬 알림 표시
      this.onForegroundMessage(async (remoteMessage) => {
        await this.displayLocalNotification(remoteMessage);
      });

      // 알림 탭 시 딥링킹 네비게이션 처리
      this.onNotificationOpened((remoteMessage) => {
        if (remoteMessage.data) {
          this.handleNotificationNavigation(remoteMessage.data);
        }
      });
    } catch (error) {
      // FCM 초기화 실패 - 무시
    }
  }
}

// 싱글톤 인스턴스 export
export const firebaseMessaging = new FirebaseMessagingService();

export default firebaseMessaging;
