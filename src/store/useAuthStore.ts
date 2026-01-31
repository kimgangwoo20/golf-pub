import { create } from 'zustand';
import authService, { UserProfile } from '../services/authService';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  signInWithCustomToken: (token: string) => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  createUserWithEmailAndPassword: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUserProfile: (uid: string) => Promise<void>;
  updateUserProfile: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  /**
   * Custom Token으로 로그인
   */
  signInWithCustomToken: async (token: string) => {
    try {
      set({ loading: true, error: null });

      const userCredential = await authService.signInWithCustomToken(token);
      const profile = await authService.getUserProfile(userCredential.user.uid);

      set({
        user: userCredential.user,
        userProfile: profile,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      console.error('로그인 실패:', error);
      set({
        error: error.message || '로그인에 실패했습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 이메일/비밀번호 로그인
   */
  signInWithEmailAndPassword: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const userCredential = await authService.signInWithEmailAndPassword(email, password);
      const profile = await authService.getUserProfile(userCredential.user.uid);

      set({
        user: userCredential.user,
        userProfile: profile,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      console.error('로그인 실패:', error);
      set({
        error: error.message || '로그인에 실패했습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 이메일/비밀번호 회원가입
   */
  createUserWithEmailAndPassword: async (email: string, password: string, displayName: string) => {
    try {
      set({ loading: true, error: null });

      const userCredential = await authService.createUserWithEmailAndPassword(email, password, displayName);
      const profile = await authService.getUserProfile(userCredential.user.uid);

      set({
        user: userCredential.user,
        userProfile: profile,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      set({
        error: error.message || '회원가입에 실패했습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  signOut: async () => {
    try {
      set({ loading: true, error: null });

      await authService.signOut();

      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error: any) {
      console.error('로그아웃 실패:', error);
      set({
        error: error.message || '로그아웃에 실패했습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 사용자 프로필 로드
   */
  loadUserProfile: async (uid: string) => {
    try {
      set({ loading: true, error: null });

      const profile = await authService.getUserProfile(uid);

      set({
        userProfile: profile,
        loading: false,
      });
    } catch (error: any) {
      console.error('프로필 로드 실패:', error);
      set({
        error: error.message || '프로필을 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  /**
   * 사용자 프로필 업데이트
   */
  updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
    try {
      set({ loading: true, error: null });

      await authService.updateUserProfile(uid, data);

      // 로컬 상태 업데이트
      const { userProfile } = get();
      if (userProfile) {
        set({
          userProfile: { ...userProfile, ...data },
          loading: false,
        });
      }
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      set({
        error: error.message || '프로필을 업데이트할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Auth 초기화 (앱 시작 시 호출)
   */
  initAuth: () => {
    authService.onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await authService.getUserProfile(user.uid);
        set({
          user,
          userProfile: profile,
          isAuthenticated: true,
        });
      } else {
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
        });
      }
    });
  },
}));
