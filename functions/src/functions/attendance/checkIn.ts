// 출석 체크 Cloud Function
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAuth } from "../../utils/auth";
import { adjustPoints } from "../../utils/points";
import { REGION } from "../../config/environment";

export const attendanceCheckIn = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireAuth(request);
    const db = admin.firestore();

    // 오늘 날짜 (KST)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const today = kstDate.toISOString().split("T")[0];

    const attendanceDocId = `${uid}_${today}`;
    const attendanceRef = db.collection("attendance").doc(attendanceDocId);

    // 중복 체크
    const existing = await attendanceRef.get();
    if (existing.exists) {
      throw new HttpsError(
        "already-exists",
        "이미 오늘 출석체크를 완료했습니다!"
      );
    }

    // 연속 출석일 계산
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    let consecutiveDays = 0;

    // 어제 출석 확인
    const yesterday = new Date(kstDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayDoc = await db
      .collection("attendance")
      .doc(`${uid}_${yesterdayStr}`)
      .get();

    if (yesterdayDoc.exists) {
      consecutiveDays = userData?.stats?.consecutiveAttendance || 0;
    }
    consecutiveDays += 1;

    // 보너스 포인트 계산
    let points = 100;
    if (consecutiveDays === 7) {
      points = 500;
    } else if (consecutiveDays === 30) {
      points = 2000;
    } else if (consecutiveDays % 7 === 0) {
      points = 300;
    }

    // Transaction: 출석 기록 + 포인트 적립 + 통계 업데이트
    await db.runTransaction(async (transaction) => {
      // 출석 기록 생성
      transaction.set(attendanceRef, {
        userId: uid,
        date: today,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        points,
        consecutiveDays,
      });

      // 사용자 통계 업데이트
      const userRef = db.collection("users").doc(uid);
      const longestStreak = Math.max(
        userData?.stats?.longestStreak || 0,
        consecutiveDays
      );

      transaction.update(userRef, {
        "stats.totalAttendance": admin.firestore.FieldValue.increment(1),
        "stats.consecutiveAttendance": consecutiveDays,
        "stats.longestStreak": longestStreak,
        "stats.lastAttendance":
          admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // 포인트 적립 (별도 트랜잭션)
    await adjustPoints(uid, points, "add", "출석 체크 포인트");

    return {
      success: true,
      points,
      consecutiveDays,
      message: `+${points} 포인트 적립! (${consecutiveDays}일 연속)`,
    };
  }
);
