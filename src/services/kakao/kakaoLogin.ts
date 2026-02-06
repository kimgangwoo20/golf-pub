// 🔐 Kakao 로그인 서비스
// @react-native-seoul/kakao-login 사용

import { login, logout, getProfile } from '@react-native-seoul/kakao-login';

export interface KakaoProfile {
  id: string;
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
  thumbnailImageUrl?: string;
}

export interface KakaoLoginResult {
  success: boolean;
  profile?: KakaoProfile;
  accessToken?: string;
  error?: string;
}

/**
 * Kakao 로그인 실행
 */
export const kakaoLogin = async (): Promise<KakaoLoginResult> => {
  try {
    // 1. Kakao 로그인
    const loginResult = await login();

    // 2. 프로필 가져오기
    const profile = await getProfile();

    // 3. 결과 반환
    return {
      success: true,
      profile: {
        id: profile.id,
        email: profile.email || undefined,
        nickname: profile.nickname || undefined,
        profileImageUrl: profile.profileImageUrl || undefined,
        thumbnailImageUrl: profile.thumbnailImageUrl || undefined,
      },
      accessToken: loginResult.accessToken,
    };
  } catch (error: any) {
    console.error('❌ Kakao 로그인 실패:', error);

    // 사용자 취소
    if (error.code === 'E_CANCELLED_OPERATION') {
      return {
        success: false,
        error: '로그인을 취소했습니다.',
      };
    }

    // Kakao 앱 미설치
    if (error.code === 'E_KAKAO_NOT_INSTALLED') {
      return {
        success: false,
        error: 'Kakao 앱이 설치되어 있지 않습니다.',
      };
    }

    // 기타 오류
    return {
      success: false,
      error: error.message || '로그인에 실패했습니다.',
    };
  }
};

/**
 * Kakao 로그아웃
 */
export const kakaoLogout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await logout();
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Kakao 로그아웃 실패:', error);
    return {
      success: false,
      error: error.message || '로그아웃에 실패했습니다.',
    };
  }
};

/**
 * Kakao 프로필 다시 가져오기
 */
export const getKakaoProfile = async (): Promise<{
  success: boolean;
  profile?: KakaoProfile;
  error?: string;
}> => {
  try {
    const profile = await getProfile();

    return {
      success: true,
      profile: {
        id: profile.id,
        email: profile.email || undefined,
        nickname: profile.nickname || undefined,
        profileImageUrl: profile.profileImageUrl || undefined,
        thumbnailImageUrl: profile.thumbnailImageUrl || undefined,
      },
    };
  } catch (error: any) {
    console.error('❌ Kakao 프로필 조회 실패:', error);
    return {
      success: false,
      error: error.message || '프로필 조회에 실패했습니다.',
    };
  }
};
