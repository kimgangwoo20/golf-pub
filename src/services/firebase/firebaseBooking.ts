// ⛳ Firebase 부킹 시스템 서비스
// 골프 부킹 생성, 참가, 관리

import firestore from '@react-native-firebase/firestore';

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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
      updatedAt: Date.now(),
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
        joinedAt: Date.now(),
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
        updatedAt: Date.now(),
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
      updatedAt: Date.now(),
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
        cancelledAt: Date.now(),
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
