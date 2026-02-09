import { create } from 'zustand';
import {
  firestore as firebaseFirestore,
  storage as firebaseStorage,
  FirestoreTimestamp,
} from '@/services/firebase/firebaseConfig';

export interface FavoriteCourse {
  name: string;
  id?: string;
  location?: { lat: number; lng: number };
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  handicap: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  bio: string;
  location: string;
  favoriteCourses: FavoriteCourse[];
  roundingStyles: string[];
  golfExperience: string;
  monthlyRounds: string;
  overseasGolf: string;
  totalRounds: number;
  rating: number;
  reviews: number;
  pointBalance: number;
  role: 'GENERAL' | 'COACH' | 'ADMIN';
  stats: {
    averageScore: number;
    bestScore: number;
    gamesPlayed: number;
    attendance: number;
  };
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadProfile: (uid: string) => Promise<void>;
  updateProfile: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (uid: string, imageUri: string) => Promise<string>;
  addPoints: (uid: string, points: number, reason: string) => Promise<void>;
  subtractPoints: (uid: string, points: number, reason: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  /**
   * 프로필 로드
   */
  loadProfile: async (uid) => {
    try {
      set({ loading: true, error: null });

      const doc = await firebaseFirestore.collection('users').doc(uid).get();

      if (!doc.exists) {
        set({ error: '프로필을 찾을 수 없습니다', loading: false });
        return;
      }

      set({ profile: doc.data() as UserProfile, loading: false });
    } catch (error: any) {
      console.error('프로필 로드 실패:', error);
      set({
        error: error.message || '프로필을 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  /**
   * 프로필 업데이트
   */
  updateProfile: async (uid, data) => {
    try {
      set({ loading: true, error: null });

      await firebaseFirestore
        .collection('users')
        .doc(uid)
        .set({
          ...data,
          updatedAt: FirestoreTimestamp.now(),
        }, { merge: true });

      const { profile } = get();
      if (profile) {
        set({ profile: { ...profile, ...data }, loading: false });
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
   * 프로필 이미지 업로드
   */
  uploadProfileImage: async (uid, imageUri) => {
    try {
      set({ loading: true, error: null });

      // Storage에 업로드
      const filename = `profiles/${uid}/${Date.now()}.jpg`;
      const reference = firebaseStorage.ref(filename);
      await reference.putFile(imageUri);

      // 다운로드 URL 가져오기
      const url = await reference.getDownloadURL();

      // Firestore 업데이트
      await firebaseFirestore.collection('users').doc(uid).set({
        photoURL: url,
        updatedAt: FirestoreTimestamp.now(),
      }, { merge: true });

      // 로컬 상태 업데이트
      const { profile } = get();
      if (profile) {
        set({ profile: { ...profile, photoURL: url }, loading: false });
      }

      return url;
    } catch (error: any) {
      console.error('프로필 이미지 업로드 실패:', error);
      set({
        error: error.message || '이미지를 업로드할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 포인트 추가
   */
  addPoints: async (uid, points, reason) => {
    try {
      const userRef = firebaseFirestore.collection('users').doc(uid);

      await firebaseFirestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          throw new Error('사용자를 찾을 수 없습니다');
        }

        const currentPoints = userDoc.data()?.pointBalance || 0;
        const newPoints = currentPoints + points;

        transaction.update(userRef, {
          pointBalance: newPoints,
          updatedAt: FirestoreTimestamp.now(),
        });

        // 포인트 내역 저장
        transaction.set(firebaseFirestore.collection('pointHistory').doc(), {
          userId: uid,
          type: 'add',
          amount: points,
          reason,
          balanceBefore: currentPoints,
          balanceAfter: newPoints,
          createdAt: FirestoreTimestamp.now(),
        });
      });

      // 로컬 상태 업데이트
      const { profile } = get();
      if (profile) {
        set({ profile: { ...profile, pointBalance: profile.pointBalance + points } });
      }
    } catch (error: any) {
      console.error('포인트 추가 실패:', error);
      throw error;
    }
  },

  /**
   * 포인트 차감
   */
  subtractPoints: async (uid, points, reason) => {
    try {
      const userRef = firebaseFirestore.collection('users').doc(uid);

      await firebaseFirestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          throw new Error('사용자를 찾을 수 없습니다');
        }

        const currentPoints = userDoc.data()?.pointBalance || 0;

        if (currentPoints < points) {
          throw new Error('포인트가 부족합니다');
        }

        const newPoints = currentPoints - points;

        transaction.update(userRef, {
          pointBalance: newPoints,
          updatedAt: FirestoreTimestamp.now(),
        });

        // 포인트 내역 저장
        transaction.set(firebaseFirestore.collection('pointHistory').doc(), {
          userId: uid,
          type: 'subtract',
          amount: points,
          reason,
          balanceBefore: currentPoints,
          balanceAfter: newPoints,
          createdAt: FirestoreTimestamp.now(),
        });
      });

      // 로컬 상태 업데이트
      const { profile } = get();
      if (profile) {
        set({ profile: { ...profile, pointBalance: profile.pointBalance - points } });
      }
    } catch (error: any) {
      console.error('포인트 차감 실패:', error);
      throw error;
    }
  },
}));
