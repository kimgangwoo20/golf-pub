// PointHistoryScreen.tsx - 포인트 내역 (Firestore 연동)
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
import { useAuthStore } from '@/store/useAuthStore';
import { profileAPI } from '@/services/api/profileAPI';
import { Point } from '@/types/profile-types';

export const PointHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend'>('all');
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const totalPoints = (user as any)?.pointBalance || 0;

  const loadPoints = useCallback(async () => {
    try {
      setLoading(true);
      const result = await profileAPI.getPointHistory(50);
      setPoints(result);
    } catch (error) {
      console.error('포인트 내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoints();
  }, [loadPoints]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPoints();
    setRefreshing(false);
  }, [loadPoints]);

  const filteredPoints = filter === 'all' ? points : points.filter((p) => p.type === filter);

  const renderItem = ({ item }: { item: Point }) => {
    const isEarn = item.type === 'earn';
    return (
      <View style={styles.pointItem}>
        <View style={styles.pointLeft}>
          <View
            style={[styles.typeIndicator, isEarn ? styles.earnIndicator : styles.useIndicator]}
          />
          <View>
            <Text style={styles.pointTitle}>
              {item.description || (isEarn ? '포인트 적립' : '포인트 사용')}
            </Text>
            <Text style={styles.pointDate}>
              {item.date ? new Date(item.date).toLocaleDateString('ko-KR') : ''}
            </Text>
          </View>
        </View>
        <View style={styles.pointRight}>
          <Text style={[styles.pointAmount, isEarn ? styles.earnAmount : styles.useAmount]}>
            {isEarn ? '+' : ''}
            {item.amount.toLocaleString()}P
          </Text>
        </View>
      </View>
    );
  };

  if (loading && points.length === 0) {
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>포인트 내역을 불러오는 중...</Text>
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
          <Text style={styles.headerTitle}>포인트 내역</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>보유 포인트</Text>
          <Text style={styles.totalAmount}>{totalPoints.toLocaleString()}P</Text>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'earn', 'spend'] as const).map((f) => (
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
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  totalCard: {
    backgroundColor: '#10b981',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '800', color: '#fff' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  pointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  pointLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  earnIndicator: { backgroundColor: '#4CAF50' },
  useIndicator: { backgroundColor: '#FF5722' },
  pointTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  pointDate: { fontSize: 12, color: '#999' },
  pointRight: { alignItems: 'flex-end' },
  pointAmount: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  earnAmount: { color: '#4CAF50' },
  useAmount: { color: '#FF5722' },
  separator: { height: 8 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#666' },
});
