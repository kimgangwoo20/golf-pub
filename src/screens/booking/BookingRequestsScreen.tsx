import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

export default function BookingRequestsScreen({ navigation }: any) {
  const requests = [{ id: '1', name: '김철수', level: '중급', rating: 4.5, message: '같이 라운딩하고 싶습니다!', avatar: 'https://i.pravatar.cc/150?img=12' }, { id: '2', name: '이영희', level: '초급', rating: 4.8, message: '초보지만 열심히 하겠습니다', avatar: 'https://i.pravatar.cc/150?img=25' }];

  const handleApprove = (id: string) => Alert.alert('승인', '신청을 승인하시겠습니까?');
  const handleReject = (id: string) => Alert.alert('거절', '신청을 거절하시겠습니까?');

  const renderRequest = ({ item }: any) => (<View style={styles.requestCard}><TouchableOpacity onPress={() => navigation.navigate('ApplicantProfile', { applicant: item })} style={styles.requestInfo}><Image source={{ uri: item.avatar }} style={styles.avatar} /><View style={styles.info}><Text style={styles.name}>{item.name}</Text><Text style={styles.level}>⭐ {item.rating} • {item.level}</Text><Text style={styles.message} numberOfLines={1}>{item.message}</Text></View></TouchableOpacity><View style={styles.actions}><TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item.id)}><Text style={styles.rejectText}>거절</Text></TouchableOpacity><TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item.id)}><Text style={styles.approveText}>승인</Text></TouchableOpacity></View></View>);

  return (<View style={styles.container}><FlatList data={requests} renderItem={renderRequest} keyExtractor={item => item.id} contentContainerStyle={styles.list} /></View>);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f8f9fa' }, list: { padding: 16 }, requestCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }, requestInfo: { flexDirection: 'row', marginBottom: 12 }, avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 }, info: { flex: 1 }, name: { fontSize: 16, fontWeight: '600', marginBottom: 4 }, level: { fontSize: 14, color: '#666', marginBottom: 4 }, message: { fontSize: 14, color: '#999' }, actions: { flexDirection: 'row', gap: 8 }, rejectButton: { flex: 1, borderWidth: 1, borderColor: '#FF3B30', padding: 12, borderRadius: 8, alignItems: 'center' }, rejectText: { color: '#FF3B30', fontWeight: '600' }, approveButton: { flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' }, approveText: { color: '#fff', fontWeight: '600' } });
