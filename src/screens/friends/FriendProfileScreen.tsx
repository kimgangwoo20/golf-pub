// FriendProfileScreen.tsx - 친구 프로필 화면

import React from 'react';
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

// Mock 친구 상세 데이터
const mockFriendProfile = {
  id: 1,
  name: '김철수',
  image: 'https://i.pravatar.cc/150?img=12',
  handicap: 18,
  location: '서울 강남구',
  bio: '주말 골퍼입니다. 평균 스코어 90대 초반이고, 편하게 라운딩하는 걸 좋아합니다!',
  joinedDate: '2024.06.15',
  friendsSince: '2025.01.15',
  mutualFriends: 5,
  stats: {
    totalMeetups: 12,
    totalRounds: 28,
    averageScore: 92,
  },
  recentMeetups: [
    {
      id: 1,
      title: '주말 오전 라운딩',
      course: '남서울CC',
      date: '2025.01.20',
    },
    {
      id: 2,
      title: '평일 조인',
      course: '레이크우드CC',
      date: '2025.01.10',
    },
    {
      id: 3,
      title: '신년 라운딩',
      course: '안양CC',
      date: '2025.01.02',
    },
  ],
};

export const FriendProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleChat = () => {
    Alert.alert('채팅', '채팅 기능은 개발 예정입니다.');
  };

  const handleInvite = () => {
    Alert.alert('모임 초대', '모임 초대 기능은 개발 예정입니다.');
  };

  const handleUnfriend = () => {
    Alert.alert(
      '친구 삭제',
      `${mockFriendProfile.name}님을 친구 목록에서 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            console.log('친구 삭제');
            navigation.goBack();
          },
        },
      ]
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
          <Text style={styles.headerTitle}>친구 프로필</Text>
          <TouchableOpacity onPress={handleUnfriend}>
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 프로필 정보 */}
          <View style={styles.profileSection}>
            <Image source={{ uri: mockFriendProfile.image }} style={styles.profileImage} />

            <Text style={styles.profileName}>{mockFriendProfile.name}</Text>

            <View style={styles.handicapContainer}>
              <Text style={styles.handicapLabel}>핸디캡</Text>
              <Text style={styles.handicapValue}>⛳ {mockFriendProfile.handicap}</Text>
            </View>

            <Text style={styles.profileLocation}>📍 {mockFriendProfile.location}</Text>
            <Text style={styles.profileBio}>{mockFriendProfile.bio}</Text>

            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>
                가입일: {mockFriendProfile.joinedDate}
              </Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>
                친구된 날: {mockFriendProfile.friendsSince}
              </Text>
            </View>

            {mockFriendProfile.mutualFriends > 0 && (
              <View style={styles.mutualBadge}>
                <Text style={styles.mutualText}>
                  공통 친구 {mockFriendProfile.mutualFriends}명
                </Text>
              </View>
            )}
          </View>

          {/* 통계 */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>활동 통계</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockFriendProfile.stats.totalMeetups}</Text>
                <Text style={styles.statLabel}>함께한 모임</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockFriendProfile.stats.totalRounds}</Text>
                <Text style={styles.statLabel}>라운딩 횟수</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockFriendProfile.stats.averageScore}</Text>
                <Text style={styles.statLabel}>평균 스코어</Text>
              </View>
            </View>
          </View>

          {/* 최근 함께한 모임 */}
          <View style={styles.meetupsSection}>
            <Text style={styles.sectionTitle}>최근 함께한 모임</Text>
            {mockFriendProfile.recentMeetups.map((meetup) => (
              <View key={meetup.id} style={styles.meetupCard}>
                <View style={styles.meetupIcon}>
                  <Text style={styles.meetupIconText}>⛳</Text>
                </View>
                <View style={styles.meetupInfo}>
                  <Text style={styles.meetupTitle}>{meetup.title}</Text>
                  <Text style={styles.meetupCourse}>{meetup.course}</Text>
                  <Text style={styles.meetupDate}>{meetup.date}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>💬 채팅하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
            <Text style={styles.inviteButtonText}>초대하기</Text>
          </TouchableOpacity>
        </View>
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
  moreIcon: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F5F5',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  handicapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  handicapLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  handicapValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  profileLocation: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#999',
  },
  metaDot: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 8,
  },
  mutualBadge: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mutualText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  meetupsSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  meetupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
  },
  meetupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  meetupIconText: {
    fontSize: 24,
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  meetupCourse: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  meetupDate: {
    fontSize: 12,
    color: '#999',
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  inviteButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
});