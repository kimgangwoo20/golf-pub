// 📦 useBookingStore.ts
// 부킹 상태 관리 (Zustand)

import { create } from 'zustand';
import { Booking } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;

  // Actions
  loadBookings: () => Promise<void>;
  addBooking: (booking: Booking) => Promise<void>;
  updateBooking: (id: number, data: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
  joinBooking: (id: number, userId: number) => Promise<void>;
  leaveBooking: (id: number, userId: number) => Promise<void>;
}

// 더미 데이터
const DUMMY_BOOKINGS: Booking[] = [
  {
    id: 1,
    title: '주말 라운딩 같이 하실 분!',
    course: '세라지오CC',
    date: '2026-01-25',
    time: '10:00',
    host: {
      name: '김골프',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 4.8,
      handicap: 18,
      level: 'intermediate',
    },
    price: {
      original: 140000,
      discount: 126000,
      perPerson: true,
    },
    participants: {
      current: 2,
      max: 4,
      members: [
        { name: '김골프', role: 'host' },
        { name: '이초보', role: 'member' },
      ],
    },
    conditions: {
      level: '초보 환영',
      pace: '여유롭게',
      drinking: '금주',
    },
    weather: {
      temp: '18°C',
      condition: '맑음',
      wind: '2.5 m/s',
    },
    description: '날씨 좋은 주말에 여유롭게 라운딩 함께 하실 분 구합니다!',
  },
  {
    id: 2,
    title: '평일 오전 티타임',
    course: '남서울CC',
    date: '2026-01-22',
    time: '08:00',
    host: {
      name: '박프로',
      avatar: 'https://i.pravatar.cc/150?img=33',
      rating: 4.9,
      handicap: 12,
      level: 'advanced',
    },
    price: {
      original: 160000,
      discount: 144000,
      perPerson: true,
    },
    participants: {
      current: 3,
      max: 4,
      members: [
        { name: '박프로', role: 'host' },
        { name: '정중급', role: 'member' },
        { name: '최고수', role: 'member' },
      ],
    },
    conditions: {
      level: '중급 이상',
      pace: '빠르게',
      drinking: '가능',
    },
  },
  {
    id: 3,
    title: '초보 골퍼 환영합니다',
    course: '대관령CC',
    date: '2026-01-28',
    time: '14:00',
    host: {
      name: '이멘토',
      avatar: 'https://i.pravatar.cc/150?img=47',
      rating: 5.0,
      handicap: 15,
      level: 'beginner',
    },
    price: {
      original: 180000,
      discount: 144000,
      perPerson: true,
    },
    participants: {
      current: 1,
      max: 4,
      members: [
        { name: '이멘토', role: 'host' },
      ],
    },
    conditions: {
      level: '초보 환영',
      pace: '여유롭게',
      drinking: '금주',
    },
  },
];

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  loadBookings: async () => {
    try {
      set({ loading: true, error: null });

      // AsyncStorage에서 데이터 로드 시도
      const stored = await AsyncStorage.getItem('bookings');

      if (stored) {
        const bookings = JSON.parse(stored);
        set({ bookings, loading: false });
      } else {
        // 더미 데이터 사용
        set({ bookings: DUMMY_BOOKINGS, loading: false });
        await AsyncStorage.setItem('bookings', JSON.stringify(DUMMY_BOOKINGS));
      }
    } catch (error) {
      console.error('부킹 로딩 실패:', error);
      set({
        error: '부킹을 불러올 수 없습니다',
        loading: false,
        bookings: DUMMY_BOOKINGS, // 에러 시 더미 데이터 사용
      });
    }
  },

  addBooking: async (booking) => {
    try {
      const { bookings } = get();
      const newBookings = [...bookings, booking];

      set({ bookings: newBookings });
      await AsyncStorage.setItem('bookings', JSON.stringify(newBookings));
    } catch (error) {
      console.error('부킹 추가 실패:', error);
      set({ error: '부킹을 추가할 수 없습니다' });
    }
  },

  updateBooking: async (id, data) => {
    try {
      const { bookings } = get();
      const newBookings = bookings.map(booking =>
        booking.id === id ? { ...booking, ...data } : booking
      );

      set({ bookings: newBookings });
      await AsyncStorage.setItem('bookings', JSON.stringify(newBookings));
    } catch (error) {
      console.error('부킹 업데이트 실패:', error);
      set({ error: '부킹을 업데이트할 수 없습니다' });
    }
  },

  deleteBooking: async (id) => {
    try {
      const { bookings } = get();
      const newBookings = bookings.filter(booking => booking.id !== id);

      set({ bookings: newBookings });
      await AsyncStorage.setItem('bookings', JSON.stringify(newBookings));
    } catch (error) {
      console.error('부킹 삭제 실패:', error);
      set({ error: '부킹을 삭제할 수 없습니다' });
    }
  },

  joinBooking: async (id, userId) => {
    try {
      const { bookings } = get();
      const booking = bookings.find(b => b.id === id);

      if (!booking) return;
      if (booking.participants.current >= booking.participants.max) {
        set({ error: '이미 정원이 마감되었습니다' });
        return;
      }

      const newBookings = bookings.map(b =>
        b.id === id
          ? {
              ...b,
              participants: {
                ...b.participants,
                current: b.participants.current + 1,
                members: [
                  ...b.participants.members,
                  { name: `사용자${userId}`, role: 'member' as const },
                ],
              },
            }
          : b
      );

      set({ bookings: newBookings });
      await AsyncStorage.setItem('bookings', JSON.stringify(newBookings));
    } catch (error) {
      console.error('부킹 참가 실패:', error);
      set({ error: '부킹에 참가할 수 없습니다' });
    }
  },

  leaveBooking: async (id, userId) => {
    try {
      const { bookings } = get();
      const booking = bookings.find(b => b.id === id);

      if (!booking) return;

      const newBookings = bookings.map(b =>
        b.id === id
          ? {
              ...b,
              participants: {
                ...b.participants,
                current: Math.max(1, b.participants.current - 1),
                members: b.participants.members.filter(
                  (m, i) => i === 0 || m.name !== `사용자${userId}`
                ),
              },
            }
          : b
      );

      set({ bookings: newBookings });
      await AsyncStorage.setItem('bookings', JSON.stringify(newBookings));
    } catch (error) {
      console.error('부킹 나가기 실패:', error);
      set({ error: '부킹을 나갈 수 없습니다' });
    }
  },
}));