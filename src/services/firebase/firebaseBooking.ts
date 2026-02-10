// ⛳ Firebase 부킹 시스템 서비스
// 골프 부킹 생성, 참가, 관리

import {
  firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  increment,
  arrayUnion,
  documentId,
  FirestoreTimestamp,
} from './firebaseConfig';
import { firebaseMessaging } from './firebaseMessaging';
import { profileAPI } from '@/services/api/profileAPI';
import { callFunction } from '@/services/firebase/firebaseFunctions';

// Booking 타입은 booking-types.ts에서 가져옴 (participants.members: BookingMember[])
// firebaseBooking에서는 간소화된 인터페이스 사용 (Firestore 문서 구조)
export interface FirebaseBooking {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  hostId: string;
  participants: {
    current: number;
    max: number;
    list: string[]; // 하위 호환: userId 배열 (레거시)
    members?: { uid: string; name: string; role: string }[]; // 표준 구조
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
  bookingData: Partial<FirebaseBooking>,
): Promise<{
  success: boolean;
  bookingId?: string;
  message: string;
}> => {
  try {
    const docRef = await addDoc(collection(firestore, 'bookings'), {
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
    await updateDoc(doc(firestore, 'users', bookingData.hostId!), {
      'stats.hostedBookings': increment(1),
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
    const bookingRef = doc(firestore, 'bookings', bookingId);

    // 트랜잭션으로 동시 참가 경합 조건 방지
    const result = await runTransaction(firestore, async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);

      if (!bookingDoc.exists) {
        return { success: false, message: '존재하지 않는 부킹입니다.' };
      }

      const bookingData = bookingDoc.data() as FirebaseBooking;

      // 이미 참가 중인지 확인 (list 또는 members 양쪽 확인)
      const isInList = bookingData.participants.list?.includes(userId);
      const isInMembers = bookingData.participants.members?.some((m) => m.uid === userId);
      if (isInList || isInMembers) {
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

      // 사용자 프로필 조회 (members 필드용)
      let userName = '사용자';
      try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists) {
          const userData = userDoc.data();
          userName = userData?.name || userData?.displayName || '사용자';
        }
      } catch {
        // 프로필 조회 실패 시 기본값 사용
      }

      const newCurrent = bookingData.participants.current + 1;
      const currentMembers = bookingData.participants.members || [];
      const updateData: Record<string, any> = {
        'participants.current': newCurrent,
        'participants.list': arrayUnion(userId),
        'participants.members': [
          ...currentMembers,
          { uid: userId, name: userName, role: 'member' },
        ],
        updatedAt: FirestoreTimestamp.now(),
      };

      // 정원이 찼으면 상태도 함께 변경
      if (newCurrent >= bookingData.participants.max) {
        updateData.status = 'full';
      }

      transaction.update(bookingRef, updateData);

      return {
        success: true,
        message: '참가 신청이 완료되었습니다!',
        hostId: bookingData.hostId,
        title: bookingData.title,
      };
    });

    if (!result.success) {
      return { success: result.success, message: result.message };
    }

    // 트랜잭션 외부: 부수 효과 (실패해도 참가 처리에 영향 없음)
    // 참가 기록 생성
    await addDoc(collection(firestore, 'bookingParticipants'), {
      bookingId,
      userId,
      hostId: (result as any).hostId,
      status: 'pending',
      joinedAt: FirestoreTimestamp.now(),
    });

    // 사용자 통계 업데이트
    await updateDoc(doc(firestore, 'users', userId), {
      'stats.joinedBookings': increment(1),
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
}): Promise<FirebaseBooking[]> => {
  try {
    const constraints: any[] = [orderBy('createdAt', 'desc'), limit(20)];

    if (filter?.status) {
      constraints.unshift(where('status', '==', filter.status));
    }

    if (filter?.date) {
      constraints.unshift(where('date', '==', filter.date));
    }

    const q = query(collection(firestore, 'bookings'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirebaseBooking[];
  } catch (error) {
    console.error('부킹 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 부킹 상세 정보 가져오기
 */
export const getBookingDetail = async (bookingId: string): Promise<FirebaseBooking | null> => {
  try {
    const docSnap = await getDoc(doc(firestore, 'bookings', bookingId));

    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as FirebaseBooking;
  } catch (error) {
    console.error('부킹 상세 조회 실패:', error);
    return null;
  }
};

/**
 * 내가 생성한 부킹 목록
 */
export const getMyHostedBookings = async (userId: string): Promise<FirebaseBooking[]> => {
  try {
    const q = query(collection(firestore, 'bookings'), where('hostId', '==', userId));
    const snapshot = await getDocs(q);

    const bookings = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirebaseBooking[];

    // 클라이언트 사이드 정렬 (복합 인덱스 불필요)
    return bookings.sort((a, b) => {
      const aTime = (a as any).createdAt?.toDate?.()?.getTime?.() || 0;
      const bTime = (b as any).createdAt?.toDate?.()?.getTime?.() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('내 부킹 조회 실패:', error);
    return [];
  }
};

/**
 * 내가 참가한 부킹 목록
 */
export const getMyJoinedBookings = async (userId: string): Promise<FirebaseBooking[]> => {
  try {
    const q = query(
      collection(firestore, 'bookings'),
      where('participants.list', 'array-contains', userId),
    );
    const snapshot = await getDocs(q);

    const bookings = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirebaseBooking[];

    // 클라이언트 사이드 정렬 (복합 인덱스 불필요)
    return bookings.sort((a, b) => {
      const aTime = (a as any).createdAt?.toDate?.()?.getTime?.() || 0;
      const bTime = (b as any).createdAt?.toDate?.()?.getTime?.() || 0;
      return bTime - aTime;
    });
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
    const result = await callFunction<{ success: boolean; message: string }>('bookingCancel', {
      bookingId,
      reason: reason || '',
    });
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
    const result = await callFunction<{ success: boolean; message: string }>('bookingWithdraw', {
      bookingId,
    });
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
    const q = query(
      collection(firestore, 'bookingParticipants'),
      where('bookingId', '==', bookingId),
      where('status', '==', 'pending'),
      orderBy('joinedAt', 'desc'),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    // 신청자 프로필 정보 조인
    const requests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let userProfile = { name: '알 수 없음', avatar: '', level: '', rating: 0 };

        try {
          const userDoc = await getDoc(doc(firestore, 'users', data.userId));

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
          id: docSnap.id,
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
    const result = await callFunction<{ success: boolean; message: string }>('bookingApprove', {
      requestId,
      bookingId,
      userId,
    });
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
    const result = await callFunction<{ success: boolean; message: string }>('bookingReject', {
      requestId,
      bookingId: bookingId || '',
      userId: userId || '',
    });
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
    const q = query(
      collection(firestore, 'bookings'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    // 호스트 ID 수집 후 배치 쿼리 (N+1 방지)
    const hostIds = [
      ...new Set(snapshot.docs.map((docSnap) => docSnap.data().hostId).filter(Boolean)),
    ];
    const hostMap: Record<string, string> = {};

    // Firestore 'in' 쿼리는 최대 10개씩
    for (let i = 0; i < hostIds.length; i += 10) {
      const chunk = hostIds.slice(i, i + 10);
      try {
        const hostsQuery = query(collection(firestore, 'users'), where(documentId(), 'in', chunk));
        const hostsSnapshot = await getDocs(hostsQuery);
        hostsSnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          hostMap[docSnap.id] = data?.name || data?.displayName || '알 수 없음';
        });
      } catch {
        // 호스트 배치 조회 실패 시 기본값 유지
      }
    }

    const bookings = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        course: data.course || '',
        date: data.date || '',
        time: data.time || '',
        organizer: hostMap[data.hostId] || '알 수 없음',
        participants: data.participants?.current || 0,
        maxParticipants: data.participants?.max || 4,
        hostId: data.hostId || '',
      };
    });

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
    const q = query(
      collection(firestore, 'bookings'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(limitCount + 10), // 본인 부킹 필터링 여유분
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    const filteredDocs = snapshot.docs
      .filter((docSnap) => docSnap.data().hostId !== userId)
      .slice(0, limitCount);

    // 호스트 ID 수집 후 배치 쿼리 (N+1 방지)
    const hostIds = [
      ...new Set(filteredDocs.map((docSnap) => docSnap.data().hostId).filter(Boolean)),
    ];
    const hostMap: Record<string, string> = {};

    for (let i = 0; i < hostIds.length; i += 10) {
      const chunk = hostIds.slice(i, i + 10);
      try {
        const hostsQuery = query(collection(firestore, 'users'), where(documentId(), 'in', chunk));
        const hostsSnapshot = await getDocs(hostsQuery);
        hostsSnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          hostMap[docSnap.id] = data?.name || data?.displayName || '알 수 없음';
        });
      } catch {
        // 호스트 배치 조회 실패 시 기본값 유지
      }
    }

    const bookings = filteredDocs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        course: data.course || '',
        date: data.date || '',
        time: data.time || '',
        organizer: hostMap[data.hostId] || '알 수 없음',
        participants: data.participants?.current || 0,
        maxParticipants: data.participants?.max || 4,
        hostId: data.hostId || '',
      };
    });

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
    const requestDoc = await getDoc(doc(firestore, 'bookingParticipants', requestId));

    if (!requestDoc.exists) return null;

    const requestData = requestDoc.data();

    // 부킹 정보 조인
    let course = '';
    let date = '';
    let time = '';
    let organizerName = '알 수 없음';

    if (requestData?.bookingId) {
      const bookingDoc = await getDoc(doc(firestore, 'bookings', requestData.bookingId));

      if (bookingDoc.exists) {
        const bookingData = bookingDoc.data();
        course = bookingData?.course || '';
        date = bookingData?.date || '';
        time = bookingData?.time || '';

        // 호스트 이름 조회
        if (bookingData?.hostId) {
          try {
            const hostDoc = await getDoc(doc(firestore, 'users', bookingData.hostId));
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
    const userDoc = await getDoc(doc(firestore, 'users', userId));

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
    const result = await callFunction<{ success: boolean; message: string }>('bookingWithdraw', {
      bookingId,
    });
    return result;
  } catch (error: any) {
    console.error('부킹 나가기 실패:', error);
    return {
      success: false,
      message: error.message || '부킹 나가기에 실패했습니다.',
    };
  }
};
