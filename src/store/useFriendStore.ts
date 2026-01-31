import { create } from 'zustand';
import { firebaseFirestore } from '../config/firebase';

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
  removeFriend: (friendId: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  loading: false,
  error: null,

  loadFriends: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const snapshot = await firebaseFirestore
        .collection('friends')
        .where('userId', '==', userId)
        .where('status', '==', 'accepted')
        .get();

      const friends = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Friend[];

      set({ friends, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  sendFriendRequest: async (userId, friendId, friendName) => {
    try {
      await firebaseFirestore.collection('friends').add({
        userId,
        friendId,
        friendName,
        status: 'pending',
        createdAt: new Date(),
      });
    } catch (error: any) {
      throw error;
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await firebaseFirestore.collection('friends').doc(requestId).update({
        status: 'accepted',
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw error;
    }
  },

  removeFriend: async (friendId) => {
    try {
      await firebaseFirestore.collection('friends').doc(friendId).delete();
    } catch (error: any) {
      throw error;
    }
  },
}));
