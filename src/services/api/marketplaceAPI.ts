// 🛒 marketplaceAPI.ts
// 중고거래 API - Firebase Firestore 연동

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Product,
  ProductCategory,
  ProductCondition,
  ProductStatus,
} from '../../types/marketplace-types';

/**
 * Firestore 컬렉션
 */
const PRODUCTS_COLLECTION = 'products';
const PRODUCT_LIKES_COLLECTION = 'product_likes';
const USERS_COLLECTION = 'users';

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

      const now = new Date();
      const product = {
        ...productData,
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName || '익명',
        sellerImage: currentUser.photoURL || '',
        sellerRating: 0, // TODO: 실제 평점
        status: 'available' as ProductStatus,
        viewCount: 0,
        likeCount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .add(product);

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

      console.log('✅ 상품 등록 성공:', docRef.id);
      return newProduct;
    } catch (error: any) {
      console.error('❌ 상품 등록 실패:', error);
      throw new Error(error.message || '상품 등록에 실패했습니다.');
    }
  },

  /**
   * 상품 목록 조회
   * 
   * @param filter 필터 옵션
   * @param sortBy 정렬 방식
   * @param limit 결과 개수
   * @returns 상품 목록
   */
  getProducts: async (
    filter?: ProductFilter,
    sortBy: ProductSortType = 'latest',
    limit: number = 20
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
          p => p.price >= filter.priceRange!.min && p.price <= filter.priceRange!.max
        );
      }

      // 찜 여부 확인
      if (currentUser && products.length > 0) {
        const productIds = products.map(p => p.id);
        const likesSnapshot = await firestore()
          .collection(PRODUCT_LIKES_COLLECTION)
          .where('userId', '==', currentUser.uid)
          .where('productId', 'in', productIds.slice(0, 10)) // 최대 10개
          .get();

        const likedProductIds = new Set(
          likesSnapshot.docs.map(doc => doc.data().productId)
        );

        products = products.map(p => ({
          ...p,
          isLiked: likedProductIds.has(p.id),
        }));
      }

      console.log(`✅ 상품 목록 조회 성공: ${products.length}개`);
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
      
      const doc = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .get();

      if (!doc.exists) {
        console.log('ℹ️ 상품을 찾을 수 없습니다:', productId);
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

      console.log('✅ 상품 상세 조회 성공:', productId);
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
    }>
  ): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const doc = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .get();

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

      console.log('✅ 상품 수정 성공:', productId);
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

      const doc = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .get();

      if (!doc.exists) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const product = doc.data();
      if (product?.sellerId !== currentUser.uid) {
        throw new Error('상품을 삭제할 권한이 없습니다.');
      }

      await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .delete();

      console.log('✅ 상품 삭제 성공:', productId);
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

      const products: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isLiked: false,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      })) as Product[];

      console.log(`✅ 내 상품 목록 조회 성공: ${products.length}개`);
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
        console.log('ℹ️ 이미 찜한 상품입니다');
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
      console.log('✅ 상품 찜하기 성공:', productId);
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
        console.log('ℹ️ 찜하지 않은 상품입니다');
        return;
      }

      // Batch 업데이트
      const batch = firestore().batch();

      // 찜 삭제
      const likeRef = firestore()
        .collection(PRODUCT_LIKES_COLLECTION)
        .doc(likeSnapshot.docs[0].id);
      batch.delete(likeRef);

      // 찜 개수 감소
      const productRef = firestore().collection(PRODUCTS_COLLECTION).doc(productId);
      batch.update(productRef, {
        likeCount: firestore.FieldValue.increment(-1),
      });

      await batch.commit();
      console.log('✅ 상품 찜 취소 성공:', productId);
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
        console.log('ℹ️ 찜한 상품이 없습니다');
        return [];
      }

      const productIds = likesSnapshot.docs.map(doc => doc.data().productId);
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

        productsSnapshot.docs.forEach(doc => {
          products.push({
            id: doc.id,
            ...doc.data(),
            isLiked: true,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          } as Product);
        });
      }

      console.log(`✅ 찜한 상품 목록 조회 성공: ${products.length}개`);
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

      console.log('✅ 조회수 증가 성공:', productId);
    } catch (error: any) {
      console.error('❌ 조회수 증가 실패:', error);
      // 조회수는 실패해도 무시
    }
  },

  /**
   * 상품 상태 변경 (예약중/판매완료)
   * 
   * @param productId 상품 ID
   * @param status 변경할 상태
   */
  updateProductStatus: async (
    productId: string,
    status: ProductStatus
  ): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const doc = await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .get();

      if (!doc.exists) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const product = doc.data();
      if (product?.sellerId !== currentUser.uid) {
        throw new Error('상품 상태를 변경할 권한이 없습니다.');
      }

      await firestore()
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .update({
          status,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ 상품 상태 변경 성공:', productId, status);
    } catch (error: any) {
      console.error('❌ 상품 상태 변경 실패:', error);
      throw new Error(error.message || '상품 상태 변경에 실패했습니다.');
    }
  },
};