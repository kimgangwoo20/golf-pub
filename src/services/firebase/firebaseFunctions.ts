// Cloud Functions 호출 래퍼
import { getFunctions, httpsCallable } from './firebaseConfig';

const functions = getFunctions(undefined, 'asia-northeast3');

/**
 * Cloud Function 호출 공통 헬퍼
 */
// 일시적 네트워크 오류로 재시도 가능한 에러 코드
const RETRYABLE_CODES = ['unavailable', 'deadline-exceeded', 'resource-exhausted'];
const MAX_RETRIES = 2;

export const callFunction = async <T = any>(name: string, data?: any): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const callable = httpsCallable(functions, name);
      const result = await callable(data);
      return result.data as T;
    } catch (error: any) {
      lastError = error;
      // 재시도 가능한 일시적 오류인 경우에만 재시도
      const isRetryable = RETRYABLE_CODES.includes(error.code);
      if (!isRetryable || attempt === MAX_RETRIES) {
        break;
      }
      // 지수 백오프: 1초, 2초
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  // Firebase Functions 에러는 code와 message를 포함
  const message = lastError?.message || 'Cloud Function 호출에 실패했습니다.';
  throw new Error(message);
};
