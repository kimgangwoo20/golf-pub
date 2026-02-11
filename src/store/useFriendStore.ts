import { create } from 'zustand';
import {
  firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  documentId,
  FirestoreTimestamp,
} from '@/services/firebase/firebaseConfig';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

interface FriendState {
  friends: Friend[];
  loading: boolean;
  error: string | null;

  loadFriends: (userId: string) => Promise<void>;
  sendFriendRequest: (userId: string, friendId: string, friendName: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (userId: string, friendId: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  loading: false,
  error: null,

  loadFriends: async (userId) => {
    try {
      set({ loading: true, error: null });

      // 서브컬렉션 경로: users/{userId}/friends
      const friendsRef = collection(firestore, 'users', userId, 'friends');
      const snapshot = await getDocs(friendsRef);

      if (snapshot.empty) {
        set({ friends: [], loading: false });
        return;
      }

      // 친구 ID 목록에서 사용자 프로필 조인
      const friendIds = snapshot.docs.map((docSnap) => docSnap.id);
      const friends: Friend[] = [];

      for (let i = 0; i < friendIds.length; i += 10) {
        const batch = friendIds.slice(i, i + 10);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where(documentId(), 'in', batch));
        const usersSnapshot = await getDocs(q);

        usersSnapshot.docs.forEach((userDoc) => {
          const userData = userDoc.data();
          const friendDocData = snapshot.docs.find((d) => d.id === userDoc.id)?.data();
          friends.push({
            id: userDoc.id,
            userId,
            friendId: userDoc.id,
            friendName: userData?.name || userData?.displayName || '사용자',
            friendAvatar: userData?.avatar || userData?.photoURL || '',
            status: 'accepted',
            createdAt: friendDocData?.createdAt?.toDate() || new Date(),
          });
        });
      }

      set({ friends, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  sendFriendRequest: async (userId, friendId, friendName) => {
    try {
      set({ error: null });
      // friendRequests 컬렉션에 요청 생성 (firebaseFriends.ts의 sendFriendRequest와 동일 패턴)
      const requestRef = doc(firestore, 'friendRequests', `${userId}_${friendId}`);
      await setDoc(requestRef, {
        fromUserId: userId,
        toUserId: friendId,
        friendName,
        status: 'pending',
        createdAt: FirestoreTimestamp.now(),
      });
    } catch (error: any) {
      set({ error: error.message || '친구 요청 실패' });
      throw error;
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      set({ error: null });
      const requestRef = doc(firestore, 'friendRequests', requestId);
      await setDoc(
        requestRef,
        {
          status: 'accepted',
          updatedAt: FirestoreTimestamp.now(),
        },
        { merge: true },
      );
    } catch (error: any) {
      set({ error: error.message || '친구 수락 실패' });
      throw error;
    }
  },

  removeFriend: async (userId, friendId) => {
    try {
      set({ error: null });
      // 양방향 삭제: 내 목록에서 친구 제거 + 친구 목록에서 나 제거
      await Promise.all([
        deleteDoc(doc(firestore, 'users', userId, 'friends', friendId)),
        deleteDoc(doc(firestore, 'users', friendId, 'friends', userId)),
      ]);

      // 로컬 상태 업데이트
      set((state) => ({
        friends: state.friends.filter((f) => f.friendId !== friendId),
      }));
    } catch (error: any) {
      set({ error: error.message || '친구 삭제 실패' });
      throw error;
    }
  },
}));
