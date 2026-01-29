// 🔐 디바이스 런타임 권한 요청 유틸리티
// Golf Pub 앱에서 사용하는 런타임 권한 관리

import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

/**
 * 위치 권한 요청
 * 사용처: 홈 화면 (날씨, 골프장 검색), 골프장 검색
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS는 Info.plist에서 자동 처리
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: '위치 권한 요청',
        message: '주변 골프장과 날씨 정보를 제공하기 위해 위치 권한이 필요합니다.',
        buttonNeutral: '나중에',
        buttonNegative: '거부',
        buttonPositive: '허용',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ 위치 권한 허용됨');
      return true;
    } else {
      console.log('❌ 위치 권한 거부됨');
      showPermissionAlert('위치');
      return false;
    }
  } catch (err) {
    console.warn('위치 권한 요청 실패:', err);
    return false;
  }
};

/**
 * 카메라 권한 요청
 * 사용처: 프로필 사진 촬영, 상품 사진 촬영, QR 코드 스캔
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: '카메라 권한 요청',
        message: '사진 촬영 및 QR 코드 스캔을 위해 카메라 권한이 필요합니다.',
        buttonNeutral: '나중에',
        buttonNegative: '거부',
        buttonPositive: '허용',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ 카메라 권한 허용됨');
      return true;
    } else {
      console.log('❌ 카메라 권한 거부됨');
      showPermissionAlert('카메라');
      return false;
    }
  } catch (err) {
    console.warn('카메라 권한 요청 실패:', err);
    return false;
  }
};

/**
 * 갤러리(저장소) 권한 요청
 * 사용처: 프로필 사진 선택, 상품 사진 선택
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  // Android 13+ (API 33+)는 READ_MEDIA_IMAGES 사용
  if (Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.READ_MEDIA_IMAGES' as any,
        {
          title: '갤러리 권한 요청',
          message: '사진을 선택하기 위해 갤러리 접근 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ 갤러리 권한 허용됨 (Android 13+)');
        return true;
      } else {
        console.log('❌ 갤러리 권한 거부됨');
        showPermissionAlert('갤러리');
        return false;
      }
    } catch (err) {
      console.warn('갤러리 권한 요청 실패:', err);
      return false;
    }
  }

  // Android 12 이하는 READ_EXTERNAL_STORAGE 사용
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: '저장소 권한 요청',
        message: '사진을 선택하기 위해 저장소 접근 권한이 필요합니다.',
        buttonNeutral: '나중에',
        buttonNegative: '거부',
        buttonPositive: '허용',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ 저장소 권한 허용됨 (Android 12-)');
      return true;
    } else {
      console.log('❌ 저장소 권한 거부됨');
      showPermissionAlert('저장소');
      return false;
    }
  } catch (err) {
    console.warn('저장소 권한 요청 실패:', err);
    return false;
  }
};

/**
 * 알림 권한 요청
 * 사용처: 로그인 후, 예약 알림, 채팅 메시지
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS는 Firebase Messaging에서 자동 처리
    return true;
  }

  // Android 13+ (API 33+)만 런타임 권한 필요
  if (Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.POST_NOTIFICATIONS' as any,
        {
          title: '알림 권한 요청',
          message: '예약 알림, 채팅 메시지 등을 받기 위해 알림 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ 알림 권한 허용됨');
        return true;
      } else {
        console.log('❌ 알림 권한 거부됨');
        showPermissionAlert('알림');
        return false;
      }
    } catch (err) {
      console.warn('알림 권한 요청 실패:', err);
      return false;
    }
  }

  // Android 12 이하는 런타임 권한 불필요
  return true;
};

/**
 * 권한 거부 시 설정 화면으로 안내하는 Alert
 */
const showPermissionAlert = (permissionName: string) => {
  Alert.alert(
    `${permissionName} 권한 필요`,
    `${permissionName} 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.`,
    [
      { text: '취소', style: 'cancel' },
      {
        text: '설정으로 이동',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ],
  );
};

/**
 * 모든 권한이 허용되었는지 확인
 */
export const checkAllPermissions = async (): Promise<{
  location: boolean;
  camera: boolean;
  storage: boolean;
  notification: boolean;
}> => {
  if (Platform.OS === 'ios') {
    return {
      location: true,
      camera: true,
      storage: true,
      notification: true,
    };
  }

  const location = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  const camera = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CAMERA
  );

  let storage = false;
  if (Platform.Version >= 33) {
    storage = await PermissionsAndroid.check(
      'android.permission.READ_MEDIA_IMAGES' as any
    );
  } else {
    storage = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
  }

  let notification = true;
  if (Platform.Version >= 33) {
    notification = await PermissionsAndroid.check(
      'android.permission.POST_NOTIFICATIONS' as any
    );
  }

  return { location, camera, storage, notification };
};
