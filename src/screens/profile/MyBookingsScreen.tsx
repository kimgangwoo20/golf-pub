import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function MyBookingsScreen({ navigation }: any) {
  const bookings = [
    { id: 1, title: '주말 라운딩', course: '레이크사이드CC', date: '2024-02-10', status: '확정' },
    { id: 2, title: '평일 조인', course: '스카이72', date: '2024-02-15', status: '대기' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>내 부킹 목록</Text>
      </View>

      <ScrollView style={styles.content}>
        {bookings.map(booking => (
          <TouchableOpacity key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingTitle}>{booking.title}</Text>
              <View style={[styles.statusBadge, booking.status === '확정' ? styles.statusConfirmed : styles.statusPending]}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>
            <Text style={styles.bookingCourse}>🏌️ {booking.course}</Text>
            <Text style={styles.bookingDate}>📅 {booking.date}</Text>
          </TouchableOpacity>
        ))}
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
  bookingCourse: { fontSize: 14, color: '#666', marginBottom: 4 },
  bookingDate: { fontSize: 14, color: '#666' },
});
