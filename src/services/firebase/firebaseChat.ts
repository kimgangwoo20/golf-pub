// 💬 firebaseChat.ts
// Firebase Realtime Database 1:1 채팅

import { database, RealtimeTimestamp, handleFirebaseError } from './firebaseConfig';
import { callFunction } from './firebaseFunctions';

/**
 * 채팅방 인터페이스
 */
export interface ChatRoom {
  roomId: string;
  participants: string[]; // [userId1, userId2]
  participantNames: Record<string, string>; // { userId1: 'name1', userId2: 'name2' }
  participantPhotos: Record<string, string | null>; // { userId1: 'url1', userId2: 'url2' }
  lastMessage: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: number;
    type: 'text' | 'image';
  } | null;
  unreadCount: Record<string, number>; // { userId1: count, userId2: count }
  createdAt: number;
  updatedAt: number;
}

/**
 * 메시지 인터페이스
 */
export interface ChatMessage {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  text: string;
  type: 'text' | 'image';
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  readBy: string[]; // 읽은 사용자 ID 목록
  timestamp: number;
}

/**
 * 타이핑 상태 인터페이스
 */
export interface TypingStatus {
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

/**
 * Firebase Chat Service
 */
class FirebaseChatService {
  /**
   * 채팅방 생성 또는 가져오기
   *
   * @param userId1 - 사용자 1 ID
   * @param userId2 - 사용자 2 ID
   * @param user1Data - 사용자 1 정보
   * @param user2Data - 사용자 2 정보
   * @returns 채팅방 ID
   */
  async createOrGetChatRoom(
    userId1: string,
    userId2: string,
    user1Data: { name: string; photo: string | null },
    user2Data: { name: string; photo: string | null },
  ): Promise<string> {
    try {
      // 채팅방 ID 생성 (항상 같은 순서로)
      const roomId = this.generateRoomId(userId1, userId2);

      // 채팅방 존재 여부 확인
      const roomRef = database.ref(`chatRooms/${roomId}`);
      const snapshot = await roomRef.once('value');

      if (!snapshot.exists()) {
        // 새 채팅방 생성
        const now = Date.now();

        const chatRoom: ChatRoom = {
          roomId,
          participants: [userId1, userId2],
          participantNames: {
            [userId1]: user1Data.name,
            [userId2]: user2Data.name,
          },
          participantPhotos: {
            [userId1]: user1Data.photo,
            [userId2]: user2Data.photo,
          },
          lastMessage: null,
          unreadCount: {
            [userId1]: 0,
            [userId2]: 0,
          },
          createdAt: now,
          updatedAt: now,
        };

        await roomRef.set(chatRoom);
      }

      return roomId;
    } catch (error) {
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 메시지 전송
   *
   * @param roomId - 채팅방 ID
   * @param senderId - 발신자 ID
   * @param senderName - 발신자 이름
   * @param senderPhoto - 발신자 사진
   * @param text - 메시지 내용
   * @param type - 메시지 타입
   * @param imageData - 이미지 데이터 (type이 'image'일 때)
   * @returns 메시지 ID
   */
  async sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | null,
    text: string,
    type: 'text' | 'image' = 'text',
    imageData?: {
      url: string;
      width: number;
      height: number;
    },
  ): Promise<string> {
    try {
      // 새 메시지 참조 생성
      const messageRef = database.ref(`messages/${roomId}`).push();
      const messageId = messageRef.key!;

      const now = Date.now();

      // 메시지 데이터
      const message: ChatMessage = {
        messageId,
        roomId,
        senderId,
        senderName,
        senderPhoto,
        text,
        type,
        ...(imageData && {
          imageUrl: imageData.url,
          imageWidth: imageData.width,
          imageHeight: imageData.height,
        }),
        readBy: [senderId], // 발신자는 자동으로 읽음 처리
        timestamp: now,
      };

      // 메시지 저장
      await messageRef.set(message);

      // 채팅방 마지막 메시지 업데이트
      await this.updateLastMessage(roomId, senderId, senderName, text, type, now);

      // 수신자의 읽지 않은 메시지 카운트 증가
      await this.incrementUnreadCount(roomId, senderId);

      // 다른 참여자에게 채팅 메시지 푸시 알림 전송 (Cloud Function 경유)
      try {
        const roomSnapshot = await database.ref(`chatRooms/${roomId}`).once('value');
        if (roomSnapshot.exists()) {
          const roomData = roomSnapshot.val() as ChatRoom;
          const notificationText = type === 'image' ? '사진을 보냈습니다.' : text;

          // 발신자를 제외한 참여자에게 FCM 푸시 알림 전송
          const notificationPromises = roomData.participants
            .filter((participantId) => participantId !== senderId)
            .map((participantId) =>
              callFunction('sendChatNotification', {
                recipientId: participantId,
                senderName,
                message: notificationText,
                chatId: roomId,
              }),
            );

          await Promise.all(notificationPromises);
        }
      } catch (notifyError) {
        // 알림 전송 실패 시 메시지 전송에 영향 없도록 무시 (로그만 기록)
        console.warn('채팅 알림 전송 실패:', notifyError);
      }

      return messageId;
    } catch (error) {
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 메시지 읽음 처리
   *
   * @param roomId - 채팅방 ID
   * @param userId - 사용자 ID
   * @param messageId - 메시지 ID
   */
  async markMessageAsRead(roomId: string, userId: string, messageId: string): Promise<void> {
    try {
      const messageRef = database.ref(`messages/${roomId}/${messageId}`);
      const snapshot = await messageRef.once('value');

      if (snapshot.exists()) {
        const message = snapshot.val() as ChatMessage;

        // 이미 읽음 처리된 경우 스킵
        if (message.readBy?.includes(userId)) {
          return;
        }

        // readBy 배열에 userId 추가 (불변성 유지)
        const readBy = [...(message.readBy || []), userId];

        await messageRef.update({ readBy });
      }
    } catch (error) {
      console.warn('메시지 읽음 처리 실패:', error);
    }
  }

  /**
   * 채팅방의 모든 메시지 읽음 처리
   *
   * @param roomId - 채팅방 ID
   * @param userId - 사용자 ID
   */
  async markAllMessagesAsRead(roomId: string, userId: string): Promise<void> {
    try {
      // 채팅방의 모든 메시지 가져오기
      const messagesRef = database.ref(`messages/${roomId}`);
      const snapshot = await messagesRef.once('value');

      if (!snapshot.exists()) {
        return;
      }

      const messages = snapshot.val();
      const updates: Record<string, any> = {};

      // 각 메시지를 읽음 처리
      Object.keys(messages).forEach((messageId) => {
        const message = messages[messageId] as ChatMessage;

        // 본인이 보낸 메시지가 아니고, 아직 읽지 않은 메시지만
        if (message.senderId !== userId && !message.readBy?.includes(userId)) {
          const readBy = [...(message.readBy || []), userId];
          updates[`${messageId}/readBy`] = readBy;
        }
      });

      if (Object.keys(updates).length > 0) {
        await messagesRef.update(updates);
      }

      // 읽지 않은 메시지 카운트 0으로 설정
      await database.ref(`chatRooms/${roomId}/unreadCount/${userId}`).set(0);
    } catch (error) {
      console.warn('전체 메시지 읽음 처리 실패:', error);
    }
  }

  /**
   * 채팅방 목록 실시간 구독
   *
   * @param userId - 사용자 ID
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  subscribeToChatRooms(userId: string, callback: (rooms: ChatRoom[]) => void): () => void {
    const roomsRef = database.ref('chatRooms').orderByChild('updatedAt');

    const onValueChange = roomsRef.on('value', (snapshot) => {
      const rooms: ChatRoom[] = [];

      if (snapshot.exists()) {
        const data = snapshot.val();

        // 내가 참여한 채팅방만 필터링
        Object.values(data).forEach((room: any) => {
          if (room.participants?.includes(userId)) {
            rooms.push(room);
          }
        });

        // 최근 메시지 순으로 정렬
        rooms.sort((a, b) => b.updatedAt - a.updatedAt);
      }

      callback(rooms);
    });

    // Unsubscribe function 반환
    return () => {
      roomsRef.off('value', onValueChange);
    };
  }

  /**
   * 메시지 목록 실시간 구독
   *
   * @param roomId - 채팅방 ID
   * @param callback - 콜백 함수
   * @param limit - 메시지 개수 제한 (기본: 50)
   * @returns Unsubscribe function
   */
  subscribeToMessages(
    roomId: string,
    callback: (messages: ChatMessage[]) => void,
    limit: number = 50,
  ): () => void {
    const messagesRef = database
      .ref(`messages/${roomId}`)
      .orderByChild('timestamp')
      .limitToLast(limit);

    const onValueChange = messagesRef.on('value', (snapshot) => {
      const messages: ChatMessage[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          messages.push(child.val() as ChatMessage);
          return undefined;
        });
      }

      callback(messages);
    });

    // Unsubscribe function 반환
    return () => {
      messagesRef.off('value', onValueChange);
    };
  }

  /**
   * 타이핑 상태 설정
   *
   * @param roomId - 채팅방 ID
   * @param userId - 사용자 ID
   * @param isTyping - 타이핑 여부
   */
  async setTypingStatus(roomId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = database.ref(`typing/${roomId}/${userId}`);

      if (isTyping) {
        await typingRef.set({
          userId,
          isTyping: true,
          timestamp: RealtimeTimestamp.now(),
        });

        // 3초 후 자동으로 타이핑 상태 제거
        setTimeout(async () => {
          await typingRef.remove();
        }, 3000);
      } else {
        await typingRef.remove();
      }
    } catch (error) {
      console.warn('타이핑 상태 설정 실패:', error);
    }
  }

