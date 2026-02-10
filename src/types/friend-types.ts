// friends-types.ts - 친구 시스템 타입 정의

export type FriendshipStatus = 'accepted' | 'pending' | 'blocked';

export interface Friend {
  id: string;
  name: string;
  image: string;
  handicap: number;
  location: string;
  bio: string;
  mutualFriends: number;
  status: FriendshipStatus;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  userHandicap: number;
  userLocation: string;
  mutualFriends: number;
  message?: string;
  createdAt: string;
  type: 'received' | 'sent';
}

export interface FriendStats {
  totalFriends: number;
  totalMeetups: number;
  totalRounds: number;
}
