// PopularBookingsScreen.tsx - 인기 부킹 목록 (Firestore 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getPopularBookings } from '@/services/firebase/firebaseBooking';

interface PopularBooking {
  id: string;
  course: string;
  date: string;
  time: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
}

export const PopularBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<PopularBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPopularBookings(20);
      setBookings(result);
    } catch (error) {
      console.error('인기 부킹 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await getPopularBookings(20);
      setBookings(result);
    } catch (error) {
      console.error('인기 부킹 새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderBooking = ({ item }: { item: PopularBooking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
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
    </TouchableOpacity>
  );

  if (loading && bookings.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>인기 부킹을 불러오는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔥</Text>
              <Text style={styles.emptyText}>인기 부킹이 없습니다</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
    fontWeight: '700',
  },
  course: {
    fontSize: 18,
    fontWeight: '700',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
