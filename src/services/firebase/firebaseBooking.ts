// ⛳ Firebase 부킹 시스템 서비스
// 골프 부킹 생성, 참가, 관리

import firestore from '@react-native-firebase/firestore';
import { FirestoreTimestamp } from './firebaseConfig';
import { firebaseMessaging } from './firebaseMessaging';
import { profileAPI } from '@/services/api/profileAPI';
import { callFunction } from '@/services/firebase/firebaseFunctions';

export interface Booking {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  hostId: string;
  participants: {
    current: number;
    max: number;
    list: string[]; // userId 배열
  };
  price: {
    original: number;
    discount: number;
  };
  status: 'open' | 'full' | 'closed' | 'completed';
  createdAt: number;
  updatedAt: number;
}

/**
 * 부킹 생성
 */
export const createBooking = async (
  bookingData: Partial<Booking>,
): Promise<{
  success: boolean;
  bookingId?: string;
  message: string;
}> => {
  try {
    const docRef = await firestore()
      .collection('bookings')
      .add({
        ...bookingData,
        status: 'open',
        participants: {
          current: 1,
          max: bookingData.participants?.max || 4,
          list: [bookingData.hostId],
        },
        createdAt: FirestoreTimestamp.now(),
        updatedAt: FirestoreTimestamp.now(),
      });

    // 호스트 통계 업데이트
    await firestore()
      .collection('users')
      .doc(bookingData.hostId!)
      .update({
        'stats.hostedBookings': firestore.FieldValue.increment(1),
      });

    return {
      success: true,
      bookingId: docRef.id,
      message: '부킹이 생성되었습니다!',
    };
  } catch (error) {
    console.error('부킹 생성 실패:', error);
    return {
      success: false,
      message: '부킹 생성에 실패했습니다.',
    };
  }
};

/**
 * 부킹 참가 신청
 */
export const joinBooking = async (
  bookingId: string,
  userId: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const bookingRef = firestore().collection('bookings').doc(bookingId);

    // 트랜잭션으로 동시 참가 경합 조건 방지
    const result = await firestore().runTransaction(async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);

      if (!bookingDoc.exists) {
        return { success: false, message: '존재하지 않는 부킹입니다.' };
      }

      const bookingData = bookingDoc.data() as Booking;

      // 이미 참가 중인지 확인
      if (bookingData.participants.list.includes(userId)) {
        return { success: false, message: '이미 참가 중입니다.' };
      }

      // 정원 확인
      if (bookingData.participants.current >= bookingData.participants.max) {
        return { success: false, message: '정원이 마감되었습니다.' };
      }

      // 부킹 상태 확인
      if (bookingData.status !== 'open') {
        return { success: false, message: '참가할 수 없는 부킹입니다.' };
      }

      const newCurrent = bookingData.participants.current + 1;
      const updateData: Record<string, any> = {
        'participants.current': newCurrent,
        'participants.list': firestore.FieldValue.arrayUnion(userId),
        updatedAt: FirestoreTimestamp.now(),
      };

      // 정원이 찼으면 상태도 함께 변경
      if (newCurrent >= bookingData.participants.max) {
        updateData.status = 'full';
      }

      transaction.update(bookingRef, updateData);

      return { success: true, message: '참가 신청이 완료되었습니다!', hostId: bookingData.hostId, title: bookingData.title };
    });

    if (!result.success) {
      return { success: result.success, message: result.message };
    }

    // 트랜잭션 외부: 부수 효과 (실패해도 참가 처리에 영향 없음)
    // 참가 기록 생성
    await firestore().collection('bookingParticipants').add({
      bookingId,
      userId,
      hostId: (result as any).hostId,
      status: 'pending',
      joinedAt: FirestoreTimestamp.now(),
    });

    // 사용자 통계 업데이트
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        'stats.joinedBookings': firestore.FieldValue.increment(1),
      });

    // 호스트에게 알림 전송
    try {
      await firebaseMessaging.createNotification(
        (result as any).hostId,
        'booking_join',
        '새 참가 신청',
        `"${(result as any).title}" 모임에 새로운 참가 신청이 있습니다.`,
        { bookingId },
      );
    } catch {
      // 알림 전송 실패 시 참가 처리에 영향 없음
    }

    // 모임 참가 포인트 적립
    try {
      await profileAPI.earnPoints(userId, 100, '골프 모임 참가');
    } catch {
      // 포인트 적립 실패 시 무시
    }

    return {
      success: true,
      message: '참가 신청이 완료되었습니다!',
    };
  } catch (error) {
    console.error('부킹 참가 실패:', error);
    return {
      success: false,
      message: '부킹 참가에 실패했습니다.',
    };
  }
};

