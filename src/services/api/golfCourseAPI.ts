// golfCourseAPI.ts - 골프장 리뷰 API (Firestore 연동)

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GolfCourseReview } from '@/types/golfcourse-types';
import { useAuthStore } from '@/store/useAuthStore';
import { profileAPI } from '@/services/api/profileAPI';

const GOLF_COURSE_REVIEWS_COLLECTION = 'golf_course_reviews';

export const golfCourseAPI = {
  /**
   * 골프장 리뷰 조회
   */
  getGolfCourseReviews: async (
    courseId: number | string,
    limit: number = 20,
  ): Promise<GolfCourseReview[]> => {
    try {
      const snapshot = await firestore()
        .collection(GOLF_COURSE_REVIEWS_COLLECTION)
        .where('courseId', '==', courseId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => {
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
    },
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
          handicap: (useAuthStore.getState() as any).userProfile?.handicap || 18,
        },
        ...reviewData,
        likes: 0,
        isLiked: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore().collection(GOLF_COURSE_REVIEWS_COLLECTION).add(docData);

      // 골프장 평점 업데이트
      await golfCourseAPI.updateGolfCourseRating(courseId);

      // 리뷰 작성 포인트 적립 (실패해도 리뷰 작성에 영향 없음)
      try {
        await profileAPI.earnPoints(currentUser.uid, 50, '골프장 리뷰 작성');
      } catch {
        // 포인트 적립 실패 시 무시
      }

      return docRef.id;
    } catch (error: any) {
      console.error('골프장 리뷰 작성 실패:', error);
      throw new Error(error.message || '리뷰 작성에 실패했습니다.');
    }
  },

  /**
   * 골프장 평점 업데이트 (리뷰 생성/수정/삭제 후 호출)
   */
  updateGolfCourseRating: async (courseId: number | string): Promise<void> => {
    try {
      const reviewsSnapshot = await firestore()
        .collection(GOLF_COURSE_REVIEWS_COLLECTION)
        .where('courseId', '==', courseId)
        .get();

      if (reviewsSnapshot.empty) {
        // 리뷰가 없으면 평점 초기화
        await firestore()
          .collection('golfCourses')
          .doc(String(courseId))
          .set({
            rating: 0,
            reviewCount: 0,
          }, { merge: true });
        return;
      }

      let totalRating = 0;
      reviewsSnapshot.docs.forEach((doc) => {
        totalRating += doc.data().rating || 0;
      });

      const averageRating = totalRating / reviewsSnapshot.size;

      await firestore()
        .collection('golfCourses')
        .doc(String(courseId))
        .set({
          rating: Math.round(averageRating * 10) / 10, // 소수점 1자리
          reviewCount: reviewsSnapshot.size,
        }, { merge: true });
    } catch (error: any) {
      console.error('골프장 평점 업데이트 실패:', error);
    }
  },

  /**
   * 골프장 리뷰 수정
   */
  updateGolfCourseReview: async (
    courseId: number | string,
    reviewId: string,
    data: { rating: number; comment: string },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await firestore()
        .collection(GOLF_COURSE_REVIEWS_COLLECTION)
        .doc(reviewId)
        .update({
          rating: data.rating,
          content: data.comment,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // 평점 재계산
      await golfCourseAPI.updateGolfCourseRating(courseId);

      return { success: true, message: '리뷰가 수정되었습니다.' };
    } catch (error: any) {
      console.error('골프장 리뷰 수정 실패:', error);
      return { success: false, message: error.message || '리뷰 수정에 실패했습니다.' };
    }
  },

  /**
   * 골프장 리뷰 삭제
   */
  deleteGolfCourseReview: async (
    courseId: number | string,
    reviewId: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await firestore()
        .collection(GOLF_COURSE_REVIEWS_COLLECTION)
        .doc(reviewId)
        .delete();

      // 평점 재계산 (리뷰 수 감소 포함)
      await golfCourseAPI.updateGolfCourseRating(courseId);

      return { success: true, message: '리뷰가 삭제되었습니다.' };
    } catch (error: any) {
      console.error('골프장 리뷰 삭제 실패:', error);
      return { success: false, message: error.message || '리뷰 삭제에 실패했습니다.' };
    }
  },
};
