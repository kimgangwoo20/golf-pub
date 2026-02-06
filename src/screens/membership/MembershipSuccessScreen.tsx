import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const MembershipSuccessScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🎉</Text>
        <Text style={styles.title}>구독 완료!</Text>
        <Text style={styles.message}>
          프리미엄 멤버십 구독이{'\n'}성공적으로 완료되었습니다
        </Text>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>이제 다음 혜택을 이용하실 수 있어요</Text>
          <View style={styles.benefitRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.benefitText}>무제한 부킹 참가</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.benefitText}>무제한 채팅</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.benefitText}>골프장 예약</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.benefitText}>매월 5,000P 적립</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home' as never, { screen: 'HomeMain' } as never)}
        >
          <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  message: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  benefitsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 350 },
  benefitsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  check: { fontSize: 18, color: '#4CAF50', marginRight: 12 },
  benefitText: { fontSize: 14, color: '#333' },
  footer: { padding: 20 },
  button: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
