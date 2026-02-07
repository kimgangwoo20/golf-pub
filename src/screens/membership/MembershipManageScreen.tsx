import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MembershipBadge } from '@/components/membership/MembershipBadge';
import { MembershipType } from '@/types/membership';

export const MembershipManageScreen: React.FC = () => {
  const currentMembership = {
    type: MembershipType.PREMIUM,
    startDate: '2024-01-01',
    nextBillingDate: '2024-02-01',
    autoRenew: true,
  };

  const handleCancelSubscription = () => {
    Alert.alert('구독 해지', '정말 구독을 해지하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '해지', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>현재 멤버십</Text>
        <View style={styles.badgeContainer}>
          <MembershipBadge type={currentMembership.type} size="large" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>시작일</Text>
          <Text style={styles.value}>{currentMembership.startDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>다음 결제일</Text>
          <Text style={styles.value}>{currentMembership.nextBillingDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>자동 갱신</Text>
          <Text style={styles.value}>{currentMembership.autoRenew ? 'ON' : 'OFF'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>플랜 변경</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleCancelSubscription}>
        <Text style={[styles.buttonText, styles.dangerText]}>구독 해지</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  badgeContainer: { alignItems: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  button: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dangerButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#FF3B30' },
  dangerText: { color: '#FF3B30' },
});
