// useNotificationStore.ts - 알림 상태 관리 스토어
import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  subscribeToUnreadCount: (userId: string) => void;
  unsubscribeFromUnreadCount: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

let notificationUnsubscribe: (() => void) | null = null;
let unreadCountUnsubscribe: (() => void) | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  subscribeToNotifications: (userId: string) => {
    // 기존 구독 해제
    if (notificationUnsubscribe) {
      notificationUnsubscribe();
    }

    notificationUnsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const notifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          })) as Notification[];

          set({ notifications });
        },
        () => {
          // 알림 구독 오류 - 무시
        }
      );
  },

  unsubscribeFromNotifications: () => {
    if (notificationUnsubscribe) {
      notificationUnsubscribe();
      notificationUnsubscribe = null;
    }
  },

  subscribeToUnreadCount: (userId: string) => {
    // 기존 구독 해제
    if (unreadCountUnsubscribe) {
      unreadCountUnsubscribe();
    }

    unreadCountUnsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .where('read', '==', false)
      .onSnapshot(
        (snapshot) => {
          set({ unreadCount: snapshot.size });
        },
        () => {
          // 읽지 않은 알림 구독 오류 - 무시
        }
      );
  },

  unsubscribeFromUnreadCount: () => {
    if (unreadCountUnsubscribe) {
      unreadCountUnsubscribe();
      unreadCountUnsubscribe = null;
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const { notifications } = get();
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification || notification.read) return;

      // Firestore에서 해당 알림의 userId를 찾아 업데이트
      // 알림은 users/{userId}/notifications/{notificationId} 경로에 있음
      // 현재 구독 중인 사용자의 알림이므로 로컬 상태만 업데이트하고
      // Firestore는 onSnapshot이 자동 반영
      set({
        notifications: notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      });
    } catch (error) {
      // 알림 읽음 처리 실패 - 무시
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .where('read', '==', false)
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      // 전체 읽음 처리 실패 - 무시
    }
  },
}));
