// chat-types.ts - 채팅 시스템 타입 정의

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
  participants: {
    uid: string;
    name: string;
    avatar?: string;
  }[];
  participantIds: string[]; // uid 배열 (Firestore array-contains 쿼리용)
  lastMessage?: {
    message: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}
