// 🔐 kakaoLogin.ts
// 카카오 로그인 서비스 - Firebase 연동

import { login as kakaoLogin, getProfile as kakaoGetProfile, logout as kakaoLogout, KakaoProfile } from '@react-native-seoul/kakao-login';
import { firebaseAuth } from './firebase/firebaseAuth';

/**
 * 카카오 로그인 서비스
 * 
 * 기능:
 * - 카카오 로그인 (웹/앱)
 * - 사용자 정보 가져오기
 * - Firebase Custom Token 연동
 * - 로그아웃
 * 
 * 사용 예시:
 * ```typescript
 * import { KakaoLoginService } from './services/kakao/kakaoLogin';
 * 
 * // 로그인
 * const user = await KakaoLoginService.login();
 * 
 * // 로그아웃
 * await KakaoLoginService.logout();
 * ```
 */

// 백엔드 API URL (환경 변수로 설정)
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

/**
 * 카카오 사용자 정보 인터페이스
 */
export interface KakaoUser {
  id: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
  thumbnailImage?: string;
  kakaoAccessToken: string;
}

/**
 * 카카오 로그인 서비스 클래스
 */
class KakaoLoginServiceClass {
  private currentUser: KakaoUser | null = null;

  /**
   * 카카오 로그인
   * 
   * 프로세스:
   * 1. 카카오 로그인 (OAuth)
   * 2. 카카오 사용자 정보 가져오기
   * 3. 백엔드에서 Firebase Custom Token 발급
   * 4. Firebase 로그인
   * 5. Firestore에 사용자 프로필 저장
   * 
   * @returns KakaoUser 객체 또는 null
   */
  async login(): Promise<KakaoUser | null> {
    try {
      console.log('🔐 카카오 로그인 시작...');

      // 1. 카카오 로그인 (OAuth)
      const result = await kakaoLogin();
      console.log('✅ 카카오 로그인 성공:', result);

      // 2. 카카오 사용자 정보 가져오기
      const profile = await kakaoGetProfile();
      console.log('✅ 카카오 프로필 가져오기 성공:', profile);

      // 3. 카카오 사용자 정보 변환
      const kakaoUser: KakaoUser = {
        id: profile.id,
        email: profile.email,
        nickname: profile.nickname,
        profileImage: profile.profileImageUrl,
        thumbnailImage: profile.thumbnailImageUrl,
        kakaoAccessToken: result.accessToken,
      };

      // 4. 백엔드에서 Firebase Custom Token 발급
      const customToken = await this.getFirebaseCustomToken(kakaoUser.id, result.accessToken);
      
      if (!customToken) {
        throw new Error('Firebase Custom Token 발급 실패');
      }

      // 5. Firebase 로그인
      const firebaseUser = await firebaseAuth.loginWithKakao(customToken);
      
      if (!firebaseUser) {
        throw new Error('Firebase 로그인 실패');
      }

      // 6. Firestore에 사용자 프로필 생성/업데이트
      await firebaseAuth.createUserProfile(firebaseUser.uid, {
        email: kakaoUser.email,
        displayName: kakaoUser.nickname,
        photoURL: kakaoUser.profileImage,
        provider: 'kakao',
        kakaoId: kakaoUser.id,
      });

      this.currentUser = kakaoUser;
      console.log('✅ 카카오 → Firebase 로그인 완료!');

      return kakaoUser;
    } catch (error: any) {
      console.error('❌ 카카오 로그인 실패:', error);
      
      // 에러 메시지 한글화
      if (error.code === 'E_CANCELLED_OPERATION') {
        console.log('ℹ️ 사용자가 로그인을 취소했습니다.');
      } else if (error.message?.includes('network')) {
        throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } else if (error.message?.includes('token')) {
        throw new Error('인증 토큰 발급에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      return null;
    }
  }

  /**
   * 백엔드에서 Firebase Custom Token 발급
   * 
   * 백엔드 API 예시:
   * POST /api/auth/kakao/token
   * Body: { kakaoId: string, kakaoAccessToken: string }
   * Response: { customToken: string }
   * 
   * @param kakaoId 카카오 사용자 ID
   * @param kakaoAccessToken 카카오 액세스 토큰
   * @returns Firebase Custom Token
   */
  private async getFirebaseCustomToken(kakaoId: string, kakaoAccessToken: string): Promise<string | null> {
    try {
      console.log('🔑 Firebase Custom Token 요청 중...');

      const response = await fetch(`${BACKEND_URL}/api/auth/kakao/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kakaoId,
          kakaoAccessToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Firebase Custom Token 발급 성공');

      return data.customToken;
    } catch (error: any) {
      console.error('❌ Firebase Custom Token 발급 실패:', error);
      
      // 개발 모드에서는 경고만 표시하고 계속 진행
      if (__DEV__) {
        console.warn('⚠️ 개발 모드: Custom Token 발급 실패 (백엔드 미구현)');
        // 개발 중에는 익명 로그인으로 대체 가능
        // return null; // 실제로는 익명 로그인 사용
      }
      
      throw error;
    }
  }

  /**
   * 카카오 프로필 정보 가져오기
   * 
   * @returns KakaoProfile 객체 또는 null
   */
  async getProfile(): Promise<KakaoProfile | null> {
    try {
      const profile = await kakaoGetProfile();
      console.log('✅ 카카오 프로필:', profile);
      return profile;
    } catch (error) {
      console.error('❌ 카카오 프로필 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 로그아웃
   * 
   * 프로세스:
   * 1. Firebase 로그아웃
   * 2. 카카오 로그아웃
   * 3. 로컬 사용자 정보 삭제
   */
  async logout(): Promise<void> {
    try {
      console.log('👋 로그아웃 시작...');

      // 1. Firebase 로그아웃
      await firebaseAuth.logout();

      // 2. 카카오 로그아웃
      await kakaoLogout();

      // 3. 로컬 사용자 정보 삭제
      this.currentUser = null;

      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw error;
    }
  }

  /**
   * 현재 로그인한 사용자 정보 가져오기
   * 
   * @returns KakaoUser 객체 또는 null
   */
  getCurrentUser(): KakaoUser | null {
    return this.currentUser;
  }

  /**
   * 로그인 상태 확인
   * 
   * @returns 로그인 여부
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}

// 싱글톤 인스턴스 export
export const KakaoLoginService = new KakaoLoginServiceClass();

/**
 * 백엔드 구현 가이드
 * 
 * Node.js + Express 예시:
 * 
 * ```javascript
 * const admin = require('firebase-admin');
 * const express = require('express');
 * const router = express.Router();
 * 
 * // Firebase Admin SDK 초기화
 * admin.initializeApp({
 *   credential: admin.credential.cert(serviceAccount)
 * });
 * 
 * // 카카오 Custom Token 발급 API
 * router.post('/api/auth/kakao/token', async (req, res) => {
 *   try {
 *     const { kakaoId, kakaoAccessToken } = req.body;
 *     
 *     // 1. 카카오 액세스 토큰 검증 (선택)
 *     // const isValid = await verifyKakaoToken(kakaoAccessToken);
 *     // if (!isValid) throw new Error('Invalid token');
 *     
 *     // 2. Firebase Custom Token 생성
 *     const customToken = await admin.auth().createCustomToken(kakaoId);
 *     
 *     // 3. 응답
 *     res.json({ customToken });
 *   } catch (error) {
 *     console.error('Custom Token 발급 실패:', error);
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * module.exports = router;
 * ```
 */

/**
 * 설치 필요 패키지:
 * 
 * npm install @react-native-seoul/kakao-login
 * 
 * app.json 설정:
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "@react-native-seoul/kakao-login",
 *         {
 *           "kakaoAppKey": "YOUR_KAKAO_APP_KEY",
 *           "android": {
 *             "kakaoAppKey": "YOUR_KAKAO_APP_KEY"
 *           },
 *           "ios": {
 *             "kakaoAppKey": "YOUR_KAKAO_APP_KEY"
 *           }
 *         }
 *       ]
 *     ]
 *   }
 * }
 */
