// useAuthStore.ts - 인증 상태 관리 (Firebase Auth 연동)
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { authAPI } from '../services/api/authAPI';
import { profileAPI } from '../services/api/profileAPI';

interface User {
  id: string; // Firebase UID
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
      // 1. Firebase Auth로 로그인
      const { user: firebaseUser, token } = await authAPI.login(email, password);

      // 2. Firestore에서 프로필 정보 가져오기
      const profile = await profileAPI.getMyProfile();

      // 3. User 객체 생성
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: profile?.name || firebaseUser.displayName || '사용자',
        avatar: profile?.profileImage || firebaseUser.photoURL || '',
        phone: profile?.phone || '',
        membership: 'FREE', // TODO: Firestore에서 가져오기
        points: profile?.points || 0,
        level: '초보', // TODO: 핸디캡으로 계산
      };

      // 4. AsyncStorage에 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));

      // 5. 상태 업데이트
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false
      });

      console.log('✅ 로그인 성공:', user.email);
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error);
      set({
        error: error.message || '로그인에 실패했습니다.',
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      throw error; // 에러를 다시 던져서 UI에서 처리 가능하게
    }
  },

  // 회원가입
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      // 1. Firebase Auth로 회원가입
      const { user: firebaseUser, token } = await authAPI.register(
        data.email,
        data.password,
        data.name
      );

      // 2. Firestore 프로필 업데이트 (전화번호 추가)
      await profileAPI.updateProfile({
        phone: data.phone,
      });

      // 3. 프로필 정보 다시 가져오기
      const profile = await profileAPI.getMyProfile();

      // 4. User 객체 생성
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || data.email,
        name: profile?.name || data.name,
        avatar: profile?.profileImage || '',
        phone: profile?.phone || data.phone,
        membership: 'FREE',
        points: 0,
        level: '초보',
      };

      // 5. AsyncStorage에 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));

      // 6. 상태 업데이트
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false
      });

      console.log('✅ 회원가입 성공:', user.email);
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error);
      set({
        error: error.message || '회원가입에 실패했습니다.',
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    set({ loading: true });
    try {
      // 1. Firebase Auth 로그아웃
      await authAPI.logout();

      // 2. AsyncStorage 삭제
      await AsyncStorage.removeItem(STORAGE_KEY);

      // 3. 상태 초기화
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        loading: false,
      });

      console.log('✅ 로그아웃 성공');
    } catch (error: any) {
      console.error('❌ 로그아웃 실패:', error);
      set({
        error: error.message || '로그아웃에 실패했습니다.',
        loading: false,
      });
    }
  },

  // 저장된 유저 정보 불러오기 (앱 시작 시)
  loadUser: async () => {
    set({ loading: true });
    try {
      // 1. Firebase Auth 상태 확인
      const firebaseUser = authAPI.getCurrentUser();

      if (firebaseUser) {
        // 2. AsyncStorage에서 저장된 정보 확인
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (stored) {
          const { user, token } = JSON.parse(stored);

          // 3. 토큰 유효성 확인 (선택사항)
          try {
            await authAPI.getIdToken(true); // 토큰 갱신

            // 4. 최신 프로필 정보 가져오기
            const profile = await profileAPI.getMyProfile();

            // 5. User 객체 업데이트
            const updatedUser: User = {
              ...user,
              name: profile?.name || user.name,
              avatar: profile?.profileImage || user.avatar,
              phone: profile?.phone || user.phone,
              points: profile?.points || user.points,
            };

            // 6. 상태 업데이트
            set({
              user: updatedUser,
              token,
              isAuthenticated: true,
              loading: false
            });

            console.log('✅ 자동 로그인 성공:', updatedUser.email);
          } catch (error) {
            // 토큰 만료 or 네트워크 에러
            console.log('ℹ️ 토큰 만료, 로그아웃 처리');
            await get().logout();
          }
        } else {
          // AsyncStorage에 없으면 로그아웃
          await authAPI.logout();
          set({ loading: false, isAuthenticated: false });
        }
      } else {
        // Firebase User 없으면 로그아웃 상태
        set({ loading: false, isAuthenticated: false });
        console.log('ℹ️ 로그인 안 됨');
      }
    } catch (error: any) {
      console.error('❌ 유저 정보 불러오기 실패:', error);
      set({
        error: error.message,
        loading: false,
        isAuthenticated: false,
      });
    }
  },

  // 유저 정보 업데이트
  updateUser: async (data) => {
    const { user, token } = get();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    set({ loading: true, error: null });
    try {
      // 1. Firestore 프로필 업데이트
      await profileAPI.updateProfile({
        name: data.name,
        phone: data.phone,
        // 기타 필드들
      });

      // 2. 로컬 상태 업데이트
      const updatedUser = { ...user, ...data };

      // 3. AsyncStorage 업데이트
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: updatedUser, token }));

      // 4. 상태 업데이트
      set({ user: updatedUser, loading: false });

      console.log('✅ 프로필 업데이트 성공');
    } catch (error: any) {
      console.error('❌ 프로필 업데이트 실패:', error);
      set({
        error: error.message || '프로필 업데이트에 실패했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));

// Firebase Auth 상태 변경 리스너
auth().onAuthStateChanged((firebaseUser) => {
  if (!firebaseUser) {
    // 로그아웃 상태
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      console.log('ℹ️ Firebase Auth 로그아웃 감지');
      useAuthStore.getState().logout();
    }
  }
});