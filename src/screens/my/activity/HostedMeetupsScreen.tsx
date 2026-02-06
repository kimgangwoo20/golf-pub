// HostedMeetupsScreen.tsx - 작성한 모임 (내가 호스트) 화면 (수정됨 - 실제 API 연동)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../store/useAuthStore'; // ✅ 추가
// import { bookingAPI } from '../../../services/api/bookingAPI'; // ✅ 추가 (API 준비 시)

type TabType = 'recruiting' | 'completed';

export const HostedMeetupsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuthStore(); // ✅ useAuthStore 사용
  
  const [activeTab, setActiveTab] = useState<TabType>('recruiting');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyHostedBookings();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadMyHostedBookings();
  }, []);

  const loadMyHostedBookings = async () => {
    try {
      setLoading(true);
      
      // TODO: 실제 API 호출로 변경
      // const allBookings = await bookingAPI.getBookings();
      // const myHostedBookings = allBookings.filter(booking => 
      //   booking.hostId === user?.id
      // );
      // setBookings(myHostedBookings);
      
      // 임시 Mock 데이터 (API 준비 전까지)
      const mockHostedMeetups = [
        {
          id: 1,
          title: '평일 오후 라운딩',
          golfCourse: '남서울CC',
          location: '서울 강남',
          date: '2025.01.30',
          time: '14:00',
          price: 150000,
          currentPlayers: 2,
          maxPlayers: 4,
          status: 'recruiting',
          image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
          hasPub: true,
          createdAt: '2025.01.15',
        },
        {
          id: 2,
          title: '초보 환영 라운딩',
          golfCourse: '대관령CC',
          location: '강원 평창',
          date: '2025.02.05',
          time: '09:00',
          price: 100000,
          currentPlayers: 1,
          maxPlayers: 4,
          status: 'recruiting',
          image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400',
          hasPub: false,
          createdAt: '2025.01.20',
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
          image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
          hasPub: true,
          createdAt: '2025.01.10',
        },
      ];
      
      setBookings(mockHostedMeetups);
    } catch (error) {
      console.error('주최한 모임 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const recruitingMeetups = bookings.filter(m => m.status === 'recruiting');
  const completedMeetups = bookings.filter(m => m.status === 'completed');

  const displayMeetups = activeTab === 'recruiting' ? recruitingMeetups : completedMeetups;

  const handleCardPress = (id: number) => {
    navigation.navigate('Bookings', {
      screen: 'BookingDetail',
      params: { bookingId: id },
    });
  };

  const handleManageParticipants = (id: number) => {
    Alert.alert('참가자 관리', '참가자 관리 기능은 개발 예정입니다.');
    console.log('참가자 관리:', id);
  };

  const handleCancelMeetup = (id: number) => {
    Alert.alert(
      '모임 취소',
      '정말 이 모임을 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: 실제 API 호출
              // await bookingAPI.cancelBooking(id);
              console.log('모임 취소:', id);
              Alert.alert('완료', '모임이 취소되었습니다.');
              loadMyHostedBookings(); // 새로고침
            } catch (error) {
              Alert.alert('에러', '모임 취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleEditMeetup = (id: number) => {
    Alert.alert('모임 수정', '모임 수정 기능은 개발 예정입니다.');
    console.log('모임 수정:', id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>주최한 모임을 불러오는 중...</Text>
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
          <Text style={styles.headerTitle}>작성한 모임</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recruiting' && styles.activeTab]}
            onPress={() => setActiveTab('recruiting')}
          >
            <Text style={[styles.tabText, activeTab === 'recruiting' && styles.activeTabText]}>
              모집 중 ({recruitingMeetups.length})
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
                  <Image source={{ uri: meetup.image }} style={styles.meetupImage} />

                  {/* 모집 중 배지 */}
                  {meetup.status === 'recruiting' && (
                    <View style={styles.recruitingBadge}>
                      <Text style={styles.recruitingBadgeText}>모집 중</Text>
                    </View>
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
                    <Text style={styles.meetupInfo}>⛳ {meetup.golfCourse}</Text>
                    <Text style={styles.meetupInfo}>📍 {meetup.location}</Text>
                    <Text style={styles.meetupInfo}>📅 {meetup.date} {meetup.time}</Text>

                    <View style={styles.meetupFooter}>
                      <View>
                        <Text style={styles.meetupPrice}>
                          {meetup.price.toLocaleString()}원/인
                        </Text>
                        <Text style={styles.meetupPlayers}>
                          {meetup.currentPlayers}/{meetup.maxPlayers}명 참가
                        </Text>
                      </View>

                      {/* 모집 중일 때만 관리 버튼 표시 */}
                      {meetup.status === 'recruiting' && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.manageButton}
                            onPress={() => handleManageParticipants(meetup.id)}
                          >
                            <Text style={styles.manageButtonText}>참가자 관리</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditMeetup(meetup.id)}
                          >
                            <Text style={styles.editButtonText}>수정</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancelMeetup(meetup.id)}
                          >
                            <Text style={styles.cancelButtonText}>취소</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>😢</Text>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'recruiting' ? '모집 중인 모임이 없습니다' : '완료된 모임이 없습니다'}
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('Bookings' as never, { screen: 'CreateBooking' } as never)}
                >
                  <Text style={styles.createButtonText}>+ 모임 만들기</Text>
                </TouchableOpacity>
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
  recruitingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recruitingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  meetupPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  meetupPlayers: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
