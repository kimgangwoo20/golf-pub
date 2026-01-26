import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

export default function PopularBookingsScreen({ navigation }: any) {
  const bookings = [{ id: '1', title: '주말 라운딩', course: '레이크사이드CC', date: '2024-02-10', members: 3, maxMembers: 4, image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400' }, { id: '2', title: '평일 조인', course: '스카이72', date: '2024-02-15', members: 2, maxMembers: 4, image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400' }];

  const renderBooking = ({ item }: any) => (<TouchableOpacity style={styles.bookingCard} onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}><Image source={{ uri: item.image }} style={styles.image} /><View style={styles.info}><Text style={styles.title}>{item.title}</Text><Text style={styles.course}>🏌️ {item.course}</Text><Text style={styles.date}>📅 {item.date}</Text><View style={styles.members}><Text style={styles.membersText}>👥 {item.members}/{item.maxMembers}명</Text></View></View></TouchableOpacity>);

  return (<View style={styles.container}><View style={styles.header}><Text style={styles.headerTitle}>🔥 인기 부킹</Text></View><FlatList data={bookings} renderItem={renderBooking} keyExtractor={item => item.id} contentContainerStyle={styles.list} /></View>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f8f9fa' }, header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }, headerTitle: { fontSize: 24, fontWeight: 'bold' }, list: { padding: 16 }, bookingCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }, image: { width: '100%', height: 180 }, info: { padding: 16 }, title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 }, course: { fontSize: 14, color: '#666', marginBottom: 4 }, date: { fontSize: 14, color: '#666', marginBottom: 8 }, members: {}, membersText: { fontSize: 14, color: '#007AFF', fontWeight: '600' } });