  /**
   * 타이핑 상태 실시간 구독
   *
   * @param roomId - 채팅방 ID
   * @param currentUserId - 현재 사용자 ID (본인 제외)
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  subscribeToTypingStatus(
    roomId: string,
    currentUserId: string,
    callback: (isTyping: boolean) => void,
  ): () => void {
    const typingRef = database.ref(`typing/${roomId}`);

    const onValueChange = typingRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const typingData = snapshot.val();

        // 다른 사용자가 타이핑 중인지 확인
        const otherUserTyping = Object.values(typingData).some(
          (status: any) => status.userId !== currentUserId && status.isTyping,
        );

        callback(otherUserTyping);
      } else {
        callback(false);
      }
    });

    return () => {
      typingRef.off('value', onValueChange);
    };
  }

  /**
   * 채팅방 마지막 메시지 업데이트
   *
   * @param roomId - 채팅방 ID
   * @param senderId - 발신자 ID
   * @param senderName - 발신자 이름
   * @param text - 메시지 내용
   * @param type - 메시지 타입
   * @param timestamp - 타임스탬프
   */
  private async updateLastMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    text: string,
    type: 'text' | 'image',
    timestamp: number,
  ): Promise<void> {
    try {
      const roomRef = database.ref(`chatRooms/${roomId}`);

      await roomRef.update({
        lastMessage: {
          text: type === 'image' ? '📷 사진' : text,
          senderId,
          senderName,
          timestamp,
          type,
        },
        updatedAt: timestamp,
      });
    } catch (error: any) {
      console.warn('채팅 작업 실패:', error?.message);
    }
  }

