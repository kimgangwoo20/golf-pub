// PointHistoryScreen.tsx - 포인트 내역
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface PointItem {
  id: string;
  type: 'earn' | 'use';
  title: string;
  description: string;
  amount: number;
  date: string;
  balance: number;
}

const MOCK_POINTS: PointItem[] = [
  { id: '1', type: 'earn', title: '라운딩 완료 보상', description: '남서울CC 라운딩', amount: 500, date: '2025-01-15', balance: 3500 },
  { id: '2', type: 'use', title: '쿠폰 교환', description: '골프공 1더즌 쿠폰', amount: -2000, date: '2025-01-14', balance: 3000 },
  { id: '3', type: 'earn', title: '출석 체크', description: '7일 연속 출석', amount: 100, date: '2025-01-13', balance: 5000 },
  { id: '4', type: 'earn', title: '리뷰 작성 보상', description: '블루원CC 리뷰', amount: 200, date: '2025-01-12', balance: 4900 },
  { id: '5', type: 'use', title: '부킹 할인 사용', description: '주말 부킹 할인', amount: -1000, date: '2025-01-11', balance: 4700 },
  { id: '6', type: 'earn', title: '친구 초대 보상', description: '이민지님 초대', amount: 1000, date: '2025-01-10', balance: 5700 },
  { id: '7', type: 'earn', title: '라운딩 완료 보상', description: '파주CC 라운딩', amount: 500, date: '2025-01-09', balance: 4700 },
  { id: '8', type: 'use', title: '포인트 결제', description: '중고 퍼터 구매', amount: -3000, date: '2025-01-08', balance: 4200 },
];

export const PointHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'all' | 'earn' | 'use'>('all');

  const totalPoints = 3500;

  const filteredPoints = filter === 'all'
    ? MOCK_POINTS
    : MOCK_POINTS.filter(p => p.type === filter);

  const renderItem = ({ item }: { item: PointItem }) => (
    <View style={styles.pointItem}>
      <View style={styles.pointLeft}>
        <View style={[styles.typeIndicator, item.type === 'earn' ? styles.earnIndicator : styles.useIndicator]} />
        <View>
          <Text style={styles.pointTitle}>{item.title}</Text>
          <Text style={styles.pointDesc}>{item.description}</Text>
          <Text style={styles.pointDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.pointRight}>
        <Text style={[styles.pointAmount, item.type === 'earn' ? styles.earnAmount : styles.useAmount]}>
          {item.type === 'earn' ? '+' : ''}{item.amount.toLocaleString()}P
        </Text>
        <Text style={styles.pointBalance}>잔액 {item.balance.toLocaleString()}P</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>포인트 내역</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>보유 포인트</Text>
          <Text style={styles.totalAmount}>{totalPoints.toLocaleString()}P</Text>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'earn', 'use'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? '전체' : f === 'earn' ? '적립' : '사용'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredPoints}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>포인트 내역이 없습니다</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E5E5',
  },
  backButton: { padding: 4 },
  backIcon: { fontSize: 32, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  totalCard: {
    backgroundColor: '#7C3AED', margin: 16, padding: 24, borderRadius: 16, alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '800', color: '#fff' },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E5E5',
  },
  filterButtonActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  pointItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 12,
  },
  pointLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  earnIndicator: { backgroundColor: '#4CAF50' },
  useIndicator: { backgroundColor: '#FF5722' },
  pointTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  pointDesc: { fontSize: 13, color: '#666', marginBottom: 2 },
  pointDate: { fontSize: 12, color: '#999' },
  pointRight: { alignItems: 'flex-end' },
  pointAmount: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  earnAmount: { color: '#4CAF50' },
  useAmount: { color: '#FF5722' },
  pointBalance: { fontSize: 12, color: '#999' },
  separator: { height: 8 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#666' },
});
