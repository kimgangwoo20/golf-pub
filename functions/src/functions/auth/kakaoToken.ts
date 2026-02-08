// 카카오 로그인 → Firebase Custom Token 발급
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import { KAKAO_REST_API_KEY, REGION } from "../../config/environment";

export const kakaoToken = onCall(
  {
    region: REGION,
    secrets: [KAKAO_REST_API_KEY],
  },
  async (request) => {
    const { kakaoAccessToken } = request.data;

    if (!kakaoAccessToken) {
      throw new HttpsError(
        "invalid-argument",
        "카카오 액세스 토큰이 필요합니다."
      );
    }

    // 카카오 API로 토큰 검증 및 사용자 정보 조회
    let kakaoUser: any;
    try {
      const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${kakaoAccessToken}`,
        },
      });
      kakaoUser = response.data;
    } catch (error) {
      throw new HttpsError(
        "unauthenticated",
        "카카오 토큰이 유효하지 않습니다."
      );
    }

    const kakaoId = kakaoUser.id;
    if (!kakaoId) {
      throw new HttpsError("internal", "카카오 사용자 ID를 가져올 수 없습니다.");
    }

    const uid = `kakao:${kakaoId}`;
    const kakaoAccount = kakaoUser.kakao_account || {};
    const kakaoProfile = kakaoAccount.profile || {};

    // Firebase 사용자 생성 또는 업데이트
    try {
      await admin.auth().getUser(uid);
    } catch {
      // 사용자가 없으면 생성
      await admin.auth().createUser({
        uid,
        displayName: kakaoProfile.nickname || "골프러",
        photoURL: kakaoProfile.profile_image_url || "",
      });
    }

    // Firestore 프로필 upsert
    const profile = {
      uid,
      kakaoId: String(kakaoId),
      nickname: kakaoProfile.nickname || "골프러",
      profileImage: kakaoProfile.profile_image_url || "",
      email: kakaoAccount.email || "",
      provider: "kakao",
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore()
      .collection("users")
      .doc(uid)
      .set(
        {
          ...profile,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    // Custom Token 발급
    const customToken = await admin.auth().createCustomToken(uid);

    return { customToken, profile };
  }
);
