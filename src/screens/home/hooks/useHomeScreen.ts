import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingStore } from '@/store/useBookingStore';
import { checkTodayAttendance, checkIn } from '@/services/firebase/firebaseAttendance';
import { joinBooking } from '@/services/firebase/firebaseBooking';

export const useHomeScreen = () => {
  const { user } = useAuthStore();
  const { bookings, loadBookings } = useBookingStore();
  
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceChecked, setAttendanceChecked] = useState(false);

  useEffect(() => {
    loadData();
    checkAttendance();
  }, []);

  const loadData = async () => {
    try {
      await loadBookings();
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const checkAttendance = async () => {
    if (!user?.id) return;
    try {
      const checked = await checkTodayAttendance(user.id);
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
  }, []);

  const handleBookingPress = (bookingId: string) => {
    // TODO: 부킹 상세 화면으로 이동
  };

  const handleJoinBooking = async (bookingId: string) => {
    if (!user?.id) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    Alert.alert(
      '참가 신청',
      '이 모임에 참가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '참가하기',
          onPress: async () => {
            try {
              await joinBooking(bookingId, user.id);
              Alert.alert('성공', '참가 신청이 완료되었습니다!');
              await loadData();
            } catch (error) {
              Alert.alert('오류', '참가 신청에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleAttendanceCheck = async () => {
    if (!user?.id) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    if (attendanceChecked) {
      Alert.alert('알림', '오늘 이미 출석체크를 완료했습니다!');
      return;
    }

    try {
      await checkIn(user.id);
      setAttendanceChecked(true);
      Alert.alert('출석 완료', '100 포인트를 받았습니다! 🎉');
    } catch (error) {
      Alert.alert('오류', '출석체크에 실패했습니다.');
    }
  };

  const handleCreateBooking = () => {
    // TODO: 부킹 생성 화면으로 이동
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
