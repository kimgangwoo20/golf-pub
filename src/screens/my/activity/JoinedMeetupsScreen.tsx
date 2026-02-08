// JoinedMeetupsScreen.tsx - 참가한 모임 화면 (Firestore 연동)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyJoinedBookings } from '@/services/firebase/firebaseBooking';

type TabType = 'upcoming' | 'completed';

export const JoinedMeetupsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyBookings = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const result = await getMyJoinedBookings(user.uid);
      setBookings(result);
    } catch (error) {
      console.error('내 모임 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyBookings();
    setRefreshing(false);
  }, [loadMyBookings]);

  useEffect(() => {
    loadMyBookings();
  }, [loadMyBookings]);

  // status 매핑: Firestore OPEN → upcoming, COMPLETED/CLOSED → completed
  const upcomingMeetups = bookings.filter((m) => m.status === 'OPEN' || m.status === 'upcoming');
  const completedMeetups = bookings.filter(
    (m) => m.status === 'COMPLETED' || m.status === 'CLOSED' || m.status === 'completed',
  );

  const displayMeetups = activeTab === 'upcoming' ? upcomingMeetups : completedMeetups;

  const handleCardPress = (id: string) => {
    navigation.navigate('Bookings', {
      screen: 'BookingDetail',
      params: { bookingId: id },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>내 모임을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>참가한 모임</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              예정 ({upcomingMeetups.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              완료 ({completedMeetups.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
        >
          <View style={styles.meetupList}>
            {displayMeetups.length > 0 ? (
              displayMeetups.map((meetup) => (
                <TouchableOpacity
                  key={meetup.id}
                  style={styles.meetupCard}
                  onPress={() => handleCardPress(meetup.id)}
                >
                  {/* 이미지 */}
                  {meetup.image && (
                    <Image source={{ uri: meetup.image }} style={styles.meetupImage} />
                  )}

                  {/* 술집 연계 배지 */}
                  {meetup.hasPub && (
                    <View style={styles.pubBadge}>
                      <Text style={styles.pubBadgeText}>🍺 술집 연계</Text>
                    </View>
                  )}

                  {/* 내용 */}
                  <View style={styles.meetupContent}>
                    <Text style={styles.meetupTitle}>{meetup.title}</Text>
                    <Text style={styles.meetupInfo}>⛳ {meetup.course}</Text>
                    {meetup.location && <Text style={styles.meetupInfo}>📍 {meetup.location}</Text>}
                    <Text style={styles.meetupInfo}>
                      📅 {meetup.date} {meetup.time}
                    </Text>
                    {meetup.host?.name && (
                      <Text style={styles.meetupInfo}>👤 호스트: {meetup.host.name}</Text>
                    )}

                    <View style={styles.meetupFooter}>
                      <Text style={styles.meetupPrice}>
                        {(meetup.price?.original || 0).toLocaleString()}원/인
                      </Text>
                      <Text style={styles.meetupPlayers}>
                        {meetup.participants?.current || 0}/{meetup.participants?.max || 4}명
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>😢</Text>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'upcoming' ? '예정된 모임이 없습니다' : '완료된 모임이 없습니다'}
                </Text>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#10b981',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  meetupList: {
    padding: 16,
    gap: 12,
  },
  meetupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  meetupImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5E5',
  },
  pubBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pubBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  meetupContent: {
    padding: 16,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  meetupInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  meetupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  meetupPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  meetupPlayers: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
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
