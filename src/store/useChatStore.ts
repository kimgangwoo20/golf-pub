import { create } from 'zustand';
import { firestore as firebaseFirestore } from '../services/firebase/firebaseConfig';

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
  createdAt: Date;
  readBy: string[]; // 읽은 사용자 ID 목록
}

export interface ChatRoom {
  id: string;
  type: 'booking' | 'marketplace' | 'direct'; // 부킹 채팅, 중고거래 채팅, 1:1 채팅
  relatedId?: string; // 부킹 ID 또는 상품 ID
  participants: Array<{
    uid: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: {
    message: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  chatRooms: ChatRoom[];
  currentRoomMessages: ChatMessage[];
  loading: boolean;
  error: string | null;

  // Actions
  loadChatRooms: (userId: string) => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, senderId: string, senderName: string, message: string, senderAvatar?: string) => Promise<void>;
  sendImage: (roomId: string, senderId: string, senderName: string, imageUrl: string, senderAvatar?: string) => Promise<void>;
  sendSystemMessage: (roomId: string, message: string) => Promise<void>;
  markAsRead: (roomId: string, userId: string) => Promise<void>;
  createChatRoom: (room: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt' | 'unreadCount'>) => Promise<string>;
  deleteChatRoom: (roomId: string) => Promise<void>;
  listenToMessages: (roomId: string, callback: (messages: ChatMessage[]) => void) => () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatRooms: [],
  currentRoomMessages: [],
  loading: false,
  error: null,

  /**
   * 채팅방 목록 로드
   */
  loadChatRooms: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const snapshot = await firebaseFirestore
        .collection('chatRooms')
        .where('participants', 'array-contains', { uid: userId })
        .orderBy('updatedAt', 'desc')
        .get();

      const chatRooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessage: doc.data().lastMessage
          ? {
              ...doc.data().lastMessage,
              createdAt: doc.data().lastMessage.createdAt?.toDate(),
            }
          : undefined,
      })) as ChatRoom[];

      set({ chatRooms, loading: false });
    } catch (error: any) {
      console.error('채팅방 로드 실패:', error);
      set({
        error: error.message || '채팅방을 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  /**
   * 메시지 로드
   */
  loadMessages: async (roomId: string) => {
    try {
      set({ loading: true, error: null });

      const snapshot = await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .limit(100)
        .get();

      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as ChatMessage[];

      set({ currentRoomMessages: messages, loading: false });
    } catch (error: any) {
      console.error('메시지 로드 실패:', error);
      set({
        error: error.message || '메시지를 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  /**
   * 텍스트 메시지 전송
   */
  sendMessage: async (roomId, senderId, senderName, message, senderAvatar) => {
    try {
      const now = new Date();
      const messageData = {
        chatRoomId: roomId,
        senderId,
        senderName,
        senderAvatar,
        message,
        type: 'text' as const,
        createdAt: now,
        readBy: [senderId],
      };

      // 메시지 추가
      const messageRef = await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .add(messageData);

      // 채팅방 업데이트 (마지막 메시지, 업데이트 시간)
      await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .update({
          lastMessage: {
            message,
            senderId,
            createdAt: now,
          },
          updatedAt: now,
        });

      // 로컬 상태 업데이트
      const { currentRoomMessages } = get();
      set({
        currentRoomMessages: [
          ...currentRoomMessages,
          { id: messageRef.id, ...messageData },
        ],
      });
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      set({ error: error.message || '메시지를 전송할 수 없습니다' });
      throw error;
    }
  },

  /**
   * 이미지 메시지 전송
   */
  sendImage: async (roomId, senderId, senderName, imageUrl, senderAvatar) => {
    try {
      const now = new Date();
      const messageData = {
        chatRoomId: roomId,
        senderId,
        senderName,
        senderAvatar,
        message: '[사진]',
        type: 'image' as const,
        imageUrl,
        createdAt: now,
        readBy: [senderId],
      };

      // 메시지 추가
      const messageRef = await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .add(messageData);

      // 채팅방 업데이트
      await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .update({
          lastMessage: {
            message: '[사진]',
            senderId,
            createdAt: now,
          },
          updatedAt: now,
        });

      // 로컬 상태 업데이트
      const { currentRoomMessages } = get();
      set({
        currentRoomMessages: [
          ...currentRoomMessages,
          { id: messageRef.id, ...messageData },
        ],
      });
    } catch (error: any) {
      console.error('이미지 전송 실패:', error);
      set({ error: error.message || '이미지를 전송할 수 없습니다' });
      throw error;
    }
  },

  /**
   * 시스템 메시지 전송
   */
  sendSystemMessage: async (roomId, message) => {
    try {
      const now = new Date();
      const messageData = {
        chatRoomId: roomId,
        senderId: 'system',
        senderName: '시스템',
        message,
        type: 'system' as const,
        createdAt: now,
        readBy: [],
      };

      await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .add(messageData);
    } catch (error: any) {
      console.error('시스템 메시지 전송 실패:', error);
    }
  },

  /**
   * 메시지 읽음 처리
   */
  markAsRead: async (roomId, userId) => {
    try {
      const messagesSnapshot = await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .where('readBy', 'not-in', [[userId]])
        .get();

      const batch = firebaseFirestore.batch();

      messagesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          readBy: [...(doc.data().readBy || []), userId],
        });
      });

      await batch.commit();

      // 채팅방의 unreadCount 업데이트
      await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .update({
          [`unreadCount.${userId}`]: 0,
        });
    } catch (error: any) {
      console.error('읽음 처리 실패:', error);
    }
  },

  /**
   * 채팅방 생성
   */
  createChatRoom: async (room) => {
    try {
      set({ loading: true, error: null });

      const now = new Date();
      const unreadCount: { [key: string]: number } = {};
      room.participants.forEach(p => {
        unreadCount[p.uid] = 0;
      });

      const newRoom = {
        ...room,
        unreadCount,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await firebaseFirestore.collection('chatRooms').add(newRoom);

      // 로컬 상태 업데이트
      const { chatRooms } = get();
      set({
        chatRooms: [{ id: docRef.id, ...newRoom } as ChatRoom, ...chatRooms],
        loading: false,
      });

      return docRef.id;
    } catch (error: any) {
      console.error('채팅방 생성 실패:', error);
      set({
        error: error.message || '채팅방을 생성할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 채팅방 삭제
   */
  deleteChatRoom: async (roomId) => {
    try {
      set({ loading: true, error: null });

      // 메시지 삭제
      const messagesSnapshot = await firebaseFirestore
        .collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .get();

      const batch = firebaseFirestore.batch();
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // 채팅방 삭제
      batch.delete(firebaseFirestore.collection('chatRooms').doc(roomId));

      await batch.commit();

      // 로컬 상태 업데이트
      const { chatRooms } = get();
      set({
        chatRooms: chatRooms.filter(room => room.id !== roomId),
        loading: false,
      });
    } catch (error: any) {
      console.error('채팅방 삭제 실패:', error);
      set({
        error: error.message || '채팅방을 삭제할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 실시간 메시지 리스너
   */
  listenToMessages: (roomId, callback) => {
    const unsubscribe = firebaseFirestore
      .collection('chatRooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as ChatMessage[];

        callback(messages);
        set({ currentRoomMessages: messages });
      });

    return unsubscribe;
  },
}));
