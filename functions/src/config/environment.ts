// 환경 변수 및 시크릿 설정
import { defineSecret } from "firebase-functions/params";

// 카카오 REST API 키 (시크릿)
export const KAKAO_REST_API_KEY = defineSecret("KAKAO_REST_API_KEY");

// Toss Payments 시크릿 키 (시크릿)
export const TOSS_SECRET_KEY = defineSecret("TOSS_SECRET_KEY");

// 리전 설정
export const REGION = "asia-northeast3";
