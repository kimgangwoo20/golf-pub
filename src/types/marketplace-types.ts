// marketplace-types.ts - 중고거래 타입 정의

export type ProductCategory =
  | 'driver'
  | 'iron'
  | 'putter'
  | 'wedge'
  | 'wood'
  | 'apparel'
  | 'accessory'
  | 'other';

export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair';

export type ProductStatus = 'available' | 'reserved' | 'sold';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  status: ProductStatus;
  images: string[];
  location: string;
  sellerName: string;
  sellerImage: string;
  sellerRating: number;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'driver', name: '드라이버', icon: '🏌️' },
  { id: 'iron', name: '아이언', icon: '⛳' },
  { id: 'putter', name: '퍼터', icon: '🎯' },
  { id: 'wedge', name: '웨지', icon: '🔺' },
  { id: 'wood', name: '우드', icon: '🌲' },
  { id: 'apparel', name: '의류', icon: '👕' },
  { id: 'accessory', name: '액세서리', icon: '🎒' },
  { id: 'other', name: '기타', icon: '📦' },
];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  'new': '새제품',
  'like-new': '거의 새것',
  'good': '좋음',
  'fair': '사용감 있음',
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  'available': '판매중',
  'reserved': '예약중',
  'sold': '판매완료',
};