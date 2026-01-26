// src/types/index.ts
// 골프 Pub 앱 타입 정의

export interface Booking {
  id: number;
  title: string;
  course: string;
  date: string;
  time: string;
  host: {
    name: string;
    avatar: string;
    rating: number;
    handicap: number;
    level: 'beginner' | 'intermediate' | 'advanced';
  };
  price: {
    original: number;
    discount: number;
    perPerson: boolean;
  };
  participants: {
    current: number;
    max: number;
    members: {
      name: string;
      role: 'host' | 'member';
    }[];
  };
  conditions?: {
    level: string;
    pace: string;
    drinking: string;
  };
  weather?: {
    temp: string;
    condition: string;
    wind: string;
  };
  description?: string;
}

export interface Friend {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastPlayed?: string;
  handicap?: number;
  roundCount?: number;
}

export interface Group {
  id: number;
  name: string;
  icon: string;
  members: number;
  lastActivity: string;
}

export interface GolfCourse {
  id: number;
  name: string;
  location: string;
  distance: number;
  image: string;
  rating: number;
  reviews: number;
  holes: number;
  price: number;
}

export interface Lesson {
  id: number;
  coach: {
    id: number;
    name: string;
    avatar: string;
    title: string;
  };
  title: string;
  description: string;
  location: string;
  duration: string;
  rating: number;
  reviews: number;
  price: number;
  packages: {
    one: number;
    five: number;
    ten: number;
  };
  image: string;
  badge?: string;
}

// ========================================
// 🌤️ 날씨 관련 타입 (weather-types.ts에서 가져오기)
// ========================================
export * from './weather-types';