// FeedScreen.tsx - Witty 스타일 소셜 피드

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Mock 사용자 데이터
const mockUser = {
  id: 1,
  name: '김골프',
  profileImage: 'https://i.pravatar.cc/150?img=12',
  isLive: false,
};

// Mock 친구 스토리 데이터
const mockStories = [
  {
    id: 1,
    userId: 2,
    userName: '이민지',
    userImage: 'https://i.pravatar.cc/150?img=45',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
  },
  {
    id: 2,
    userId: 3,
    userName: '박정우',
    userImage: 'https://i.pravatar.cc/150?img=33',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
  },
  {
    id: 3,
    userId: 4,
    userName: '최수진',
    userImage: 'https://i.pravatar.cc/150?img=27',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
  },
];

// Mock 피드 데이터
const mockFeeds = [
  {
    id: 1,
    userId: 2,
    userName: '이민지',
    userImage: 'https://i.pravatar.cc/150?img=45',
    time: '2시간 전',
    content: '오늘 남서울CC에서 라운딩했습니다! 날씨 최고였어요 ⛳🏌️',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600',
    likes: 67,
    comments: 45,
    location: '남서울CC',
    tags: ['#골프', '#라운딩', '#남서울CC'],
  },
  {
    id: 2,
    userId: 3,
    userName: '박정우',
    userImage: 'https://i.pravatar.cc/150?img=33',
    time: '5시간 전',
    content: '드라이버 새로 샀어요! 비거리가 30m 늘었습니다 🚀',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600',
    likes: 124,
    comments: 38,
    location: null,
    tags: ['#골프용품', '#드라이버', '#테일러메이드'],
  },
  {
    id: 3,
    userId: 4,
    userName: '최수진',
    userImage: 'https://i.pravatar.cc/150?img=27',
    time: '1일 전',
    content: '100타 돌파 기념! 🎉 드디어 100타를 깼습니다!',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600',
    likes: 232,
    comments: 89,
    location: '레이크사이드CC',
    tags: ['#100타돌파', '#기념', '#골프'],
  },
];

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation();

  const [selectedTab, setSelectedTab] = useState('all'); // all, friends, following
  const [likedFeeds, setLikedFeeds] = useState<number[]>([]);

  // 탭 데이터
  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'friends', label: '친구' },
    { id: 'following', label: '팔로잉' },
  ];

  const handleLike = (feedId: number) => {
    if (likedFeeds.includes(feedId)) {
      setLikedFeeds(likedFeeds.filter(id => id !== feedId));
    } else {
      setLikedFeeds([...likedFeeds, feedId]);
    }
  };

  const handleComment = (feedId: number) => {
    Alert.alert('댓글', '댓글 기능은 개발 예정입니다.');
  };

  const handleShare = (feedId: number) => {
    Alert.alert('공유', '공유 기능은 개발 예정입니다.');
  };

  const handleStoryPress = (storyId: number) => {
    Alert.alert('스토리', '스토리 상세 보기는 개발 예정입니다.');
  };

  const handleAddFriend = () => {
    Alert.alert('친구 추가', '친구 추가 기능은 개발 예정입니다.');
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Witty 스타일 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: mockUser.profileImage }}
              style={styles.headerAvatar}
            />
            <Text style={styles.headerName}>{mockUser.name}</Text>
          </View>

          <View style={styles.headerRight}>
            {mockUser.isLive && (
              <View style={styles.liveButton}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert('알림', '알림 기능은 개발 예정입니다.')}
            >
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert('메시지', '메시지 기능은 개발 예정입니다.')}
            >
              <Text style={styles.iconText}>✉️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 탭 */}
        <View style={styles.tabSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem,
                  selectedTab === tab.id && styles.tabItemActive
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[
                  styles.tabLabel,
                  selectedTab === tab.id && styles.tabLabelActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 스토리 섹션 */}
          <View style={styles.storySection}>
            <Text style={styles.sectionTitle}>스토리</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storyContainer}
            >
              {mockStories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyItem}
                  onPress={() => handleStoryPress(story.id)}
                >
                  <View style={styles.storyImageWrapper}>
                    <Image
                      source={{ uri: story.userImage }}
                      style={styles.storyImage}
                    />
                    <View style={styles.storyRing} />
                  </View>
                  <Text style={styles.storyName} numberOfLines={1}>
                    {story.userName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 피드 리스트 */}
          <View style={styles.feedSection}>
            {mockFeeds.map((feed) => (
              <View key={feed.id} style={styles.feedCard}>
                {/* 피드 헤더 */}
                <View style={styles.feedHeader}>
                  <Image
                    source={{ uri: feed.userImage }}
                    style={styles.feedAvatar}
                  />
                  <View style={styles.feedUserInfo}>
                    <Text style={styles.feedUserName}>{feed.userName}</Text>
                    <Text style={styles.feedTime}>{feed.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addFriendButton}
                    onPress={handleAddFriend}
                  >
                    <Text style={styles.addFriendText}>친구추가</Text>
                  </TouchableOpacity>
                </View>

                {/* 피드 내용 */}
                <Text style={styles.feedContent}>{feed.content}</Text>

                {/* 피드 이미지 */}
                <Image
                  source={{ uri: feed.image }}
                  style={styles.feedImage}
                />

                {/* 위치 & 태그 */}
                <View style={styles.feedMeta}>
                  {feed.location && (
                    <View style={styles.locationTag}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText}>{feed.location}</Text>
                    </View>
                  )}
                  <View style={styles.tagsContainer}>
                    {feed.tags.map((tag, index) => (
                      <Text key={index} style={styles.tagText}>{tag}</Text>
                    ))}
                  </View>
                </View>

                {/* 좋아요/댓글 통계 */}
                <View style={styles.feedStats}>
                  <Text style={styles.feedStatsText}>
                    ❤️ {likedFeeds.includes(feed.id) ? feed.likes + 1 : feed.likes}
                  </Text>
                  <Text style={styles.feedStatsText}>
                    💬 {feed.comments}개의 댓글
                  </Text>
                </View>

                {/* 액션 버튼 */}
                <View style={styles.feedActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLike(feed.id)}
                  >
                    <Text style={[
                      styles.actionIcon,
                      likedFeeds.includes(feed.id) && styles.actionIconActive
                    ]}>
                      {likedFeeds.includes(feed.id) ? '❤️' : '🤍'}
                    </Text>
                    <Text style={styles.actionLabel}>좋아요</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleComment(feed.id)}
                  >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionLabel}>댓글</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(feed.id)}
                  >
                    <Text style={styles.actionIcon}>📤</Text>
                    <Text style={styles.actionLabel}>공유</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 글쓰기 플로팅 버튼 */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleCreatePost}
        >
          <Text style={styles.fabIcon}>✏️</Text>
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

  // Witty 스타일 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
  },
  iconText: {
    fontSize: 18,
  },

  // 탭
  tabSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabItemActive: {
    backgroundColor: '#7C3AED',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabLabelActive: {
    color: '#fff',
  },

  scrollView: {
    flex: 1,
  },

  // 스토리 섹션
  storySection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  storyContainer: {
    paddingHorizontal: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 70,
  },
  storyImageWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  storyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E5E5',
  },
  storyRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  storyName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // 피드 섹션
  feedSection: {
    gap: 8,
  },
  feedCard: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingTop: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  feedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  feedUserInfo: {
    flex: 1,
  },
  feedUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  feedTime: {
    fontSize: 12,
    color: '#999',
  },
  addFriendButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 16,
  },
  addFriendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  feedContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  feedImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#E5E5E5',
  },
  feedMeta: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },
  feedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  feedStatsText: {
    fontSize: 13,
    color: '#666',
  },
  feedActions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionIconActive: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  bottomSpacing: {
    height: 80,
  },

  // 플로팅 버튼
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
  },
});