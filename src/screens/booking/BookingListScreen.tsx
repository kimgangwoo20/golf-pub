// BookingListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, RefreshControl, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Booking, BookingFilter as FilterType, BookingSortType } from '../../types/booking-types';
import { BookingListItem } from '../../components/booking/BookingListItem';
import { BookingFilter } from '../../components/booking/BookingFilter';
import { colors } from '../../styles/theme';

export const BookingListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>({});
  const [sortType, setSortType] = useState<BookingSortType>('latest');

  useEffect(() => { loadBookings(); }, []);
  useEffect(() => { applyFiltersAndSort(); }, [bookings, activeFilter, sortType]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const mockBookings: Booking[] = [
        {
          id: 1, title: '주말 라운딩 같이 치실 분!', golfCourse: '세라지오CC', location: '경기 광주',
          date: '2025-01-18', time: '08:00', maxPlayers: 4, currentPlayers: 2, price: 120000,
          level: 'intermediate', status: 'open', description: '주말 아침 상쾌하게 라운딩하실 분 찾습니다!',
          image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
          participants: [
            { id: 1, avatar: 'https://i.pravatar.cc/150?img=12' },
            { id: 2, avatar: 'https://i.pravatar.cc/150?img=25' },
          ], hasPub: false,
        },
        {
          id: 2, title: '프로 동행 레슨 라운딩', golfCourse: '남서울CC', location: '경기 성남',
          date: '2025-01-20', time: '14:00', maxPlayers: 4, currentPlayers: 3, price: 150000,
          level: 'beginner', status: 'open', description: '초보자도 환영합니다! 친절하게 가르쳐드려요.',
          image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
          participants: [
            { id: 3, avatar: 'https://i.pravatar.cc/150?img=33' },
            { id: 4, avatar: 'https://i.pravatar.cc/150?img=44' },
            { id: 5, avatar: 'https://i.pravatar.cc/150?img=55' },
          ], hasPub: false,
        },
        {
          id: 3, title: '강원도 출장 골프 번개!', golfCourse: '대관령CC', location: '강원 평창',
          date: '2025-01-17', time: '10:00', maxPlayers: 4, currentPlayers: 4, price: 100000,
          level: 'any', status: 'full', description: '강원도 출장 중 골프 번개 모임!',
          image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800',
          participants: [
            { id: 1, avatar: 'https://i.pravatar.cc/150?img=1' },
            { id: 2, avatar: 'https://i.pravatar.cc/150?img=2' },
            { id: 3, avatar: 'https://i.pravatar.cc/150?img=3' },
            { id: 4, avatar: 'https://i.pravatar.cc/150?img=4' },
          ], hasPub: true, pubName: '골프 Pub 횡성점', pubTime: '19:00',
        },
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('부킹 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  };

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
        filtered = filtered.filter(b => b.date === today);
      } else if (activeFilter.date === 'thisWeek') {
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(b => b.date >= today && b.date <= weekLater.toISOString().split('T')[0]);
      } else if (activeFilter.date === 'thisMonth') {
        const monthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        filtered = filtered.filter(b => b.date >= today && b.date <= monthLater.toISOString().split('T')[0]);
      }
    }
    if (activeFilter.location) filtered = filtered.filter(b => b.location.includes(activeFilter.location!));
    if (activeFilter.priceRange) {
      const { min, max } = activeFilter.priceRange;
      filtered = filtered.filter(b => b.price >= min && b.price <= max);
    }
    if (activeFilter.level && activeFilter.level.length > 0) {
      filtered = filtered.filter(b => activeFilter.level!.includes(b.level) || b.level === 'any');
    }
    if (activeFilter.status && activeFilter.status.length > 0) {
      filtered = filtered.filter(b => activeFilter.status!.includes(b.status));
    }
    if (activeFilter.hasPub !== undefined) {
      filtered = filtered.filter(b => b.hasPub === activeFilter.hasPub);
    }
    switch (sortType) {
      case 'latest': filtered.sort((a, b) => b.id - a.id); break;
      case 'popular': filtered.sort((a, b) => b.currentPlayers - a.currentPlayers); break;
      case 'priceLow': filtered.sort((a, b) => a.price - b.price); break;
      case 'priceHigh': filtered.sort((a, b) => b.price - a.price); break;
      case 'dateClose': filtered.sort((a, b) => a.date.localeCompare(b.date)); break;
    }
    setFilteredBookings(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>부킹 목록을 불러오는 중...</Text>
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
            onPress={() => navigation.navigate('CreateBooking' as never)}
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
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BookingListItem
              booking={item}
              onPress={() => navigation.navigate('BookingDetail' as never, { bookingId: item.id } as never)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  createButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  listContainer: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgSecondary },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  emptyDescription: { fontSize: 14, color: colors.textTertiary },
});