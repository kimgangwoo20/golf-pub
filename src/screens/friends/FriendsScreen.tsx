// FriendsScreen.tsx - 친구 목록 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Friend } from '../../types/friend-types';

// Mock 친구 데이터
const mockFriends: Friend[] = [
  {
    id: 1,
    name: '김철수',
    image: 'https://i.pravatar.cc/150?img=12',
    handicap: 18,
    location: '서울 강남구',
    bio: '주말 골퍼입니다',
    mutualFriends: 5,
    status: 'accepted',
    createdAt: '2025.01.15',
  },
  {
    id: 2,
    name: '이영희',
    image: 'https://i.pravatar.cc/150?img=45',
    handicap: 22,
    location: '경기 성남시',
    bio: '골프 초보 환영!',
    mutualFriends: 3,
    status: 'accepted',
    createdAt: '2025.01.10',
  },
  {
    id: 3,
    name: '박민수',
    image: 'https://i.pravatar.cc/150?img=33',
    handicap: 15,
    location: '서울 송파구',
    bio: '평일 라운딩 선호',
    mutualFriends: 8,
    status: 'accepted',
    createdAt: '2025.01.05',
  },
  {
    id: 4,
    name: '최지원',
    image: 'https://i.pravatar.cc/150?img=20',
    handicap: 20,
    location: '인천 남동구',
    bio: '골프 사랑해요',
    mutualFriends: 2,
    status: 'accepted',
    createdAt: '2024.12.28',
  },
  {
    id: 5,
    name: '정대호',
    image: 'https://i.pravatar.cc/150?img=15',
    handicap: 12,
    location: '서울 강서구',
    bio: '매주 라운딩',
    mutualFriends: 6,
    status: 'accepted',
    createdAt: '2024.12.20',
  },
];

export const FriendsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleFriendPress = (friendId: number) => {
    console.log('친구 클릭:', friendId);
    navigation.navigate('FriendProfile' as never, { friendId } as never);
  };

  const handleAddFriend = () => {
    navigation.navigate('AddFriend' as never);
  };

  const handleRequests = () => {
    navigation.navigate('FriendRequests' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>친구</Text>
          <TouchableOpacity onPress={handleRequests}>
            <View style={styles.requestBadge}>
              <Text style={styles.requestIcon}>👥</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 통계 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockFriends.length}</Text>
            <Text style={styles.statLabel}>친구</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>함께한 모임</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>라운딩 횟수</Text>
          </View>
        </View>

        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="친구 이름을 검색하세요"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 친구 목록 */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.friendsList}>
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendCard}
                  onPress={() => handleFriendPress(friend.id)}
                >
                  <Image source={{ uri: friend.image }} style={styles.friendImage} />

                  <View style={styles.friendInfo}>
                    <View style={styles.friendHeader}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <View style={styles.handicapBadge}>
                        <Text style={styles.handicapText}>⛳ {friend.handicap}</Text>
                      </View>
                    </View>
                    <Text style={styles.friendBio} numberOfLines={1}>
                      {friend.bio}
                    </Text>
                    <Text style={styles.friendLocation}>📍 {friend.location}</Text>
                    {friend.mutualFriends > 0 && (
                      <Text style={styles.mutualFriends}>
                        공통 친구 {friend.mutualFriends}명
                      </Text>
                    )}
                  </View>

                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>🔍</Text>
                <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
              </View>
            )}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 친구 추가 버튼 */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
          <Text style={styles.addButtonText}>+ 친구 추가</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  requestBadge: {
    position: 'relative',
  },
  requestIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
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
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  clearIcon: {
    fontSize: 18,
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  friendsList: {
    padding: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  handicapBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  handicapText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  friendBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  friendLocation: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  bottomSpacing: {
    height: 80,
  },
});