// 🔐 authAPI.ts
// 인증 API - Firebase Auth Wrapper

import auth from '@react-native-firebase/auth';
import { profileAPI } from './profileAPI';

/**
 * 인증 API
 * Firebase Auth의 wrapper
 */
export const authAPI = {
  /**
   * 이메일/비밀번호 로그인
   * 
   * @param email 이메일
   * @param password 비밀번호
   * @returns 사용자 정보
   */
  login: async (email: string, password: string) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      return {
        user: userCredential.user,
        token: await userCredential.user.getIdToken(),
      };
    } catch (error: any) {
      let message = '로그인에 실패했습니다.';
      if (error.code === 'auth/user-not-found') {
        message = '존재하지 않는 계정입니다.';
      } else if (error.code === 'auth/wrong-password') {
        message = '비밀번호가 일치하지 않습니다.';
      } else if (error.code === 'auth/invalid-email') {
        message = '올바른 이메일 형식이 아닙니다.';
      } else if (error.code === 'auth/user-disabled') {
        message = '비활성화된 계정입니다.';
      }
      
      throw new Error(message);
    }
  },

  /**
   * 이메일/비밀번호 회원가입
   * 
   * @param email 이메일
   * @param password 비밀번호
   * @param name 이름
   * @returns 사용자 정보
   */
  register: async (email: string, password: string, name: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // 이름 업데이트
      await userCredential.user.updateProfile({
        displayName: name,
      });

      // Firestore에 프로필 생성
      await profileAPI.createUserProfile();

      return {
        user: userCredential.user,
        token: await userCredential.user.getIdToken(),
      };
    } catch (error: any) {
      let message = '회원가입에 실패했습니다.';
      if (error.code === 'auth/email-already-in-use') {
        message = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/invalid-email') {
        message = '올바른 이메일 형식이 아닙니다.';
      } else if (error.code === 'auth/weak-password') {
        message = '비밀번호는 최소 6자 이상이어야 합니다.';
      }
      
      throw new Error(message);
    }
  },

  /**
   * 로그아웃
   */
  logout: async () => {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error(error.message || '로그아웃에 실패했습니다.');
    }
  },

  /**
   * 현재 로그인한 사용자 가져오기
   * 
   * @returns 현재 사용자 or null
   */
  getCurrentUser: () => {
    return auth().currentUser;
  },

  /**
   * 비밀번호 재설정 이메일 전송
   * 
   * @param email 이메일
   */
  sendPasswordResetEmail: async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      let message = '이메일 전송에 실패했습니다.';
      if (error.code === 'auth/user-not-found') {
        message = '존재하지 않는 이메일입니다.';
      } else if (error.code === 'auth/invalid-email') {
        message = '올바른 이메일 형식이 아닙니다.';
      }
      
      throw new Error(message);
    }
  },

  /**
   * 비밀번호 변경
   * 
   * @param newPassword 새 비밀번호
   */
  updatePassword: async (newPassword: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      await currentUser.updatePassword(newPassword);
    } catch (error: any) {
      let message = '비밀번호 변경에 실패했습니다.';
      if (error.code === 'auth/requires-recent-login') {
        message = '보안을 위해 다시 로그인해주세요.';
      } else if (error.code === 'auth/weak-password') {
        message = '비밀번호는 최소 6자 이상이어야 합니다.';
      }
      
      throw new Error(message);
    }
  },

  /**
   * 이메일 인증 메일 전송
   */
  sendEmailVerification: async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      if (currentUser.emailVerified) {
        return;
      }

      await currentUser.sendEmailVerification();
    } catch (error: any) {
      throw new Error(error.message || '이메일 인증 메일 전송에 실패했습니다.');
    }
  },

  /**
   * 이메일 인증 여부 확인
   * 
   * @returns 인증 여부
   */
  isEmailVerified: (): boolean => {
    const currentUser = auth().currentUser;
    return currentUser?.emailVerified || false;
  },

  /**
   * 사용자 정보 새로고침
   */
  reloadUser: async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      await currentUser.reload();
    } catch (error: any) {
      throw new Error(error.message || '사용자 정보 새로고침에 실패했습니다.');
    }
  },

  /**
   * 계정 삭제
   */
  deleteAccount: async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      await currentUser.delete();
    } catch (error: any) {
      let message = '계정 삭제에 실패했습니다.';
      if (error.code === 'auth/requires-recent-login') {
        message = '보안을 위해 다시 로그인해주세요.';
      }
      
      throw new Error(message);
    }
  },

  /**
   * ID Token 가져오기
   * 
   * @param forceRefresh 강제 새로고침
   * @returns ID Token
   */
  getIdToken: async (forceRefresh: boolean = false): Promise<string> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const token = await currentUser.getIdToken(forceRefresh);
      return token;
    } catch (error: any) {
      throw new Error(error.message || 'ID Token을 가져오는데 실패했습니다.');
    }
  },

  /**
   * 인증 상태 변경 리스너 등록
   * 
   * @param callback 콜백 함수
   * @returns 구독 해제 함수
   */
  onAuthStateChanged: (
    callback: (user: any) => void
  ): (() => void) => {
    return auth().onAuthStateChanged(callback);
  },
};