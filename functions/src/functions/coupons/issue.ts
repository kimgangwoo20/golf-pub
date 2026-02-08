// 쿠폰 발급 Cloud Function (ADMIN 전용)
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAdmin } from "../../utils/auth";
import { sendPushNotification } from "../../utils/notifications";
import { REGION } from "../../config/environment";

export const couponIssue = onCall(
  { region: REGION },
  async (request) => {
    await requireAdmin(request);
    const { userId, name, discount, discountType, minAmount, expiryDays } =
      request.data;

    if (!userId || !name || !discount || !discountType || !expiryDays) {
      throw new HttpsError(
        "invalid-argument",
        "필수 정보가 누락되었습니다."
      );
    }

    if (!["PERCENT", "AMOUNT"].includes(discountType)) {
      throw new HttpsError(
        "invalid-argument",
        "할인 타입은 PERCENT 또는 AMOUNT이어야 합니다."
      );
    }

    const db = admin.firestore();

    // 대상 사용자 존재 확인
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "사용자를 찾을 수 없습니다.");
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const couponData = {
      title: name,
      discount,
      discountType,
      minAmount: minAmount || 0,
      isUsed: false,
      expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 사용자 쿠폰 컬렉션에 추가
    const couponRef = await db
      .collection("users")
      .doc(userId)
      .collection("coupons")
      .add(couponData);

    // 알림 전송
    try {
      const discountText =
        discountType === "PERCENT" ? `${discount}%` : `${discount}원`;
      await sendPushNotification(
        userId,
        "coupon_issued",
        "쿠폰 발급",
        `${name} (${discountText} 할인) 쿠폰이 발급되었습니다!`,
        { couponId: couponRef.id }
      );
    } catch {
      // 알림 실패해도 쿠폰 발급에 영향 없음
    }

    return {
      success: true,
      couponId: couponRef.id,
    };
  }
);
