// useNotificationStore.ts - 알림 상태 관리 스토어
import { create } from 'zustand';
import {
  firestore,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  updateDoc,
  writeBatch,
} from '@/services/firebase/firebaseConfig';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  subscribeToUnreadCount: (userId: string) => void;
  unsubscribeFromUnreadCount: () => void;
  markAsRead: (notificationId: string, userId: string) => Promise<void>;
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

    const notificationsRef = collection(firestore, 'users', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

    notificationUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((docSnap) => {
          const docData = docSnap.data();
          return {
            id: docSnap.id,
            type: docData.type || 'system_notice',
            title: docData.title || '',
            body: docData.body || '',
            read: docData.read ?? docData.isRead ?? false,
            data: docData.data,
            createdAt: docData.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          };
        }) as Notification[];

        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      },
      (error) => {
        console.error('알림 구독 오류:', error);
      },
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

    const notificationsRef = collection(firestore, 'users', userId, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));

    unreadCountUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        set({ unreadCount: snapshot.size });
      },
      (error) => {
        console.error('읽지 않은 알림 구독 오류:', error);
      },
    );
  },

  unsubscribeFromUnreadCount: () => {
    if (unreadCountUnsubscribe) {
      unreadCountUnsubscribe();
      unreadCountUnsubscribe = null;
    }
  },

  markAsRead: async (notificationId: string, userId: string) => {
    try {
      const { notifications } = get();
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification || notification.read) return;

      // 로컬 상태 즉시 업데이트
      set({
        notifications: notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      });

      // Firestore 업데이트 (isRead 필드)
      const notificationRef = doc(firestore, 'users', userId, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true, read: true });
    } catch (error) {
      // 알림 읽음 처리 실패 - 무시
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      // 로컬 상태 즉시 업데이트
      const { notifications } = get();
      set({
        notifications: notifications.map((n) => ({ ...n, read: true })),
      });

      // Firestore 일괄 업데이트
      const notificationsRef = collection(firestore, 'users', userId, 'notifications');
      const q = query(notificationsRef, where('isRead', '==', false));
      const snapshot = await getDocs(q);

      const batch = writeBatch(firestore);
      snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, { isRead: true, read: true });
      });

      await batch.commit();
    } catch (error) {
      // 전체 읽음 처리 실패 - 무시
    }
  },
}));
