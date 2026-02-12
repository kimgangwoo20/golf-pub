// profile-types.ts - 프로필 관련 타입 정의 (통합)

export interface FavoriteCourse {
  name: string;
  id?: string;
  location?: { lat: number; lng: number };
}

export interface UserProfile {
  // 식별자
  uid: string;

  // 기본 정보
  email: string | null;
  displayName?: string | null;
  nickname?: string; // 카카오 로그인용
  photoURL?: string | null;
  profileImage?: string; // 카카오 로그인용 별칭
  phoneNumber?: string | null;
  gender?: 'male' | 'female';

  // 골프 프로필
  handicap?: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  bio?: string;
  location?: string;
  favoriteGolfCourse?: string;
  favoriteCourses?: FavoriteCourse[];
  golfExperience?: string | number;
  roundingStyles?: string[];
  interests?: string[];
  monthlyRounds?: string;
  overseasGolf?: string;

  // 소셜/통계
  totalRounds?: number;
  likeCount?: number;
  rating?: number;
  reviews?: number;
  stats?: {
    averageScore: number;
    bestScore: number;
    gamesPlayed: number;
    attendance: number;
  };

  // 역할/멤버십
  role?: 'GENERAL' | 'COACH' | 'ADMIN';
  isCoach?: boolean;
  coachVerified?: boolean;
  membership?: string;
  membershipLevel?: 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM';
  provider?: 'firebase' | 'kakao' | 'email';

  // 포인트/쿠폰
  points?: number;
  pointBalance?: number;
  coupons?: number;

  // 미디어
  backgroundMedia?: { url: string; type: 'image' | 'video'; order: number }[];

  // 타임스탬프
  createdAt?: Date | any;
  updatedAt?: Date | any;
  lastLoginAt?: Date | any;
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
  id: string;
  amount: number;
  description: string;
  type: 'earn' | 'spend';
  date: string;
}

export interface Coupon {
  id: string;
  name: string;
  discount: number;
  discountType: 'percent' | 'fixed';
  minAmount?: number;
  expiryDate: string;
  isUsed: boolean;
}

export interface ProfileReview {
  id: string;
  bookingId: string;
  bookingTitle: string;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerImage: string;
}
