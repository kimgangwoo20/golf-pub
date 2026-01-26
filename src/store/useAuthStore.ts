// useAuthStore.ts - 인증 상태 관리
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  membership: 'FREE' | 'PRO' | 'PREMIUM';
  points: number;
  level: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEY = '@golf_pub_auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // 로그인
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await authAPI.login(email, password);
      
      // Mock 데이터
      const mockUser: User = {
        id: 1,
        email,
        name: '홍길동',
        avatar: 'https://i.pravatar.cc/150?img=1',
        phone: '010-1234-5678',
        membership: 'PRO',
        points: 15000,
        level: '중급',
      };
      const mockToken = 'mock_jwt_token_' + Date.now();

      // AsyncStorage에 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser, token: mockToken }));

      set({ 
        user: mockUser, 
        token: mockToken, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message || '로그인 실패', loading: false });
    }
  },

  // 회원가입
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await authAPI.register(data);

      // Mock 데이터
      const mockUser: User = {
        id: Date.now(),
        email: data.email,
        name: data.name,
        phone: data.phone,
        membership: 'FREE',
        points: 0,
        level: '초보',
      };
      const mockToken = 'mock_jwt_token_' + Date.now();

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser, token: mockToken }));

      set({ 
        user: mockUser, 
        token: mockToken, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message || '회원가입 실패', loading: false });
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        error: null 
      });
    } catch (error: any) {
      set({ error: error.message || '로그아웃 실패' });
    }
  },

  // 저장된 유저 정보 불러오기
  loadUser: async () => {
    set({ loading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { user, token } = JSON.parse(stored);
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // 유저 정보 업데이트
  updateUser: async (data) => {
    const { user, token } = get();
    if (!user) return;

    try {
      // TODO: 실제 API 호출
      // const response = await authAPI.updateProfile(data);

      const updatedUser = { ...user, ...data };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: updatedUser, token }));
      
      set({ user: updatedUser });
    } catch (error: any) {
      set({ error: error.message || '프로필 업데이트 실패' });
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));
