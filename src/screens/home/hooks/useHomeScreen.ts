import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingStore } from '@/store/useBookingStore';
import { checkTodayAttendance, markAttendance } from '@/services/firebase/firebaseAttendance';
import { joinBooking } from '@/services/firebase/firebaseBooking';

export const useHomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { bookings, loadBookings } = useBookingStore();

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceChecked, setAttendanceChecked] = useState(false);

  useEffect(() => {
    loadData();
    checkAttendance();
    // loadData, checkAttendance는 컴포넌트 내 함수이지만 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      await loadBookings();
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const checkAttendance = async () => {
    if (!user?.uid) return;
    try {
      const checked = await checkTodayAttendance(user.uid);
      setAttendanceChecked(checked);
    } catch (error) {
      console.error('출석 확인 실패:', error);
    }
  };

  const handleFilterChange = (newFilter: string) => setFilter(newFilter);
  const handleSearch = (text: string) => setSearchQuery(text);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    await checkAttendance();
    setRefreshing(false);
    // loadData, checkAttendance는 컴포넌트 내 함수이지만 마운트 후 변하지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookingPress = (bookingId: string) => {
    (navigation as any).navigate('Bookings', { screen: 'BookingDetail', params: { bookingId } });
  };

  const handleJoinBooking = async (bookingId: string) => {
    if (!user?.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    Alert.alert('참가 신청', '이 모임에 참가하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '참가하기',
        onPress: async () => {
          try {
            await joinBooking(bookingId, user.uid);
            Alert.alert('성공', '참가 신청이 완료되었습니다!');
            await loadData();
          } catch (error) {
            Alert.alert('오류', '참가 신청에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleAttendanceCheck = async () => {
    if (!user?.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    if (attendanceChecked) {
      Alert.alert('알림', '오늘 이미 출석체크를 완료했습니다!');
      return;
    }

    try {
      const result = await markAttendance(user.uid);
      if (result.success) {
        setAttendanceChecked(true);
        Alert.alert(
          '출석 완료! 🎉',
          `+${result.points}P 적립!\n${result.consecutiveDays}일 연속 출석 중`,
        );
      } else {
        Alert.alert('알림', result.message);
      }
    } catch (error) {
      Alert.alert('오류', '출석체크에 실패했습니다.');
    }
  };

  const handleCreateBooking = () => {
    if (!user?.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    navigation.navigate('CreateBooking');
  };

  return {
    bookings,
    filter,
    searchQuery,
    refreshing,
    attendanceChecked,
    handleFilterChange,
    handleSearch,
    handleRefresh,
    handleBookingPress,
    handleJoinBooking,
    handleAttendanceCheck,
    handleCreateBooking,
  };
};
