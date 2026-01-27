// MyHomeScreen.tsx - Witty 스타일 My 홈피

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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';

const { width } = Dimensions.get('window');

// Mock 컨텐츠 데이터
const mockContents = [
  {
    id: 1,
    type: 'diary',
    icon: '📖',
    title: '오늘의 라운딩 후기',
    description: '남서울CC에서 좋은 스코어!',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
    likes: 28,
    comments: 14,
    date: '2024-01-26',
  },
  {
    id: 2,
    type: 'photo',
    icon: '📷',
    title: '골프장 풍경',
    description: '날씨 좋은 날 라운딩',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    likes: 67,
    comments: 45,
    date: '2024-01-25',
  },
  {
    id: 3,
    type: 'video',
    icon: '🎥',
    title: '스윙 연습 영상',
    description: '오늘 연습장에서',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
    likes: 23,
    comments: 8,
    date: '2024-01-24',
  },
  {
    id: 4,
    type: 'diary',
    icon: '📖',
    title: '100타 돌파 기념!',
    description: '드디어 100타를 깼습니다',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    likes: 156,
    comments: 89,
    date: '2024-01-23',
  },
  {
    id: 5,
    type: 'photo',
    icon: '📷',
    title: '새 드라이버',
    description: '테일러메이드 신제품',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    likes: 45,
    comments: 23,
    date: '2024-01-22',
  },
  {
    id: 6,
    type: 'video',
    icon: '🎥',
    title: '퍼팅 연습',
    description: '집에서 연습 중',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
    likes: 34,
    comments: 12,
    date: '2024-01-21',
  },
];

// Mock 방명록 데이터
const mockGuestbook = [
  {
    id: 1,
    author: '이민지',
    authorImage: 'https://i.pravatar.cc/150?img=45',
    content: '오늘 라운딩 정말 즐거웠어요! 다음에 또 함께해요 ⛳',
    time: '2시간 전',
  },
  {
    id: 2,
    author: '박정우',
    authorImage: 'https://i.pravatar.cc/150?img=33',
    content: '스윙 자세가 많이 좋아지셨네요! 👍',
    time: '5시간 전',
  },
  {
    id: 3,
    author: '최수진',
    authorImage: 'https://i.pravatar.cc/150?img=27',
    content: '100타 돌파 축하드려요! 🎉🎉',
    time: '1일 전',
  },
  {
    id: 4,
    author: '김철수',
    authorImage: 'https://i.pravatar.cc/150?img=15',
    content: '다음 주 레슨 기대됩니다!',
    time: '2일 전',
  },
  {
    id: 5,
    author: '정미영',
    authorImage: 'https://i.pravatar.cc/150?img=28',
    content: '드라이버 추천 감사합니다 ^^',
    time: '3일 전',
  },
];

