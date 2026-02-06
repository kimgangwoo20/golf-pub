// BookingDetailScreen.tsx - 부킹 상세 화면
import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../styles/theme';
import { Booking } from '../../types/booking-types';

const { width } = Dimensions.get('window');

export const BookingDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { bookingId } = route.params as { bookingId: number };

  // Mock 데이터 (실제로는 API에서 가져옴)
  const booking: Booking = {
    id: bookingId,
    title: '주말 라운딩 같이 치실 분!',
    golfCourse: '세라지오CC',
    location: '경기 광주',
    date: '2025-01-18',
    time: '08:00',
    maxPlayers: 4,
    currentPlayers: 2,
    price: 120000,
    level: 'intermediate',
    status: 'open',
    description: '주말 아침 상쾌하게 라운딩하실 분 찾습니다!\n\n⛳ 코스: 세라지오CC 정규 18홀\n🕐 시간: 오전 8시 티오프\n💰 비용: 1인당 12만원 (그린피 포함)\n\n초중급자 환영합니다. 편하게 즐기실 분들만 신청해주세요!\n\n라운딩 후 근처 맛집에서 식사 예정입니다.',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
    participants: [
      { id: 1, avatar: 'https://i.pravatar.cc/150?img=12', name: '김골프' },
      { id: 2, avatar: 'https://i.pravatar.cc/150?img=25', name: '박버디' },
    ],
    hasPub: false,
    hostId: 1,
  };

  const host = {
    id: 1,
    name: '김골프',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4.8,
    reviewCount: 23,
    bio: '골프 경력 3년차입니다. 즐겁게 치실 분들 환영해요!',
  };

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
    if (booking.status === 'full') {
      Alert.alert('마감된 모임', '이미 정원이 마감되었습니다.');
      return;
    }

    Alert.alert(
      '참가 신청',
      `${booking.golfCourse} 라운딩에 참가하시겠습니까?\n\n금액: ${booking.price.toLocaleString()}원`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            // 결제 화면으로 이동
            navigation.navigate('Payment' as never, { bookingId: booking.id } as never);
          },
        },
      ]
    );
  };

  const handleChat = () => {
    navigation.navigate('Chat' as never, {
      screen: 'ChatRoom',
      params: {
        chatId: `booking_${booking.id}`,
        chatName: booking.title,
      },
    } as never);
  };

  // 새로고침
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: 실제 데이터 새로고침 API 호출
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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
          <Image source={{ uri: booking.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* 메인 정보 */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{booking.title}</Text>
            <View style={[styles.statusBadge, booking.status === 'full' && styles.statusBadgeFull]}>
              <Text style={styles.statusBadgeText}>
                {booking.status === 'open' ? '모집중' : '마감'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.golfCourse}>⛳ {booking.golfCourse}</Text>
            <Text style={styles.location}>📍 {booking.location}</Text>
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
              <Text style={styles.infoValue}>{getLevelText(booking.level)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>인원</Text>
              <Text style={styles.infoValue}>
                {booking.currentPlayers}/{booking.maxPlayers}명
              </Text>
            </View>
          </View>
        </View>

        {/* 호스트 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>호스트</Text>
          <View style={styles.hostCard}>
            <Image source={{ uri: host.avatar }} style={styles.hostAvatar} />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{host.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {host.rating}</Text>
                <Text style={styles.reviewCount}>후기 {host.reviewCount}개</Text>
              </View>
              <Text style={styles.hostBio}>{host.bio}</Text>
            </View>
          </View>
        </View>

        {/* 참가자 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>참가자 ({booking.currentPlayers}명)</Text>
          <View style={styles.participantsList}>
            {booking.participants.map((participant) => (
              <View key={participant.id} style={styles.participantItem}>
                <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>
            ))}
            {Array.from({ length: booking.maxPlayers - booking.currentPlayers }).map((_, index) => (
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 설명</Text>
          <Text style={styles.description}>{booking.description}</Text>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>1인당</Text>
          <Text style={styles.price}>{booking.price.toLocaleString()}원</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.joinButton, booking.status === 'full' && styles.joinButtonDisabled]}
            onPress={handleJoinBooking}
            disabled={booking.status === 'full'}
          >
            <Text style={styles.joinButtonText}>
              {booking.status === 'full' ? '마감되었습니다' : '참가 신청'}
            </Text>
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
  reviewCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  hostBio: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
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