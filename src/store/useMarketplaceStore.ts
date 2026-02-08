import { create } from 'zustand';
import { firestore as firebaseFirestore } from '@/services/firebase/firebaseConfig';
import { Product } from '@/types/marketplace-types';

interface MarketplaceState {
  items: Product[];
  loading: boolean;
  error: string | null;

  loadItems: () => Promise<void>;
  loadMyItems: (userId: string) => Promise<void>;
  createItem: (item: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, data: Partial<Product>) => Promise<void>;
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
        .collection('products')
        .where('status', '==', 'available')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[];

      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message || '상품을 불러올 수 없습니다', loading: false });
    }
  },

  loadMyItems: async (userId) => {
    try {
      set({ loading: true, error: null });

      const snapshot = await firebaseFirestore
        .collection('products')
        .where('sellerId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[];

      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message || '상품을 불러올 수 없습니다', loading: false });
    }
  },

  createItem: async (item) => {
    try {
      set({ loading: true, error: null });

      const now = new Date();
      await firebaseFirestore.collection('products').add({
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
      await firebaseFirestore
        .collection('products')
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        });
    } catch (error: any) {
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      await firebaseFirestore.collection('products').doc(id).delete();
    } catch (error: any) {
      throw error;
    }
  },
}));
