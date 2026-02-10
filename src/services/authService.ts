// src/services/authService.ts
import {
  auth,
  firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from '@/services/firebase/firebaseConfig';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  nickname?: string; // Kakao 로그인용
  photoURL?: string | null;
  profileImage?: string; // Kakao 로그인용
  phoneNumber?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date; // Kakao 로그인용
  provider?: 'firebase' | 'kakao' | 'email'; // 로그인 제공자
  // 추가 프로필 정보
  bio?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  handicap?: number;
  favoriteGolfCourse?: string;
  golfExperience?: number; // 골프 경력 (년)
  gender?: 'male' | 'female'; // 성별
  membership?: string; // 멤버십 타입 (FREE, PREMIUM, VIP)
}

class AuthService {
  /**
   * Custom Token으로 로그인
   */
  async signInWithCustomToken(token: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await signInWithCustomToken(auth, token);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 이메일/비밀번호 로그인
   */
  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 이메일/비밀번호 회원가입
   */
  async createUserWithEmailAndPassword(
    email: string,
    password: string,
    displayName: string,
    gender?: 'male' | 'female',
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      // Firebase Auth에 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 프로필 업데이트
      await userCredential.user.updateProfile({ displayName });

      // Firestore에 사용자 프로필 문서 생성
      await this.createUserProfile(userCredential.user.uid, {
        email,
        displayName,
        photoURL: null,
        phoneNumber: null,
        gender,
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 사용자 프로필 생성
   */
  async createUserProfile(
    uid: string,
    data: {
      email: string;
      displayName: string | null;
      photoURL: string | null;
      phoneNumber: string | null;
      gender?: 'male' | 'female';
    },
  ): Promise<void> {
    try {
      const now = new Date();
      const userProfile: Record<string, any> = {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        phoneNumber: data.phoneNumber,
        points: 0,
        pointBalance: 0,
        role: 'GENERAL',
        membership: 'FREE',
        stats: {
          hostedBookings: 0,
          joinedBookings: 0,
          totalAttendance: 0,
          consecutiveAttendance: 0,
          longestStreak: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      // gender가 있을 때만 포함 (undefined 방지)
      if (data.gender) {
        userProfile.gender = data.gender;
      }

      const userRef = doc(firestore, 'users', uid);
      await setDoc(userRef, userProfile, { merge: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists) {
        // Firestore에 프로필이 없으면 현재 Auth 정보로 생성
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
          await this.createUserProfile(uid, {
            email: currentUser.email || '',
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            phoneNumber: currentUser.phoneNumber,
          });

          // 다시 조회
          const newDocSnap = await getDoc(userRef);
          return newDocSnap.data() as unknown as UserProfile;
        }
        return null;
      }

      return docSnap.data() as unknown as UserProfile;
    } catch (error) {
      // 에러 무시
      return null;
    }
  }

  /**
   * 사용자 프로필 업데이트
   */
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, updateData);

      // Auth 프로필도 업데이트 (displayName, photoURL만 가능)
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        const authUpdateData: { displayName?: string; photoURL?: string } = {};

        if (data.displayName !== undefined) {
          authUpdateData.displayName = data.displayName ?? undefined;
        }
        if (data.photoURL !== undefined) {
          authUpdateData.photoURL = data.photoURL ?? undefined;
        }

        if (Object.keys(authUpdateData).length > 0) {
          await currentUser.updateProfile(authUpdateData);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Auth 상태 변경 리스너
   */
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * 현재 로그인된 사용자
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth.currentUser;
  }

  /**
   * 비밀번호 재설정 이메일 전송
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 이메일 인증 메일 전송
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.sendEmailVerification();
      }
    } catch (error) {
      throw error;
    }
  }
}

// Singleton 인스턴스
const authService = new AuthService();

export default authService;
