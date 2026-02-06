// useNotificationStore.ts - 알림 상태 관리 스토어
import { create } from 'zustand';

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
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  subscribeToNotifications: (userId: string) => {
    // TODO: Firebase Firestore 실시간 알림 구독
    console.log('알림 구독 시작:', userId);
  },

  unsubscribeFromNotifications: () => {
    console.log('알림 구독 해제');
  },

  subscribeToUnreadCount: (userId: string) => {
    // TODO: Firebase Firestore 읽지 않은 알림 수 구독
    console.log('읽지 않은 알림 수 구독:', userId);
  },

  unsubscribeFromUnreadCount: () => {
    console.log('읽지 않은 알림 수 구독 해제');
  },
}));
