import { create } from 'zustand';
import {
  firestore as firebaseFirestore,
  FirestoreTimestamp,
} from '@/services/firebase/firebaseConfig';
import { Booking } from '@/types/booking-types';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;

  // Actions
  loadBookings: () => Promise<void>;
  loadMyBookings: (userId: string) => Promise<void>;
  getBooking: (id: string) => Promise<Booking | null>;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  joinBooking: (bookingId: string, userId: string, userName: string) => Promise<void>;
  leaveBooking: (bookingId: string, userId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  /**
   * 모든 부킹 로드 (OPEN 상태만)
   */
  loadBookings: async () => {
    try {
      set({ loading: true, error: null });

      const snapshot = await firebaseFirestore
        .collection('bookings')
        .where('status', '==', 'OPEN')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Booking[];

      set({ bookings, loading: false });
    } catch (error: any) {
      console.error('부킹 로드 실패:', error);
      set({
        error: error.message || '부킹을 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  /**
   * 내 부킹 로드
   */
  loadMyBookings: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      // 내가 호스트인 부킹
      const hostSnapshot = await firebaseFirestore
        .collection('bookings')
        .where('hostId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      // 내가 참여한 부킹
      const participantSnapshot = await firebaseFirestore
        .collection('bookings')
        .where('participants.members', 'array-contains', { uid: userId })
        .orderBy('createdAt', 'desc')
        .get();

      const hostBookings = hostSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Booking[];

      const participantBookings = participantSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Booking[];

      // 중복 제거 (호스트이면서 참여자인 경우)
      const uniqueBookings = [...hostBookings];
      participantBookings.forEach((booking) => {
        if (!uniqueBookings.find((b) => b.id === booking.id)) {
          uniqueBookings.push(booking);
        }
      });

      set({ bookings: uniqueBookings, loading: false });
    } catch (error: any) {
      console.error('내 부킹 로드 실패:', error);
      set({
        error: error.message || '부킹을 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  /**
   * 특정 부킹 가져오기
   */
  getBooking: async (id: string) => {
    try {
      const doc = await firebaseFirestore.collection('bookings').doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate(),
        updatedAt: doc.data()?.updatedAt?.toDate(),
      } as Booking;
    } catch (error: any) {
      console.error('부킹 로드 실패:', error);
      return null;
    }
  },

  /**
   * 부킹 생성
   */
  createBooking: async (booking) => {
    try {
      set({ loading: true, error: null });

      const firestoreData = {
        ...booking,
        createdAt: FirestoreTimestamp.now(),
        updatedAt: FirestoreTimestamp.now(),
      };

      const docRef = await firebaseFirestore.collection('bookings').add(firestoreData);

      // 로컬 상태 업데이트 (Date 타입으로)
      const localNow = new Date();
      const { bookings } = get();
      set({
        bookings: [
          { id: docRef.id, ...booking, createdAt: localNow, updatedAt: localNow } as Booking,
          ...bookings,
        ],
        loading: false,
      });
    } catch (error: any) {
      console.error('부킹 생성 실패:', error);
      set({
        error: error.message || '부킹을 생성할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 부킹 업데이트
   */
  updateBooking: async (id, data) => {
    try {
      set({ loading: true, error: null });

      await firebaseFirestore
        .collection('bookings')
        .doc(id)
        .update({
          ...data,
          updatedAt: FirestoreTimestamp.now(),
        });

      // 로컬 상태 업데이트
      const { bookings } = get();
      set({
        bookings: bookings.map((booking) =>
          booking.id === id ? { ...booking, ...data } : booking,
        ),
        loading: false,
      });
    } catch (error: any) {
      console.error('부킹 업데이트 실패:', error);
      set({
        error: error.message || '부킹을 업데이트할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 부킹 삭제
   */
  deleteBooking: async (id) => {
    try {
      set({ loading: true, error: null });

      await firebaseFirestore.collection('bookings').doc(id).delete();

      // 로컬 상태 업데이트
      const { bookings } = get();
      set({
        bookings: bookings.filter((booking) => booking.id !== id),
        loading: false,
      });
    } catch (error: any) {
      console.error('부킹 삭제 실패:', error);
      set({
        error: error.message || '부킹을 삭제할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 부킹 참가
   */
  joinBooking: async (bookingId, userId, userName) => {
    try {
      set({ loading: true, error: null });

      const bookingRef = firebaseFirestore.collection('bookings').doc(bookingId);

      // Firestore 트랜잭션으로 원자적 업데이트 (경쟁 조건 방지)
      await firebaseFirestore.runTransaction(async (transaction) => {
        const bookingSnapshot = await transaction.get(bookingRef);
        if (!bookingSnapshot.exists) {
          throw new Error('부킹을 찾을 수 없습니다');
        }
        const latestData = bookingSnapshot.data() as Booking;

        if (latestData.participants.current >= latestData.participants.max) {
          throw new Error('이미 정원이 마감되었습니다');
        }
        if (latestData.participants.members.some((m) => m.uid === userId)) {
          throw new Error('이미 참가한 부킹입니다');
        }

        transaction.update(bookingRef, {
          'participants.current': latestData.participants.current + 1,
          'participants.members': [
            ...latestData.participants.members,
            { uid: userId, name: userName, role: 'member' },
          ],
          updatedAt: FirestoreTimestamp.now(),
        });
      });

      // 로컬 상태 업데이트
      const { bookings } = get();
      set({
        bookings: bookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                participants: {
                  ...b.participants,
                  current: b.participants.current + 1,
                  members: [
                    ...b.participants.members,
                    { uid: userId, name: userName, role: 'member' },
                  ],
                },
              }
            : b,
        ),
        loading: false,
      });
    } catch (error: any) {
      console.error('부킹 참가 실패:', error);
      set({
        error: error.message || '부킹에 참가할 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 부킹 나가기
   */
  leaveBooking: async (bookingId, userId) => {
    try {
      set({ loading: true, error: null });

      const bookingRef = firebaseFirestore.collection('bookings').doc(bookingId);

      // Firestore 트랜잭션으로 원자적 업데이트 (경쟁 조건 방지)
      await firebaseFirestore.runTransaction(async (transaction) => {
        const bookingSnapshot = await transaction.get(bookingRef);
        if (!bookingSnapshot.exists) {
          throw new Error('부킹을 찾을 수 없습니다');
        }
        const bookingData = bookingSnapshot.data() as Booking;

        if (bookingData.hostId === userId) {
          throw new Error('호스트는 부킹을 나갈 수 없습니다');
        }

        transaction.update(bookingRef, {
          'participants.current': Math.max(1, bookingData.participants.current - 1),
          'participants.members': bookingData.participants.members.filter((m) => m.uid !== userId),
          updatedAt: FirestoreTimestamp.now(),
        });
      });

      // 로컬 상태 업데이트
      const { bookings } = get();
      set({
        bookings: bookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                participants: {
                  ...b.participants,
                  current: Math.max(1, b.participants.current - 1),
                  members: b.participants.members.filter((m) => m.uid !== userId),
                },
              }
            : b,
        ),
        loading: false,
      });
    } catch (error: any) {
      console.error('부킹 나가기 실패:', error);
      set({
        error: error.message || '부킹을 나갈 수 없습니다',
        loading: false,
      });
      throw error;
    }
  },
}));
