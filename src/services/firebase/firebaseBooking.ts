// ⛳ Firebase 부킹 시스템 서비스
// 골프 부킹 생성, 참가, 관리

import firestore from '@react-native-firebase/firestore';
import { FirestoreTimestamp } from './firebaseConfig';

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
export const createBooking = async (bookingData: Partial<Booking>): Promise<{
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
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return {
        success: false,
        message: '존재하지 않는 부킹입니다.',
      };
    }

    const bookingData = bookingDoc.data() as Booking;

    // 이미 참가 중인지 확인
    if (bookingData.participants.list.includes(userId)) {
      return {
        success: false,
        message: '이미 참가 중입니다.',
      };
    }

    // 정원 확인
    if (bookingData.participants.current >= bookingData.participants.max) {
      return {
        success: false,
        message: '정원이 마감되었습니다.',
      };
    }

    // 부킹 상태 확인
    if (bookingData.status !== 'open') {
      return {
        success: false,
        message: '참가할 수 없는 부킹입니다.',
      };
    }

    // 참가자 추가
    await bookingRef.update({
      'participants.current': firestore.FieldValue.increment(1),
      'participants.list': firestore.FieldValue.arrayUnion(userId),
      updatedAt: FirestoreTimestamp.now(),
    });

    // 정원이 찼으면 상태 변경
    if (bookingData.participants.current + 1 >= bookingData.participants.max) {
      await bookingRef.update({
        status: 'full',
      });
    }

    // 참가 기록 생성
    await firestore()
      .collection('bookingParticipants')
      .add({
        bookingId,
        userId,
        hostId: bookingData.hostId,
        status: 'pending', // pending, approved, rejected
        joinedAt: FirestoreTimestamp.now(),
      });

    // 사용자 통계 업데이트
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        'stats.joinedBookings': firestore.FieldValue.increment(1),
      });

    // 호스트에게 알림 (TODO: Firebase Cloud Messaging)

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
    let query = firestore()
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(20);

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
    const doc = await firestore()
      .collection('bookings')
      .doc(bookingId)
      .get();

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
 * 부킹 취소 (호스트만 가능)
 */
export const cancelBooking = async (
  bookingId: string,
  userId: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const bookingDoc = await firestore()
      .collection('bookings')
      .doc(bookingId)
      .get();

    if (!bookingDoc.exists) {
      return {
        success: false,
        message: '존재하지 않는 부킹입니다.',
      };
    }

    const bookingData = bookingDoc.data() as Booking;

    if (bookingData.hostId !== userId) {
      return {
        success: false,
        message: '호스트만 취소할 수 있습니다.',
      };
    }

    await firestore()
      .collection('bookings')
      .doc(bookingId)
      .update({
        status: 'closed',
        updatedAt: FirestoreTimestamp.now(),
      });

    // 참가자들에게 알림 (TODO: Firebase Cloud Messaging)

    return {
      success: true,
      message: '부킹이 취소되었습니다.',
    };
  } catch (error) {
    console.error('부킹 취소 실패:', error);
    return {
      success: false,
      message: '부킹 취소에 실패했습니다.',
    };
  }
};

/**
 * 참가 신청 목록 조회 (호스트용)
 * bookingParticipants 컬렉션에서 pending 상태 쿼리 + users 프로필 조인
 */
export const getBookingRequests = async (bookingId: string): Promise<{
  id: string;
  userId: string;
  name: string;
  avatar: string;
  level: string;
  rating: number;
  message: string;
  status: string;
  joinedAt: any;
}[]> => {
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
          const userDoc = await firestore()
            .collection('users')
            .doc(data.userId)
            .get();

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
      })
    );

    return requests;
  } catch (error) {
    console.error('참가 신청 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 참가 신청 승인
 * bookingParticipants 문서 status → 'approved'
 * bookings 문서의 participants 업데이트
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
    // 신청 상태를 approved로 변경
    await firestore()
      .collection('bookingParticipants')
      .doc(requestId)
      .update({
        status: 'approved',
        approvedAt: FirestoreTimestamp.now(),
      });

    // bookings 문서의 participants 업데이트
    const bookingRef = firestore().collection('bookings').doc(bookingId);
    await bookingRef.update({
      'participants.current': firestore.FieldValue.increment(1),
      'participants.list': firestore.FieldValue.arrayUnion(userId),
      updatedAt: FirestoreTimestamp.now(),
    });

    // 정원 확인 후 상태 변경
    const bookingDoc = await bookingRef.get();
    if (bookingDoc.exists) {
      const bookingData = bookingDoc.data();
      if (bookingData?.participants?.current >= bookingData?.participants?.max) {
        await bookingRef.update({ status: 'full' });
      }
    }

    return {
      success: true,
      message: '참가가 승인되었습니다.',
    };
  } catch (error) {
    console.error('참가 승인 실패:', error);
    return {
      success: false,
      message: '참가 승인에 실패했습니다.',
    };
  }
};

