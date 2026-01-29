// 🔐 인증 상태 관리 Store
// Zustand로 사용자 로그인 상태 관리

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export interface User {
  id: string;
  kakaoId: string;
  email?: string;
  nickname: string;
  avatar?: string;
  phone?: string;
  createdAt: number;
  handicap?: number;
  location?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (kakaoId: string, profile: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@golf_pub_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (isLoading) => set({ isLoading }),

  /**
   * 로그인 (Kakao ID로 사용자 생성/조회)
   */
  login: async (kakaoId: string, profile: any) => {
    try {
      set({ isLoading: true });
      console.log('📝 사용자 로그인 처리 시작:', kakaoId);

      // 1. Firebase에서 사용자 조회
      const userDoc = await firestore()
        .collection('users')
        .doc(kakaoId)
        .get();

      let userData: User;

      if (userDoc.exists) {
        // 기존 사용자
        console.log('✅ 기존 사용자 로그인');
        userData = userDoc.data() as User;
      } else {
        // 신규 사용자 생성
        console.log('🆕 신규 사용자 생성');
        userData = {
          id: kakaoId,
          kakaoId: kakaoId,
          email: profile.email,
          nickname: profile.nickname || '골프 애호가',
          avatar: profile.profileImageUrl,
          createdAt: Date.now(),
        };

        await firestore()
          .collection('users')
          .doc(kakaoId)
          .set(userData);

        console.log('✅ 신규 사용자 생성 완료');
      }

      // 2. AsyncStorage에 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      // 3. 상태 업데이트
      set({ 
        user: userData, 
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('✅ 로그인 완료:', userData.nickname);
    } catch (error) {
      console.error('❌ 로그인 처리 실패:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  logout: async () => {
    try {
      set({ isLoading: true });
      console.log('🔓 로그아웃 시작...');

      // 1. AsyncStorage 삭제
      await AsyncStorage.removeItem(STORAGE_KEY);

      // 2. 상태 초기화
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
      });

      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 프로필 업데이트
   */
  updateProfile: async (updates: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      console.log('📝 프로필 업데이트 시작:', updates);

      // 1. Firebase 업데이트
      await firestore()
        .collection('users')
        .doc(user.id)
        .update(updates);

      // 2. 로컬 상태 업데이트
      const updatedUser = { ...user, ...updates };
      
      // 3. AsyncStorage 업데이트
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // 4. 상태 업데이트
      set({ user: updatedUser });

      console.log('✅ 프로필 업데이트 완료');
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      throw error;
    }
  },

  /**
   * 저장된 사용자 정보 불러오기 (자동 로그인)
   */
  loadUserFromStorage: async () => {
    try {
      set({ isLoading: true });
      console.log('💾 저장된 사용자 정보 불러오기...');

      const userJson = await AsyncStorage.getItem(STORAGE_KEY);

      if (userJson) {
        const user = JSON.parse(userJson) as User;
        console.log('✅ 자동 로그인 성공:', user.nickname);
        
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        console.log('ℹ️ 저장된 사용자 정보 없음');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('❌ 사용자 정보 불러오기 실패:', error);
      set({ isLoading: false });
    }
  },
}));
