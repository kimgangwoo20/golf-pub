// useFriendStore.ts - 친구 상태 관리
import { create } from 'zustand';

interface Friend {
  id: number;
  name: string;
  avatar: string;
  level: string;
  handicap?: number;
  status: 'online' | 'offline';
  mutualFriends?: number;
}

interface FriendRequest {
  id: number;
  from: Friend;
  message?: string;
  createdAt: string;
}

interface Group {
  id: number;
  name: string;
  memberCount: number;
  members: Friend[];
  createdAt: string;
}

interface FriendState {
  friends: Friend[];
  requests: FriendRequest[];
  groups: Group[];
  loading: boolean;
  error: string | null;

  // Actions
  loadFriends: () => Promise<void>;
  loadRequests: () => Promise<void>;
  loadGroups: () => Promise<void>;
  addFriend: (friendId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
  acceptRequest: (requestId: number) => Promise<void>;
  rejectRequest: (requestId: number) => Promise<void>;
  sendRequest: (friendId: number, message?: string) => Promise<void>;
  createGroup: (name: string, memberIds: number[]) => Promise<void>;
  updateGroup: (groupId: number, data: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;
  clearError: () => void;
}

// Mock 데이터
const MOCK_FRIENDS: Friend[] = [
  { id: 1, name: '김철수', avatar: 'https://i.pravatar.cc/150?img=12', level: '중급', handicap: 18, status: 'online', mutualFriends: 5 },
  { id: 2, name: '이영희', avatar: 'https://i.pravatar.cc/150?img=25', level: '초급', handicap: 28, status: 'offline', mutualFriends: 3 },
  { id: 3, name: '박민수', avatar: 'https://i.pravatar.cc/150?img=33', level: '고급', handicap: 8, status: 'online', mutualFriends: 12 },
];

const MOCK_REQUESTS: FriendRequest[] = [
  { 
    id: 1, 
    from: { id: 10, name: '정수진', avatar: 'https://i.pravatar.cc/150?img=44', level: '중급', status: 'online' },
    message: '같이 라운딩해요!',
    createdAt: '2026-01-25T10:00:00Z'
  },
];

const MOCK_GROUPS: Group[] = [
  { 
    id: 1, 
    name: '주말 골프 모임', 
    memberCount: 8, 
    members: MOCK_FRIENDS.slice(0, 3),
    createdAt: '2026-01-20T10:00:00Z'
  },
];

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  requests: [],
  groups: [],
  loading: false,
  error: null,

  // 친구 목록 불러오기
  loadFriends: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await friendAPI.getFriends();
      
      // Mock 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ friends: MOCK_FRIENDS, loading: false });
    } catch (error: any) {
      set({ error: error.message || '친구 목록 불러오기 실패', loading: false });
    }
  },

  // 친구 요청 목록 불러오기
  loadRequests: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ requests: MOCK_REQUESTS, loading: false });
    } catch (error: any) {
      set({ error: error.message || '친구 요청 불러오기 실패', loading: false });
    }
  },

  // 그룹 목록 불러오기
  loadGroups: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ groups: MOCK_GROUPS, loading: false });
    } catch (error: any) {
      set({ error: error.message || '그룹 목록 불러오기 실패', loading: false });
    }
  },

  // 친구 추가
  addFriend: async (friendId: number) => {
    try {
      // TODO: 실제 API 호출
      console.log('친구 추가:', friendId);
    } catch (error: any) {
      set({ error: error.message || '친구 추가 실패' });
    }
  },

  // 친구 삭제
  removeFriend: async (friendId: number) => {
    try {
      // TODO: 실제 API 호출
      const friends = get().friends.filter(f => f.id !== friendId);
      set({ friends });
    } catch (error: any) {
      set({ error: error.message || '친구 삭제 실패' });
    }
  },

  // 친구 요청 수락
  acceptRequest: async (requestId: number) => {
    try {
      // TODO: 실제 API 호출
      const request = get().requests.find(r => r.id === requestId);
      if (request) {
        const friends = [...get().friends, request.from];
        const requests = get().requests.filter(r => r.id !== requestId);
        set({ friends, requests });
      }
    } catch (error: any) {
      set({ error: error.message || '요청 수락 실패' });
    }
  },

  // 친구 요청 거절
  rejectRequest: async (requestId: number) => {
    try {
      // TODO: 실제 API 호출
      const requests = get().requests.filter(r => r.id !== requestId);
      set({ requests });
    } catch (error: any) {
      set({ error: error.message || '요청 거절 실패' });
    }
  },

  // 친구 요청 보내기
  sendRequest: async (friendId: number, message?: string) => {
    try {
      // TODO: 실제 API 호출
      console.log('친구 요청 전송:', friendId, message);
    } catch (error: any) {
      set({ error: error.message || '친구 요청 실패' });
    }
  },

  // 그룹 생성
  createGroup: async (name: string, memberIds: number[]) => {
    try {
      // TODO: 실제 API 호출
      const newGroup: Group = {
        id: Date.now(),
        name,
        memberCount: memberIds.length,
        members: get().friends.filter(f => memberIds.includes(f.id)),
        createdAt: new Date().toISOString(),
      };
      set({ groups: [...get().groups, newGroup] });
    } catch (error: any) {
      set({ error: error.message || '그룹 생성 실패' });
    }
  },

  // 그룹 수정
  updateGroup: async (groupId: number, data: Partial<Group>) => {
    try {
      // TODO: 실제 API 호출
      const groups = get().groups.map(g => g.id === groupId ? { ...g, ...data } : g);
      set({ groups });
    } catch (error: any) {
      set({ error: error.message || '그룹 수정 실패' });
    }
  },

  // 그룹 삭제
  deleteGroup: async (groupId: number) => {
    try {
      // TODO: 실제 API 호출
      const groups = get().groups.filter(g => g.id !== groupId);
      set({ groups });
    } catch (error: any) {
      set({ error: error.message || '그룹 삭제 실패' });
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));
