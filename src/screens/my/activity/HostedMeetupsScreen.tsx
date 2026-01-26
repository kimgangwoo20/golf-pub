// HostedMeetupsScreen.tsx - 작성한 모임 (내가 호스트) 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Mock 작성한 모임 데이터
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
    status: 'recruiting', // recruiting, completed, cancelled
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

type TabType = 'recruiting' | 'completed';

export const HostedMeetupsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('recruiting');

  const recruitingMeetups = mockHostedMeetups.filter(m => m.status === 'recruiting');
  const completedMeetups = mockHostedMeetups.filter(m => m.status === 'completed');

  const displayMeetups = activeTab === 'recruiting' ? recruitingMeetups : completedMeetups;

  const handleCardPress = (id: number) => {
    console.log('모임 상세:', id);
    // TODO: BookingDetail 화면으로 이동
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
          onPress: () => console.log('모임 취소:', id),
        },
      ]
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'recruiting') {
      return { text: '모집중', color: '#2E7D32', bgColor: '#E8F5E9' };
    } else if (status === 'completed') {
      return { text: '완료', color: '#666', bgColor: '#F5F5F5' };
    } else {
      return { text: '취소', color: '#FF3B30', bgColor: '#FFE5E5' };
    }
  };

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

        {/* 통계 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockHostedMeetups.length}</Text>
            <Text style={styles.statLabel}>총 작성</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recruitingMeetups.length}</Text>
            <Text style={styles.statLabel}>모집중</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedMeetups.length}</Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
        </View>

        {/* 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recruiting' && styles.activeTab]}
            onPress={() => setActiveTab('recruiting')}
          >
            <Text style={[styles.tabText, activeTab === 'recruiting' && styles.activeTabText]}>
              모집중 ({recruitingMeetups.length})
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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.meetupList}>
            {displayMeetups.length > 0 ? (
              displayMeetups.map((meetup) => {
                const statusBadge = getStatusBadge(meetup.status);

                return (
                  <TouchableOpacity
                    key={meetup.id}
                    style={styles.meetupCard}
                    onPress={() => handleCardPress(meetup.id)}
                  >
                    {/* 이미지 */}
                    <Image source={{ uri: meetup.image }} style={styles.meetupImage} />

                    {/* 상태 배지 */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                      <Text style={[styles.statusText, { color: statusBadge.color }]}>
                        {statusBadge.text}
                      </Text>
                    </View>

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
                        <Text style={styles.meetupPrice}>
                          {meetup.price.toLocaleString()}원/인
                        </Text>
                        <Text style={styles.meetupPlayers}>
                          {meetup.currentPlayers}/{meetup.maxPlayers}명
                        </Text>
                      </View>

                      {/* 호스트 버튼 */}
                      {meetup.status === 'recruiting' && (
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.manageButton]}
                            onPress={() => handleManageParticipants(meetup.id)}
                          >
                            <Text style={styles.manageButtonText}>참가자 관리</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => handleCancelMeetup(meetup.id)}
                          >
                            <Text style={styles.cancelButtonText}>취소</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>😢</Text>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'recruiting' ? '모집중인 모임이 없습니다' : '완료된 모임이 없습니다'}
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
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
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButton: {
    backgroundColor: '#E8F5E9',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
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