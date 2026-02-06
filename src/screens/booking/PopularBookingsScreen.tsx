// PopularBookingsScreen.tsx - 인기 부킹 목록
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

interface Booking {
  id: string;
  course: string;
  date: string;
  time: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  views: number;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    course: '스카이72 골프클럽',
    date: '2024-02-01',
    time: '08:00',
    organizer: '김골프',
    participants: 3,
    maxParticipants: 4,
    views: 156,
  },
  {
    id: '2',
    course: '남서울 컨트리클럽',
    date: '2024-02-03',
    time: '10:00',
    organizer: '이영희',
    participants: 2,
    maxParticipants: 4,
    views: 98,
  },
];

export const PopularBookingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: 실제 API 호출
    setTimeout(() => {
      setBookings(MOCK_BOOKINGS);
      setRefreshing(false);
    }, 1000);
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation?.navigate('BookingDetail', { bookingId: item.id })}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🔥 인기</Text>
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
      <Text style={styles.views}>👁️ {item.views}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 8,
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
  views: {
    fontSize: 12,
    color: '#999',
  },
});
