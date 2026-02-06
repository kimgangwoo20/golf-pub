// CouponsScreen.tsx - 쿠폰함
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

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiry: string;
  status: 'available' | 'used' | 'expired';
  code: string;
}

const MOCK_COUPONS: Coupon[] = [
  { id: '1', title: '신규 가입 축하 쿠폰', description: '첫 부킹 시 사용 가능', discount: '10,000원 할인', expiry: '2025-03-31', status: 'available', code: 'WELCOME10K' },
  { id: '2', title: '라운딩 할인 쿠폰', description: '주중 라운딩 전용', discount: '15% 할인', expiry: '2025-02-28', status: 'available', code: 'WEEKDAY15' },
  { id: '3', title: '골프용품 할인', description: '중고거래 구매 시 사용', discount: '5,000원 할인', expiry: '2025-04-30', status: 'available', code: 'MARKET5K' },
  { id: '4', title: '친구 초대 보상 쿠폰', description: '부킹 시 사용 가능', discount: '20% 할인', expiry: '2025-01-31', status: 'expired', code: 'INVITE20' },
  { id: '5', title: '설날 특별 쿠폰', description: '전 골프장 사용 가능', discount: '30,000원 할인', expiry: '2025-01-10', status: 'used', code: 'NEWYEAR30K' },
];

export const CouponsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'available' | 'used' | 'expired'>('available');

  const filteredCoupons = MOCK_COUPONS.filter(c => c.status === filter);

  const getStatusColor = (status: Coupon['status']) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'used': return '#999';
      case 'expired': return '#FF5722';
    }
  };

  const renderItem = ({ item }: { item: Coupon }) => (
    <View style={[styles.couponCard, item.status !== 'available' && styles.couponInactive]}>
      <View style={[styles.couponLeft, { borderLeftColor: getStatusColor(item.status) }]}>
        <Text style={styles.couponDiscount}>{item.discount}</Text>
        <Text style={styles.couponTitle}>{item.title}</Text>
        <Text style={styles.couponDesc}>{item.description}</Text>
        <Text style={styles.couponExpiry}>유효기간: {item.expiry}까지</Text>
      </View>
      <View style={styles.couponRight}>
        <View style={[styles.couponDivider]} />
        <Text style={styles.couponCode}>{item.code}</Text>
        {item.status === 'available' && (
          <TouchableOpacity style={styles.useButton}>
            <Text style={styles.useButtonText}>사용</Text>
          </TouchableOpacity>
        )}
        {item.status === 'used' && <Text style={styles.statusLabel}>사용완료</Text>}
        {item.status === 'expired' && <Text style={[styles.statusLabel, { color: '#FF5722' }]}>기간만료</Text>}
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
          <Text style={styles.headerTitle}>쿠폰함</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.filterRow}>
          {(['available', 'used', 'expired'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'available' ? `사용가능 (${MOCK_COUPONS.filter(c => c.status === 'available').length})` : f === 'used' ? '사용완료' : '기간만료'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredCoupons}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎫</Text>
              <Text style={styles.emptyText}>쿠폰이 없습니다</Text>
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
  filterRow: {
    flexDirection: 'row', padding: 16, gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E5E5',
  },
  filterButtonActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  couponCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  couponInactive: { opacity: 0.6 },
  couponLeft: {
    flex: 1, padding: 16, borderLeftWidth: 4,
  },
  couponDiscount: { fontSize: 18, fontWeight: '800', color: '#10b981', marginBottom: 4 },
  couponTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  couponDesc: { fontSize: 13, color: '#666', marginBottom: 6 },
  couponExpiry: { fontSize: 12, color: '#999' },
  couponRight: {
    width: 80, alignItems: 'center', justifyContent: 'center', padding: 12,
  },
  couponDivider: {
    position: 'absolute', left: 0, top: 12, bottom: 12, width: 1,
    borderLeftWidth: 1, borderLeftColor: '#E5E5E5', borderStyle: 'dashed',
  },
  couponCode: { fontSize: 10, color: '#999', marginBottom: 8 },
  useButton: {
    backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12,
  },
  useButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  statusLabel: { fontSize: 12, fontWeight: '600', color: '#999' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#666' },
});
