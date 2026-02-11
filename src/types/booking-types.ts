// src/types/booking-types.ts

/**
 * 골프 실력 레벨
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'any';

/**
 * 부킹 상태
 */
export type BookingStatus = 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';

/**
 * 참가 멤버 정보
 */
export interface BookingMember {
  uid: string;
  name: string;
  role: 'host' | 'member';
}

/**
 * 호스트 정보
 */
export interface BookingHost {
  name: string;
  avatar: string;
  rating: number;
  handicap: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * 가격 정보
 */
export interface BookingPrice {
  original: number;
  discount: number;
  perPerson: boolean;
}

/**
 * 참가자 정보
 */
export interface BookingParticipants {
  current: number;
  max: number;
  members: BookingMember[];
  list?: string[];
}

/**
 * 조건 정보
 */
export interface BookingConditions {
  level: string;
  pace: string;
  drinking: string;
}

/**
 * 날씨 정보 (선택)
 */
export interface BookingWeather {
  condition: string;
  temp: string;
}

/**
 * 부킹 (골프 번개 모임)
 */
export interface Booking {
  id: string;
  hostId: string;
  title: string;
  course: string;
  date: string;
  time: string;
  host: BookingHost;
  price: BookingPrice;
  participants: BookingParticipants;
  conditions?: BookingConditions;
  weather?: BookingWeather;
  status: BookingStatus;
  description?: string;
  image?: string;
  images?: string[];
  level?: SkillLevel;
  location?: string;
  hasPub?: boolean;
  pubName?: string;
  pubTime?: string;
  createdAt: Date;
  updatedAt: Date;
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
  | 'latest' // 최신순
  | 'popular' // 인기순
  | 'priceLow' // 가격 낮은순
  | 'priceHigh' // 가격 높은순
  | 'dateClose'; // 날짜 가까운순

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
  bookingId: string;
  userId: string;
  message?: string;
}

/**
 * 부킹 결제 정보
 */
export interface BookingPayment {
  bookingId: string;
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
  id: string;
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
