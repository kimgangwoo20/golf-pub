// JoinedMeetupsScreen.tsx - 참가한 모임 화면 (수정됨 - 실제 API 연동)

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
import { useAuthStore } from '../../../store/useAuthStore'; // ✅ 추가
// import { bookingAPI } from '../../../services/api/bookingAPI'; // ✅ 추가 (API 준비 시)

type TabType = 'upcoming' | 'completed';

export const JoinedMeetupsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuthStore(); // ✅ useAuthStore 사용
  
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyBookings();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      
      // TODO: 실제 API 호출로 변경
      // const allBookings = await bookingAPI.getBookings();
      // const myBookings = allBookings.filter(booking => 
      //   booking.participants?.some(p => p.userId === user?.id)
      // );
      // setBookings(myBookings);
      
      // 임시 Mock 데이터 (API 준비 전까지)
      const mockJoinedMeetups = [
        {
          id: 1,
          title: '평일 오후 라운딩',
          golfCourse: '남서울CC',
          location: '서울 강남',
          date: '2025.01.30',
          time: '14:00',
          price: 150000,
          currentPlayers: 3,
          maxPlayers: 4,
          status: 'upcoming',
          hostName: '이호스트',
          image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
          hasPub: true,
        },
        {
          id: 2,
          title: '초보 환영 라운딩',
          golfCourse: '대관령CC',
          location: '강원 평창',
          date: '2025.02.05',
          time: '09:00',
          price: 100000,
          currentPlayers: 2,
          maxPlayers: 4,
          status: 'upcoming',
          hostName: '박골프',
          image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400',
          hasPub: false,
        },
        {
          id: 3,
          title: '주말 라운딩 같이 치실 분!',
          golfCourse: '세라지오CC',
          location: '경기 광주',
          date: '2025.01.17',
          time: '10:00',
          price: 120000,
          currentPlayers: 4,
          maxPlayers: 4,
          status: 'completed',
          hostName: '김라운딩',
          image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
          hasPub: true,
        },
        {
          id: 4,
          title: '강원도 겨울 라운딩',
          golfCourse: '하이원CC',
          location: '강원 정선',
          date: '2025.01.10',
          time: '11:00',
          price: 90000,
          currentPlayers: 4,
          maxPlayers: 4,
          status: 'completed',
          hostName: '최겨울',
          image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
          hasPub: false,
        },
      ];
      
      setBookings(mockJoinedMeetups);
    } catch (error) {
      console.error('내 모임 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingMeetups = bookings.filter(m => m.status === 'upcoming');
  const completedMeetups = bookings.filter(m => m.status === 'completed');

  const displayMeetups = activeTab === 'upcoming' ? upcomingMeetups : completedMeetups;

  const handleCardPress = (id: number) => {
    navigation.navigate('Bookings', {
      screen: 'BookingDetail',
      params: { bookingId: id },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
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
              tintColor="#2E7D32"
              colors={['#2E7D32']}
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
                  <Image source={{ uri: meetup.image }} style={styles.meetupImage} />

                  {/* 술집 연계 배지 */}
                  {meetup.hasPub && (
                    <View style={styles.pubBadge}>
                      <Text style={styles.pubBadgeText}>🍺 술집 연계</Text>
                    </View>
                  )}

                  {/* 내용 */}
                  <View style={styles.meetupContent}>
                    <Text style={styles.meetupTitle}>{meetup.title}</Text>
                    <Text style={styles.meetupInfo}>⛳ {meetup.golfCourse}</Text>
                    <Text style={styles.meetupInfo}>📍 {meetup.location}</Text>
                    <Text style={styles.meetupInfo}>📅 {meetup.date} {meetup.time}</Text>
                    <Text style={styles.meetupInfo}>👤 호스트: {meetup.hostName}</Text>

                    <View style={styles.meetupFooter}>
                      <Text style={styles.meetupPrice}>
                        {meetup.price.toLocaleString()}원/인
                      </Text>
                      <Text style={styles.meetupPlayers}>
                        {meetup.currentPlayers}/{meetup.maxPlayers}명
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
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#2E7D32',
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
    color: '#2E7D32',
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
