// useProfileStore.ts - 프로필 상태 관리
import { create } from 'zustand';

interface Stats {
  totalGames: number;
  averageScore: number;
  bestScore: number;
  handicap: number;
  experienceYears: number;
}

interface Activity {
  id: number;
  type: 'booking' | 'post' | 'review' | 'friend';
  title: string;
  description: string;
  date: string;
  metadata?: any;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

interface Profile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  location: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  membership: 'FREE' | 'PRO' | 'PREMIUM';
  points: number;
  stats: Stats;
  activities: Activity[];
  reviews: Review[];
  settings: {
    notifications: boolean;
    locationSharing: boolean;
    profilePublic: boolean;
  };
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
  updateSettings: (settings: Partial<Profile['settings']>) => Promise<void>;
  loadActivities: () => Promise<void>;
  loadReviews: () => Promise<void>;
  addPoints: (amount: number, reason: string) => Promise<void>;
  usePoints: (amount: number, reason: string) => Promise<void>;
  clearError: () => void;
}

// Mock 데이터
const MOCK_PROFILE: Profile = {
  id: 1,
  name: '홍길동',
  email: 'hong@golf.com',
  phone: '010-1234-5678',
  avatar: 'https://i.pravatar.cc/150?img=1',
  bio: '주말 골퍼입니다. 같이 라운딩하실 분 환영해요!',
  location: '서울 강남구',
  level: 'intermediate',
  membership: 'PRO',
  points: 15000,
  stats: {
    totalGames: 48,
    averageScore: 95,
    bestScore: 88,
    handicap: 18,
    experienceYears: 2,
  },
  activities: [
    {
      id: 1,
      type: 'booking',
      title: '세라지오CC 라운딩',
      description: '부킹에 참가했습니다',
      date: '2026-01-24T10:00:00Z',
    },
    {
      id: 2,
      type: 'review',
      title: '리뷰 작성',
      description: '김골프님에게 리뷰를 남겼습니다',
      date: '2026-01-23T15:30:00Z',
    },
  ],
  reviews: [
    {
      id: 1,
      rating: 5,
      comment: '매너 좋으시고 실력도 좋으세요!',
      reviewer: {
        id: 2,
        name: '김골프',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      createdAt: '2026-01-23T10:00:00Z',
    },
  ],
  settings: {
    notifications: true,
    locationSharing: true,
    profilePublic: true,
  },
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  // 프로필 불러오기
  loadProfile: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await profileAPI.getProfile();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ profile: MOCK_PROFILE, loading: false });
    } catch (error: any) {
      set({ error: error.message || '프로필 불러오기 실패', loading: false });
    }
  },

  // 프로필 업데이트
  updateProfile: async (data: Partial<Profile>) => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await profileAPI.updateProfile(data);
      
      const profile = get().profile;
      if (!profile) throw new Error('프로필이 없습니다');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ 
        profile: { ...profile, ...data },
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message || '프로필 업데이트 실패', loading: false });
    }
  },

  // 프로필 사진 업데이트
  updateAvatar: async (uri: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출 (이미지 업로드)
      // const imageUrl = await profileAPI.uploadAvatar(uri);
      
      const profile = get().profile;
      if (!profile) throw new Error('프로필이 없습니다');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ 
        profile: { ...profile, avatar: uri },
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message || '프로필 사진 업데이트 실패', loading: false });
    }
  },

  // 설정 업데이트
  updateSettings: async (settings: Partial<Profile['settings']>) => {
    try {
      // TODO: 실제 API 호출
      const profile = get().profile;
      if (!profile) throw new Error('프로필이 없습니다');
      
      set({ 
        profile: { 
          ...profile, 
          settings: { ...profile.settings, ...settings }
        }
      });
    } catch (error: any) {
      set({ error: error.message || '설정 업데이트 실패' });
    }
  },

  // 활동 내역 불러오기
  loadActivities: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await profileAPI.getActivities();
      
      const profile = get().profile;
      if (!profile) throw new Error('프로필이 없습니다');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      // Mock: 이미 profile에 activities 있음
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || '활동 내역 불러오기 실패', loading: false });
    }
  },

  // 리뷰 불러오기
  loadReviews: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await profileAPI.getReviews();
      
      const profile = get().profile;
      if (!profile) throw new Error('프로필이 없습니다');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      // Mock: 이미 profile에 reviews 있음
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || '리뷰 불러오기 실패', loading: false });
    }
  },

  // 포인트 추가 (출석, 리뷰 작성 등)
  addPoints: async (amount: number, reason: string) => {
    try {
      // TODO: 실제 API 호출
      const profile = get().profile;
      if (!profile) throw new Error('프로필이 없습니다');
      
      set({ 
        profile: { 
          ...profile, 
          points: profile.points + amount 
        }
      });
      
      console.log(`포인트 ${amount}점 적립: ${reason}`);
    } catch (error: any) {
      set({ error: error.message || '포인트 적립 실패' });
    }
  },

  // 포인트 사용 (쿠폰, 혜택 등)
  usePoints: async (amount: number, reason: string) => {
    try {
      // TODO: 실제 API 호출
      const profile = get().profile;
      if (!profile) throw new Error('프로필이 없습니다');
      
      if (profile.points < amount) {
        throw new Error('포인트가 부족합니다');
      }
      
      set({ 
        profile: { 
          ...profile, 
          points: profile.points - amount 
        }
      });
      
      console.log(`포인트 ${amount}점 사용: ${reason}`);
    } catch (error: any) {
      set({ error: error.message || '포인트 사용 실패' });
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));
