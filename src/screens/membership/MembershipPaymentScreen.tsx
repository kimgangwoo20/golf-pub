import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const MembershipPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const params = route.params as any;
  const { plan, billingCycle, price } = params || {};

  const handlePayment = () => {
    // 결제 처리 로직 (Toss Payments 연동)
    Alert.alert(
      '결제 진행',
      '결제를 진행하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            // TODO: 실제 결제 API 호출
            setTimeout(() => {
              navigation.navigate('MembershipSuccess' as never);
            }, 1000);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>멤버십 플랜</Text>
              <Text style={styles.value}>{plan}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>결제 주기</Text>
              <Text style={styles.value}>{billingCycle === 'MONTHLY' ? '월간' : '연간'}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>결제 금액</Text>
              <Text style={styles.totalValue}>{price?.toLocaleString()}원</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'card' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={styles.methodText}>💳 신용/체크카드</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'account' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('account')}
          >
            <Text style={styles.methodText}>🏦 계좌이체</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handlePayment}>
          <Text style={styles.buttonText}>결제하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  totalRow: { borderBottomWidth: 0, marginTop: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  methodCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#e0e0e0' },
  methodCardActive: { borderColor: '#10b981', backgroundColor: '#F0F8FF' },
  methodText: { fontSize: 16, fontWeight: '600' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  button: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
