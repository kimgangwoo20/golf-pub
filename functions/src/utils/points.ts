// 포인트 처리 유틸리티 (Firestore Transaction 기반)
import * as admin from "firebase-admin";
import { HttpsError } from "firebase-functions/v2/https";

interface AdjustPointsResult {
  newBalance: number;
  transactionId: string;
}

/**
 * 포인트 원자적 적립/차감
 *
 * @param userId 대상 사용자 ID
 * @param amount 양수: 적립, 음수 불가 (type으로 구분)
 * @param type 'add' | 'subtract'
 * @param reason 적립/차감 사유
 */
export async function adjustPoints(
  userId: string,
  amount: number,
  type: "add" | "subtract",
  reason: string
): Promise<AdjustPointsResult> {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);

  const result = await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "사용자를 찾을 수 없습니다.");
    }

    const currentBalance: number = userDoc.data()?.points || 0;

    let newBalance: number;
    let historyAmount: number;

    if (type === "add") {
      newBalance = currentBalance + amount;
      historyAmount = amount;
    } else {
      // 잔액 검증
      if (currentBalance < amount) {
        throw new HttpsError(
          "failed-precondition",
          `포인트가 부족합니다. (현재: ${currentBalance}, 필요: ${amount})`
        );
      }
      newBalance = currentBalance - amount;
      historyAmount = -amount;
    }

    // 사용자 포인트 업데이트
    transaction.update(userRef, { points: newBalance });

    // 포인트 내역 생성
    const historyRef = userRef.collection("points").doc();
    transaction.set(historyRef, {
      amount: historyAmount,
      type: type === "add" ? "earn" : "spend",
      description: reason,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { newBalance, transactionId: historyRef.id };
  });

  return result;
}
