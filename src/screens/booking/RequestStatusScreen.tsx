import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function RequestStatusScreen({ navigation }: any) {
  const requests = [{ id: '1', title: '주말 라운딩', course: '레이크사이드CC', date: '2024-02-10', status: 'pending' }, { id: '2', title: '평일 조인', course: '스카이72', date: '2024-02-15', status: 'approved' }, { id: '3', title: '강원도 골프', course: '대관령CC', date: '2024-02-18', status: 'rejected' }];

  const getStatusText = (status: string) => ({ pending: '대기중', approved: '승인됨', rejected: '거절됨' }[status] || status);
  const getStatusColor = (status: string) => ({ pending: '#FFA500', approved: '#4CAF50', rejected: '#F44336' }[status] || '#999');

  const renderRequest = ({ item }: any) => (<TouchableOpacity style={styles.requestCard} onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}><View style={styles.requestInfo}><Text style={styles.title}>{item.title}</Text><Text style={styles.course}>{item.course}</Text><Text style={styles.date}>{item.date}</Text></View><View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}><Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text></View></TouchableOpacity>);

  return (<View style={styles.container}><View style={styles.header}><Text style={styles.headerTitle}>내 신청 내역</Text></View><FlatList data={requests} renderItem={renderRequest} keyExtractor={item => item.id} contentContainerStyle={styles.list} /></View>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f8f9fa' }, header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }, headerTitle: { fontSize: 24, fontWeight: 'bold' }, list: { padding: 16 }, requestCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, requestInfo: { flex: 1 }, title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 }, course: { fontSize: 14, color: '#666', marginBottom: 2 }, date: { fontSize: 14, color: '#666' }, statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }, statusText: { fontSize: 12, fontWeight: '600' } });
