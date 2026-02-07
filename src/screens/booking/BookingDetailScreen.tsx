// BookingDetailScreen.tsx - 부킹 상세 화면
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles/theme';
import { Booking } from '@/types/booking-types';
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';

const { width } = Dimensions.get('window');

export const BookingDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { bookingId } = route.params as { bookingId: string };

  const { getBooking, joinBooking } = useBookingStore();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const loadBooking = useCallback(async () => {
    try {
      setError(null);
      const data = await getBooking(bookingId);
      if (data) {
        setBooking(data);
      } else {
        setError('부킹을 찾을 수 없습니다');
      }
    } catch (err: any) {
      setError(err.message || '부킹을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBooking]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const getLevelText = (level: string): string => {
    const levels = { beginner: '초보', intermediate: '중급', advanced: '고급', any: '누구나' };
    return levels[level as keyof typeof levels] || level;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  const handleJoinBooking = () => {
    if (!booking) return;

    if (booking.status === 'CLOSED') {
      Alert.alert('마감된 모임', '이미 정원이 마감되었습니다.');
      return;
    }

    if (!user) {
      Alert.alert('로그인 필요', '참가 신청을 하려면 로그인해 주세요.');
      return;
    }

    Alert.alert(
      '참가 신청',
      `${booking.course} 라운딩에 참가하시겠습니까?\n\n금액: ${booking.price.discount.toLocaleString()}원`,
      [
        { text: '취소', style: 'cancel' as const },
        {
          text: '확인',
          onPress: async () => {
            try {
              setJoining(true);
              await joinBooking(booking.id, user.uid, user.displayName || '익명');
              Alert.alert('완료', '참가 신청이 완료되었습니다.');
              // 데이터 새로고침
              await loadBooking();
            } catch (err: any) {
              Alert.alert('오류', err.message || '참가 신청에 실패했습니다.');
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  const handleChat = () => {
    if (!booking) return;
    navigation.navigate('Chat' as any, {
      screen: 'ChatRoom',
      params: {
        chatId: `booking_${booking.id}`,
        chatName: booking.title,
      },
    } as any);
  };

  // 새로고침
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBooking();
    setRefreshing(false);
  }, [loadBooking]);

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || '부킹을 찾을 수 없습니다'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBooking}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 헤더 이미지 */}
        <View style={styles.imageContainer}>
          {booking.image ? (
            <Image source={{ uri: booking.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.bgTertiary }]} />
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* 메인 정보 */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{booking.title}</Text>
            <View style={[styles.statusBadge, booking.status === 'CLOSED' && styles.statusBadgeFull]}>
              <Text style={styles.statusBadgeText}>
                {booking.status === 'OPEN' ? '모집중' : '마감'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.golfCourse}>⛳ {booking.course}</Text>
            {booking.location && <Text style={styles.location}>📍 {booking.location}</Text>}
          </View>
        </View>

        {/* 라운딩 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>라운딩 정보</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>날짜</Text>
              <Text style={styles.infoValue}>{formatDate(booking.date)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>시간</Text>
              <Text style={styles.infoValue}>{booking.time}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>실력</Text>
              <Text style={styles.infoValue}>{getLevelText(booking.level ?? 'any')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>인원</Text>
              <Text style={styles.infoValue}>
                {booking.participants.current}/{booking.participants.max}명
              </Text>
            </View>
          </View>
        </View>

        {/* 호스트 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>호스트</Text>
          <View style={styles.hostCard}>
            {booking.host.avatar ? (
              <Image source={{ uri: booking.host.avatar }} style={styles.hostAvatar} />
            ) : (
              <View style={[styles.hostAvatar, { backgroundColor: colors.bgTertiary, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 24, color: colors.textTertiary }}>{booking.host.name?.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{booking.host.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {booking.host.rating}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 참가자 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>참가자 ({booking.participants.current}명)</Text>
          <View style={styles.participantsList}>
            {booking.participants.members.map((member) => (
              <View key={member.uid} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.emptySlotText}>{member.name.charAt(0)}</Text>
                </View>
                <Text style={styles.participantName}>{member.name}</Text>
              </View>
            ))}
            {Array.from({ length: booking.participants.max - booking.participants.current }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.participantItem}>
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>?</Text>
                </View>
                <Text style={styles.participantName}>빈 자리</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 술집 연계 */}
        {booking.hasPub && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍺 술집 연계</Text>
            <View style={styles.pubCard}>
              <Text style={styles.pubName}>{booking.pubName}</Text>
              <Text style={styles.pubTime}>라운딩 후 {booking.pubTime}</Text>
            </View>
          </View>
        )}

        {/* 상세 설명 */}
        {booking.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상세 설명</Text>
            <Text style={styles.description}>{booking.description}</Text>
          </View>
        )}

        {/* 하단 여백 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>1인당</Text>
          <Text style={styles.price}>{booking.price.discount.toLocaleString()}원</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.joinButton, (booking.status === 'CLOSED' || joining) && styles.joinButtonDisabled]}
            onPress={handleJoinBooking}
            disabled={booking.status === 'CLOSED' || joining}
          >
            {joining ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.joinButtonText}>
                {booking.status === 'CLOSED' ? '마감되었습니다' : '참가 신청'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: width,
    height: 300,
    backgroundColor: colors.bgTertiary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  mainInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 12,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeFull: {
    backgroundColor: colors.danger,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  golfCourse: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 12,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hostCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  participantItem: {
    width: '25%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  participantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: colors.bgTertiary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  participantName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySlot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bgTertiary,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptySlotText: {
    fontSize: 24,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  pubCard: {
    padding: 16,
    backgroundColor: colors.secondary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  pubName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pubTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: {
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 20,
  },
  joinButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
