import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ComparisonTable } from '../../components/membership/ComparisonTable';

export const PlanComparisonScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>플랜 비교</Text>
          <Text style={styles.subtitle}>
            각 멤버십의 차이점을 한눈에 확인하세요
          </Text>
        </View>

        <View style={styles.tableContainer}>
          <ComparisonTable />
        </View>

        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>💡 참고사항</Text>
          <Text style={styles.noteText}>
            • 모든 멤버십은 언제든 변경 및 해지 가능합니다{'\n'}
            • 연간 결제 시 17% 할인 혜택이 적용됩니다{'\n'}
            • VIP 회원은 모든 프리미엄 혜택이 포함됩니다{'\n'}
            • 포인트는 매월 자동으로 적립됩니다
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MembershipPlan' as never)}
        >
          <Text style={styles.buttonText}>플랜 선택하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  tableContainer: {
    padding: 20,
  },
  noteContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