/**
 * 참가 신청 거절
 * bookingParticipants 문서 status → 'rejected'
 */
export const rejectBookingRequest = async (requestId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await firestore()
      .collection('bookingParticipants')
      .doc(requestId)
      .update({
        status: 'rejected',
        rejectedAt: FirestoreTimestamp.now(),
      });

    return {
      success: true,
      message: '참가가 거절되었습니다.',
    };
  } catch (error) {
    console.error('참가 거절 실패:', error);
    return {
      success: false,
      message: '참가 거절에 실패했습니다.',
    };
  }
};

/**
 * 인기 부킹 목록 (OPEN 상태, 참가자 많은 순)
 */
export const getPopularBookings = async (limitCount: number = 20): Promise<{
  id: string;
  course: string;
  date: string;
  time: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  hostId: string;
}[]> => {
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
      })
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
export const getRecommendedBookings = async (userId: string, limitCount: number = 20): Promise<{
  id: string;
  course: string;
  date: string;
  time: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  hostId: string;
}[]> => {
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
        })
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
export const getRequestStatus = async (requestId: string): Promise<{
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
    const requestDoc = await firestore()
      .collection('bookingParticipants')
      .doc(requestId)
      .get();

    if (!requestDoc.exists) return null;

    const requestData = requestDoc.data();

    // 부킹 정보 조인
    let course = '';
    let date = '';
    let time = '';
    let organizerName = '알 수 없음';

    if (requestData?.bookingId) {
      const bookingDoc = await firestore()
        .collection('bookings')
        .doc(requestData.bookingId)
        .get();

      if (bookingDoc.exists) {
        const bookingData = bookingDoc.data();
        course = bookingData?.course || '';
        date = bookingData?.date || '';
        time = bookingData?.time || '';

        // 호스트 이름 조회
        if (bookingData?.hostId) {
          try {
            const hostDoc = await firestore()
              .collection('users')
              .doc(bookingData.hostId)
              .get();
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
export const getApplicantProfile = async (userId: string): Promise<{
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
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

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
 * 부킹 참가 취소
 */
export const leaveBooking = async (
  bookingId: string,
  userId: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const bookingRef = firestore().collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return {
        success: false,
        message: '존재하지 않는 부킹입니다.',
      };
    }

    const bookingData = bookingDoc.data() as Booking;

    // 호스트는 나갈 수 없음
    if (bookingData.hostId === userId) {
      return {
        success: false,
        message: '호스트는 부킹을 나갈 수 없습니다.',
      };
    }

    // 참가자 제거
    await bookingRef.update({
      'participants.current': firestore.FieldValue.increment(-1),
      'participants.list': firestore.FieldValue.arrayRemove(userId),
      status: 'open', // 정원이 비었으므로 다시 open
      updatedAt: FirestoreTimestamp.now(),
    });

    // 참가 기록 업데이트
    const participantSnapshot = await firestore()
      .collection('bookingParticipants')
      .where('bookingId', '==', bookingId)
      .where('userId', '==', userId)
      .get();

    if (!participantSnapshot.empty) {
      await participantSnapshot.docs[0].ref.update({
        status: 'cancelled',
        cancelledAt: FirestoreTimestamp.now(),
      });
    }

    return {
      success: true,
      message: '부킹에서 나갔습니다.',
    };
  } catch (error) {
    console.error('부킹 나가기 실패:', error);
    return {
      success: false,
      message: '부킹 나가기에 실패했습니다.',
    };
  }
};
