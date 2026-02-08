// 쿠폰 사용 Cloud Function
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAuth } from "../../utils/auth";
import { REGION } from "../../config/environment";

export const couponRedeem = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireAuth(request);
    const { couponId } = request.data;

    if (!couponId) {
      throw new HttpsError(
        "invalid-argument",
        "쿠폰 ID가 필요합니다."
      );
    }

    const db = admin.firestore();
    const couponRef = db
      .collection("users")
      .doc(uid)
      .collection("coupons")
      .doc(couponId);

    const couponDoc = await couponRef.get();

    if (!couponDoc.exists) {
      throw new HttpsError("not-found", "쿠폰을 찾을 수 없습니다.");
    }

    const couponData = couponDoc.data()!;

    // 이미 사용된 쿠폰
    if (couponData.isUsed) {
      throw new HttpsError(
        "failed-precondition",
        "이미 사용된 쿠폰입니다."
      );
    }

    // 만료일 확인
    const expiryDate = couponData.expiryDate?.toDate?.();
    if (expiryDate && expiryDate < new Date()) {
      throw new HttpsError(
        "failed-precondition",
        "만료된 쿠폰입니다."
      );
    }

    // 쿠폰 사용 처리
    await couponRef.update({
      isUsed: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      discount: couponData.discount,
      discountType: couponData.discountType,
    };
  }
);
