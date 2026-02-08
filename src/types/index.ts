/**
 * 골프 Pub 앱 - 공통 타입 정의
 */

// User Types
export interface User {
  uid: string;
  id: string; // uid alias (Firebase Auth 호환)
  email: string | null;
  displayName: string | null;
  name: string | null; // displayName alias
  photoURL: string | null;
  avatar: string | null; // photoURL alias
  phoneNumber: string | null;
  phone: string | null; // phoneNumber alias
  role: 'GENERAL' | 'COACH' | 'ADMIN';
  handicap: number;
  pointBalance: number;
  points: number; // pointBalance alias
  membership?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types (re-exported from booking-types.ts)
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// Marketplace Types
export type ItemCategory = 'DRIVER' | 'IRON' | 'PUTTER' | 'CLOTHES' | 'ETC';
export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'USED';
export type ItemStatus = 'FOR_SALE' | 'RESERVED' | 'SOLD';

// Chat Types
export type ChatRoomType = 'booking' | 'marketplace' | 'direct';
export type MessageType = 'text' | 'image' | 'system';

// Friend Types
export type FriendStatus = 'pending' | 'accepted' | 'blocked';

// Point Types
export interface PointHistory {
  id: string;
  userId: string;
  type: 'add' | 'subtract';
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

// Review Types
export interface Review {
  id: string;
  targetId: string; // 부킹 ID 또는 상품 ID
  targetType: 'booking' | 'marketplace' | 'coach';
  reviewerId: string;
  reviewerName: string;
  rating: number;
  content: string;
  images?: string[];
  createdAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  bookingId?: string;
  itemId?: string;
  amount: number;
  fee: number;
  method: 'CARD' | 'TRANSFER' | 'KAKAO_PAY' | 'POINT';
  status: 'PENDING' | 'DEPOSITED' | 'RELEASED' | 'REFUNDED';
  orderId: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'chat' | 'friend' | 'marketplace' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// Golf Course Types
export interface GolfCourse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  holes: 18 | 27 | 36;
  rating: number;
  reviews: number;
  price: {
    weekday: number;
    weekend: number;
  };
  images: string[];
}

// Re-exports from sub-type files
export type { Weather, WeatherForecast } from './weather-types';
export type {
  Booking,
  BookingFilter,
  BookingPayment,
  BookingStatus,
  SkillLevel,
  BookingHost,
  BookingPrice,
  BookingParticipants,
  BookingConditions,
  BookingWeather,
  BookingMember,
} from './booking-types';
