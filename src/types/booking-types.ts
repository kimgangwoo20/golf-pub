// src/types/booking-types.ts

/**
 * 골프 실력 레벨
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'any';

/**
 * 부킹 상태
 */
export type BookingStatus = 'open' | 'full' | 'closed' | 'cancelled' | 'completed';

/**
 * 참가자 정보
 */
export interface Participant {
  id: number;
  avatar: string;
  name?: string;
}

/**
 * 부킹 (골프 번개 모임)
 */
export interface Booking {
  id: number;
  title: string;
  golfCourse: string;
  location: string;
  date: string; // YYYY-MM-DD 형식
  time: string; // HH:mm 형식
  maxPlayers: number;
  currentPlayers: number;
  price: number;
  level: SkillLevel;
  status: BookingStatus;
  description: string;
  image: string;
  participants: Participant[];
  hasPub: boolean;
  pubName?: string;
  pubTime?: string;
  hostId?: number;
  createdAt?: string;
}

/**
 * 부킹 필터 옵션
 */
export interface BookingFilter {
  date?: 'today' | 'thisWeek' | 'thisMonth' | 'all';
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  level?: SkillLevel[];
  status?: BookingStatus[];
  hasPub?: boolean;
}

/**
 * 부킹 정렬 옵션
 */
export type BookingSortType =
  | 'latest'      // 최신순
  | 'popular'     // 인기순
  | 'priceLow'    // 가격 낮은순
  | 'priceHigh'   // 가격 높은순
  | 'dateClose';  // 날짜 가까운순

/**
 * 부킹 생성 요청 데이터
 */
export interface CreateBookingRequest {
  title: string;
  golfCourse: string;
  location: string;
  date: string;
  time: string;
  maxPlayers: number;
  price: number;
  level: SkillLevel;
  description: string;
  image?: string;
  hasPub?: boolean;
  pubName?: string;
  pubTime?: string;
}

/**
 * 부킹 참가 신청 데이터
 */
export interface JoinBookingRequest {
  bookingId: number;
  userId: number;
  message?: string;
}

/**
 * 부킹 결제 정보
 */
export interface BookingPayment {
  bookingId: number;
  amount: number;
  platformFee: number; // 5% 수수료
  pointsUsed: number;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: 'card' | 'bank' | 'simple';
}

/**
 * 코치 정보
 */
export interface Coach {
  id: number;
  name: string;
  type: string;
  rating: number;
  rounds: number;
  handicap: number;
  bio: string;
  avatar: string;
  cover: string;
  verified: boolean;
  region: string;
}