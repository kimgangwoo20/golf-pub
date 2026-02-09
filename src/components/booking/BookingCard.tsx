// 📋 BookingCard.tsx
// 골프 부킹 카드 컴포넌트

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '@/styles/theme';
import { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  onJoinPress?: () => void; // 참가하기 버튼 클릭 핸들러
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress, onJoinPress }) => {
  const [avatarError, setAvatarError] = useState(false);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return { label: '초보', color: colors.success };
      case 'intermediate':
        return { label: '중급', color: colors.warning };
      case 'advanced':
        return { label: '고급', color: colors.danger };
      default:
        return { label: '모든 레벨', color: colors.tertiary };
    }
  };

  const levelBadge = getLevelBadge(booking.host.level);
  const isFull = booking.participants.current >= booking.participants.max;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8} disabled={isFull}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.hostInfo}>
          {!avatarError && booking.host.avatar ? (
            <Image
              source={{ uri: booking.host.avatar }}
              style={styles.avatar}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{booking.host.name?.[0] || '?'}</Text>
            </View>
          )}
          <View style={styles.hostDetails}>
            <Text style={styles.hostName}>{booking.host.name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {booking.host.rating}</Text>
              <Text style={styles.handicapText}>• HC {booking.host.handicap}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.levelBadge, { backgroundColor: `${levelBadge.color}20` }]}>
          <Text style={[styles.levelBadgeText, { color: levelBadge.color }]}>
            {levelBadge.label}
          </Text>
        </View>
      </View>

      {/* 제목 */}
      <Text style={styles.title} numberOfLines={2}>
        {booking.title}
      </Text>

      {/* 상세 정보 */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{booking.course}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {formatDate(booking.date)} {booking.time}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>👥</Text>
          <Text style={styles.detailText}>
            {booking.participants.current}/{booking.participants.max}명
          </Text>
        </View>
      </View>

      {/* 조건 태그 */}
      {booking.conditions && (
        <View style={styles.conditions}>
          {booking.conditions.pace && (
            <View style={styles.conditionTag}>
              <Text style={styles.conditionText}>⏱️ {booking.conditions.pace}</Text>
            </View>
          )}
          {booking.conditions.drinking && (
            <View style={styles.conditionTag}>
              <Text style={styles.conditionText}>🍺 {booking.conditions.drinking}</Text>
            </View>
          )}
        </View>
      )}

      {/* 푸터 */}
      <View style={styles.footer}>
        <View>
          {booking.price.original > booking.price.discount && (
            <Text style={styles.originalPrice}>{booking.price.original.toLocaleString()}원</Text>
          )}
          <Text style={styles.price}>
            {booking.price.discount.toLocaleString()}원<Text style={styles.priceUnit}>/인</Text>
          </Text>
        </View>

        <View style={styles.joinBtnContainer}>
          {isFull ? (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>모집완료</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 방지
                if (onJoinPress) {
                  onJoinPress();
                } else {
                  onPress(); // fallback
                }
              }}
              activeOpacity={0.8}
            >
              <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.joinBtn}>
                <Text style={styles.joinBtnText}>참가하기</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 날씨 정보 (있을 경우) */}
      {booking.weather && (
        <View style={styles.weatherBadge}>
          <Text style={styles.weatherText}>
            {booking.weather.condition} {booking.weather.temp}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// 날짜 포맷팅 헬퍼 함수
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  return `${month}/${day}(${weekday})`;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.md,
    backgroundColor: colors.bgTertiary,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  handicapText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  levelBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  // 제목
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: fontSize.lg * 1.4,
  },

  // 상세 정보
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // 조건 태그
  conditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  conditionTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
  },
  conditionText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },

  // 푸터
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  originalPrice: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
  },
  priceUnit: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textTertiary,
  },
  joinBtnContainer: {
    minWidth: 100,
  },
  joinBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  fullBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  fullBadgeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
  },

  // 날씨 배지
  weatherBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  weatherText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