/**
 * 부킹 목록 가져오기 (필터링)
 */
export const getBookings = async (filter?: {
  status?: string;
  date?: string;
  level?: string;
}): Promise<Booking[]> => {
  try {
    let query = firestore().collection('bookings').orderBy('createdAt', 'desc').limit(20);

    if (filter?.status) {
      query = query.where('status', '==', filter.status) as any;
    }

    if (filter?.date) {
      query = query.where('date', '==', filter.date) as any;
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('부킹 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 부킹 상세 정보 가져오기
 */
export const getBookingDetail = async (bookingId: string): Promise<Booking | null> => {
  try {
    const doc = await firestore().collection('bookings').doc(bookingId).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Booking;
  } catch (error) {
    console.error('부킹 상세 조회 실패:', error);
    return null;
  }
};

/**
 * 내가 생성한 부킹 목록
 */
export const getMyHostedBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const snapshot = await firestore()
      .collection('bookings')
      .where('hostId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('내 부킹 조회 실패:', error);
    return [];
  }
};

/**
 * 내가 참가한 부킹 목록
 */
export const getMyJoinedBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const snapshot = await firestore()
      .collection('bookings')
      .where('participants.list', 'array-contains', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('참가 부킹 조회 실패:', error);
    return [];
  }
};

/**
 * 부킹 취소 (호스트만 가능) - Cloud Functions 경유
 * 호스트 검증 + 상태 변경 + 참가자 알림 전송
 */
export const cancelBooking = async (
  bookingId: string,
  _userId: string,
  reason?: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFunction<{ success: boolean; message: string }>(
      'bookingCancel',
      { bookingId, reason: reason || '' },
    );
    return result;
  } catch (error: any) {
    console.error('부킹 취소 실패:', error);
    return {
      success: false,
      message: error.message || '부킹 취소에 실패했습니다.',
    };
  }
};

/**
 * 부킹 참가 철회 (참가자용) - Cloud Functions 경유
 * Transaction 기반 원자적 처리 + 호스트 알림 전송
 */
export const withdrawFromBooking = async (
  bookingId: string,
  _userId: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFunction<{ success: boolean; message: string }>(
      'bookingWithdraw',
      { bookingId },
    );
    return result;
  } catch (error: any) {
    console.error('부킹 참가 철회 실패:', error);
    return {
      success: false,
      message: error.message || '참가 철회에 실패했습니다.',
    };
  }
};

/**
 * 참가 신청 목록 조회 (호스트용)
 * bookingParticipants 컬렉션에서 pending 상태 쿼리 + users 프로필 조인
 */
export const getBookingRequests = async (
  bookingId: string,
): Promise<
  {
    id: string;
    userId: string;
    name: string;
    avatar: string;
    level: string;
    rating: number;
    message: string;
    status: string;
    joinedAt: any;
  }[]
