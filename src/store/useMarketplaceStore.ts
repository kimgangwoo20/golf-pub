import { create } from 'zustand';
import { firebaseFirestore } from '../config/firebase';

export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  category: 'DRIVER' | 'IRON' | 'PUTTER' | 'CLOTHES' | 'ETC';
  condition: 'NEW' | 'LIKE_NEW' | 'USED';
  images: string[];
  location: string;
  status: 'FOR_SALE' | 'RESERVED' | 'SOLD';
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MarketplaceState {
  items: MarketItem[];
  loading: boolean;
  error: string | null;

  loadItems: () => Promise<void>;
  loadMyItems: (userId: string) => Promise<void>;
  createItem: (item: Omit<MarketItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, data: Partial<MarketItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async () => {
    try {
      set({ loading: true, error: null });
      
      const snapshot = await firebaseFirestore
        .collection('marketplace')
        .where('status', '==', 'FOR_SALE')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as MarketItem[];

      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadMyItems: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const snapshot = await firebaseFirestore
        .collection('marketplace')
        .where('sellerId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as MarketItem[];

      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createItem: async (item) => {
    try {
      set({ loading: true, error: null });
      
      const now = new Date();
      await firebaseFirestore.collection('marketplace').add({
        ...item,
        createdAt: now,
        updatedAt: now,
      });

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateItem: async (id, data) => {
    try {
      await firebaseFirestore.collection('marketplace').doc(id).update({
        ...data,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      await firebaseFirestore.collection('marketplace').doc(id).delete();
    } catch (error: any) {
      throw error;
    }
  },
}));
