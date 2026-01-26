// PointHistoryScreen.tsx - 포인트 내역 화면

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Mock 포인트 내역 데이터
const mockPointHistory = [
  {
    id: 1,
    type: 'earn',
    amount: 5000,
    description: '모임 참가 완료',
    date: '2025.01.20',
  },
  {
    id: 2,
    type: 'spend',
    amount: -3000,
    description: '쿠폰 구매',
    date: '2025.01.18',
  },
  {
    id: 3,
    type: 'earn',
    amount: 2000,
    description: '후기 작성',
    date: '2025.01.15',
  },
  {
    id: 4,
    type: 'earn',
    amount: 10000,
    description: '신규 가입 보너스',
    date: '2025.01.10',
  },
  {
    id: 5,
    type: 'spend',
    amount: -5000,
    description: '모임 참가 결제',
    date: '2025.01.08',
  },
  {
    id: 6,
    type: 'earn',
    amount: 3000,
    description: '친구 추천',
    date: '2025.01.05',
  },
  {
    id: 7,
    type: 'earn',
    amount: 1000,
    description: '출석 체크',
    date: '2025.01.03',
  },
  {
    id: 8,
    type: 'spend',
    amount: -2000,
    description: '프로필 뱃지 구매',
    date: '2025.01.01',
  },
];

export const PointHistoryScreen: React.FC = () => {
  const navigation = useNavigation();

  const currentPoints = 15000;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>포인트 내역</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 현재 포인트 */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>보유 포인트</Text>
          <Text style={styles.balanceAmount}>{currentPoints.toLocaleString()}P</Text>
        </View>

        {/* 포인트 내역 */}
        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
          <View style={styles.historyContainer}>
            {mockPointHistory.map((item, index) => (
              <View key={item.id}>
                <View style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDescription}>{item.description}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={[
                    styles.historyAmount,
                    item.type === 'earn' ? styles.earnAmount : styles.spendAmount
                  ]}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                  </Text>
                </View>
                {index < mockPointHistory.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  balanceCard: {
    backgroundColor: '#2E7D32',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E8F5E9',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  historyList: {
    flex: 1,
  },
  historyContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  historyLeft: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: '#999',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  earnAmount: {
    color: '#2E7D32',
  },
  spendAmount: {
    color: '#FF3B30',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});