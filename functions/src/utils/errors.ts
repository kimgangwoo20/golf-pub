// 에러 핸들링 유틸리티
import { HttpsError, type FunctionsErrorCode } from "firebase-functions/v2/https";

/**
 * 비즈니스 로직 에러를 HttpsError로 래핑
 */
export function throwError(
  code: FunctionsErrorCode,
  message: string
): never {
  throw new HttpsError(code, message);
}

/**
 * 에러를 안전하게 HttpsError로 변환
 */
export function wrapError(error: unknown): HttpsError {
  if (error instanceof HttpsError) {
    return error;
  }

  const message = error instanceof Error
    ? error.message
    : "알 수 없는 오류가 발생했습니다.";

  return new HttpsError("internal", message);
}
