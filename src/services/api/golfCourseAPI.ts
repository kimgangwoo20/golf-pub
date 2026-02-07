// golfCourseAPI.ts - 골프장 리뷰 API (Firestore 연동)

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GolfCourseReview } from '@/types/golfcourse-types';

const GOLF_COURSE_REVIEWS_COLLECTION = 'golf_course_reviews';

export const golfCourseAPI = {
  /**
   * 골프장 리뷰 조회
   */
  getGolfCourseReviews: async (
    courseId: number | string,
    limit: number = 20
  ): Promise<GolfCourseReview[]> => {
    try {
      const snapshot = await firestore()
        .collection(GOLF_COURSE_REVIEWS_COLLECTION)
        .where('courseId', '==', courseId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          courseId: data.courseId,
          author: data.author || { id: '', name: '익명', image: '', handicap: 0 },
          rating: data.rating || 0,
          courseRating: data.courseRating || 0,
          facilityRating: data.facilityRating || 0,
          serviceRating: data.serviceRating || 0,
          content: data.content || '',
          images: data.images || [],
          likes: data.likes || 0,
          isLiked: false,
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString?.('ko-KR') || '',
        } as GolfCourseReview;
      });
    } catch (error: any) {
      console.error('골프장 리뷰 조회 실패:', error);
      throw new Error(error.message || '리뷰를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 골프장 리뷰 작성
   */
  createGolfCourseReview: async (
    courseId: number | string,
    reviewData: {
      rating: number;
      courseRating: number;
      facilityRating: number;
      serviceRating: number;
      content: string;
      images: string[];
    }
  ): Promise<string> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const docData = {
        courseId,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || '익명',
          image: currentUser.photoURL || '',
          handicap: 18, // TODO: 사용자 프로필에서 핸디캡 가져오기
        },
        ...reviewData,
        likes: 0,
        isLiked: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection(GOLF_COURSE_REVIEWS_COLLECTION)
        .add(docData);

      return docRef.id;
    } catch (error: any) {
      console.error('골프장 리뷰 작성 실패:', error);
      throw new Error(error.message || '리뷰 작성에 실패했습니다.');
    }
  },
};
