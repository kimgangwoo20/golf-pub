import { create } from 'zustand';
import firestoreModule from '@react-native-firebase/firestore';
import {
  firestore as firebaseFirestore,
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
      const snapshot = await firebaseFirestore
        .collection('users')
        .doc(userId)
        .collection('friends')
        .get();

      if (snapshot.empty) {
        set({ friends: [], loading: false });
        return;
      }

      // 친구 ID 목록에서 사용자 프로필 조인
      const friendIds = snapshot.docs.map((doc) => doc.id);
      const friends: Friend[] = [];

      for (let i = 0; i < friendIds.length; i += 10) {
        const batch = friendIds.slice(i, i + 10);
        const usersSnapshot = await firebaseFirestore
          .collection('users')
          .where(firestoreModule.FieldPath.documentId(), 'in', batch)
          .get();

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
      // friendRequests 컬렉션에 요청 생성 (firebaseFriends.ts의 sendFriendRequest와 동일 패턴)
      await firebaseFirestore.collection('friendRequests').doc(`${userId}_${friendId}`).set({
        fromUserId: userId,
        toUserId: friendId,
        friendName,
        status: 'pending',
        createdAt: FirestoreTimestamp.now(),
      });
    } catch (error: any) {
      throw error;
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await firebaseFirestore.collection('friendRequests').doc(requestId).set(
        {
          status: 'accepted',
          updatedAt: FirestoreTimestamp.now(),
        },
        { merge: true },
      );
    } catch (error: any) {
      throw error;
    }
  },

  removeFriend: async (userId, friendId) => {
    try {
      // 양방향 삭제: 내 목록에서 친구 제거 + 친구 목록에서 나 제거
      await Promise.all([
        firebaseFirestore
          .collection('users')
          .doc(userId)
          .collection('friends')
          .doc(friendId)
          .delete(),
        firebaseFirestore
          .collection('users')
          .doc(friendId)
          .collection('friends')
          .doc(userId)
          .delete(),
      ]);

      // 로컬 상태 업데이트
      set((state) => ({
        friends: state.friends.filter((f) => f.friendId !== friendId),
      }));
    } catch (error: any) {
      throw error;
    }
  },
}));
