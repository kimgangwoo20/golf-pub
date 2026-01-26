// CouponScreen.tsx - 쿠폰함 화면

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Mock 쿠폰 데이터
const mockCoupons = [
  {
    id: 1,
    name: '신규 가입 축하 쿠폰',
    discount: 10000,
    discountType: 'fixed',
    minAmount: 50000,
    expiryDate: '2025.02.28',
    isUsed: false,
  },
  {
    id: 2,
    name: '20% 할인 쿠폰',
    discount: 20,
    discountType: 'percent',
    minAmount: 30000,
    expiryDate: '2025.03.15',
    isUsed: false,
  },
  {
    id: 3,
    name: '5,000원 할인 쿠폰',
    discount: 5000,
    discountType: 'fixed',
    minAmount: 20000,
    expiryDate: '2025.02.01',
    isUsed: false,
  },
  {
    id: 4,
    name: '15% 할인 쿠폰',
    discount: 15,
    discountType: 'percent',
    minAmount: 50000,
    expiryDate: '2025.01.20',
    isUsed: true,
  },
];

export const CouponScreen: React.FC = () => {
  const navigation = useNavigation();

  const availableCoupons = mockCoupons.filter(c => !c.isUsed);
  const usedCoupons = mockCoupons.filter(c => c.isUsed);

  const handleUseCoupon = (coupon: typeof mockCoupons[0]) => {
    Alert.alert(
      '쿠폰 사용',
      `${coupon.name}을(를) 사용하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '사용',
          onPress: () => Alert.alert('쿠폰 사용', '쿠폰이 적용되었습니다.'),
        },
      ]
    );
  };

  const renderCoupon = (coupon: typeof mockCoupons[0], isUsed: boolean) => {
    const discountText = coupon.discountType === 'fixed'
      ? `${coupon.discount.toLocaleString()}원`
      : `${coupon.discount}%`;

    return (
      <View key={coupon.id} style={[styles.couponCard, isUsed && styles.usedCoupon]}>
        <View style={styles.couponLeft}>
          <View style={[styles.discountBadge, isUsed && styles.usedBadge]}>
            <Text style={[styles.discountText, isUsed && styles.usedText]}>
              {discountText}
            </Text>
          </View>
        </View>

        <View style={styles.couponRight}>
          <Text style={[styles.couponName, isUsed && styles.usedText]}>
            {coupon.name}
          </Text>
          <Text style={[styles.couponCondition, isUsed && styles.usedText]}>
            {coupon.minAmount.toLocaleString()}원 이상 구매 시
          </Text>
          <Text style={[styles.couponExpiry, isUsed && styles.usedText]}>
            {isUsed ? '사용 완료' : `${coupon.expiryDate}까지`}
          </Text>
        </View>

        {!isUsed && (
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => handleUseCoupon(coupon)}
          >
            <Text style={styles.useButtonText}>사용</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>쿠폰함</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 사용 가능한 쿠폰 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              사용 가능한 쿠폰 ({availableCoupons.length}장)
            </Text>
            <View style={styles.couponList}>
              {availableCoupons.length > 0 ? (
                availableCoupons.map(coupon => renderCoupon(coupon, false))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>😢</Text>
                  <Text style={styles.emptyTitle}>사용 가능한 쿠폰이 없습니다</Text>
                </View>
              )}
            </View>
          </View>

          {/* 사용한 쿠폰 */}
          {usedCoupons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                사용한 쿠폰 ({usedCoupons.length}장)
              </Text>
              <View style={styles.couponList}>
                {usedCoupons.map(coupon => renderCoupon(coupon, true))}
              </View>
            </View>
          )}

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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  couponList: {
    gap: 12,
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  usedCoupon: {
    opacity: 0.5,
  },
  couponLeft: {
    marginRight: 16,
    justifyContent: 'center',
  },
  discountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  usedBadge: {
    backgroundColor: '#F5F5F5',
  },
  discountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  couponRight: {
    flex: 1,
    justifyContent: 'center',
  },
  couponName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  couponCondition: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  couponExpiry: {
    fontSize: 12,
    color: '#999',
  },
  usedText: {
    color: '#999',
  },
  useButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 20,
    alignSelf: 'center',
  },
  useButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
});