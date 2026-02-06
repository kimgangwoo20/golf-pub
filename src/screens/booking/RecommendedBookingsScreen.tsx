// RecommendedBookingsScreen.tsx - 추천 부킹 목록
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

interface Booking {
  id: string;
  course: string;
  date: string;
  time: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  matchScore: number;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    course: '스카이72 골프클럽',
    date: '2024-02-01',
    time: '08:00',
    organizer: '김골프',
    participants: 2,
    maxParticipants: 4,
    matchScore: 95,
  },
  {
    id: '2',
    course: '남서울 컨트리클럽',
    date: '2024-02-03',
    time: '10:00',
    organizer: '이영희',
    participants: 3,
    maxParticipants: 4,
    matchScore: 88,
  },
];

export const RecommendedBookingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation?.navigate('BookingDetail', { bookingId: item.id })}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✨ 추천</Text>
        </View>
        <Text style={styles.matchScore}>{item.matchScore}% 매칭</Text>
      </View>
      <Text style={styles.course}>{item.course}</Text>
      <View style={styles.info}>
        <Text style={styles.infoText}>📅 {item.date}</Text>
        <Text style={styles.infoText}>⏰ {item.time}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.organizer}>주최: {item.organizer}</Text>
        <Text style={styles.participants}>
          {item.participants}/{item.maxParticipants}명
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          회원님의 레벨과 선호도를 기반으로 추천해드립니다
        </Text>
      </View>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  notice: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
  },
  noticeText: {
    fontSize: 13,
    color: '#1565c0',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  course: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  info: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizer: {
    fontSize: 14,
    color: '#666',
  },
  participants: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});
