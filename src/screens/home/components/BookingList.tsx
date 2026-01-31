import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Booking {
  id: string;
  title: string;
  golfCourse: string;
  date: string;
  time: string;
  currentPlayers: number;
  maxPlayers: number;
  price: number;
}

interface Props {
  bookings: Booking[];
  onBookingPress: (id: string) => void;
  onJoinPress: (id: string) => void;
}

export const BookingList: React.FC<Props> = ({ bookings, onBookingPress, onJoinPress }) => (
  <FlatList
    data={bookings}
    keyExtractor={item => item.id}
    scrollEnabled={false}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.card} onPress={() => onBookingPress(item.id)}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.course}>⛳ {item.golfCourse}</Text>
        <View style={styles.info}>
          <Text style={styles.infoText}>📅 {item.date}</Text>
          <Text style={styles.infoText}>⏰ {item.time}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.players}>
            👥 {item.currentPlayers}/{item.maxPlayers}명
          </Text>
          <Text style={styles.price}>💰 {item.price.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={(e) => {
            e.stopPropagation();
            onJoinPress(item.id);
          }}
        >
          <Text style={styles.joinText}>참가하기</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )}
    ListEmptyComponent={
      <View style={styles.empty}>
        <Text style={styles.emptyText}>부킹이 없습니다</Text>
      </View>
    }
  />
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  course: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  info: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  infoText: { fontSize: 13, color: '#94a3b8' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  players: { fontSize: 14, color: '#0f172a' },
  price: { fontSize: 14, fontWeight: '600', color: '#10b981' },
  joinButton: { backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  joinText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  empty: { padding: 50, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#94a3b8' },
});
