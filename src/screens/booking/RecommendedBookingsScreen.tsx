import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

export default function RecommendedBookingsScreen({ navigation }: any) {
  const bookings = [{ id: '1', title: '초보 환영 라운딩', course: '남서울CC', date: '2024-02-20', level: '초급', image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400' }];

  const renderBooking = ({ item }: any) => (<TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}><Image source={{ uri: item.image }} style={styles.image} /><View style={styles.info}><View style={styles.badge}><Text style={styles.badgeText}>추천</Text></View><Text style={styles.title}>{item.title}</Text><Text style={styles.course}>{item.course}</Text><Text style={styles.date}>{item.date}</Text></View></TouchableOpacity>);

  return (<View style={styles.container}><View style={styles.header}><Text style={styles.headerTitle}>✨ 추천 부킹</Text><Text style={styles.headerSubtitle}>내 레벨에 맞는 부킹</Text></View><FlatList data={bookings} renderItem={renderBooking} keyExtractor={item => item.id} contentContainerStyle={styles.list} /></View>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f8f9fa' }, header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }, headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 }, headerSubtitle: { fontSize: 14, color: '#666' }, list: { padding: 16 }, card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }, image: { width: '100%', height: 180 }, info: { padding: 16 }, badge: { alignSelf: 'flex-start', backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 }, badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' }, title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 }, course: { fontSize: 14, color: '#666', marginBottom: 4 }, date: { fontSize: 14, color: '#666' } });
