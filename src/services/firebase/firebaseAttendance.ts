// 📅 Firebase 출석 체크 서비스
// 사용자의 일일 출석 체크 및 포인트 적립 관리

import { firestore, collection, doc, getDoc, getDocs, query, where } from './firebaseConfig';
import { callFunction } from './firebaseFunctions';

/**
 * 오늘 출석 체크 여부 확인
 */
export const checkTodayAttendance = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const docSnap = await getDoc(doc(firestore, 'attendance', `${userId}_${today}`));

    return docSnap.exists;
  } catch (error) {
    console.error('출석 확인 실패:', error);
    return false;
  }
};

/**
 * 출석 체크 실행 (Cloud Functions 경유)
 */
export const markAttendance = async (
  _userId: string,
): Promise<{
  success: boolean;
  points: number;
  consecutiveDays: number;
  message: string;
}> => {
  try {
    const result = await callFunction<{
      success: boolean;
      points: number;
      consecutiveDays: number;
      message: string;
    }>('attendanceCheckIn');

    return result;
  } catch (error: any) {
    // already-exists 에러는 중복 출석
    if (error.message?.includes('이미 오늘')) {
      return {
        success: false,
        points: 0,
        consecutiveDays: 0,
        message: '이미 오늘 출석체크를 완료했습니다!',
      };
    }
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

    const q = query(
      collection(firestore, 'attendance'),
      where('userId', '==', userId),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => docSnap.data().date);
  } catch (error) {
    console.error('출석 캘린더 조회 실패:', error);
    return [];
  }
};

/**
 * 출석 통계 가져오기
 */
export const getAttendanceStats = async (
  userId: string,
): Promise<{
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  thisMonthDays: number;
}> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));

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
