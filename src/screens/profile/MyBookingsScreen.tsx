import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';

export const MyBookingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([
    { id: 1, title: '주말 라운딩', course: '레이크사이드CC', date: '2024-02-10', status: '확정' },
    { id: 2, title: '평일 조인', course: '스카이72', date: '2024-02-15', status: '대기' },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    // TODO: 실제 API 호출
    // const myBookings = await bookingAPI.getMyBookings(user?.uid);
    // setBookings(myBookings);
  }, [user]);

  // 화면 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [loadBookings]);

  const handleBookingPress = (bookingId: number) => {
    navigation?.navigate('BookingDetail', { bookingId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>내 부킹 목록</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      >
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => handleBookingPress(booking.id)}
            >
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTitle}>{booking.title}</Text>
                <View style={[styles.statusBadge, booking.status === '확정' ? styles.statusConfirmed : styles.statusPending]}>
                  <Text style={[styles.statusText, booking.status === '확정' ? styles.statusTextConfirmed : styles.statusTextPending]}>
                    {booking.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.bookingCourse}>🏌️ {booking.course}</Text>
              <Text style={styles.bookingDate}>📅 {booking.date}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>참가한 부킹이 없습니다</Text>
            <TouchableOpacity
              style={styles.findButton}
              onPress={() => navigation?.navigate('Bookings')}
            >
              <Text style={styles.findButtonText}>부킹 찾아보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff', marginBottom: 12 },
  backButton: { fontSize: 16, color: '#007AFF', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  content: { flex: 1, padding: 20 },
  bookingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bookingTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusConfirmed: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextConfirmed: { color: '#2E7D32' },
  statusTextPending: { color: '#F57C00' },
  bookingCourse: { fontSize: 14, color: '#666', marginBottom: 4 },
  bookingDate: { fontSize: 14, color: '#666' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 20 },
  findButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  findButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
