// src/services/authService.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

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
}

class AuthService {
  /**
   * Custom Token으로 로그인
   */
  async signInWithCustomToken(token: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().signInWithCustomToken(token);
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
    password: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
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
    displayName: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      // Firebase Auth에 사용자 생성
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // 프로필 업데이트
      await userCredential.user.updateProfile({ displayName });

      // Firestore에 사용자 프로필 문서 생성
      await this.createUserProfile(userCredential.user.uid, {
        email,
        displayName,
        photoURL: null,
        phoneNumber: null,
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
      await auth().signOut();
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
    }
  ): Promise<void> {
    try {
      const now = new Date();
      const userProfile: UserProfile = {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        phoneNumber: data.phoneNumber,
        createdAt: now,
        updatedAt: now,
      };

      await firestore().collection('users').doc(uid).set(userProfile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const doc = await firestore().collection('users').doc(uid).get();

      if (!doc.exists) {
        // Firestore에 프로필이 없으면 현재 Auth 정보로 생성
        const currentUser = auth().currentUser;
        if (currentUser && currentUser.uid === uid) {
          await this.createUserProfile(uid, {
            email: currentUser.email || '',
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            phoneNumber: currentUser.phoneNumber,
          });
          
          // 다시 조회
          const newDoc = await firestore().collection('users').doc(uid).get();
          return newDoc.data() as UserProfile;
        }
        return null;
      }

      return doc.data() as UserProfile;
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

      await firestore().collection('users').doc(uid).update(updateData);

      // Auth 프로필도 업데이트 (displayName, photoURL만 가능)
      const currentUser = auth().currentUser;
      if (currentUser && currentUser.uid === uid) {
        const authUpdateData: { displayName?: string; photoURL?: string } = {};
        
        if (data.displayName !== undefined) {
          authUpdateData.displayName = data.displayName;
        }
        if (data.photoURL !== undefined) {
          authUpdateData.photoURL = data.photoURL;
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
    return auth().onAuthStateChanged(callback);
  }

  /**
   * 현재 로그인된 사용자
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * 비밀번호 재설정 이메일 전송
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 이메일 인증 메일 전송
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const currentUser = auth().currentUser;
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