> => {
  try {
    const snapshot = await firestore()
      .collection('bookingParticipants')
      .where('bookingId', '==', bookingId)
      .where('status', '==', 'pending')
      .orderBy('joinedAt', 'desc')
      .get();

    if (snapshot.empty) {
      return [];
    }

    // 신청자 프로필 정보 조인
    const requests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let userProfile = { name: '알 수 없음', avatar: '', level: '', rating: 0 };

        try {
          const userDoc = await firestore().collection('users').doc(data.userId).get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            userProfile = {
              name: userData?.displayName || userData?.name || '알 수 없음',
              avatar: userData?.photoURL || userData?.avatar || '',
              level: userData?.golfLevel || userData?.level || '',
              rating: userData?.rating || 0,
            };
          }
        } catch {
          // 사용자 정보 조회 실패 시 기본값 사용
        }

        return {
          id: doc.id,
          userId: data.userId,
          name: userProfile.name,
          avatar: userProfile.avatar,
          level: userProfile.level,
          rating: userProfile.rating,
          message: data.message || '',
          status: data.status,
          joinedAt: data.joinedAt,
        };
      }),
    );

    return requests;
  } catch (error) {
    console.error('참가 신청 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 참가 신청 승인 (Cloud Functions 경유)
 * 호스트 검증 + Transaction 기반 원자적 처리 + 알림 전송
 */
export const approveBookingRequest = async (
  requestId: string,
  bookingId: string,
  userId: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFunction<{ success: boolean; message: string }>(
      'bookingApprove',
      { requestId, bookingId, userId },
    );
    return result;
  } catch (error: any) {
    console.error('참가 승인 실패:', error);
    return {
      success: false,
      message: error.message || '참가 승인에 실패했습니다.',
    };
  }
};

/**
 * 참가 신청 거절 (Cloud Functions 경유)
 * 호스트 검증 + 상태 변경 + 알림 전송
 */
export const rejectBookingRequest = async (
  requestId: string,
  bookingId?: string,
  userId?: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFunction<{ success: boolean; message: string }>(
      'bookingReject',
      { requestId, bookingId: bookingId || '', userId: userId || '' },
    );
    return result;
  } catch (error: any) {
    console.error('참가 거절 실패:', error);
    return {
      success: false,
      message: error.message || '참가 거절에 실패했습니다.',
    };
  }
};

/**
 * 인기 부킹 목록 (OPEN 상태, 참가자 많은 순)
 */
export const getPopularBookings = async (
  limitCount: number = 20,
): Promise<
  {
    id: string;
    course: string;
    date: string;
    time: string;
    organizer: string;
    participants: number;
    maxParticipants: number;
    hostId: string;
  }[]
> => {
  try {
    const snapshot = await firestore()
      .collection('bookings')
      .where('status', '==', 'open')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    if (snapshot.empty) return [];

    const bookings = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let organizerName = '알 수 없음';

        if (data.hostId) {
          try {
            const hostDoc = await firestore().collection('users').doc(data.hostId).get();
            const hostData = hostDoc.data();
            organizerName = hostData?.name || hostData?.displayName || '알 수 없음';
          } catch {
            // 호스트 정보 조회 실패 시 기본값 사용
          }
        }

        return {
          id: doc.id,
          course: data.course || '',
          date: data.date || '',
          time: data.time || '',
          organizer: organizerName,
          participants: data.participants?.current || 0,
          maxParticipants: data.participants?.max || 4,
          hostId: data.hostId || '',
        };
      }),
    );

    // 참가자 많은 순으로 정렬
    return bookings.sort((a, b) => b.participants - a.participants);
  } catch (error) {
    console.error('인기 부킹 조회 실패:', error);
    return [];
  }
};

/**
 * 추천 부킹 목록 (OPEN 상태, 본인 호스팅 제외)
 */
export const getRecommendedBookings = async (
  userId: string,
  limitCount: number = 20,
): Promise<
  {
    id: string;
    course: string;
    date: string;
    time: string;
    organizer: string;
    participants: number;
    maxParticipants: number;
    hostId: string;
  }[]
