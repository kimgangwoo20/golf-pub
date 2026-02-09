// BookingListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BookingFilter as FilterType, BookingSortType } from '@/types/booking-types';
import { BookingListItem } from '@/components/booking/BookingListItem';
import { BookingFilter } from '@/components/booking/BookingFilter';
import { useBookingStore } from '@/store/useBookingStore';
import { colors } from '@/styles/theme';

export const BookingListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { bookings, loading, error, loadBookings } = useBookingStore();
  const [filteredBookings, setFilteredBookings] = useState<typeof bookings>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>({});
  const [sortType, setSortType] = useState<BookingSortType>('latest');

  // 화면 포커스 시 자동 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  useEffect(() => {
    applyFiltersAndSort();
  }, [bookings, activeFilter, sortType]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...bookings];
    if (activeFilter.date) {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      if (activeFilter.date === 'today') {
        filtered = filtered.filter((b) => b.date === today);
      } else if (activeFilter.date === 'thisWeek') {
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (b) => b.date >= today && b.date <= weekLater.toISOString().split('T')[0],
        );
      } else if (activeFilter.date === 'thisMonth') {
        const monthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        filtered = filtered.filter(
          (b) => b.date >= today && b.date <= monthLater.toISOString().split('T')[0],
        );
      }
    }
    if (activeFilter.location)
      filtered = filtered.filter((b) => b.location?.includes(activeFilter.location!));
    if (activeFilter.priceRange) {
      const { min, max } = activeFilter.priceRange;
      const getPrice = (b: (typeof bookings)[0]) => b.price.original || b.price.discount || 0;
      filtered = filtered.filter((b) => getPrice(b) >= min && getPrice(b) <= max);
    }
    if (activeFilter.level && activeFilter.level.length > 0) {
      filtered = filtered.filter(
        (b) => (b.level && activeFilter.level!.includes(b.level)) || b.level === 'any',
      );
    }
    if (activeFilter.status && activeFilter.status.length > 0) {
      filtered = filtered.filter((b) => activeFilter.status!.includes(b.status));
    }
    if (activeFilter.hasPub !== undefined) {
      filtered = filtered.filter((b) => b.hasPub === activeFilter.hasPub);
    }
    // 가격 헬퍼: original 우선, 없으면 discount
    const getPrice = (b: (typeof bookings)[0]) => b.price.original || b.price.discount || 0;

    switch (sortType) {
      case 'latest':
        filtered.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return bTime - aTime;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => b.participants.current - a.participants.current);
        break;
      case 'priceLow':
        filtered.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case 'priceHigh':
        filtered.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case 'dateClose':
        filtered.sort((a, b) => a.date.localeCompare(b.date));
        break;
    }
    setFilteredBookings(filtered);
  };

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>부킹 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>😢</Text>
        <Text style={styles.emptyTitle}>불러오기 실패</Text>
        <Text style={styles.emptyDescription}>{error}</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => loadBookings()}>
          <Text style={styles.createButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⛳ 골프 번개</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateBooking' as any)}
          >
            <Text style={styles.createButtonText}>+ 모임 만들기</Text>
          </TouchableOpacity>
        </View>
        <BookingFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortType={sortType}
          onSortChange={setSortType}
        />
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingListItem
              booking={item}
              onPress={() =>
                navigation.navigate('BookingDetail' as any, { bookingId: item.id } as any)
              }
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>😢</Text>
              <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
              <Text style={styles.emptyDescription}>다른 필터로 검색해보세요</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: colors.bgSecondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  listContainer: { padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  emptyDescription: { fontSize: 14, color: colors.textTertiary },
});
