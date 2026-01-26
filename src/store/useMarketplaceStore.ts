// useMarketplaceStore.ts - 중고거래 상태 관리
import { create } from 'zustand';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: 'club' | 'ball' | 'wear' | 'accessory' | 'bag' | 'etc';
  condition: 'new' | 'like-new' | 'good' | 'fair';
  images: string[];
  seller: {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  location: string;
  status: 'available' | 'reserved' | 'sold';
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceFilter {
  category?: string;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  sortBy?: 'latest' | 'popular' | 'price-low' | 'price-high';
}

interface MarketplaceState {
  products: Product[];
  myProducts: Product[];
  likedProducts: number[];
  filter: MarketplaceFilter;
  loading: boolean;
  error: string | null;

  // Actions
  loadProducts: () => Promise<void>;
  loadMyProducts: () => Promise<void>;
  loadProduct: (id: number) => Promise<Product | null>;
  createProduct: (data: Partial<Product>) => Promise<void>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  likeProduct: (id: number) => Promise<void>;
  unlikeProduct: (id: number) => Promise<void>;
  setFilter: (filter: MarketplaceFilter) => void;
  clearFilter: () => void;
  clearError: () => void;
}

// Mock 데이터
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: '타이틀리스트 TS3 드라이버 (거의 새것)',
    description: '10번 정도만 사용했습니다. 상태 매우 좋아요!',
    price: 350000,
    category: 'club',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400'],
    seller: { id: 1, name: '김골프', avatar: 'https://i.pravatar.cc/150?img=12', rating: 4.8, verified: true },
    location: '서울 강남구',
    status: 'available',
    views: 124,
    likes: 15,
    createdAt: '2026-01-24T10:00:00Z',
    updatedAt: '2026-01-24T10:00:00Z',
  },
  {
    id: 2,
    title: '나이키 골프화 270 (사이즈 270)',
    description: '3개월 사용. 깨끗합니다.',
    price: 80000,
    category: 'wear',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400'],
    seller: { id: 2, name: '이골퍼', avatar: 'https://i.pravatar.cc/150?img=25', rating: 4.5, verified: false },
    location: '경기 성남시',
    status: 'available',
    views: 89,
    likes: 8,
    createdAt: '2026-01-23T15:30:00Z',
    updatedAt: '2026-01-23T15:30:00Z',
  },
];

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  products: [],
  myProducts: [],
  likedProducts: [],
  filter: {},
  loading: false,
  error: null,

  // 전체 상품 불러오기
  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      // const response = await marketplaceAPI.getProducts(get().filter);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 필터 적용
      let filtered = [...MOCK_PRODUCTS];
      const { category, condition, priceMin, priceMax, sortBy } = get().filter;
      
      if (category) filtered = filtered.filter(p => p.category === category);
      if (condition) filtered = filtered.filter(p => p.condition === condition);
      if (priceMin) filtered = filtered.filter(p => p.price >= priceMin);
      if (priceMax) filtered = filtered.filter(p => p.price <= priceMax);
      
      // 정렬
      switch (sortBy) {
        case 'latest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
          filtered.sort((a, b) => b.views - a.views);
          break;
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
      }
      
      set({ products: filtered, loading: false });
    } catch (error: any) {
      set({ error: error.message || '상품 목록 불러오기 실패', loading: false });
    }
  },

  // 내 상품 불러오기
  loadMyProducts: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ myProducts: MOCK_PRODUCTS.filter(p => p.seller.id === 1), loading: false });
    } catch (error: any) {
      set({ error: error.message || '내 상품 불러오기 실패', loading: false });
    }
  },

  // 상품 상세 불러오기
  loadProduct: async (id: number) => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 300));
      const product = MOCK_PRODUCTS.find(p => p.id === id) || null;
      set({ loading: false });
      return product;
    } catch (error: any) {
      set({ error: error.message || '상품 불러오기 실패', loading: false });
      return null;
    }
  },

  // 상품 등록
  createProduct: async (data: Partial<Product>) => {
    set({ loading: true, error: null });
    try {
      // TODO: 실제 API 호출
      const newProduct: Product = {
        id: Date.now(),
        title: data.title || '',
        description: data.description || '',
        price: data.price || 0,
        category: data.category || 'etc',
        condition: data.condition || 'good',
        images: data.images || [],
        seller: { id: 1, name: '나', avatar: '', rating: 4.5, verified: false },
        location: data.location || '',
        status: 'available',
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({ 
        myProducts: [...get().myProducts, newProduct],
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message || '상품 등록 실패', loading: false });
    }
  },

  // 상품 수정
  updateProduct: async (id: number, data: Partial<Product>) => {
    try {
      // TODO: 실제 API 호출
      const myProducts = get().myProducts.map(p => 
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      );
      set({ myProducts });
    } catch (error: any) {
      set({ error: error.message || '상품 수정 실패' });
    }
  },

  // 상품 삭제
  deleteProduct: async (id: number) => {
    try {
      // TODO: 실제 API 호출
      const myProducts = get().myProducts.filter(p => p.id !== id);
      set({ myProducts });
    } catch (error: any) {
      set({ error: error.message || '상품 삭제 실패' });
    }
  },

  // 찜하기
  likeProduct: async (id: number) => {
    try {
      // TODO: 실제 API 호출
      set({ likedProducts: [...get().likedProducts, id] });
    } catch (error: any) {
      set({ error: error.message || '찜하기 실패' });
    }
  },

  // 찜 취소
  unlikeProduct: async (id: number) => {
    try {
      // TODO: 실제 API 호출
      const likedProducts = get().likedProducts.filter(pid => pid !== id);
      set({ likedProducts });
    } catch (error: any) {
      set({ error: error.message || '찜 취소 실패' });
    }
  },

  // 필터 설정
  setFilter: (filter: MarketplaceFilter) => {
    set({ filter: { ...get().filter, ...filter } });
  },

  // 필터 초기화
  clearFilter: () => {
    set({ filter: {} });
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));
