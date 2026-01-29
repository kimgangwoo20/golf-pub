// 🔐 PERMISSIONS 상수 정의
// Golf Pub 앱에서 사용하는 모든 권한 정의

export const PERMISSIONS = {
  // 위치 권한 - 골프장 검색, 날씨 정보
  LOCATION: {
    name: 'location',
    android: 'android.permission.ACCESS_FINE_LOCATION',
    ios: 'NSLocationWhenInUseUsageDescription',
    title: '위치 권한 요청',
    message: '주변 골프장과 날씨 정보를 제공하기 위해 위치 권한이 필요합니다.',
    required: false,
    features: ['골프장 검색', '날씨 정보', '근처 친구 추천'],
  },

  // 카메라 권한 - 프로필 사진, 상품 사진, QR 코드
  CAMERA: {
    name: 'camera',
    android: 'android.permission.CAMERA',
    ios: 'NSCameraUsageDescription',
    title: '카메라 권한 요청',
    message: '사진 촬영 및 QR 코드 스캔을 위해 카메라 권한이 필요합니다.',
    required: false,
    features: ['프로필 사진 촬영', '상품 사진 촬영', 'QR 코드 스캔'],
  },

  // 갤러리 권한 - 이미지 선택
  PHOTO_LIBRARY: {
    name: 'photoLibrary',
    android: 'android.permission.READ_EXTERNAL_STORAGE',
    androidNew: 'android.permission.READ_MEDIA_IMAGES', // Android 13+
    ios: 'NSPhotoLibraryUsageDescription',
    title: '갤러리 권한 요청',
    message: '사진을 선택하기 위해 갤러리 접근 권한이 필요합니다.',
    required: false,
    features: ['프로필 사진 선택', '상품 사진 선택'],
  },

  // 알림 권한 - 푸시 알림
  NOTIFICATIONS: {
    name: 'notifications',
    android: 'android.permission.POST_NOTIFICATIONS', // Android 13+
    ios: 'NotificationCenter',
    title: '알림 권한 요청',
    message: '예약 알림, 채팅 메시지 등을 받기 위해 알림 권한이 필요합니다.',
    required: false,
    features: ['예약 알림', '채팅 메시지', '친구 요청', '출석 알림'],
  },
} as const;

export type PermissionType = keyof typeof PERMISSIONS;

// 권한 상태
export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  NEVER_ASK_AGAIN = 'never_ask_again',
  UNAVAILABLE = 'unavailable',
}

// 기능별 필요한 권한 매핑
export const FEATURE_PERMISSIONS = {
  // 프로필 사진 변경
  PROFILE_PHOTO: ['CAMERA', 'PHOTO_LIBRARY'],
  
  // 상품 등록
  PRODUCT_UPLOAD: ['CAMERA', 'PHOTO_LIBRARY'],
  
  // QR 코드 친구 추가
  QR_SCAN: ['CAMERA'],
  
  // 골프장 검색
  GOLF_SEARCH: ['LOCATION'],
  
  // 날씨 정보
  WEATHER: ['LOCATION'],
  
  // 알림
  PUSH_NOTIFICATION: ['NOTIFICATIONS'],
} as const;