export const MyHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  // ✅ 실제 사용자 데이터로 변경
  const userData = {
    name: user?.name || '골퍼',
    email: user?.email || '',
    profileImage: user?.avatar || 'https://i.pravatar.cc/150?img=12',
    backgroundImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    phone: user?.phone || '',
    points: user?.points || 0,
    membership: user?.membership || 'FREE',
    handicap: '18',
    todayVisits: 15,
    totalVisits: 1234,
    roundCount: 24,
    avgScore: 4.8,
    friends: 23,
    mood: '오늘도 좋은 날씨! 라운딩 가고 싶다 ⛳',
  };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all'); // all, diary, photo, guestbook

  // 햄버거 메뉴 아이템
  const drawerItems = [
    { icon: '⚙️', label: '설정', screen: 'Settings' },
    { icon: '🔔', label: '알림 설정', screen: 'Notifications' },
    { icon: '🎨', label: '테마/꾸미기', screen: 'Theme' },
    { icon: '💰', label: '포인트 내역', screen: 'PointHistory' },
    { icon: '🎫', label: '쿠폰함', screen: 'Coupons' },
    { icon: '❓', label: '고객센터', screen: 'Support' },
    { icon: '⭐', label: '내 활동', screen: 'Profile' },
  ];

  // 탭 데이터
  const tabs = [
    { id: 'all', icon: '🔥', label: '전체' },
    { id: 'diary', icon: '📖', label: '다이어리' },
    { id: 'photo', icon: '📷', label: '사진첩' },
    { id: 'guestbook', icon: '💬', label: '방명록' },
  ];

  const handleDrawerItemPress = (screen: string) => {
    setDrawerVisible(false);

    if (screen === 'Settings') {
      navigation.navigate('Settings' as never);
    } else if (screen === 'Notifications') {
      navigation.navigate('Notifications' as never);
    } else if (screen === 'PointHistory') {
      navigation.navigate('PointHistory' as never);
    } else if (screen === 'Coupons') {
      navigation.navigate('Coupons' as never);
    } else if (screen === 'Support') {
      navigation.navigate('Support' as never);
    } else if (screen === 'Profile') {
      navigation.navigate('Profile' as never);
    } else {
      Alert.alert(screen, `${screen} 화면은 개발 예정입니다.`);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  // 필터링된 컨텐츠
  const filteredContents = selectedTab === 'all'
    ? mockContents
    : mockContents.filter(item => {
        if (selectedTab === 'diary') return item.type === 'diary';
        if (selectedTab === 'photo') return item.type === 'photo' || item.type === 'video';
        if (selectedTab === 'guestbook') return item.type === 'guestbook';
        return true;
      });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My 홈피</Text>
          </View>
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={styles.hamburgerButton}
          >
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 프로필 배경 (축소) */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: userData.backgroundImage }}
              style={styles.backgroundImage}
              blurRadius={2}
            />
            <View style={styles.overlay} />

            <View style={styles.profileContent}>
              <TouchableOpacity onPress={handleEditProfile}>
                <Image
                  source={{ uri: userData.profileImage }}
                  style={styles.profileImage}
                />
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profileHandicap}>핸디캡: {userData.handicap}</Text>
              </View>

              {/* 방문자 카운터 */}
              <View style={styles.visitorCounter}>
                <View style={styles.counterItem}>
                  <Text style={styles.counterLabel}>Today</Text>
                  <Text style={styles.counterValue}>{userData.todayVisits}</Text>
                </View>
                <View style={styles.counterDivider} />
                <View style={styles.counterItem}>
                  <Text style={styles.counterLabel}>Total</Text>
                  <Text style={styles.counterValue}>{userData.totalVisits}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 통계 카드 */}
          <View style={styles.statsSection}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⛳</Text>
                <Text style={styles.statValue}>{userData.roundCount}</Text>
                <Text style={styles.statLabel}>라운딩</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🏌️</Text>
                <Text style={styles.statValue}>{userData.avgScore}</Text>
                <Text style={styles.statLabel}>평균타수</Text>
              </View>
              <View style={styles.statDivider} />
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('Friends' as never)}
                activeOpacity={0.7}
              >
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statValue}>{userData.friends}</Text>
                <Text style={styles.statLabel}>골프친구</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Witty 스타일 탭 */}
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
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
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

          {/* 컨텐츠 그리드 또는 방명록 */}
          {selectedTab === 'guestbook' ? (
            // 방명록 탭
            <View style={styles.guestbookSection}>
              {mockGuestbook.map((item) => (
                <View key={item.id} style={styles.guestbookCard}>
                  <View style={styles.guestbookHeader}>
                    <View style={styles.guestbookHeaderLeft}>
                      <Image
                        source={{ uri: item.authorImage }}
                        style={styles.guestbookAvatar}
                      />
                      <Text style={styles.guestbookAuthor}>{item.author}</Text>
                    </View>
                    <Text style={styles.guestbookDate}>{item.time}</Text>
                  </View>

                  <Text style={styles.guestbookText}>{item.content}</Text>

                  <View style={styles.guestbookFooter}>
                    <TouchableOpacity
                      style={styles.replyButton}
                      onPress={() => Alert.alert('답글', '답글 기능은 개발 예정입니다.')}
                    >
                      <Text style={styles.replyButtonText}>답글쓰기</Text>
                    </TouchableOpacity>
                    <View style={styles.guestbookLikes}>
                      <Text style={styles.likeIcon}>❤️</Text>
                      <Text style={styles.likeCount}>5</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* 방명록 작성 버튼 */}
              <TouchableOpacity
                style={styles.writeGuestbookButton}
                onPress={() => Alert.alert('방명록', '방명록 작성 기능은 개발 예정입니다.')}
              >
                <Text style={styles.writeGuestbookIcon}>✏️</Text>
                <Text style={styles.writeGuestbookText}>방명록 남기기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // 컨텐츠 그리드 (전체/다이어리/사진첩)
            <View style={styles.contentSection}>
              {filteredContents.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.contentCard}
                  onPress={() => Alert.alert(item.title, item.description)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.contentImage}
                  />
                  <View style={styles.contentOverlay}>
                    <Text style={styles.contentIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.contentStats}>
                      <View style={styles.contentStatItem}>
                        <Text style={styles.contentStatIcon}>❤️</Text>
                        <Text style={styles.contentStatText}>{item.likes}</Text>
                      </View>
                      <View style={styles.contentStatItem}>
                        <Text style={styles.contentStatIcon}>💬</Text>
                        <Text style={styles.contentStatText}>{item.comments}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 햄버거 드로어 메뉴 */}
        <Modal
          visible={drawerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDrawerVisible(false)}
        >
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          >
            <View style={styles.drawerContainer}>
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.drawerHeader}>
                  <Text style={styles.drawerTitle}>메뉴</Text>
                  <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                    <Text style={styles.drawerClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.drawerContent}>
                  {drawerItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.drawerItem}
                      onPress={() => handleDrawerItemPress(item.screen)}
                    >
                      <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                      <Text style={styles.drawerItemLabel}>{item.label}</Text>
                      <Text style={styles.drawerItemArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  hamburgerButton: {
    padding: 4,
  },
  hamburgerIcon: {
    fontSize: 28,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },

  // 프로필 배경 (축소)
  profileHeader: {
    position: 'relative',
    height: 200,
    backgroundColor: '#2E7D32',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  profileContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#E5E5E5',
    marginBottom: 8,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileHandicap: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E8F5E9',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  visitorCounter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  counterItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  counterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  counterDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
  },

  // 통계 섹션
  statsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
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
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },

  // Witty 스타일 탭
  tabSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabItemActive: {
    backgroundColor: '#7C3AED',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabLabelActive: {
    color: '#fff',
  },

  // 컨텐츠 그리드
  contentSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  contentCard: {
    width: (width - 32) / 2,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#E5E5E5',
  },
  contentOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  contentIcon: {
    fontSize: 16,
  },
  contentInfo: {
    padding: 12,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  contentStats: {
    flexDirection: 'row',
    gap: 12,
  },
  contentStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentStatIcon: {
    fontSize: 12,
  },
  contentStatText: {
    fontSize: 12,
    color: '#666',
  },

  // 방명록 섹션
  guestbookSection: {
    padding: 16,
  },
  guestbookCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guestbookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  guestbookHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestbookAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    marginRight: 10,
  },
  guestbookAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  guestbookDate: {
    fontSize: 12,
    color: '#999',
  },
  guestbookText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  guestbookFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  replyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  guestbookLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIcon: {
    fontSize: 16,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  writeGuestbookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  writeGuestbookIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  writeGuestbookText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  bottomSpacing: {
    height: 40,
  },

  // 햄버거 드로어
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  drawerClose: {
    fontSize: 28,
    color: '#666',
  },
  drawerContent: {
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  drawerItemIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  drawerItemArrow: {
    fontSize: 24,
    color: '#999',
  },
});