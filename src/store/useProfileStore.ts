import { create } from 'zustand';
import {
  firestore,
  storage,
  collection,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  increment,
  FirestoreTimestamp,
  storageRefFn,
  getDownloadURL,
} from '@/services/firebase/firebaseConfig';

import type { UserProfile, FavoriteCourse } from '@/types/profile-types';

export type { UserProfile, FavoriteCourse } from '@/types/profile-types';

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
  toggleProfileLike: (targetUid: string, likerUid: string) => Promise<boolean>;
  checkProfileLiked: (targetUid: string, likerUid: string) => Promise<boolean>;
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

      const userRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists) {
        set({ error: '프로필을 찾을 수 없습니다', loading: false });
        return;
      }

      set({ profile: docSnap.data() as UserProfile, loading: false });
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

      const userRef = doc(firestore, 'users', uid);
      await setDoc(
        userRef,
        {
          ...data,
          updatedAt: FirestoreTimestamp.now(),
        },
        { merge: true },
      );

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
      const reference = storageRefFn(storage, filename);
      await reference.putFile(imageUri);

      // 다운로드 URL 가져오기
      const url = await getDownloadURL(reference);

      // Firestore 업데이트
      const userRef = doc(firestore, 'users', uid);
      await setDoc(
        userRef,
        {
          photoURL: url,
          updatedAt: FirestoreTimestamp.now(),
        },
        { merge: true },
      );

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
      const userRef = doc(firestore, 'users', uid);

      await runTransaction(firestore, async (transaction) => {
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
        const historyRef = doc(collection(firestore, 'pointHistory'));
        transaction.set(historyRef, {
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
        set({ profile: { ...profile, pointBalance: (profile.pointBalance || 0) + points } });
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
      const userRef = doc(firestore, 'users', uid);

      await runTransaction(firestore, async (transaction) => {
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
        const historyRef = doc(collection(firestore, 'pointHistory'));
        transaction.set(historyRef, {
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
        set({ profile: { ...profile, pointBalance: (profile.pointBalance || 0) - points } });
      }
    } catch (error: any) {
      console.error('포인트 차감 실패:', error);
      throw error;
    }
  },

  /**
   * 프로필 좋아요 토글 (트랜잭션)
   * @returns liked 여부 (true = 좋아요됨, false = 취소됨)
   */
  toggleProfileLike: async (targetUid, likerUid) => {
    const likeDocId = `${targetUid}_${likerUid}`;
    const likeRef = doc(firestore, 'profileLikes', likeDocId);
    const userRef = doc(firestore, 'users', targetUid);

    const liked = await runTransaction(firestore, async (transaction) => {
      const likeDoc = await transaction.get(likeRef);

      if (likeDoc.exists) {
        // 좋아요 취소
        transaction.delete(likeRef);
        transaction.update(userRef, {
          likeCount: increment(-1),
        });
        return false;
      } else {
        // 좋아요 추가
        transaction.set(likeRef, {
          targetUid,
          likerUid,
          createdAt: FirestoreTimestamp.now(),
        });
        transaction.update(userRef, {
          likeCount: increment(1),
        });
        return true;
      }
    });

    // 로컬 상태 업데이트
    const { profile } = get();
    if (profile && profile.uid === targetUid) {
      const currentCount = profile.likeCount || 0;
      set({
        profile: {
          ...profile,
          likeCount: liked ? currentCount + 1 : Math.max(0, currentCount - 1),
        },
      });
    }

    return liked;
  },

  /**
   * 프로필 좋아요 상태 확인
   */
  checkProfileLiked: async (targetUid, likerUid) => {
    const likeDocId = `${targetUid}_${likerUid}`;
    const likeRef = doc(firestore, 'profileLikes', likeDocId);
    const docSnap = await getDoc(likeRef);
    return docSnap.exists;
  },
}));
