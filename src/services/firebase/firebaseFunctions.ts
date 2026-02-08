// Cloud Functions 호출 래퍼
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';

/**
 * Cloud Function 호출 공통 헬퍼
 */
export const callFunction = async <T = any>(
  name: string,
  data?: any,
): Promise<T> => {
  try {
    const callable = firebase.app().functions('asia-northeast3').httpsCallable(name);
    const result = await callable(data);
    return result.data as T;
  } catch (error: any) {
    // Firebase Functions 에러는 code와 message를 포함
    const message = error.message || 'Cloud Function 호출에 실패했습니다.';
    throw new Error(message);
  }
};
