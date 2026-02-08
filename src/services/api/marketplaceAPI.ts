// 🛒 marketplaceAPI.ts
// 중고거래 API - Firebase Firestore 연동

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Product,
  ProductCategory,
  ProductCondition,
  ProductStatus,
} from '@/types/marketplace-types';

/**
 * Firestore 컬렉션
 */
const PRODUCTS_COLLECTION = 'products';
const PRODUCT_LIKES_COLLECTION = 'product_likes';
const USERS_COLLECTION = 'users';

/**
 * 가격 제안 인터페이스
 */
export interface PriceOffer {
  id: string;
  userId: string;
  userName: string;
  offerPrice: number;
  originalPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

/**
 * 상품 필터 옵션
 */
export interface ProductFilter {
  category?: ProductCategory;
  condition?: ProductCondition[];
  priceRange?: { min: number; max: number };
  location?: string;
  status?: ProductStatus;
}

/**
 * 상품 정렬 옵션
 */
export type ProductSortType = 'latest' | 'priceLow' | 'priceHigh' | 'popular';

/**
 * 중고거래 API
 */
export const marketplaceAPI = {
  /**
   * 상품 등록
   *
   * @param productData 상품 정보
   * @returns 생성된 상품
   */
  createProduct: async (productData: {
    title: string;
    description: string;
    price: number;
    category: ProductCategory;
    condition: ProductCondition;
    images: string[];
    location: string;
  }): Promise<Product> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 판매자 평점 조회
      let sellerRating = 0;
      try {
        const sellerDoc = await firestore().collection(USERS_COLLECTION).doc(currentUser.uid).get();
        if (sellerDoc.exists) {
          sellerRating = sellerDoc.data()?.rating || 0;
        }
      } catch {
        // 평점 조회 실패 시 0으로 유지
      }

      const now = new Date();
      const product = {
        ...productData,
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName || '익명',
        sellerImage: currentUser.photoURL || '',
        sellerRating,
        status: 'available' as ProductStatus,
        viewCount: 0,
        likeCount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore().collection(PRODUCTS_COLLECTION).add(product);

      const newProduct = {
        id: docRef.id,
        ...productData,
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName || '익명',
        sellerImage: currentUser.photoURL || '',
        sellerRating: 0,
        status: 'available',
        viewCount: 0,
        likeCount: 0,
        isLiked: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as any;

      return newProduct;
    } catch (error: any) {
      console.error('❌ 상품 등록 실패:', error);
      throw new Error(error.message || '상품 등록에 실패했습니다.');
    }
  },

  /**
   * 상품 목록 조회 (커서 기반 페이지네이션)
   *
   * @param filter 필터 옵션
   * @param sortBy 정렬 방식
   * @param limit 결과 개수
   * @param lastDoc 마지막 문서 (페이지네이션 커서)
   * @returns 상품 목록 + 마지막 문서 커서
   */
  getProducts: async (
    filter?: ProductFilter,
    sortBy: ProductSortType = 'latest',
    limit: number = 20,
    lastDoc?: any,
  ): Promise<Product[]> => {
    try {
      const currentUser = auth().currentUser;
      let query = firestore().collection(PRODUCTS_COLLECTION) as any;

      // 필터 적용
      if (filter) {
        if (filter.category) {
          query = query.where('category', '==', filter.category);
        }

        if (filter.status) {
          query = query.where('status', '==', filter.status);
        } else {
          // 기본: 판매중만 조회
          query = query.where('status', '==', 'available');
        }

        if (filter.location) {
          query = query.where('location', '==', filter.location);
        }

        if (filter.condition && filter.condition.length > 0) {
          query = query.where('condition', 'in', filter.condition);
        }
      } else {
        // 기본: 판매중만
        query = query.where('status', '==', 'available');
      }

      // 정렬 적용
      switch (sortBy) {
        case 'latest':
          query = query.orderBy('createdAt', 'desc');
          break;
        case 'priceLow':
          query = query.orderBy('price', 'asc');
          break;
        case 'priceHigh':
          query = query.orderBy('price', 'desc');
          break;
        case 'popular':
          query = query.orderBy('viewCount', 'desc');
          break;
      }

      // 커서 기반 페이지네이션
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      query = query.limit(limit);

      const snapshot = await query.get();
      let products: Product[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        isLiked: false, // 나중에 확인
      }));

      // 가격 필터 (클라이언트)
      if (filter?.priceRange) {
        products = products.filter(
          (p) => p.price >= filter.priceRange!.min && p.price <= filter.priceRange!.max,
        );
      }

      // 찜 여부 확인
      if (currentUser && products.length > 0) {
        const productIds = products.map((p) => p.id);
        const likesSnapshot = await firestore()
          .collection(PRODUCT_LIKES_COLLECTION)
          .where('userId', '==', currentUser.uid)
          .where('productId', 'in', productIds.slice(0, 10)) // 최대 10개
          .get();

        const likedProductIds = new Set(likesSnapshot.docs.map((doc) => doc.data().productId));

        products = products.map((p) => ({
          ...p,
          isLiked: likedProductIds.has(p.id),
        }));
      }

      return products;
    } catch (error: any) {
      console.error('❌ 상품 목록 조회 실패:', error);
      throw new Error(error.message || '상품 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 상품 상세 조회
   *
   * @param productId 상품 ID
   * @returns 상품 상세
   */
  getProductById: async (productId: string): Promise<Product | null> => {
    try {
      const currentUser = auth().currentUser;

      const doc = await firestore().collection(PRODUCTS_COLLECTION).doc(productId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      let isLiked = false;

      // 찜 여부 확인
      if (currentUser) {
        const likeSnapshot = await firestore()
          .collection(PRODUCT_LIKES_COLLECTION)
          .where('userId', '==', currentUser.uid)
          .where('productId', '==', productId)
          .get();

        isLiked = !likeSnapshot.empty;
      }

      const product: Product = {
        id: doc.id,
        ...data,
        isLiked,
        createdAt: data?.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      } as Product;

      return product;
    } catch (error: any) {
      console.error('❌ 상품 상세 조회 실패:', error);
      throw new Error(error.message || '상품 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 상품 수정
   *
   * @param productId 상품 ID
   * @param updates 수정할 데이터
   */
  updateProduct: async (
    productId: string,
    updates: Partial<{
      title: string;
      description: string;
      price: number;
      category: ProductCategory;
      condition: ProductCondition;
      images: string[];
      location: string;
    }>,
  ): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const doc = await firestore().collection(PRODUCTS_COLLECTION).doc(productId).get();

      if (!doc.exists) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const product = doc.data();
      if (product?.sellerId !== currentUser.uid) {
        throw new Error('상품을 수정할 권한이 없습니다.');
      }

      await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .update({
          ...updates,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      console.error('❌ 상품 수정 실패:', error);
      throw new Error(error.message || '상품 수정에 실패했습니다.');
    }
  },

  /**
   * 상품 삭제
   *
   * @param productId 상품 ID
   */
  deleteProduct: async (productId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const doc = await firestore().collection(PRODUCTS_COLLECTION).doc(productId).get();

      if (!doc.exists) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const product = doc.data();
      if (product?.sellerId !== currentUser.uid) {
        throw new Error('상품을 삭제할 권한이 없습니다.');
      }

      await firestore().collection(PRODUCTS_COLLECTION).doc(productId).delete();
    } catch (error: any) {
      console.error('❌ 상품 삭제 실패:', error);
      throw new Error(error.message || '상품 삭제에 실패했습니다.');
    }
  },

  /**
   * 내 판매 상품 목록
   *
   * @returns 내 상품 목록
   */
  getMyProducts: async (): Promise<Product[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const snapshot = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .where('sellerId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const products: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isLiked: false,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as Product[];

      return products;
    } catch (error: any) {
      console.error('❌ 내 상품 목록 조회 실패:', error);
      throw new Error(error.message || '내 상품 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 상품 찜하기
   *
   * @param productId 상품 ID
   */
  likeProduct: async (productId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 이미 찜했는지 확인
      const existingLike = await firestore()
        .collection(PRODUCT_LIKES_COLLECTION)
        .where('userId', '==', currentUser.uid)
        .where('productId', '==', productId)
        .get();

      if (!existingLike.empty) {
        return;
      }

      // Batch 업데이트
      const batch = firestore().batch();

      // 찜 추가
      const likeRef = firestore().collection(PRODUCT_LIKES_COLLECTION).doc();
      batch.set(likeRef, {
        userId: currentUser.uid,
        productId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 찜 개수 증가
      const productRef = firestore().collection(PRODUCTS_COLLECTION).doc(productId);
      batch.update(productRef, {
        likeCount: firestore.FieldValue.increment(1),
      });

      await batch.commit();
    } catch (error: any) {
      console.error('❌ 상품 찜하기 실패:', error);
      throw new Error(error.message || '상품 찜하기에 실패했습니다.');
    }
  },

  /**
   * 상품 찜 취소
   *
   * @param productId 상품 ID
   */
  unlikeProduct: async (productId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const likeSnapshot = await firestore()
        .collection(PRODUCT_LIKES_COLLECTION)
        .where('userId', '==', currentUser.uid)
        .where('productId', '==', productId)
        .get();

      if (likeSnapshot.empty) {
        return;
      }

      // Batch 업데이트
      const batch = firestore().batch();

      // 찜 삭제
      const likeRef = firestore().collection(PRODUCT_LIKES_COLLECTION).doc(likeSnapshot.docs[0].id);
      batch.delete(likeRef);

      // 찜 개수 감소
      const productRef = firestore().collection(PRODUCTS_COLLECTION).doc(productId);
      batch.update(productRef, {
        likeCount: firestore.FieldValue.increment(-1),
      });

      await batch.commit();
    } catch (error: any) {
      console.error('❌ 상품 찜 취소 실패:', error);
      throw new Error(error.message || '상품 찜 취소에 실패했습니다.');
    }
  },

  /**
   * 찜한 상품 목록
   *
   * @returns 찜한 상품 목록
   */
  getLikedProducts: async (): Promise<Product[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const likesSnapshot = await firestore()
        .collection(PRODUCT_LIKES_COLLECTION)
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

      if (likesSnapshot.empty) {
        return [];
      }

      const productIds = likesSnapshot.docs.map((doc) => doc.data().productId);
      const products: Product[] = [];

      // 최대 10개씩 조회
      const chunks = [];
      for (let i = 0; i < productIds.length; i += 10) {
        chunks.push(productIds.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        const productsSnapshot = await firestore()
          .collection(PRODUCTS_COLLECTION)
          .where(firestore.FieldPath.documentId(), 'in', chunk)
          .get();

        productsSnapshot.docs.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data(),
            isLiked: true,
            createdAt:
              doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            updatedAt:
              doc.data().updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          } as Product);
        });
      }

      return products;
    } catch (error: any) {
      console.error('❌ 찜한 상품 목록 조회 실패:', error);
      throw new Error(error.message || '찜한 상품 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 조회수 증가
   *
   * @param productId 상품 ID
   */
  increaseViewCount: async (productId: string): Promise<void> => {
    try {
      await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .update({
          viewCount: firestore.FieldValue.increment(1),
        });
    } catch (error: any) {
      console.error('❌ 조회수 증가 실패:', error);
      // 조회수는 실패해도 무시
    }
  },

  /**
   * 가격 제안 목록 조회 (판매자용)
   *
   * @param productId 상품 ID
   * @returns 가격 제안 목록
   */
  getOffers: async (productId: string): Promise<PriceOffer[]> => {
    try {
      const snapshot = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .collection('offers')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as PriceOffer[];
    } catch (error: any) {
      console.error('가격 제안 조회 실패:', error);
      throw new Error(error.message || '가격 제안 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 가격 제안 수락
   *
   * @param productId 상품 ID
   * @param offerId 제안 ID
   */
  acceptOffer: async (productId: string, offerId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('로그인이 필요합니다.');

      // 판매자 검증
      const productDoc = await firestore().collection(PRODUCTS_COLLECTION).doc(productId).get();
      if (productDoc.data()?.sellerId !== currentUser.uid) {
        throw new Error('판매자만 제안을 수락할 수 있습니다.');
      }

      const batch = firestore().batch();

      // 해당 제안 수락
      const offerRef = firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .collection('offers')
        .doc(offerId);
      batch.update(offerRef, { status: 'ACCEPTED', updatedAt: firestore.FieldValue.serverTimestamp() });

      // 다른 PENDING 제안들 자동 거절
      const pendingOffers = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .collection('offers')
        .where('status', '==', 'PENDING')
        .get();

      pendingOffers.docs.forEach((doc) => {
        if (doc.id !== offerId) {
          batch.update(doc.ref, { status: 'REJECTED', updatedAt: firestore.FieldValue.serverTimestamp() });
        }
      });

      // 상품 상태를 예약중으로 변경
      batch.update(firestore().collection(PRODUCTS_COLLECTION).doc(productId), {
        status: 'reserved' as ProductStatus,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
    } catch (error: any) {
      console.error('가격 제안 수락 실패:', error);
      throw new Error(error.message || '가격 제안 수락에 실패했습니다.');
    }
  },

  /**
   * 가격 제안 거절
   *
   * @param productId 상품 ID
   * @param offerId 제안 ID
   */
  rejectOffer: async (productId: string, offerId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('로그인이 필요합니다.');

      const productDoc = await firestore().collection(PRODUCTS_COLLECTION).doc(productId).get();
      if (productDoc.data()?.sellerId !== currentUser.uid) {
        throw new Error('판매자만 제안을 거절할 수 있습니다.');
      }

      await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .collection('offers')
        .doc(offerId)
        .update({ status: 'REJECTED', updatedAt: firestore.FieldValue.serverTimestamp() });
    } catch (error: any) {
      console.error('가격 제안 거절 실패:', error);
      throw new Error(error.message || '가격 제안 거절에 실패했습니다.');
    }
  },

  /**
   * 내 상품에 대한 전체 제안 조회 (판매자 대시보드)
   *
   * @returns 내 상품별 제안 목록
   */
  getMyProductOffers: async (): Promise<{ product: Product; offers: PriceOffer[] }[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('로그인이 필요합니다.');

      const products = await marketplaceAPI.getMyProducts();
      const results: { product: Product; offers: PriceOffer[] }[] = [];

      for (const product of products) {
        const offers = await marketplaceAPI.getOffers(product.id);
        const pendingOffers = offers.filter((o) => o.status === 'PENDING');
        if (pendingOffers.length > 0) {
          results.push({ product, offers: pendingOffers });
        }
      }

      return results;
    } catch (error: any) {
      console.error('내 상품 제안 조회 실패:', error);
      throw new Error(error.message || '제안 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 상품 상태 변경 (예약중/판매완료)
   *
   * @param productId 상품 ID
   * @param status 변경할 상태
   */
  updateProductStatus: async (productId: string, status: ProductStatus): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const doc = await firestore().collection(PRODUCTS_COLLECTION).doc(productId).get();

      if (!doc.exists) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const product = doc.data();
      if (product?.sellerId !== currentUser.uid) {
        throw new Error('상품 상태를 변경할 권한이 없습니다.');
      }

      await firestore().collection(PRODUCTS_COLLECTION).doc(productId).update({
        status,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      console.error('❌ 상품 상태 변경 실패:', error);
      throw new Error(error.message || '상품 상태 변경에 실패했습니다.');
    }
  },
};
