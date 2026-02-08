// BookingListItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Booking, BookingStatus } from '@/types/booking-types';
import { ParticipantAvatar } from './ParticipantAvatar';
import { colors } from '@/styles/theme';

interface Props {
  booking: Booking;
  onPress: () => void;
}

export const BookingListItem: React.FC<Props> = ({ booking, onPress }) => {
  const getLevelText = (level: string): string =>
    ({ beginner: '초보', intermediate: '중급', advanced: '고급', any: '누구나' })[level] || level;
  const getStatusColor = (status: BookingStatus): string =>
    ({
      OPEN: colors.primary,
      CLOSED: colors.textTertiary,
      COMPLETED: colors.textTertiary,
      CANCELLED: colors.danger,
    })[status] || colors.textTertiary;
  const getStatusText = (status: BookingStatus): string =>
    ({ OPEN: '모집중', CLOSED: '마감', COMPLETED: '종료', CANCELLED: '취소' })[status] || status;
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };
  const formatPrice = (price: number): string => `${price.toLocaleString()}원`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {booking.image ? (
          <Image source={{ uri: booking.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 48, opacity: 0.3 }}>⛳</Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
        {booking.hasPub && (
          <View style={styles.pubBadge}>
            <Text style={styles.pubBadgeText}>🍺 술집 연계</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {booking.title}
        </Text>
        <View style={styles.locationRow}>
          <Text style={styles.golfCourse}>{booking.course}</Text>
          <Text style={styles.location}>📍 {booking.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>날짜</Text>
            <Text style={styles.metaValue}>{formatDate(booking.date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>시간</Text>
            <Text style={styles.metaValue}>{booking.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>실력</Text>
            <Text style={styles.metaValue}>{getLevelText(booking.level || 'any')}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>1인당</Text>
            <Text style={styles.price}>
              {formatPrice(
                booking.price.perPerson
                  ? booking.price.discount || booking.price.original
                  : booking.price.original,
              )}
            </Text>
          </View>
          <View style={styles.participantsContainer}>
            <ParticipantAvatar
              members={booking.participants.members}
              maxPlayers={booking.participants.max}
            />
            <Text style={styles.participantsCount}>
              {booking.participants.current}/{booking.participants.max}명
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: { position: 'relative', height: 180, backgroundColor: colors.bgTertiary },
  image: { width: '100%', height: '100%' },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
  pubBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pubBadgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
  body: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  golfCourse: { fontSize: 15, fontWeight: '600', color: colors.primary, marginRight: 8 },
  location: { fontSize: 13, color: colors.textSecondary },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: 11, color: colors.textTertiary, marginBottom: 4 },
  metaValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 12, color: colors.textTertiary, marginBottom: 2 },
  price: { fontSize: 20, fontWeight: '700', color: colors.primary },
  participantsContainer: { alignItems: 'flex-end' },
  participantsCount: { marginTop: 6, fontSize: 12, fontWeight: '600', color: colors.textSecondary },
});
