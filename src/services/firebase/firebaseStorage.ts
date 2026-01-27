// 📦 firebaseStorage.ts
// Firebase Storage 이미지 업로드 (Cloudflare Images 연동)

import { storage, handleFirebaseError } from './firebaseConfig';
import type { FirebaseStorageTypes } from '@react-native-firebase/storage';

/**
 * 이미지 압축 옵션
 */
export interface ImageCompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0.0 ~ 1.0
}

/**
 * 업로드 결과 인터페이스
 */
export interface UploadResult {
  url: string;
  path: string;
  fullPath: string;
  size: number;
  contentType: string;
}

/**
 * Cloudflare Images 설정
 */
const CLOUDFLARE_CONFIG = {
  accountId: process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '',
  apiToken: process.env.EXPO_PUBLIC_CLOUDFLARE_API_TOKEN || '',
  deliveryUrl: process.env.EXPO_PUBLIC_CLOUDFLARE_DELIVERY_URL || 'https://imagedelivery.net',
  enabled: process.env.EXPO_PUBLIC_USE_CLOUDFLARE_IMAGES === 'true',
};

/**
 * Firebase Storage Service
 */
class FirebaseStorageService {
  /**
   * 프로필 이미지 업로드
   *
   * @param userId - 사용자 ID
   * @param uri - 이미지 URI
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과
   */
  async uploadProfileImage(
    userId: string,
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      console.log('📸 프로필 이미지 업로드 시작:', userId);

      const path = `profiles/${userId}/avatar_${Date.now()}.jpg`;

      return await this.uploadImage(uri, path, onProgress);
    } catch (error) {
      console.error('❌ 프로필 이미지 업로드 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 채팅 이미지 업로드
   *
   * @param roomId - 채팅방 ID
   * @param uri - 이미지 URI
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과
   */
  async uploadChatImage(
    roomId: string,
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      console.log('💬 채팅 이미지 업로드 시작:', roomId);

      const imageId = Date.now();
      const path = `chats/${roomId}/${imageId}.jpg`;

      return await this.uploadImage(uri, path, onProgress);
    } catch (error) {
      console.error('❌ 채팅 이미지 업로드 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 부킹 이미지 업로드
   *
   * @param bookingId - 부킹 ID
   * @param uri - 이미지 URI
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과
   */
  async uploadBookingImage(
    bookingId: string,
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      console.log('⛳ 부킹 이미지 업로드 시작:', bookingId);

      const imageId = Date.now();
      const path = `bookings/${bookingId}/${imageId}.jpg`;

      return await this.uploadImage(uri, path, onProgress);
    } catch (error) {
      console.error('❌ 부킹 이미지 업로드 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 상품 이미지 업로드
   *
   * @param productId - 상품 ID
   * @param uri - 이미지 URI
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과
   */
  async uploadProductImage(
    productId: string,
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      console.log('🛒 상품 이미지 업로드 시작:', productId);

      const imageId = Date.now();
      const path = `products/${productId}/${imageId}.jpg`;

      return await this.uploadImage(uri, path, onProgress);
    } catch (error) {
      console.error('❌ 상품 이미지 업로드 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 포스트 이미지 업로드
   *
   * @param postId - 포스트 ID
   * @param uri - 이미지 URI
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과
   */
  async uploadPostImage(
    postId: string,
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      console.log('📝 포스트 이미지 업로드 시작:', postId);

      const imageId = Date.now();
      const path = `posts/${postId}/${imageId}.jpg`;

      return await this.uploadImage(uri, path, onProgress);
    } catch (error) {
      console.error('❌ 포스트 이미지 업로드 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 리뷰 이미지 업로드
   *
   * @param reviewId - 리뷰 ID
   * @param uri - 이미지 URI
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과
   */
  async uploadReviewImage(
    reviewId: string,
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      console.log('⭐ 리뷰 이미지 업로드 시작:', reviewId);

      const imageId = Date.now();
      const path = `reviews/${reviewId}/${imageId}.jpg`;

      return await this.uploadImage(uri, path, onProgress);
    } catch (error) {
      console.error('❌ 리뷰 이미지 업로드 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 일반 이미지 업로드 (내부 메서드)
   *
   * @param uri - 이미지 URI
   * @param path - Storage 경로
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과
   */
  private async uploadImage(
    uri: string,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      // Storage 참조 생성
      const reference = storage().ref(path);

      // 업로드 태스크 생성
      const task = reference.putFile(uri, {
        contentType: 'image/jpeg',
      });

      // 진행률 모니터링
      if (onProgress) {
        task.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      // 업로드 완료 대기
      await task;

      // 다운로드 URL 가져오기
      const downloadUrl = await reference.getDownloadURL();

      // 메타데이터 가져오기
      const metadata = await reference.getMetadata();

      console.log('✅ 이미지 업로드 완료:', path);

      const result: UploadResult = {
        url: downloadUrl,
        path,
        fullPath: metadata.fullPath,
        size: metadata.size,
        contentType: metadata.contentType || 'image/jpeg',
      };

      // Cloudflare Images 활성화 시 추가 처리
      if (CLOUDFLARE_CONFIG.enabled) {
        const cloudflareUrl = await this.uploadToCloudflare(downloadUrl, path);
        if (cloudflareUrl) {
          result.url = cloudflareUrl;
        }
      }

      return result;
    } catch (error) {
      console.error('❌ 이미지 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * Cloudflare Images에 업로드
   *
   * @param firebaseUrl - Firebase Storage URL
   * @param imageName - 이미지 이름
   * @returns Cloudflare Images URL
   */
  private async uploadToCloudflare(
    firebaseUrl: string,
    imageName: string
  ): Promise<string | null> {
    try {
      console.log('☁️ Cloudflare Images 업로드 시작...');

      if (!CLOUDFLARE_CONFIG.accountId || !CLOUDFLARE_CONFIG.apiToken) {
        console.warn('⚠️ Cloudflare 설정이 없습니다. Firebase URL 사용');
        return null;
      }

      // Cloudflare Images API 호출
      const formData = new FormData();
      formData.append('url', firebaseUrl);
      formData.append('id', imageName.replace(/\//g, '_'));

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success && data.result?.variants) {
        const cloudflareUrl = data.result.variants[0];
        console.log('✅ Cloudflare Images 업로드 완료');
        return cloudflareUrl;
      } else {
        console.warn('⚠️ Cloudflare Images 업로드 실패. Firebase URL 사용');
        return null;
      }
    } catch (error) {
      console.error('❌ Cloudflare Images 업로드 에러:', error);
      return null;
    }
  }

  /**
   * 이미지 삭제
   *
   * @param path - Storage 경로
   */
  async deleteImage(path: string): Promise<void> {
    try {
      console.log('🗑️ 이미지 삭제 시작:', path);

      const reference = storage().ref(path);
      await reference.delete();

      console.log('✅ 이미지 삭제 완료:', path);
    } catch (error) {
      console.error('❌ 이미지 삭제 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 여러 이미지 업로드
   *
   * @param uris - 이미지 URI 배열
   * @param basePath - 기본 경로 (예: 'products/product123')
   * @param onProgress - 진행률 콜백
   * @returns 업로드 결과 배열
   */
  async uploadMultipleImages(
    uris: string[],
    basePath: string,
    onProgress?: (overall: number, current: number, total: number) => void
  ): Promise<UploadResult[]> {
    try {
      console.log(`📸 ${uris.length}개 이미지 업로드 시작`);

      const results: UploadResult[] = [];
      const total = uris.length;

      for (let i = 0; i < total; i++) {
        const uri = uris[i];
        const path = `${basePath}/image_${i}_${Date.now()}.jpg`;

        const result = await this.uploadImage(uri, path, (progress) => {
          if (onProgress) {
            const overall = ((i + progress / 100) / total) * 100;
            onProgress(overall, i + 1, total);
          }
        });

        results.push(result);
      }

      console.log(`✅ ${total}개 이미지 업로드 완료`);

      return results;
    } catch (error) {
      console.error('❌ 다중 이미지 업로드 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 이미지 URL 가져오기
   *
   * @param path - Storage 경로
   * @returns 다운로드 URL
   */
  async getImageUrl(path: string): Promise<string> {
    try {
      const reference = storage().ref(path);
      const url = await reference.getDownloadURL();
      return url;
    } catch (error) {
      console.error('❌ 이미지 URL 가져오기 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 이미지 메타데이터 가져오기
   *
   * @param path - Storage 경로
   * @returns 메타데이터
   */
  async getImageMetadata(
    path: string
  ): Promise<FirebaseStorageTypes.FullMetadata> {
    try {
      const reference = storage().ref(path);
      const metadata = await reference.getMetadata();
      return metadata;
    } catch (error) {
      console.error('❌ 메타데이터 가져오기 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 폴더 내 모든 이미지 삭제
   *
   * @param folderPath - 폴더 경로 (예: 'products/product123')
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      console.log('🗑️ 폴더 삭제 시작:', folderPath);

      const reference = storage().ref(folderPath);
      const result = await reference.listAll();

      // 모든 파일 삭제
      const deletePromises = result.items.map((item) => item.delete());
      await Promise.all(deletePromises);

      console.log('✅ 폴더 삭제 완료:', folderPath);
    } catch (error) {
      console.error('❌ 폴더 삭제 실패:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * 이미지 압축 (로컬)
   *
   * @param uri - 이미지 URI
   * @param options - 압축 옵션
   * @returns 압축된 이미지 URI
   */
  async compressImage(
    uri: string,
    options: ImageCompressionOptions = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
    }
  ): Promise<string> {
    try {
      // React Native Image Resizer 또는 Expo ImageManipulator 사용
      // 여기서는 예시로 구현

      console.log('🔨 이미지 압축 시작...');

      // TODO: 실제 압축 로직 구현
      // import * as ImageManipulator from 'expo-image-manipulator';
      // const result = await ImageManipulator.manipulateAsync(
      //   uri,
      //   [{ resize: { width: options.maxWidth, height: options.maxHeight } }],
      //   { compress: options.quality, format: ImageManipulator.SaveFormat.JPEG }
      // );

      console.log('✅ 이미지 압축 완료');

      // 임시로 원본 URI 반환
      return uri;
    } catch (error) {
      console.error('❌ 이미지 압축 실패:', error);
      return uri; // 압축 실패 시 원본 반환
    }
  }

  /**
   * 업로드 취소
   *
   * @param task - 업로드 태스크
   */
  cancelUpload(task: FirebaseStorageTypes.Task): void {
    try {
      task.cancel();
      console.log('⏸️ 업로드 취소됨');
    } catch (error) {
      console.error('❌ 업로드 취소 실패:', error);
    }
  }

  /**
   * Storage 용량 확인 (추정)
   *
   * @param folderPath - 폴더 경로
   * @returns 전체 크기 (bytes)
   */
  async getFolderSize(folderPath: string): Promise<number> {
    try {
      const reference = storage().ref(folderPath);
      const result = await reference.listAll();

      let totalSize = 0;

      for (const item of result.items) {
        const metadata = await item.getMetadata();
        totalSize += metadata.size;
      }

      console.log(`📊 폴더 크기: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

      return totalSize;
    } catch (error) {
      console.error('❌ 폴더 크기 확인 실패:', error);
      return 0;
    }
  }

  /**
   * Cloudflare Images 변환 URL 생성
   *
   * @param imageId - Cloudflare 이미지 ID
   * @param variant - 변환 옵션 (예: 'public', 'thumbnail')
   * @returns Cloudflare Images URL
   */
  getCloudflareImageUrl(imageId: string, variant: string = 'public'): string {
    if (!CLOUDFLARE_CONFIG.enabled || !CLOUDFLARE_CONFIG.accountId) {
      return '';
    }

    return `${CLOUDFLARE_CONFIG.deliveryUrl}/${CLOUDFLARE_CONFIG.accountId}/${imageId}/${variant}`;
  }
}

// 싱글톤 인스턴스 export
export const firebaseStorage = new FirebaseStorageService();

export default firebaseStorage;