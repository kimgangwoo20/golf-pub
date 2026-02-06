// 🔐 firebaseAuth.ts
// Firebase Authentication (카카오 Custom Token 인증)

import { auth, firestore, FirestoreTimestamp, handleFirebaseError } from './firebaseConfig';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

/**
 * 사용자 프로필 인터페이스
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  handicap: number;
  role: 'GENERAL' | 'COACH' | 'ADMIN';
  isCoach: boolean;
  coachVerified: boolean;
  points: number;
  membershipLevel: 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM';
  location: {
    city: string;
    district: string;
  } | null;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
}

/**
 * 카카오 사용자 정보 인터페이스
 */
export interface KakaoUserInfo {
  id: string;
  kakao_account: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    phone_number?: string;
  };
}

/**
 * Firebase Authentication Service
 */
class FirebaseAuthService {
  /**
   * 카카오 Custom Token으로 로그인
   *
   * @param customToken - 백엔드에서 발급받은 Custom Token
   * @param kakaoUserInfo - 카카오 사용자 정보
   * @returns Firebase User Credential
   */
  async loginWithKakao(
    customToken: string,
    kakaoUserInfo: KakaoUserInfo
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      console.log('🔐 카카오 Custom Token 로그인 시작...');

      // Custom Token으로 Firebase 인증
      const userCredential = await auth.signInWithCustomToken(customToken);

      console.log('✅ Firebase 인증 성공:', userCredential.user.uid);

      // Firestore에 사용자 프로필 저장/업데이트
      await this.updateUserProfile(userCredential.user.uid, kakaoUserInfo);

      // 마지막 로그인 시간 업데이트
      await this.updateLastLogin(userCredential.user.uid);

      return userCredential;
    } catch (error) {
      console.error('❌ 카카오 로그인 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 이메일/비밀번호로 로그인
   *
   * @param email - 이메일
   * @param password - 비밀번호
   * @returns Firebase User Credential
   */
  async loginWithEmail(
    email: string,
    password: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      console.log('📧 이메일 로그인 시작...', email);

      const userCredential = await auth.signInWithEmailAndPassword(email, password);

      console.log('✅ 이메일 로그인 성공:', userCredential.user.uid);

      // 마지막 로그인 시간 업데이트
      await this.updateLastLogin(userCredential.user.uid);

      return userCredential;
    } catch (error) {
      console.error('❌ 이메일 로그인 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 이메일/비밀번호로 회원가입
   *
   * @param email - 이메일
   * @param password - 비밀번호
   * @param displayName - 닉네임
   * @returns Firebase User Credential
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      console.log('📝 이메일 회원가입 시작...', email);

      // Firebase Authentication 회원가입
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // 프로필 업데이트
      await userCredential.user.updateProfile({
        displayName,
      });

      console.log('✅ 이메일 회원가입 성공:', userCredential.user.uid);

      // Firestore에 기본 프로필 생성
      await this.createUserProfile(userCredential.user.uid, {
        email,
        displayName,
        photoURL: null,
        phoneNumber: null,
      });

      return userCredential;
    } catch (error) {
      console.error('❌ 이메일 회원가입 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 익명 로그인
   *
   * @returns Firebase User Credential
   */
  async loginAnonymously(): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      console.log('👤 익명 로그인 시작...');

      const userCredential = await auth.signInAnonymously();

      console.log('✅ 익명 로그인 성공:', userCredential.user.uid);

      return userCredential;
    } catch (error) {
      console.error('❌ 익명 로그인 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 로그아웃 시작...');

      const user = auth.currentUser;
      if (user) {
        // 온라인 상태를 오프라인으로 변경
        await this.setUserOffline(user.uid);
      }

      await auth.signOut();

      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 현재 사용자 가져오기
   *
   * @returns Firebase User | null
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth.currentUser;
  }

  /**
   * 사용자 프로필 가져오기
   *
   * @param uid - 사용자 ID
   * @returns UserProfile | null
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const doc = await firestore.collection('users').doc(uid).get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as UserProfile;
    } catch (error) {
      console.error('❌ 프로필 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * Firestore에 사용자 프로필 생성
   *
   * @param uid - 사용자 ID
   * @param data - 사용자 정보
   */
  private async createUserProfile(
    uid: string,
    data: {
      email: string | null;
      displayName: string | null;
      photoURL: string | null;
      phoneNumber: string | null;
    }
  ): Promise<void> {
    try {
      const userProfile: UserProfile = {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        phoneNumber: data.phoneNumber,
        handicap: 0,
        role: 'GENERAL',
        isCoach: false,
        coachVerified: false,
        points: 0,
        membershipLevel: 'FREE',
        location: null,
        createdAt: FirestoreTimestamp.now(),
        updatedAt: FirestoreTimestamp.now(),
        lastLoginAt: FirestoreTimestamp.now(),
      };

      await firestore.collection('users').doc(uid).set(userProfile);

      console.log('✅ 사용자 프로필 생성 완료:', uid);
    } catch (error) {
      console.error('❌ 프로필 생성 실패:', error);
      throw error;
    }
  }

  /**
   * Firestore에 사용자 프로필 업데이트
   *
   * @param uid - 사용자 ID
   * @param kakaoUserInfo - 카카오 사용자 정보
   */
  private async updateUserProfile(
    uid: string,
    kakaoUserInfo: KakaoUserInfo
  ): Promise<void> {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const doc = await userRef.get();

      const profile = kakaoUserInfo.kakao_account.profile;

      if (!doc.exists) {
        // 신규 사용자 - 프로필 생성
        await this.createUserProfile(uid, {
          email: kakaoUserInfo.kakao_account.email || null,
          displayName: profile?.nickname || null,
          photoURL: profile?.profile_image_url || null,
          phoneNumber: kakaoUserInfo.kakao_account.phone_number || null,
        });
      } else {
        // 기존 사용자 - 프로필 업데이트
        await userRef.update({
          email: kakaoUserInfo.kakao_account.email || doc.data()?.email,
          displayName: profile?.nickname || doc.data()?.displayName,
          photoURL: profile?.profile_image_url || doc.data()?.photoURL,
          phoneNumber: kakaoUserInfo.kakao_account.phone_number || doc.data()?.phoneNumber,
          updatedAt: FirestoreTimestamp.now(),
        });

        console.log('✅ 사용자 프로필 업데이트 완료:', uid);
      }
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 마지막 로그인 시간 업데이트
   *
   * @param uid - 사용자 ID
   */
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await firestore.collection('users').doc(uid).update({
        lastLoginAt: FirestoreTimestamp.now(),
      });

      // 온라인 상태로 변경
      await this.setUserOnline(uid);
    } catch (error) {
      console.error('⚠️ 마지막 로그인 시간 업데이트 실패:', error);
      // 로그인은 성공했으므로 에러를 던지지 않음
    }
  }

  /**
   * 사용자 온라인 상태로 변경
   *
   * @param uid - 사용자 ID
   */
  private async setUserOnline(uid: string): Promise<void> {
    try {
      await firestore.collection('users').doc(uid).update({
        isOnline: true,
        lastSeenAt: FirestoreTimestamp.now(),
      });
    } catch (error) {
      console.error('⚠️ 온라인 상태 변경 실패:', error);
    }
  }

  /**
   * 사용자 오프라인 상태로 변경
   *
   * @param uid - 사용자 ID
   */
  private async setUserOffline(uid: string): Promise<void> {
    try {
      await firestore.collection('users').doc(uid).update({
        isOnline: false,
        lastSeenAt: FirestoreTimestamp.now(),
      });
    } catch (error) {
      console.error('⚠️ 오프라인 상태 변경 실패:', error);
    }
  }

  /**
   * 프로필 업데이트
   *
   * @param uid - 사용자 ID
   * @param updates - 업데이트할 데이터
   */
  async updateProfile(
    uid: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      await firestore.collection('users').doc(uid).update({
        ...updates,
        updatedAt: FirestoreTimestamp.now(),
      });

      console.log('✅ 프로필 업데이트 성공:', uid);
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 핸디캡 업데이트
   *
   * @param uid - 사용자 ID
   * @param handicap - 핸디캡
   */
  async updateHandicap(uid: string, handicap: number): Promise<void> {
    try {
      await firestore.collection('users').doc(uid).update({
        handicap,
        updatedAt: FirestoreTimestamp.now(),
      });

      console.log('✅ 핸디캡 업데이트 성공:', uid, handicap);
    } catch (error) {
      console.error('❌ 핸디캡 업데이트 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 코치 인증
   *
   * @param uid - 사용자 ID
   */
  async verifyCoach(uid: string): Promise<void> {
    try {
      await firestore.collection('users').doc(uid).update({
        isCoach: true,
        coachVerified: true,
        role: 'COACH',
        updatedAt: FirestoreTimestamp.now(),
      });

      console.log('✅ 코치 인증 완료:', uid);
    } catch (error) {
      console.error('❌ 코치 인증 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 포인트 추가
   *
   * @param uid - 사용자 ID
   * @param points - 포인트
   * @param reason - 사유
   */
  async addPoints(uid: string, points: number, reason: string): Promise<void> {
    try {
      const userRef = firestore.collection('users').doc(uid);

      // 트랜잭션으로 포인트 추가
      await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(userRef);

        if (!doc.exists) {
          throw new Error('사용자를 찾을 수 없습니다.');
        }

        const currentPoints = doc.data()?.points || 0;
        const newPoints = currentPoints + points;

        transaction.update(userRef, {
          points: newPoints,
          updatedAt: FirestoreTimestamp.now(),
        });

        // 포인트 히스토리 기록
        const historyRef = firestore
          .collection('users')
          .doc(uid)
          .collection('pointHistory')
          .doc();

        transaction.set(historyRef, {
          amount: points,
          reason,
          balance: newPoints,
          createdAt: FirestoreTimestamp.now(),
        });
      });

      console.log('✅ 포인트 추가 완료:', uid, points);
    } catch (error) {
      console.error('❌ 포인트 추가 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 포인트 차감
   *
   * @param uid - 사용자 ID
   * @param points - 포인트
   * @param reason - 사유
   */
  async deductPoints(uid: string, points: number, reason: string): Promise<void> {
    try {
      const userRef = firestore.collection('users').doc(uid);

      // 트랜잭션으로 포인트 차감
      await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(userRef);

        if (!doc.exists) {
          throw new Error('사용자를 찾을 수 없습니다.');
        }

        const currentPoints = doc.data()?.points || 0;

        if (currentPoints < points) {
          throw new Error('포인트가 부족합니다.');
        }

        const newPoints = currentPoints - points;

        transaction.update(userRef, {
          points: newPoints,
          updatedAt: FirestoreTimestamp.now(),
        });

        // 포인트 히스토리 기록
        const historyRef = firestore
          .collection('users')
          .doc(uid)
          .collection('pointHistory')
          .doc();

        transaction.set(historyRef, {
          amount: -points,
          reason,
          balance: newPoints,
          createdAt: FirestoreTimestamp.now(),
        });
      });

      console.log('✅ 포인트 차감 완료:', uid, points);
    } catch (error) {
      console.error('❌ 포인트 차감 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 회원 탈퇴
   *
   * @param uid - 사용자 ID
   */
  async deleteAccount(uid: string): Promise<void> {
    try {
      console.log('🗑️ 회원 탈퇴 시작...', uid);

      // Firestore 사용자 문서 삭제
      await firestore.collection('users').doc(uid).delete();

      // Firebase Auth 사용자 삭제
      const user = auth.currentUser;
      if (user && user.uid === uid) {
        await user.delete();
      }

      console.log('✅ 회원 탈퇴 완료:', uid);
    } catch (error) {
      console.error('❌ 회원 탈퇴 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 인증 상태 변경 리스너 등록
   *
   * @param callback - 콜백 함수
   * @returns Unsubscribe function
   */
  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ): () => void {
    return auth.onAuthStateChanged(callback);
  }
}

// 싱글톤 인스턴스 export
export const firebaseAuth = new FirebaseAuthService();

export default firebaseAuth;