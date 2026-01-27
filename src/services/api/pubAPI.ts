// 🍺 pubAPI.ts
// 퍼블릭/술집 API - Firebase Firestore 연동

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

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
   * @param limit 결과 개수
   * @returns 퍼블릭 목록
   */
  getPubs: async (location?: string, limit: number = 20): Promise<Pub[]> => {
    try {
      let query = firestore().collection(PUBS_COLLECTION) as any;

      if (location) {
        query = query.where('location', '==', location);
      }

      query = query
        .orderBy('rating', 'desc')
        .limit(limit);

      const snapshot = await query.get();
      const pubs: Pub[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`✅ 퍼블릭 목록 조회 성공: ${pubs.length}개`);
      return pubs;
    } catch (error: any) {
      console.error('❌ 퍼블릭 목록 조회 실패:', error);
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
      const doc = await firestore()
        .collection(PUBS_COLLECTION)
        .doc(pubId)
        .get();

      if (!doc.exists) {
        console.log('ℹ️ 퍼블릭을 찾을 수 없습니다:', pubId);
        return null;
      }

      const pub: Pub = {
        id: doc.id,
        ...doc.data(),
      } as Pub;

      console.log('✅ 퍼블릭 상세 조회 성공:', pubId);
      return pub;
    } catch (error: any) {
      console.error('❌ 퍼블릭 상세 조회 실패:', error);
      throw new Error(error.message || '퍼블릭 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 인기 퍼블릭 조회 (평점순)
   * 
   * @param limit 결과 개수
   * @returns 인기 퍼블릭 목록
   */
  getPopularPubs: async (limit: number = 10): Promise<Pub[]> => {
    try {
      const snapshot = await firestore()
        .collection(PUBS_COLLECTION)
        .orderBy('rating', 'desc')
        .orderBy('reviewCount', 'desc')
        .limit(limit)
        .get();

      const pubs: Pub[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Pub[];

      console.log(`✅ 인기 퍼블릭 조회 성공: ${pubs.length}개`);
      return pubs;
    } catch (error: any) {
      console.error('❌ 인기 퍼블릭 조회 실패:', error);
      throw new Error(error.message || '인기 퍼블릭을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 퍼블릭 리뷰 조회
   * 
   * @param pubId 퍼블릭 ID
   * @param limit 결과 개수
   * @returns 리뷰 목록
   */
  getPubReviews: async (pubId: string, limit: number = 20): Promise<PubReview[]> => {
    try {
      const snapshot = await firestore()
        .collection(PUB_REVIEWS_COLLECTION)
        .where('pubId', '==', pubId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const reviews: PubReview[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as PubReview[];

      console.log(`✅ 퍼블릭 리뷰 조회 성공: ${reviews.length}개`);
      return reviews;
    } catch (error: any) {
      console.error('❌ 퍼블릭 리뷰 조회 실패:', error);
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
    images?: string[]
  ): Promise<string> => {
    try {
      const currentUser = auth().currentUser;
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
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const reviewRef = await firestore()
        .collection(PUB_REVIEWS_COLLECTION)
        .add(reviewData);

      // 퍼블릭 평점 업데이트
      await pubAPI.updatePubRating(pubId);

      console.log('✅ 퍼블릭 리뷰 작성 성공:', reviewRef.id);
      return reviewRef.id;
    } catch (error: any) {
      console.error('❌ 퍼블릭 리뷰 작성 실패:', error);
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
      const reviewsSnapshot = await firestore()
        .collection(PUB_REVIEWS_COLLECTION)
        .where('pubId', '==', pubId)
        .get();

      if (reviewsSnapshot.empty) return;

      let totalRating = 0;
      reviewsSnapshot.docs.forEach(doc => {
        totalRating += doc.data().rating || 0;
      });

      const averageRating = totalRating / reviewsSnapshot.size;

      await firestore()
        .collection(PUBS_COLLECTION)
        .doc(pubId)
        .update({
          rating: Math.round(averageRating * 10) / 10, // 소수점 1자리
          reviewCount: reviewsSnapshot.size,
        });

      console.log('✅ 퍼블릭 평점 업데이트 성공');
    } catch (error: any) {
      console.error('❌ 퍼블릭 평점 업데이트 실패:', error);
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
    radiusKm: number = 5
  ): Promise<Pub[]> => {
    try {
      // Firestore는 geohash 쿼리를 권장하지만
      // 간단하게 모든 퍼블릭을 가져와서 클라이언트에서 필터링
      const snapshot = await firestore()
        .collection(PUBS_COLLECTION)
        .get();

      const pubs: Pub[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          const distance = pubAPI.calculateDistance(
            latitude,
            longitude,
            data.latitude,
            data.longitude
          );

          if (distance <= radiusKm) {
            pubs.push({
              id: doc.id,
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

      console.log(`✅ 주변 퍼블릭 검색 성공: ${pubs.length}개`);
      return pubs;
    } catch (error: any) {
      console.error('❌ 주변 퍼블릭 검색 실패:', error);
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
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};