  /**
   * 읽지 않은 메시지 카운트 증가
   *
   * @param roomId - 채팅방 ID
   * @param senderId - 발신자 ID (제외)
   */
  private async incrementUnreadCount(roomId: string, senderId: string): Promise<void> {
    try {
      const roomRef = database.ref(`chatRooms/${roomId}`);
      const snapshot = await roomRef.once('value');

      if (snapshot.exists()) {
        const room = snapshot.val() as ChatRoom;

        // 발신자가 아닌 참여자들의 읽지 않은 카운트 증가
        const updates: Record<string, number> = {};

        room.participants.forEach((participantId) => {
          if (participantId !== senderId) {
            const currentCount = room.unreadCount?.[participantId] || 0;
            updates[`unreadCount/${participantId}`] = currentCount + 1;
          }
        });

        await roomRef.update(updates);
      }
    } catch (error: any) {
      console.warn('채팅 작업 실패:', error?.message);
    }
  }

  /**
   * 채팅방 ID 생성 (항상 같은 순서로)
   *
   * @param userId1 - 사용자 1 ID
   * @param userId2 - 사용자 2 ID
   * @returns 채팅방 ID
   */
  private generateRoomId(userId1: string, userId2: string): string {
    const sorted = [userId1, userId2].sort();
    return `chat_${sorted[0]}_${sorted[1]}`;
  }

  /**
   * 채팅방 나가기
   *
   * @param roomId - 채팅방 ID
   * @param userId - 사용자 ID
   */
  async leaveChatRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomRef = database.ref(`chatRooms/${roomId}`);
      const snapshot = await roomRef.once('value');

      if (!snapshot.exists()) {
        return;
      }

      const room = snapshot.val() as ChatRoom;
      const remainingParticipants = room.participants.filter((id) => id !== userId);

      if (remainingParticipants.length === 0) {
        // 마지막 참가자가 나가면 채팅방 + 메시지 삭제
        await roomRef.remove();
        await database.ref(`messages/${roomId}`).remove();
        await database.ref(`typing/${roomId}`).remove();
      } else {
        // 참가자 목록에서 제거하고 관련 데이터 정리
        const updates: Record<string, any> = {
          participants: remainingParticipants,
          updatedAt: Date.now(),
        };

        // 나간 사용자의 이름/사진/unreadCount 정리
        delete room.participantNames?.[userId];
        delete room.participantPhotos?.[userId];
        delete room.unreadCount?.[userId];
        updates.participantNames = room.participantNames;
        updates.participantPhotos = room.participantPhotos;
        updates.unreadCount = room.unreadCount;

        await roomRef.update(updates);
      }
    } catch (error) {
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 오래된 메시지 삭제 (30일 이상)
   *
   * @param roomId - 채팅방 ID
   */
  async deleteOldMessages(roomId: string): Promise<void> {
    try {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const messagesRef = database
        .ref(`messages/${roomId}`)
        .orderByChild('timestamp')
        .endAt(thirtyDaysAgo);

      const snapshot = await messagesRef.once('value');

      if (snapshot.exists()) {
        const updates: Record<string, null> = {};

        snapshot.forEach((child) => {
          updates[child.key!] = null;
          return undefined;
        });

        await database.ref(`messages/${roomId}`).update(updates);
      }
    } catch (error: any) {
      console.warn('채팅 작업 실패:', error?.message);
    }
  }
}

// 싱글톤 인스턴스 export
export const firebaseChat = new FirebaseChatService();

export default firebaseChat;
