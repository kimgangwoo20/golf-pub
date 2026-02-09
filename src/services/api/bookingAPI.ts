// 📋 bookingAPI.ts
// 부킹(골프 번개 모임) API - Firebase Firestore 연동

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Booking,
  BookingStatus,
  BookingFilter,
  BookingSortType,
  CreateBookingRequest,
} from '@/types/booking-types';

/**
 * Firestore 컬렉션
 */
const BOOKINGS_COLLECTION = 'bookings';
const APPLICATIONS_COLLECTION = 'applications';

/**
 * 부킹 API
 *
 * Firebase Firestore 구조:
 *
 * bookings/
 *   {bookingId}/
 *     - title, golfCourse, date, time, etc.
 *     applications/
 *       {applicationId}/
 *         - userId, status, message, createdAt
 */
export const bookingAPI = {
  /**
   * 부킹 생성
   *
   * @param data 부킹 생성 데이터
   * @returns 생성된 부킹
   */
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const now = new Date();
      const bookingData = {
        ...data,
        hostId: currentUser.uid,
        currentPlayers: 1, // 호스트 포함
        status: 'OPEN' as BookingStatus,
        participants: {
          current: 1,
          max: data.maxPlayers,
          members: [
            {
              uid: currentUser.uid,
              name: currentUser.displayName || '익명',
              role: 'host' as const,
            },
          ],
        },
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore().collection(BOOKINGS_COLLECTION).add(bookingData);

      const newBooking = {
        id: docRef.id,
        ...bookingData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as any;

      return newBooking;
    } catch (error: any) {
      console.error('❌ 부킹 생성 실패:', error);
      throw new Error(error.message || '부킹 생성에 실패했습니다.');
    }
  },

  /**
   * 부킹 목록 조회 (필터 + 정렬)
   *
   * @param filter 필터 옵션
   * @param sortBy 정렬 방식
   * @param limit 결과 개수
   * @returns 부킹 목록
   */
  getBookings: async (
    filter?: BookingFilter,
    sortBy: BookingSortType = 'latest',
    limit: number = 20,
  ): Promise<Booking[]> => {
    try {
      let query = firestore().collection(BOOKINGS_COLLECTION) as any;

      // 필터 적용
      if (filter) {
        // 상태 필터
        if (filter.status && filter.status.length > 0) {
          query = query.where('status', 'in', filter.status);
        }

        // 레벨 필터
        if (filter.level && filter.level.length > 0) {
          query = query.where('level', 'in', filter.level);
        }

        // 날짜 필터
        if (filter.date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (filter.date === 'today') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            query = query
              .where('date', '>=', today.toISOString().split('T')[0])
              .where('date', '<', tomorrow.toISOString().split('T')[0]);
          } else if (filter.date === 'thisWeek') {
            const weekLater = new Date(today);
            weekLater.setDate(weekLater.getDate() + 7);
            query = query
              .where('date', '>=', today.toISOString().split('T')[0])
              .where('date', '<=', weekLater.toISOString().split('T')[0]);
          } else if (filter.date === 'thisMonth') {
            const monthLater = new Date(today);
            monthLater.setMonth(monthLater.getMonth() + 1);
            query = query
              .where('date', '>=', today.toISOString().split('T')[0])
              .where('date', '<=', monthLater.toISOString().split('T')[0]);
          }
        }

        // 위치 필터
        if (filter.location) {
          query = query.where('location', '==', filter.location);
        }

        // 술집 여부
        if (filter.hasPub !== undefined) {
          query = query.where('hasPub', '==', filter.hasPub);
        }
      }

      // 정렬 적용
      switch (sortBy) {
        case 'latest':
          query = query.orderBy('createdAt', 'desc');
          break;
        case 'popular':
          query = query.orderBy('currentPlayers', 'desc');
          break;
        case 'priceLow':
          query = query.orderBy('price', 'asc');
          break;
        case 'priceHigh':
          query = query.orderBy('price', 'desc');
          break;
        case 'dateClose':
          query = query.orderBy('date', 'asc');
          break;
        default:
          query = query.orderBy('createdAt', 'desc');
      }

      // 개수 제한
      query = query.limit(limit);

      const snapshot = await query.get();
      const bookings: Booking[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      }));

      // 가격 범위 필터 (클라이언트 측)
      let filteredBookings = bookings;
      if (filter?.priceRange) {
        filteredBookings = bookings.filter(
          (b) =>
            b.price.original >= filter.priceRange!.min &&
            b.price.original <= filter.priceRange!.max,
        );
      }

      return filteredBookings;
    } catch (error: any) {
      console.error('❌ 부킹 목록 조회 실패:', error);
      throw new Error(error.message || '부킹 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 부킹 상세 조회
   *
   * @param bookingId 부킹 ID
   * @returns 부킹 상세
   */
  getBookingById: async (bookingId: string): Promise<Booking | null> => {
    try {
      const doc = await firestore().collection(BOOKINGS_COLLECTION).doc(bookingId).get();

      if (!doc.exists) {
        return null;
      }

      const booking: Booking = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: doc.data()?.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      } as Booking;

      return booking;
    } catch (error: any) {
      console.error('❌ 부킹 상세 조회 실패:', error);
      throw new Error(error.message || '부킹 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 부킹 수정
   *
   * @param bookingId 부킹 ID
   * @param data 수정할 데이터
   * @returns 수정된 부킹
   */
  updateBooking: async (
    bookingId: string,
    data: Partial<CreateBookingRequest>,
  ): Promise<Booking> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 호스트 확인
      const bookingDoc = await firestore().collection(BOOKINGS_COLLECTION).doc(bookingId).get();

      if (!bookingDoc.exists) {
        throw new Error('부킹을 찾을 수 없습니다.');
      }

      const booking = bookingDoc.data();
      if (booking?.hostId !== currentUser.uid) {
        throw new Error('부킹을 수정할 권한이 없습니다.');
      }

      // 수정
      await firestore()
        .collection(BOOKINGS_COLLECTION)
        .doc(bookingId)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // 수정된 부킹 가져오기
      const updatedBooking = await bookingAPI.getBookingById(bookingId);

      return updatedBooking!;
    } catch (error: any) {
      console.error('❌ 부킹 수정 실패:', error);
      throw new Error(error.message || '부킹 수정에 실패했습니다.');
    }
  },

  /**
   * 부킹 삭제
   *
   * @param bookingId 부킹 ID
   */
  deleteBooking: async (bookingId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 호스트 확인
      const bookingDoc = await firestore().collection(BOOKINGS_COLLECTION).doc(bookingId).get();

      if (!bookingDoc.exists) {
        throw new Error('부킹을 찾을 수 없습니다.');
      }

      const booking = bookingDoc.data();
      if (booking?.hostId !== currentUser.uid) {
        throw new Error('부킹을 삭제할 권한이 없습니다.');
      }

      // 삭제
      await firestore().collection(BOOKINGS_COLLECTION).doc(bookingId).delete();
    } catch (error: any) {
      console.error('❌ 부킹 삭제 실패:', error);
      throw new Error(error.message || '부킹 삭제에 실패했습니다.');
    }
  },

  /**
   * 부킹 참가 신청
   *
   * @param bookingId 부킹 ID
   * @param message 신청 메시지 (선택)
   * @returns 신청 ID
   */
  applyToBooking: async (bookingId: string, message?: string): Promise<string> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 부킹 존재 확인
      const bookingDoc = await firestore().collection(BOOKINGS_COLLECTION).doc(bookingId).get();

      if (!bookingDoc.exists) {
        throw new Error('부킹을 찾을 수 없습니다.');
      }

      const booking = bookingDoc.data();

      // 호스트는 신청 불가
      if (booking?.hostId === currentUser.uid) {
        throw new Error('본인이 만든 부킹에는 신청할 수 없습니다.');
      }

      // 이미 참가 중인지 확인
      const existingApplications = await firestore()
        .collection(BOOKINGS_COLLECTION)
        .doc(bookingId)
        .collection(APPLICATIONS_COLLECTION)
        .where('userId', '==', currentUser.uid)
        .get();

      if (!existingApplications.empty) {
        throw new Error('이미 신청한 부킹입니다.');
      }

      // 정원 확인
      if (booking?.currentPlayers >= booking?.maxPlayers) {
        throw new Error('정원이 마감되었습니다.');
      }

      // 신청 생성
      const applicationData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || '익명',
        userAvatar: currentUser.photoURL || '',
        message: message || '',
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const applicationRef = await firestore()
        .collection(BOOKINGS_COLLECTION)
        .doc(bookingId)
        .collection(APPLICATIONS_COLLECTION)
        .add(applicationData);

      return applicationRef.id;
    } catch (error: any) {
      console.error('❌ 부킹 신청 실패:', error);
      throw new Error(error.message || '부킹 신청에 실패했습니다.');
    }
  },

  /**
   * 신청자 승인
   *
   * @param bookingId 부킹 ID
   * @param applicationId 신청 ID
   */
  acceptApplicant: async (bookingId: string, applicationId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 호스트 확인
      const bookingDoc = await firestore().collection(BOOKINGS_COLLECTION).doc(bookingId).get();

      if (!bookingDoc.exists) {
        throw new Error('부킹을 찾을 수 없습니다.');
      }

      const booking = bookingDoc.data();
      if (booking?.hostId !== currentUser.uid) {
        throw new Error('승인할 권한이 없습니다.');
      }

      // 정원 확인
      if (booking?.currentPlayers >= booking?.maxPlayers) {
        throw new Error('정원이 마감되었습니다.');
      }

      // 신청 정보 가져오기
      const applicationDoc = await firestore()
        .collection(BOOKINGS_COLLECTION)
        .doc(bookingId)
        .collection(APPLICATIONS_COLLECTION)
        .doc(applicationId)
        .get();

      if (!applicationDoc.exists) {
        throw new Error('신청을 찾을 수 없습니다.');
      }

      const application = applicationDoc.data();

      // 배치 업데이트
      const batch = firestore().batch();

      // 신청 상태 업데이트
      batch.update(
        firestore()
          .collection(BOOKINGS_COLLECTION)
          .doc(bookingId)
          .collection(APPLICATIONS_COLLECTION)
          .doc(applicationId),
        {
          status: 'accepted',
          acceptedAt: firestore.FieldValue.serverTimestamp(),
        },
      );

      // 부킹 참가자 추가
      batch.update(firestore().collection(BOOKINGS_COLLECTION).doc(bookingId), {
        currentPlayers: firestore.FieldValue.increment(1),
        participants: firestore.FieldValue.arrayUnion({
          id: application?.userId,
          name: application?.userName,
          avatar: application?.userAvatar,
        }),
        status: booking.currentPlayers + 1 >= booking.maxPlayers ? 'full' : booking.status,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
    } catch (error: any) {
      console.error('❌ 신청자 승인 실패:', error);
      throw new Error(error.message || '신청자 승인에 실패했습니다.');
    }
  },

  /**
   * 신청자 거절
   *
   * @param bookingId 부킹 ID
   * @param applicationId 신청 ID
   */
  rejectApplicant: async (bookingId: string, applicationId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 호스트 확인
      const bookingDoc = await firestore().collection(BOOKINGS_COLLECTION).doc(bookingId).get();

      if (!bookingDoc.exists) {
        throw new Error('부킹을 찾을 수 없습니다.');
      }

      const booking = bookingDoc.data();
      if (booking?.hostId !== currentUser.uid) {
        throw new Error('거절할 권한이 없습니다.');
      }

      // 신청 상태 업데이트
      await firestore()
        .collection(BOOKINGS_COLLECTION)
        .doc(bookingId)
        .collection(APPLICATIONS_COLLECTION)
        .doc(applicationId)
        .update({
          status: 'rejected',
          rejectedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      console.error('❌ 신청자 거절 실패:', error);
      throw new Error(error.message || '신청자 거절에 실패했습니다.');
    }
  },

  /**
   * 내가 만든 부킹 목록
   *
   * @returns 내 부킹 목록
   */
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const snapshot = await firestore()
        .collection(BOOKINGS_COLLECTION)
        .where('hostId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const bookings: Booking[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as Booking[];

      return bookings;
    } catch (error: any) {
      console.error('❌ 내 부킹 목록 조회 실패:', error);
      throw new Error(error.message || '내 부킹 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 내가 신청한 부킹 목록
   *
   * @returns 신청한 부킹 목록 (부킹 정보 + 신청 상태)
   */
  getMyApplications: async (): Promise<(Booking & { applicationStatus: string })[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // collectionGroup 쿼리로 모든 부킹의 applications 서브컬렉션에서 내 신청만 조회
      const myApplicationsSnapshot = await firestore()
        .collectionGroup(APPLICATIONS_COLLECTION)
        .where('userId', '==', currentUser.uid)
        .limit(100)
        .get();

      if (myApplicationsSnapshot.empty) {
        return [];
      }

      // 부모 부킹 문서 가져오기
      const bookingPromises = myApplicationsSnapshot.docs.map(async (appDoc) => {
        const bookingRef = appDoc.ref.parent.parent;
        if (!bookingRef) return null;

        try {
          const bookingDoc = await bookingRef.get();
          if (!bookingDoc.exists) return null;

          return {
            booking: {
              id: bookingDoc.id,
              ...bookingDoc.data(),
              createdAt:
                bookingDoc.data()?.createdAt?.toDate?.()?.toISOString?.() ||
                new Date().toISOString(),
              updatedAt:
                bookingDoc.data()?.updatedAt?.toDate?.()?.toISOString?.() ||
                new Date().toISOString(),
            } as Booking,
            applicationStatus: appDoc.data().status,
          };
        } catch {
          return null;
        }
      });

      const applications = (await Promise.all(bookingPromises)).filter(
        (app) => app !== null,
      ) as { booking: Booking; applicationStatus: string }[];

      return applications.map((app) => ({
        ...app.booking,
        applicationStatus: app.applicationStatus,
      }));
    } catch (error: any) {
      console.error('❌ 신청한 부킹 목록 조회 실패:', error);
      throw new Error(error.message || '신청한 부킹 목록을 불러오는데 실패했습니다.');
    }
  },
};