> => {
  try {
    const snapshot = await firestore()
      .collection('bookings')
      .where('status', '==', 'open')
      .orderBy('createdAt', 'desc')
      .limit(limitCount + 10) // 본인 부킹 필터링 여유분
      .get();

    if (snapshot.empty) return [];

    const bookings = await Promise.all(
      snapshot.docs
        .filter((doc) => doc.data().hostId !== userId)
        .slice(0, limitCount)
        .map(async (doc) => {
          const data = doc.data();
          let organizerName = '알 수 없음';

          if (data.hostId) {
            try {
              const hostDoc = await firestore().collection('users').doc(data.hostId).get();
              const hostData = hostDoc.data();
              organizerName = hostData?.name || hostData?.displayName || '알 수 없음';
            } catch {
              // 호스트 정보 조회 실패 시 기본값 사용
            }
          }

          return {
            id: doc.id,
            course: data.course || '',
            date: data.date || '',
            time: data.time || '',
            organizer: organizerName,
            participants: data.participants?.current || 0,
            maxParticipants: data.participants?.max || 4,
            hostId: data.hostId || '',
          };
        }),
    );

    return bookings;
  } catch (error) {
    console.error('추천 부킹 조회 실패:', error);
    return [];
  }
};

/**
 * 참가 신청 상태 조회 (bookingParticipants + bookings 조인)
 */
export const getRequestStatus = async (
  requestId: string,
): Promise<{
  id: string;
  status: string;
  course: string;
  date: string;
  time: string;
  organizer: string;
  appliedAt: any;
  bookingId: string;
} | null> => {
  try {
    const requestDoc = await firestore().collection('bookingParticipants').doc(requestId).get();

    if (!requestDoc.exists) return null;

    const requestData = requestDoc.data();

    // 부킹 정보 조인
    let course = '';
    let date = '';
    let time = '';
    let organizerName = '알 수 없음';

    if (requestData?.bookingId) {
      const bookingDoc = await firestore().collection('bookings').doc(requestData.bookingId).get();

      if (bookingDoc.exists) {
        const bookingData = bookingDoc.data();
        course = bookingData?.course || '';
        date = bookingData?.date || '';
        time = bookingData?.time || '';

        // 호스트 이름 조회
        if (bookingData?.hostId) {
          try {
            const hostDoc = await firestore().collection('users').doc(bookingData.hostId).get();
            const hostData = hostDoc.data();
            organizerName = hostData?.name || hostData?.displayName || '알 수 없음';
          } catch {
            // 호스트 정보 조회 실패 시 기본값 사용
          }
        }
      }
    }

    return {
      id: requestDoc.id,
      status: requestData?.status || 'pending',
      course,
      date,
      time,
      organizer: organizerName,
      appliedAt: requestData?.joinedAt,
      bookingId: requestData?.bookingId || '',
    };
  } catch (error) {
    console.error('신청 상태 조회 실패:', error);
    return null;
  }
};

/**
 * 신청자 프로필 조회 (users 컬렉션)
 */
export const getApplicantProfile = async (
  userId: string,
): Promise<{
  name: string;
  level: string;
  rating: number;
  avatar: string;
  avgScore: number;
  experience: string;
  rounds: number;
  bio: string;
} | null> => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) return null;

    const data = userDoc.data();
    return {
      name: data?.name || data?.displayName || '사용자',
      level: data?.golfLevel || data?.level || '미등록',
      rating: data?.rating || 0,
      avatar: data?.avatar || data?.photoURL || '',
      avgScore: data?.avgScore || data?.stats?.averageScore || 0,
      experience: data?.experience || '',
      rounds: data?.stats?.totalRounds || 0,
      bio: data?.bio || '',
    };
  } catch (error) {
    console.error('신청자 프로필 조회 실패:', error);
    return null;
  }
};

/**
 * 부킹 참가 취소 (Cloud Functions 경유)
 * bookingWithdraw CF 재사용 - Transaction 기반 원자적 처리
 */
export const leaveBooking = async (
  bookingId: string,
  _userId: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFunction<{ success: boolean; message: string }>(
      'bookingWithdraw',
      { bookingId },
    );
    return result;
  } catch (error: any) {
    console.error('부킹 나가기 실패:', error);
    return {
      success: false,
      message: error.message || '부킹 나가기에 실패했습니다.',
    };
  }
};
