// FriendProfileScreen.tsx - 친구 프로필 화면 (Firestore 연동)

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/useAuthStore';
import { getFriendProfile, removeFriend } from '@/services/firebase/firebaseFriends';
import { DEFAULT_AVATAR } from '@/constants/images';

export const FriendProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const friendId = route.params?.friendId;

  const [profile, setProfile] = useState<any>(null);
  const [friendshipInfo, setFriendshipInfo] = useState<any>(null);
  const [recentMeetups, setRecentMeetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user?.uid || !friendId) return;
    try {
      setLoading(true);
      const result = await getFriendProfile(user.uid, friendId);
      if (result) {
        setProfile(result.profile);
        setFriendshipInfo(result.friendshipInfo);
        setRecentMeetups(result.recentMeetups);
      }
    } catch (error) {
      console.error('친구 프로필 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, friendId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChat = () => {
    if (!profile) return;
    navigation.navigate(
      'Chat' as any,
      {
        screen: 'ChatRoom',
        params: {
          chatId: `friend_${friendId}`,
          chatName: profile.name,
        },
      } as any,
    );
  };

  const handleInvite = () => {
    // 모임 생성 화면으로 이동 (친구 초대)
    (navigation as any).navigate('Bookings', { screen: 'CreateBooking' });
  };

  const handleUnfriend = () => {
    if (!user?.uid || !friendId || !profile) return;
    Alert.alert('친구 삭제', `${profile.name}님을 친구 목록에서 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await removeFriend(user.uid, friendId);
            if (result.success) {
              Alert.alert('완료', result.message);
              navigation.goBack();
            } else {
              Alert.alert('오류', result.message);
            }
          } catch (error) {
            console.error('친구 삭제 실패:', error);
            Alert.alert('오류', '친구 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>친구 프로필</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>친구 프로필</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>프로필을 찾을 수 없습니다</Text>
          </View>
        </View>
      </SafeAreaView>
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
          <Text style={styles.headerTitle}>친구 프로필</Text>
          <TouchableOpacity onPress={handleUnfriend}>
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 프로필 정보 */}
          <View style={styles.profileSection}>
            <Image source={{ uri: profile.avatar || DEFAULT_AVATAR }} style={styles.profileImage} />

            <Text style={styles.profileName}>{profile.name}</Text>

            <View style={styles.handicapContainer}>
              <Text style={styles.handicapLabel}>핸디캡</Text>
              <Text style={styles.handicapValue}>⛳ {profile.handicap}</Text>
            </View>

            <Text style={styles.profileLocation}>📍 {profile.location}</Text>
            {profile.bio ? <Text style={styles.profileBio}>{profile.bio}</Text> : null}

            <View style={styles.metaInfo}>
              {profile.joinedDate && (
                <Text style={styles.metaText}>가입일: {formatDate(profile.joinedDate)}</Text>
              )}
              {friendshipInfo?.friendsSince && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>
                    친구된 날: {formatDate(friendshipInfo.friendsSince)}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* 통계 */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>활동 통계</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats?.totalMeetups || 0}</Text>
                <Text style={styles.statLabel}>함께한 모임</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats?.totalRounds || 0}</Text>
                <Text style={styles.statLabel}>라운딩 횟수</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats?.averageScore || '-'}</Text>
                <Text style={styles.statLabel}>평균 스코어</Text>
              </View>
            </View>
          </View>

          {/* 최근 함께한 모임 */}
          {recentMeetups.length > 0 && (
            <View style={styles.meetupsSection}>
              <Text style={styles.sectionTitle}>최근 함께한 모임</Text>
              {recentMeetups.map((meetup) => (
                <View key={meetup.id} style={styles.meetupCard}>
                  <View style={styles.meetupIcon}>
                    <Text style={styles.meetupIconText}>⛳</Text>
                  </View>
                  <View style={styles.meetupInfo}>
                    <Text style={styles.meetupTitle}>{meetup.title}</Text>
                    <Text style={styles.meetupCourse}>{meetup.course}</Text>
                    <Text style={styles.meetupDate}>{formatDate(meetup.date)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {recentMeetups.length === 0 && (
            <View style={styles.meetupsSection}>
              <Text style={styles.sectionTitle}>최근 함께한 모임</Text>
              <View style={styles.emptyMeetups}>
                <Text style={styles.emptyMeetupText}>함께한 모임이 없습니다</Text>
              </View>
            </View>
          )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
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
    color: '#10b981',
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
    color: '#10b981',
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
  emptyMeetups: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyMeetupText: {
    fontSize: 14,
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
    backgroundColor: '#10b981',
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
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
});
