// 🏠 HomeScreen.tsx
// 골프 Pub 메인 홈 화면

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '@/styles/theme';
import { BookingCard } from '@/components/booking/BookingCard';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { useBookingStore } from '@/store/useBookingStore';
import { Booking } from '@/types';

type FilterType = 'all' | 'today' | 'week' | 'beginner';

export const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceChecked, setAttendanceChecked] = useState(false);

  const { bookings, loadBookings } = useBookingStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadBookings();
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.title.toLowerCase().includes(query) ||
        booking.course.toLowerCase().includes(query)
      );
    }

    // 날짜 필터
    if (activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return booking.date === today;
    }

    if (activeFilter === 'week') {
      const today = new Date();
      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const bookingDate = new Date(booking.date);
      return bookingDate >= today && bookingDate <= weekLater;
    }

    // 레벨 필터
    if (activeFilter === 'beginner') {
      return booking.host.level === 'beginner';
    }

    return true;
  });

  const handleFilterPress = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleBookingPress = (booking: Booking) => {
    // 상세 모달 열기 (navigation.navigate('BookingDetail', { booking }))
    console.log('부킹 클릭:', booking.id);
  };

  const handleAttendanceCheck = () => {
    if (attendanceChecked) {
      console.log('이미 출석체크 완료!');
      return;
    }
    setAttendanceChecked(true);
    console.log('출석체크 완료! 100 포인트 적립');
    // 실제 포인트 적립 API 호출
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>골프 부킹을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⛳</Text>
            <Text style={styles.logoText}>골프 Pub</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>✚</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="골프장, 지역으로 검색..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >

                      {/* 멤버십 배너 - 여기가 새로 추가되는 부분! */}
                      <TouchableOpacity
                        style={styles.membershipBanner}
                        onPress={() => {
                          // TODO: 네비게이션 추가 후 아래 코드로 변경
                          // navigation.navigate('MembershipIntro');
                          console.log('멤버십 화면으로 이동');
                          alert('멤버십 화면은 네비게이션 설정 후 사용 가능합니다!');
                        }}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.membershipGradient}
                        >
                          <View style={styles.membershipContent}>
                            <View style={styles.membershipLeft}>
                              <Text style={styles.membershipBadge}>👑 프리미엄</Text>
                              <Text style={styles.membershipTitle}>멤버십 혜택을 누려보세요</Text>
                              <Text style={styles.membershipSubtitle}>무제한 부킹 참가 • 매월 5,000P 적립</Text>
                            </View>
                            <View style={styles.membershipRight}>
                              <View style={styles.membershipButton}>
                                <Text style={styles.membershipButtonText}>자세히 →</Text>
                              </View>
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>

        {/* 날씨 위젯 */}
        <WeatherWidget />

        {/* 출석체크 이벤트 배너 */}
        <TouchableOpacity
          style={[
            styles.attendanceBanner,
            attendanceChecked && styles.attendanceBannerChecked
          ]}
          onPress={handleAttendanceCheck}
          activeOpacity={0.8}
          disabled={attendanceChecked}
        >
          <View style={styles.attendanceIconWrapper}>
            <Text style={styles.attendanceIcon}>
              {attendanceChecked ? '✓' : '✨'}
            </Text>
          </View>
          <View style={styles.attendanceContent}>
            <Text style={styles.attendanceTitle}>
              {attendanceChecked ? '출석체크 완료!' : '매일 출석 체크하고'}
            </Text>
            <Text style={styles.attendanceSubtitle}>
              {attendanceChecked ? '+100 포인트 적립됨' : '100 포인트 받기!'}
            </Text>
          </View>
          <View style={[
            styles.attendanceButton,
            attendanceChecked && styles.attendanceButtonChecked
          ]}>
            <Text style={styles.attendanceButtonText}>
              {attendanceChecked ? '✓ 완료' : '체크하기'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 필터 칩 */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <FilterChip
              label="전체"
              active={activeFilter === 'all'}
              onPress={() => handleFilterPress('all')}
            />
            <FilterChip
              label="오늘"
              active={activeFilter === 'today'}
              onPress={() => handleFilterPress('today')}
            />
            <FilterChip
              label="이번 주"
              active={activeFilter === 'week'}
              onPress={() => handleFilterPress('week')}
            />
            <FilterChip
              label="초보 환영"
              active={activeFilter === 'beginner'}
              onPress={() => handleFilterPress('beginner')}
            />
          </ScrollView>
        </View>

        {/* 부킹 목록 */}
        <View style={styles.bookingsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 인기 부킹</Text>
            <Text style={styles.bookingCount}>{filteredBookings.length}개</Text>
          </View>

          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⛳</Text>
              <Text style={styles.emptyTitle}>부킹이 없습니다</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? '검색 결과가 없습니다' : '새로운 부킹을 만들어보세요!'}
              </Text>
            </View>
          ) : (
            filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => handleBookingPress(booking)}
              />
            ))
          )}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 플로팅 버튼 (부킹 생성) */}
      <TouchableOpacity style={styles.floatingBtn}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.floatingBtnGradient}
        >
          <Text style={styles.floatingBtnText}>✚ 부킹 만들기</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ============================================
// FilterChip 컴포넌트
// ============================================
interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================
// StyleSheet
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },

  // 로딩
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },

  // 헤더
  header: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    ...shadows.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    fontSize: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: fontWeight.extrabold,
    color: 'white',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnText: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    backgroundColor: colors.danger,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: 'white',
  },

  // 검색바
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    padding: 0,
  },
  clearBtn: {
    fontSize: 20,
    color: colors.textTertiary,
  },

  // 컨텐츠
  content: {
    flex: 1,
  },

  // 출석체크 배너
  attendanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  attendanceBannerChecked: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  attendanceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  attendanceIcon: {
    fontSize: 24,
  },
  attendanceContent: {
    flex: 1,
  },
  attendanceTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  attendanceSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#2E7D32',
  },
  attendanceButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  attendanceButtonChecked: {
    backgroundColor: '#9E9E9E',
  },
  attendanceButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },

  // 필터
  filtersContainer: {
    paddingTop: spacing.md,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryDark,
  },

  // 부킹 목록
  bookingsContainer: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  bookingCount: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // 플로팅 버튼
  floatingBtn: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    ...shadows.xl,
  },
  floatingBtnGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  floatingBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: 'white',
  },

  // 하단 여백
  bottomSpacer: {
    height: 100,
  },

    membershipBanner: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.medium,
    },
    membershipGradient: {
      padding: spacing.lg,
    },
    membershipContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    membershipLeft: {
      flex: 1,
    },
    membershipBadge: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '600',
      marginBottom: 4,
    },
    membershipTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    membershipSubtitle: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    membershipRight: {
      marginLeft: spacing.md,
    },
    membershipButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: borderRadius.md,
    },
    membershipButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
});