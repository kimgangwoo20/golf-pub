// 인증 유틸리티
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

/**
 * 인증된 사용자의 uid를 반환
 * 인증되지 않은 경우 HttpsError 발생
 */
export function requireAuth(request: CallableRequest): string {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "로그인이 필요합니다."
    );
  }
  return request.auth.uid;
}

/**
 * ADMIN 권한 검증
 */
export async function requireAdmin(request: CallableRequest): Promise<string> {
  const uid = requireAuth(request);

  const userDoc = await admin.firestore()
    .collection("users")
    .doc(uid)
    .get();

  const role = userDoc.data()?.role;
  if (role !== "ADMIN") {
    throw new HttpsError(
      "permission-denied",
      "관리자 권한이 필요합니다."
    );
  }

  return uid;
}
