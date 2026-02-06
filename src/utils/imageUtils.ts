// 📷 이미지 선택 및 업로드 유틸리티
// expo-image-picker 또는 react-native-image-picker 사용

import { Alert, Platform } from 'react-native';
import storage from '@react-native-firebase/storage';
import { requestCameraPermission, requestStoragePermission } from './devicePermissions';

// expo-image-picker 타입 (설치 후 사용)
interface ImagePickerResult {
  canceled: boolean;
  assets?: Array<{
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
  }>;
}

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
  options?: ImagePickerOptions
): Promise<string | null> => {
  try {
    // 권한 확인
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return null;
    }

    // expo-image-picker 동적 import
    let ImagePicker;
    try {
      ImagePicker = require('expo-image-picker');
    } catch (e) {
      Alert.alert(
        '기능 사용 불가',
        '이미지 선택을 위해 expo-image-picker 설치가 필요합니다.\n\nnpx expo install expo-image-picker'
      );
      console.error('expo-image-picker가 설치되지 않았습니다.');
      return null;
    }

    const result: ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
export const pickMultipleImages = async (
  options?: ImagePickerOptions
): Promise<string[]> => {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return [];
    }

    let ImagePicker;
    try {
      ImagePicker = require('expo-image-picker');
    } catch (e) {
      Alert.alert(
        '기능 사용 불가',
        '이미지 선택을 위해 expo-image-picker 설치가 필요합니다.\n\nnpx expo install expo-image-picker'
      );
      return [];
    }

    const result: ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
export const takePhoto = async (
  options?: ImagePickerOptions
): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return null;
    }

    let ImagePicker;
    try {
      ImagePicker = require('expo-image-picker');
    } catch (e) {
      Alert.alert(
        '기능 사용 불가',
        '카메라 사용을 위해 expo-image-picker 설치가 필요합니다.\n\nnpx expo install expo-image-picker'
      );
      return null;
    }

    const result: ImagePickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
export const showImagePickerOptions = (): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      '이미지 추가',
      '이미지를 가져올 방법을 선택하세요',
      [
        {
          text: '카메라',
          onPress: async () => {
            const uri = await takePhoto();
            resolve(uri);
          },
        },
        {
          text: '갤러리',
          onPress: async () => {
            const uri = await pickImageFromGallery();
            resolve(uri);
          },
        },
        {
          text: '취소',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Firebase Storage에 이미지 업로드
 */
export const uploadImageToStorage = async (
  imageUri: string,
  storagePath: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // 파일 이름 생성
    const filename = `${storagePath}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const reference = storage().ref(filename);

    // 업로드 태스크 생성
    const task = reference.putFile(imageUri);

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
    const downloadURL = await reference.getDownloadURL();
    console.log('✅ 이미지 업로드 완료:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ 이미지 업로드 실패:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
};

/**
 * 여러 이미지 Firebase Storage에 업로드
 */
export const uploadMultipleImages = async (
  imageUris: string[],
  storagePath: string,
  onProgress?: (currentIndex: number, totalCount: number) => void
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
    const reference = storage().refFromURL(imageUrl);
    await reference.delete();
    console.log('✅ 이미지 삭제 완료');
  } catch (error) {
    console.error('❌ 이미지 삭제 실패:', error);
    // 이미지가 이미 삭제된 경우 무시
  }
};
