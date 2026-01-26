// profile-types.ts - 프로필 관련 타입 정의

export interface UserProfile {
  id: number;
  name: string;
  profileImage: string;
  email?: string;
  phone?: string;
  handicap: number;
  memberSince: string;
  points: number;
  coupons: number;
  bio?: string;
}

export interface UserStats {
  totalRounds: number;
  averageScore: number;
  meetupsJoined: number;
  bestScore?: number;
  totalDistance?: number;
}

export interface UserActivity {
  joinedMeetups: number;
  hostedMeetups: number;
  reviews: number;
  purchases?: number;
  sales?: number;
}

export interface UserRating {
  rating: number;
  reviewCount: number;
}

export interface Point {
  id: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend';
  date: string;
}

export interface Coupon {
  id: number;
  name: string;
  discount: number;
  discountType: 'percent' | 'fixed';
  minAmount?: number;
  expiryDate: string;
  isUsed: boolean;
}

export interface Review {
  id: number;
  bookingId: number;
  bookingTitle: string;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerImage: string;
}