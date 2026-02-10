// pubAPI.ts
// 퍼블릭/술집 API - Firebase Firestore 연동

import {
  firestore,
  auth,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as limitFn,
  serverTimestamp,
} from '@/services/firebase/firebaseConfig';
import { profileAPI } from '@/services/api/profileAPI';

/**
 * 퍼블릭/술집 정보
 */
export interface Pub {
  id: string;
  name: string;
  address: string;
  location: string;
  phone: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  priceRange: number; // 1-4
  openTime: string;
  closeTime: string;
  menu?: string[];
  features?: string[];
  latitude?: number;
  longitude?: number;
}

/**
 * 퍼블릭 리뷰
 */
export interface PubReview {
  id: string;
  pubId: string;
  userId: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

/**
 * Firestore 컬렉션
 */
const PUBS_COLLECTION = 'pubs';
const PUB_REVIEWS_COLLECTION = 'pub_reviews';

/**
 * 퍼블릭/술집 API
 */
export const pubAPI = {
  /**
   * 퍼블릭 목록 조회
   *
   * @param location 지역 (선택)
   * @param limitCount 결과 개수
   * @returns 퍼블릭 목록
   */
  getPubs: async (location?: string, limitCount: number = 20): Promise<Pub[]> => {
    try {
      const constraints: any[] = [];

      if (location) {
        constraints.push(where('location', '==', location));
      }

      constraints.push(orderBy('rating', 'desc'));
      constraints.push(limitFn(limitCount));

      const q = query(collection(firestore, PUBS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      const pubs: Pub[] = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      return pubs;
    } catch (error: any) {
      console.error('퍼블릭 목록 조회 실패:', error);
      throw new Error(error.message || '퍼블릭 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 퍼블릭 상세 조회
   *
   * @param pubId 퍼블릭 ID
   * @returns 퍼블릭 상세
   */
  getPubById: async (pubId: string): Promise<Pub | null> => {
    try {
      const docSnap = await getDoc(doc(firestore, PUBS_COLLECTION, pubId));

      if (!docSnap.exists) {
        return null;
      }

      const pub: Pub = {
        id: docSnap.id,
        ...docSnap.data(),
      } as Pub;

      return pub;
    } catch (error: any) {
      console.error('퍼블릭 상세 조회 실패:', error);
      throw new Error(error.message || '퍼블릭 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 인기 퍼블릭 조회 (평점순)
   *
   * @param limitCount 결과 개수
   * @returns 인기 퍼블릭 목록
   */
  getPopularPubs: async (limitCount: number = 10): Promise<Pub[]> => {
    try {
      const q = query(
        collection(firestore, PUBS_COLLECTION),
        orderBy('rating', 'desc'),
        orderBy('reviewCount', 'desc'),
        limitFn(limitCount),
      );
      const snapshot = await getDocs(q);

      const pubs: Pub[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Pub[];

      return pubs;
    } catch (error: any) {
      console.error('인기 퍼블릭 조회 실패:', error);
      throw new Error(error.message || '인기 퍼블릭을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 퍼블릭 리뷰 조회
   *
   * @param pubId 퍼블릭 ID
   * @param limitCount 결과 개수
   * @returns 리뷰 목록
   */
  getPubReviews: async (pubId: string, limitCount: number = 20): Promise<PubReview[]> => {
    try {
      const q = query(
        collection(firestore, PUB_REVIEWS_COLLECTION),
        where('pubId', '==', pubId),
        orderBy('createdAt', 'desc'),
        limitFn(limitCount),
      );
      const snapshot = await getDocs(q);

      const reviews: PubReview[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt:
          docSnap.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as PubReview[];

      return reviews;
    } catch (error: any) {
      console.error('퍼블릭 리뷰 조회 실패:', error);
      throw new Error(error.message || '리뷰를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 퍼블릭 리뷰 작성
   *
   * @param pubId 퍼블릭 ID
   * @param rating 평점 (1-5)
   * @param comment 리뷰 내용
   * @param images 이미지 (선택)
   * @returns 리뷰 ID
   */
  createPubReview: async (
    pubId: string,
    rating: number,
    comment: string,
    images?: string[],
  ): Promise<string> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const reviewData = {
        pubId,
        userId: currentUser.uid,
        userName: currentUser.displayName || '익명',
        userImage: currentUser.photoURL || '',
        rating,
        comment,
        images: images || [],
        createdAt: serverTimestamp(),
      };

      const reviewRef = await addDoc(collection(firestore, PUB_REVIEWS_COLLECTION), reviewData);

      // 퍼블릭 평점 업데이트
      await pubAPI.updatePubRating(pubId);

      // 리뷰 작성 포인트 적립 (실패해도 리뷰 작성에 영향 없음)
      try {
        await profileAPI.earnPoints(currentUser.uid, 50, '펍 리뷰 작성');
      } catch {
        // 포인트 적립 실패 시 무시
      }

      return reviewRef.id;
    } catch (error: any) {
      console.error('퍼블릭 리뷰 작성 실패:', error);
      throw new Error(error.message || '리뷰 작성에 실패했습니다.');
    }
  },

  /**
   * 퍼블릭 평점 업데이트 (내부 함수)
   *
   * @param pubId 퍼블릭 ID
   */
  updatePubRating: async (pubId: string): Promise<void> => {
    try {
      const q = query(collection(firestore, PUB_REVIEWS_COLLECTION), where('pubId', '==', pubId));
      const reviewsSnapshot = await getDocs(q);

      if (reviewsSnapshot.empty) {
        // 리뷰가 없으면 평점 초기화
        await setDoc(
          doc(firestore, PUBS_COLLECTION, pubId),
          {
            rating: 0,
            reviewCount: 0,
          },
          { merge: true },
        );
        return;
      }

      let totalRating = 0;
      reviewsSnapshot.docs.forEach((docSnap) => {
        totalRating += docSnap.data().rating || 0;
      });

      const averageRating = totalRating / reviewsSnapshot.size;

      await setDoc(
        doc(firestore, PUBS_COLLECTION, pubId),
        {
          rating: Math.round(averageRating * 10) / 10, // 소수점 1자리
          reviewCount: reviewsSnapshot.size,
        },
        { merge: true },
      );
    } catch (error: any) {
      console.error('퍼블릭 평점 업데이트 실패:', error);
    }
  },

  /**
   * 펍 리뷰 수정
   */
  updatePubReview: async (
    pubId: string,
    reviewId: string,
    data: { rating: number; comment: string },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await updateDoc(doc(firestore, PUB_REVIEWS_COLLECTION, reviewId), {
        rating: data.rating,
        comment: data.comment,
        updatedAt: serverTimestamp(),
      });

      // 평점 재계산
      await pubAPI.updatePubRating(pubId);

      return { success: true, message: '리뷰가 수정되었습니다.' };
    } catch (error: any) {
      console.error('펍 리뷰 수정 실패:', error);
      return { success: false, message: error.message || '리뷰 수정에 실패했습니다.' };
    }
  },

  /**
   * 펍 리뷰 삭제
   */
  deletePubReview: async (
    pubId: string,
    reviewId: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await deleteDoc(doc(firestore, PUB_REVIEWS_COLLECTION, reviewId));

      // 평점 재계산 (리뷰 수 감소 포함)
      await pubAPI.updatePubRating(pubId);

      return { success: true, message: '리뷰가 삭제되었습니다.' };
    } catch (error: any) {
      console.error('펍 리뷰 삭제 실패:', error);
      return { success: false, message: error.message || '리뷰 삭제에 실패했습니다.' };
    }
  },

  /**
   * 주변 퍼블릭 검색 (위치 기반)
   *
   * @param latitude 위도
   * @param longitude 경도
   * @param radiusKm 반경 (km)
   * @returns 주변 퍼블릭 목록
   */
  getNearbyPubs: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<Pub[]> => {
    try {
      // Firestore는 geohash 쿼리를 권장하지만
      // 간단하게 모든 퍼블릭을 가져와서 클라이언트에서 필터링
      const snapshot = await getDocs(collection(firestore, PUBS_COLLECTION));

      const pubs: Pub[] = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.latitude && data.longitude) {
          const distance = pubAPI.calculateDistance(
            latitude,
            longitude,
            data.latitude,
            data.longitude,
          );

          if (distance <= radiusKm) {
            pubs.push({
              id: docSnap.id,
              ...data,
            } as Pub);
          }
        }
      });

      // 거리순 정렬
      pubs.sort((a, b) => {
        const distA = pubAPI.calculateDistance(latitude, longitude, a.latitude!, a.longitude!);
        const distB = pubAPI.calculateDistance(latitude, longitude, b.latitude!, b.longitude!);
        return distA - distB;
      });

      return pubs;
    } catch (error: any) {
      console.error('주변 퍼블릭 검색 실패:', error);
      throw new Error(error.message || '주변 퍼블릭을 검색하는데 실패했습니다.');
    }
  },

  /**
   * 두 좌표 사이 거리 계산 (Haversine formula)
   *
   * @returns 거리 (km)
   */
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
