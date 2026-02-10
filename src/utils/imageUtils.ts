// 이미지 선택 및 업로드 유틸리티

import { Alert, Linking } from 'react-native';
import {
  storage,
  storageRefFn,
  getDownloadURL,
  deleteObject,
} from '@/services/firebase/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

/**
 * 이미지 선택 옵션
 */
export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  multiple?: boolean;
  selectionLimit?: number;
}

/**
 * 갤러리에서 이미지 선택
 */
export const pickImageFromGallery = async (
  options?: ImagePickerOptions,
): Promise<string | null> => {
  try {
    // expo 내장 권한 API 사용
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('갤러리 권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => Linking.openSettings() },
      ]);
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('이미지 선택 실패:', error);
    Alert.alert('오류', '이미지를 선택하는데 실패했습니다.');
    return null;
  }
};

/**
 * 갤러리에서 여러 이미지 선택
 */
export const pickMultipleImages = async (options?: ImagePickerOptions): Promise<string[]> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('갤러리 권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => Linking.openSettings() },
      ]);
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: options?.selectionLimit ?? 10,
      quality: options?.quality ?? 0.8,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map((asset) => asset.uri);
  } catch (error) {
    console.error('이미지 선택 실패:', error);
    Alert.alert('오류', '이미지를 선택하는데 실패했습니다.');
    return [];
  }
};

/**
 * 카메라로 사진 촬영
 */
export const takePhoto = async (options?: ImagePickerOptions): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('카메라 권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => Linking.openSettings() },
      ]);
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('사진 촬영 실패:', error);
    Alert.alert('오류', '사진을 촬영하는데 실패했습니다.');
    return null;
  }
};

/**
 * 이미지 선택 방법 선택 (갤러리/카메라)
 */
export const showImagePickerOptions = (options?: ImagePickerOptions): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      '이미지 추가',
      '이미지를 가져올 방법을 선택하세요',
      [
        {
          text: '카메라',
          onPress: async () => {
            const uri = await takePhoto(options);
            resolve(uri);
          },
        },
        {
          text: '갤러리',
          onPress: async () => {
            const uri = await pickImageFromGallery(options);
            resolve(uri);
          },
        },
        {
          text: '취소',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
};

/**
 * 이미지 압축 및 리사이징
 * expo-image-manipulator를 사용하여 업로드 전 이미지 최적화
 *
 * @param uri 원본 이미지 URI
 * @param maxWidth 최대 너비 (기본: 1200)
 * @param quality 압축 품질 0-1 (기본: 0.7)
 * @returns 최적화된 이미지 URI
 */
export const compressImage = async (
  uri: string,
  maxWidth: number = 1200,
  quality: number = 0.7,
): Promise<string> => {
  try {
    let ImageManipulator;
    try {
      ImageManipulator = require('expo-image-manipulator');
    } catch {
      // expo-image-manipulator 미설치 시 원본 반환
      return uri;
    }

    const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: maxWidth } }], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return result.uri;
  } catch {
    // 압축 실패 시 원본 반환
    return uri;
  }
};

/**
 * 썸네일 생성
 *
 * @param uri 원본 이미지 URI
 * @param size 썸네일 크기 (기본: 200)
 * @returns 썸네일 URI
 */
export const createThumbnail = async (uri: string, size: number = 200): Promise<string> => {
  return compressImage(uri, size, 0.6);
};

/**
 * Firebase Storage에 이미지 업로드 (압축 포함)
 */
export const uploadImageToStorage = async (
  imageUri: string,
  storagePath: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  try {
    // 업로드 전 이미지 압축
    const compressedUri = await compressImage(imageUri);

    // 파일 이름 생성
    const filename = `${storagePath}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const reference = storageRefFn(storage, filename);

    // 업로드 태스크 생성
    const task = reference.putFile(compressedUri);

    // 진행률 콜백
    if (onProgress) {
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      });
    }

    // 업로드 완료 대기
    await task;

    // 다운로드 URL 반환
    const downloadURL = await getDownloadURL(reference);
    return downloadURL;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
};

/**
 * 여러 이미지 Firebase Storage에 업로드
 */
export const uploadMultipleImages = async (
  imageUris: string[],
  storagePath: string,
  onProgress?: (currentIndex: number, totalCount: number) => void,
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    if (onProgress) {
      onProgress(i + 1, imageUris.length);
    }

    const url = await uploadImageToStorage(imageUris[i], storagePath);
    uploadedUrls.push(url);
  }

  return uploadedUrls;
};

/**
 * Firebase Storage에서 이미지 삭제
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    // URL에서 Storage 경로 추출
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
    if (!pathMatch || !pathMatch[1]) {
      console.error('이미지 삭제 실패: URL에서 경로를 추출할 수 없습니다.');
      return;
    }
    const storagePath = pathMatch[1];
    const reference = storageRefFn(storage, storagePath);
    await deleteObject(reference);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    // 이미지가 이미 삭제된 경우 무시
  }
};
