// PaymentHistoryScreen.tsx - 결제 내역 조회 화면

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight } from '@/styles/theme';
import { paymentAPI, PaymentRecord } from '@/services/api/paymentAPI';

// 결제 상태별 라벨 & 색상
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: '결제 완료', color: '#10b981' },
  CANCELED: { label: '취소', color: '#ef4444' },
  PARTIAL_CANCELED: { label: '부분 취소', color: '#f59e0b' },
  FAILED: { label: '실패', color: '#94a3b8' },
};

// 날짜 포맷
const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${min}`;
};

// 금액 포맷
const formatAmount = (amount: number): string => {
  return `${amount.toLocaleString('ko-KR')}원`;
};

const PaymentItem: React.FC<{ item: PaymentRecord }> = ({ item }) => {
  const status = STATUS_MAP[item.status] || STATUS_MAP.FAILED;

  return (
    <View style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentTitle} numberOfLines={1}>
          {item.bookingTitle || `주문 ${item.orderId}`}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.paymentAmount}>{formatAmount(item.amount)}</Text>
      {item.cancelAmount && item.cancelAmount > 0 && (
        <Text style={styles.cancelAmount}>환불: -{formatAmount(item.cancelAmount)}</Text>
      )}
      <Text style={styles.paymentDate}>{formatDate(item.createdAt)}</Text>
      {item.cancelReason && (
        <Text style={styles.cancelReason}>취소 사유: {item.cancelReason}</Text>
      )}
    </View>
  );
};

export const PaymentHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      const result = await paymentAPI.getPaymentHistory(50);
      setPayments(result);
    } catch (error: any) {
      console.error('결제 내역 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPayments();
  }, [loadPayments]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyTitle}>결제 내역이 없습니다</Text>
      <Text style={styles.emptySubtitle}>골프 모임에 참여하면 결제 내역이 여기에 표시됩니다.</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'<'} 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>결제 내역</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          data={payments}
          renderItem={({ item }) => <PaymentItem item={item} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          contentContainerStyle={payments.length === 0 ? styles.emptyList : undefined}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold as any,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
  },
  paymentItem: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as any,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold as any,
  },
  paymentAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cancelAmount: {
    fontSize: fontSize.sm,
    color: '#ef4444',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  cancelReason: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
