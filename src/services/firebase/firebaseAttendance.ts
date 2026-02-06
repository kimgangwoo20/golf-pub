// 📅 Firebase 출석 체크 서비스
// 사용자의 일일 출석 체크 및 포인트 적립 관리

import firestore from '@react-native-firebase/firestore';
import { FirestoreTimestamp } from './firebaseConfig';

interface AttendanceRecord {
  userId: string;
  date: string; // YYYY-MM-DD 형식
  timestamp: number;
  points: number;
  consecutiveDays: number;
}

/**
 * 오늘 출석 체크 여부 확인
 */
export const checkTodayAttendance = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const doc = await firestore()
      .collection('attendance')
      .doc(`${userId}_${today}`)
      .get();

    return doc.exists;
  } catch (error) {
    console.error('출석 확인 실패:', error);
    return false;
  }
};

/**
 * 출석 체크 실행
 */
export const markAttendance = async (userId: string): Promise<{
  success: boolean;
  points: number;
  consecutiveDays: number;
  message: string;
}> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = FirestoreTimestamp.now();

    // 이미 출석했는지 확인
    const alreadyChecked = await checkTodayAttendance(userId);
    if (alreadyChecked) {
      return {
        success: false,
        points: 0,
        consecutiveDays: 0,
        message: '이미 오늘 출석체크를 완료했습니다!',
      };
    }

    // 연속 출석 일수 계산
    const consecutiveDays = await getConsecutiveDays(userId);
    const newConsecutiveDays = consecutiveDays + 1;

    // 보너스 포인트 계산 (연속 출석)
    let points = 100; // 기본 포인트
    if (newConsecutiveDays === 7) {
      points = 500; // 7일 연속 보너스
    } else if (newConsecutiveDays === 30) {
      points = 2000; // 30일 연속 보너스
    } else if (newConsecutiveDays % 7 === 0) {
      points = 300; // 7일 단위 보너스
    }

    // 출석 기록 저장
    const attendanceRecord: AttendanceRecord = {
      userId,
      date: today,
      timestamp,
      points,
      consecutiveDays: newConsecutiveDays,
    };

    await firestore()
      .collection('attendance')
      .doc(`${userId}_${today}`)
      .set(attendanceRecord);

    // 사용자 포인트 업데이트
    await updateUserPoints(userId, points);

    // 사용자 통계 업데이트
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        'stats.totalAttendance': firestore.FieldValue.increment(1),
        'stats.consecutiveAttendance': newConsecutiveDays,
        'stats.lastAttendance': timestamp,
      });

    return {
      success: true,
      points,
      consecutiveDays: newConsecutiveDays,
      message: `+${points} 포인트 적립! (${newConsecutiveDays}일 연속)`,
    };
  } catch (error) {
    console.error('출석 체크 실패:', error);
    return {
      success: false,
      points: 0,
      consecutiveDays: 0,
      message: '출석 체크에 실패했습니다. 다시 시도해주세요.',
    };
  }
};

/**
 * 연속 출석 일수 계산
 */
const getConsecutiveDays = async (userId: string): Promise<number> => {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    const userData = userDoc.data();
    const lastAttendance = userData?.stats?.lastAttendance;

    if (!lastAttendance) {
      return 0; // 첫 출석
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayDoc = await firestore()
      .collection('attendance')
      .doc(`${userId}_${yesterdayStr}`)
      .get();

    if (yesterdayDoc.exists) {
      // 어제 출석했으면 연속
      return userData?.stats?.consecutiveAttendance || 0;
    } else {
      // 어제 출석 안 했으면 초기화
      return 0;
    }
  } catch (error) {
    console.error('연속 출석 계산 실패:', error);
    return 0;
  }
};

/**
 * 사용자 포인트 업데이트
 */
const updateUserPoints = async (userId: string, points: number): Promise<void> => {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        'points.balance': firestore.FieldValue.increment(points),
        'points.earned': firestore.FieldValue.increment(points),
      });

    // 포인트 내역 기록
    await firestore()
      .collection('pointHistory')
      .add({
        userId,
        type: 'attendance',
        amount: points,
        timestamp: FirestoreTimestamp.now(),
        description: '출석 체크 포인트',
      });
  } catch (error) {
    console.error('포인트 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 출석 캘린더 데이터 가져오기 (월별)
 */
export const getAttendanceCalendar = async (
  userId: string,
  year: number,
  month: number,
): Promise<string[]> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const snapshot = await firestore()
      .collection('attendance')
      .where('userId', '==', userId)
      .where('date', '>=', startDateStr)
      .where('date', '<=', endDateStr)
      .get();

    return snapshot.docs.map((doc) => doc.data().date);
  } catch (error) {
    console.error('출석 캘린더 조회 실패:', error);
    return [];
  }
};

/**
 * 출석 통계 가져오기
 */
export const getAttendanceStats = async (userId: string): Promise<{
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  thisMonthDays: number;
}> => {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    const userData = userDoc.data();

    // 이번 달 출석 일수
    const now = new Date();
    const thisMonthAttendance = await getAttendanceCalendar(
      userId,
      now.getFullYear(),
      now.getMonth() + 1,
    );

    return {
      totalDays: userData?.stats?.totalAttendance || 0,
      currentStreak: userData?.stats?.consecutiveAttendance || 0,
      longestStreak: userData?.stats?.longestStreak || 0,
      thisMonthDays: thisMonthAttendance.length,
    };
  } catch (error) {
    console.error('출석 통계 조회 실패:', error);
    return {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      thisMonthDays: 0,
    };
  }
};
