// golfcourse-types.ts - 골프장 시스템 타입 정의

export interface GolfCourse {
  id: number;
  name: string;
  address: string;
  phone: string;
  website?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // km
  images: string[];
  rating: number;
  reviewCount: number;
  facilities: Facility[];
  holes: number;
  greenFee: {
    weekday: number;
    weekend: number;
  };
  operatingHours: string;
  description: string;
  isFavorite: boolean;
}

export interface Facility {
  id: string;
  name: string;
  icon: string;
}

export interface GolfCourseReview {
  id: number;
  courseId: number;
  author: {
    id: number;
    name: string;
    image: string;
    handicap: number;
  };
  rating: number;
  courseRating: number;
  facilityRating: number;
  serviceRating: number;
  content: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export type FilterType = 'distance' | 'rating' | 'price';
export type SortType = 'distance' | 'rating' | 'price_low' | 'price_high';

export const FACILITIES: Facility[] = [
  { id: 'sauna', name: '사우나', icon: '♨️' },
  { id: 'practice', name: '연습장', icon: '🏌️' },
  { id: 'restaurant', name: '레스토랑', icon: '🍴' },
  { id: 'proshop', name: '프로샵', icon: '🏪' },
  { id: 'parking', name: '주차장', icon: '🅿️' },
  { id: 'caddy', name: '캐디', icon: '👤' },
  { id: 'cart', name: '카트', icon: '🛺' },
  { id: 'locker', name: '락커룸', icon: '🚿' },
];