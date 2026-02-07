// 👤 profileAPI.ts
// 프로필 관리 API - Firebase Auth + Firestore 연동

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { UserProfile, Point, Coupon } from '../../types/profile-types';

/**
 * Firestore 컬렉션
 */
const USERS_COLLECTION = 'users';
const POINTS_COLLECTION = 'points';
const COUPONS_COLLECTION = 'coupons';

/**
 * 프로필 API
 */
export const profileAPI = {
  /**
   * 내 프로필 조회
   * 
   * @returns 프로필 정보
   */
  getMyProfile: async (): Promise<UserProfile | null> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const userDoc = await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .get();

      if (!userDoc.exists) {
        // Firestore에 없으면 Auth 정보로 생성
        await profileAPI.createUserProfile();
        // 생성 후 직접 조회 (재귀 방지)
        const newDoc = await firestore()
          .collection(USERS_COLLECTION)
          .doc(currentUser.uid)
          .get();
        if (!newDoc.exists) {
          return null;
        }
        const newData = newDoc.data();
        return {
          id: currentUser.uid,
          name: newData?.name || currentUser.displayName || '익명',
          profileImage: newData?.photoURL || currentUser.photoURL || '',
          email: newData?.email || currentUser.email || '',
          phone: newData?.phone || '',
          handicap: newData?.handicap || 0,
          memberSince: newData?.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          points: newData?.points || 0,
          coupons: newData?.coupons || 0,
          bio: newData?.bio || '',
        } as unknown as UserProfile;
      }

      const data = userDoc.data();
      const profile = {
        id: currentUser.uid,
        name: data?.name || data?.displayName || currentUser.displayName || '익명',
        profileImage: data?.photoURL || data?.profileImage || currentUser.photoURL || '',
        email: data?.email || currentUser.email || '',
        phone: data?.phone || currentUser.phoneNumber || '',
        handicap: data?.handicap || 0,
        memberSince: data?.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        points: data?.points || 0,
        coupons: data?.coupons || 0,
        bio: data?.bio || '',
      } as unknown as UserProfile;

      // 프로필 조회 성공
      return profile;
    } catch (error: any) {
      console.error('프로필 조회 실패');
      throw new Error(error.message || '프로필을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 사용자 프로필 생성 (회원가입 시)
   */
  createUserProfile: async (): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const userData = {
        name: currentUser.displayName || '익명',
        displayName: currentUser.displayName || '익명',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '',
        photoURL: currentUser.photoURL || '',
        profileImage: currentUser.photoURL || '',
        handicap: 0,
        points: 0,
        coupons: 0,
        bio: '',
        location: '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .set(userData, { merge: true });

      // 프로필 생성 성공
    } catch (error: any) {
      console.error('프로필 생성 실패');
      throw new Error(error.message || '프로필 생성에 실패했습니다.');
    }
  },

  /**
   * 프로필 수정
   * 
   * @param updates 수정할 데이터
   */
  updateProfile: async (updates: Partial<{
    name: string;
    phone: string;
    handicap: number;
    bio: string;
    location: string;
  }>): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // Firestore 업데이트
      await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .update({
          ...updates,
          displayName: updates.name || currentUser.displayName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Firebase Auth 업데이트 (이름만)
      if (updates.name) {
        await currentUser.updateProfile({
          displayName: updates.name,
        });
      }

      // 프로필 수정 성공
    } catch (error: any) {
      console.error('프로필 수정 실패');
      throw new Error(error.message || '프로필 수정에 실패했습니다.');
    }
  },

  /**
   * 프로필 이미지 업로드
   * 
   * @param imageUri 이미지 URI
   * @returns 업로드된 이미지 URL
   */
  uploadProfileImage: async (imageUri: string): Promise<string> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // Storage에 업로드
      const filename = `profile_${currentUser.uid}_${Date.now()}.jpg`;
      const reference = storage().ref(`profiles/${filename}`);
      
      await reference.putFile(imageUri);
      const downloadURL = await reference.getDownloadURL();

      // Firestore 업데이트
      await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .update({
          photoURL: downloadURL,
          profileImage: downloadURL,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Firebase Auth 업데이트
      await currentUser.updateProfile({
        photoURL: downloadURL,
      });

      // 프로필 이미지 업로드 성공
      return downloadURL;
    } catch (error: any) {
      console.error('프로필 이미지 업로드 실패');
      throw new Error(error.message || '이미지 업로드에 실패했습니다.');
    }
  },

  /**
   * 포인트 내역 조회
   * 
   * @param limit 결과 개수
   * @returns 포인트 내역
   */
  getPointHistory: async (limit: number = 20): Promise<Point[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const snapshot = await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .collection(POINTS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const points: Point[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as unknown as Point[];

      // 포인트 내역 조회 성공
      return points;
    } catch (error: any) {
      console.error('포인트 내역 조회 실패');
      throw new Error(error.message || '포인트 내역을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 포인트 적립
   * 
   * @param amount 적립 포인트
   * @param description 적립 사유
   */
  earnPoints: async (amount: number, description: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const batch = firestore().batch();

      // 포인트 내역 추가
      const pointRef = firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .collection(POINTS_COLLECTION)
        .doc();

      batch.set(pointRef, {
        amount,
        description,
        type: 'earn',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 총 포인트 증가
      const userRef = firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid);

      batch.update(userRef, {
        points: firestore.FieldValue.increment(amount),
      });

      await batch.commit();
      // 포인트 적립 성공
    } catch (error: any) {
      console.error('포인트 적립 실패');
      throw new Error(error.message || '포인트 적립에 실패했습니다.');
    }
  },

  /**
   * 포인트 사용
   * 
   * @param amount 사용 포인트
   * @param description 사용 사유
   */
  spendPoints: async (amount: number, description: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 현재 포인트 확인
      const userDoc = await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .get();

      const currentPoints = userDoc.data()?.points || 0;
      if (currentPoints < amount) {
        throw new Error('포인트가 부족합니다.');
      }

      const batch = firestore().batch();

      // 포인트 내역 추가
      const pointRef = firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .collection(POINTS_COLLECTION)
        .doc();

      batch.set(pointRef, {
        amount: -amount,
        description,
        type: 'spend',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 총 포인트 감소
      const userRef = firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid);

      batch.update(userRef, {
        points: firestore.FieldValue.increment(-amount),
      });

      await batch.commit();
      // 포인트 사용 성공
    } catch (error: any) {
      console.error('포인트 사용 실패');
      throw new Error(error.message || '포인트 사용에 실패했습니다.');
    }
  },

  /**
   * 쿠폰 목록 조회
   * 
   * @returns 쿠폰 목록
   */
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const snapshot = await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .collection(COUPONS_COLLECTION)
        .orderBy('expiryDate', 'asc')
        .get();

      const coupons: Coupon[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as unknown as Coupon[];

      // 쿠폰 목록 조회 성공
      return coupons;
    } catch (error: any) {
      console.error('쿠폰 목록 조회 실패');
      throw new Error(error.message || '쿠폰 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 내 리뷰 목록 조회
   *
   * @returns 리뷰 목록
   */
  getMyReviews: async (): Promise<any[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const snapshot = await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .collection('reviews')
        .orderBy('createdAt', 'desc')
        .get();

      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      }));

      return reviews;
    } catch (error: any) {
      console.error('리뷰 목록 조회 실패');
      throw new Error(error.message || '리뷰 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 다른 사용자 프로필 조회
   *
   * @param userId 사용자 ID
   * @returns 프로필 정보
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        // 사용자를 찾을 수 없음
        return null;
      }

      const data = userDoc.data();
      const profile = {
        id: userId,
        name: data?.name || data?.displayName || '익명',
        profileImage: data?.photoURL || data?.profileImage || '',
        email: '', // 다른 사용자 이메일은 숨김
        phone: '', // 다른 사용자 전화번호는 숨김
        handicap: data?.handicap || 0,
        memberSince: data?.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        points: 0, // 다른 사용자 포인트는 숨김
        coupons: 0,
        bio: data?.bio || '',
      } as unknown as UserProfile;

      // 사용자 프로필 조회 성공
      return profile;
    } catch (error: any) {
      console.error('사용자 프로필 조회 실패');
      throw new Error(error.message || '프로필을 불러오는데 실패했습니다.');
    }
  },
};