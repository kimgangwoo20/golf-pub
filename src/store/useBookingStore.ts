import { create } from 'zustand';
import { firestore as firebaseFirestore } from '@/services/firebase/firebaseConfig';
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

      const now = new Date();
      const newBooking = {
        ...booking,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await firebaseFirestore.collection('bookings').add(newBooking);

      // 로컬 상태 업데이트
      const { bookings } = get();
      set({
        bookings: [{ id: docRef.id, ...newBooking } as Booking, ...bookings],
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
          updatedAt: new Date(),
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
      const booking = await bookingRef.get();

      if (!booking.exists) {
        throw new Error('부킹을 찾을 수 없습니다');
      }

      const bookingData = booking.data() as Booking;

      // 정원 확인
      if (bookingData.participants.current >= bookingData.participants.max) {
        throw new Error('이미 정원이 마감되었습니다');
      }

      // 이미 참가했는지 확인
      if (bookingData.participants.members.some((m) => m.uid === userId)) {
        throw new Error('이미 참가한 부킹입니다');
      }

      // Firestore 업데이트
      await bookingRef.update({
        'participants.current': bookingData.participants.current + 1,
        'participants.members': [
          ...bookingData.participants.members,
          { uid: userId, name: userName, role: 'member' },
        ],
        updatedAt: new Date(),
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
      const booking = await bookingRef.get();

      if (!booking.exists) {
        throw new Error('부킹을 찾을 수 없습니다');
      }

      const bookingData = booking.data() as Booking;

      // 호스트는 나갈 수 없음
      if (bookingData.hostId === userId) {
        throw new Error('호스트는 부킹을 나갈 수 없습니다');
      }

      // Firestore 업데이트
      await bookingRef.update({
        'participants.current': Math.max(1, bookingData.participants.current - 1),
        'participants.members': bookingData.participants.members.filter((m) => m.uid !== userId),
        updatedAt: new Date(),
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
