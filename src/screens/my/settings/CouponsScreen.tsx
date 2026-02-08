// CouponsScreen.tsx - 쿠폰함 (Firestore 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { profileAPI } from '@/services/api/profileAPI';
import { Coupon } from '@/types/profile-types';

type CouponStatus = 'available' | 'used' | 'expired';

const getCouponStatus = (coupon: Coupon): CouponStatus => {
  if (coupon.isUsed) return 'used';
  if (new Date(coupon.expiryDate) < new Date()) return 'expired';
  return 'available';
};

export const CouponsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<CouponStatus>('available');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const result = await profileAPI.getCoupons();
      setCoupons(result);
    } catch (error) {
      console.error('쿠폰 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCoupons();
    setRefreshing(false);
  }, [loadCoupons]);

  const filteredCoupons = coupons.filter((c) => getCouponStatus(c) === filter);
  const availableCount = coupons.filter((c) => getCouponStatus(c) === 'available').length;

  const getStatusColor = (status: CouponStatus) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'used':
        return '#999';
      case 'expired':
        return '#FF5722';
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discount}% 할인`;
    }
    return `${coupon.discount.toLocaleString()}원 할인`;
  };

  const renderItem = ({ item }: { item: Coupon }) => {
    const status = getCouponStatus(item);
    return (
      <View style={[styles.couponCard, status !== 'available' && styles.couponInactive]}>
        <View style={[styles.couponLeft, { borderLeftColor: getStatusColor(status) }]}>
          <Text style={styles.couponDiscount}>{formatDiscount(item)}</Text>
          <Text style={styles.couponTitle}>{item.name}</Text>
          {item.minAmount && (
            <Text style={styles.couponDesc}>{item.minAmount.toLocaleString()}원 이상 구매 시</Text>
          )}
          <Text style={styles.couponExpiry}>
            유효기간: {new Date(item.expiryDate).toLocaleDateString('ko-KR')}까지
          </Text>
        </View>
        <View style={styles.couponRight}>
          <View style={styles.couponDivider} />
          {status === 'available' && (
            <TouchableOpacity style={styles.useButton}>
              <Text style={styles.useButtonText}>사용</Text>
            </TouchableOpacity>
          )}
          {status === 'used' && <Text style={styles.statusLabel}>사용완료</Text>}
          {status === 'expired' && (
            <Text style={[styles.statusLabel, { color: '#FF5722' }]}>기간만료</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading && coupons.length === 0) {
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>쿠폰을 불러오는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          {(['available', 'used', 'expired'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'available'
                  ? `사용가능 (${availableCount})`
                  : f === 'used'
                    ? '사용완료'
                    : '기간만료'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredCoupons}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
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
  backButton: { padding: 4 },
  backIcon: { fontSize: 32, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  filterRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  couponInactive: { opacity: 0.6 },
  couponLeft: {
    flex: 1,
    padding: 16,
    borderLeftWidth: 4,
  },
  couponDiscount: { fontSize: 18, fontWeight: '800', color: '#10b981', marginBottom: 4 },
  couponTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  couponDesc: { fontSize: 13, color: '#666', marginBottom: 6 },
  couponExpiry: { fontSize: 12, color: '#999' },
  couponRight: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  couponDivider: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  useButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  useButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  statusLabel: { fontSize: 12, fontWeight: '600', color: '#999' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#666' },
});
