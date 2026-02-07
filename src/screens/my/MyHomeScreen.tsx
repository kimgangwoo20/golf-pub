// MyHomeScreen.tsx - Witty 스타일 My 홈피 (무한 스크롤)

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { FeedViewer, FeedItem } from '../../components/media';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 6;

// 공개 범위 타입
type Visibility = 'public' | 'friends' | 'private';

// 컨텐츠 타입 정의
interface ContentItem {
  id: number;
  type: string;
  mediaType: 'image' | 'video';
  icon: string;
  title: string;
  description: string;
  image: string;
  mediaUrl: string;
  mediaUrls?: string[]; // 다중 이미지 지원
  likes: number;
  comments: number;
  date: string;
  authorId: string; // 작성자 ID (접근 권한용)
  visibility: Visibility; // 공개 범위
}

// 방명록 타입 정의
interface GuestbookItem {
  id: number;
  author: string;
  authorId: string; // 작성자 ID (접근 권한용)
  authorImage: string;
  content: string;
  time: string;
}

// 전체 Mock 컨텐츠 데이터 (더 많은 데이터 시뮬레이션)
const generateMockContents = (): ContentItem[] => {
  const baseContents = [
    {
      type: 'diary',
      mediaType: 'image' as const,
      icon: '📖',
      title: '오늘의 라운딩 후기',
      description: '남서울CC에서 좋은 스코어!',
      image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
      mediaUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200',
      // 다중 이미지 예시: 라운딩 사진 여러 장
      mediaUrls: [
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200',
        'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200',
        'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200',
      ],
    },
    {
      type: 'photo',
      mediaType: 'image' as const,
      icon: '📷',
      title: '골프장 풍경',
      description: '날씨 좋은 날 라운딩',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
      mediaUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
      // 다중 이미지 예시: 코스 여러 홀 사진
      mediaUrls: [
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200',
      ],
    },
    {
      type: 'video',
      mediaType: 'video' as const,
      icon: '🎥',
      title: '스윙 연습 영상',
      description: '오늘 연습장에서 스윙 연습한 영상입니다.',
      image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
      mediaUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      // 비디오는 다중 이미지 없음
    },
    {
      type: 'diary',
      mediaType: 'image' as const,
      icon: '📖',
      title: '100타 돌파 기념!',
      description: '드디어 100타를 깼습니다',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
      mediaUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
      // 다중 이미지 예시: 스코어카드 + 기념사진
      mediaUrls: [
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
        'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200',
        'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200',
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200',
      ],
    },
    {
      type: 'photo',
      mediaType: 'image' as const,
      icon: '📷',
      title: '새 드라이버',
      description: '테일러메이드 신제품',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
      mediaUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
      // 단일 이미지 (mediaUrls 없음)
    },
    {
      type: 'video',
      mediaType: 'video' as const,
      icon: '🎥',
      title: '퍼팅 연습',
      description: '집에서 퍼팅 연습하는 영상입니다.',
      image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
      mediaUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    },
  ];

  // 30개 아이템 생성 (무한 스크롤 테스트용)
  const contents: ContentItem[] = [];
  const visibilities: Visibility[] = ['public', 'friends', 'private'];

  for (let i = 0; i < 30; i++) {
    const base = baseContents[i % baseContents.length];
    contents.push({
      ...base,
      id: i + 1,
      likes: Math.floor(Math.random() * 200) + 10,
      comments: Math.floor(Math.random() * 50) + 5,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mediaUrls: (base as any).mediaUrls, // 다중 이미지 URL 복사
      authorId: 'current-user', // 모든 게시물은 현재 사용자 소유 (My홈피이므로)
      visibility: visibilities[i % 3], // 테스트용 공개범위 설정
    });
  }
  return contents;
};

const allMockContents = generateMockContents();

// Mock 방명록 데이터 생성
const generateMockGuestbook = (currentUserName: string): GuestbookItem[] => [
  {
    id: 1,
    author: '이민지',
    authorId: 'user-1',
    authorImage: 'https://i.pravatar.cc/150?img=45',
    content: '오늘 라운딩 정말 즐거웠어요! 다음에 또 함께해요 ⛳',
    time: '2시간 전',
  },
  {
    id: 2,
    author: '박정우',
    authorId: 'user-2',
    authorImage: 'https://i.pravatar.cc/150?img=33',
    content: '스윙 자세가 많이 좋아지셨네요! 👍',
    time: '5시간 전',
  },
  {
    id: 3,
    author: currentUserName, // 현재 사용자가 쓴 방명록 (삭제 가능)
    authorId: 'current-user',
    authorImage: 'https://i.pravatar.cc/150?img=12',
    content: '내가 쓴 테스트 방명록입니다.',
    time: '1일 전',
  },
  {
    id: 4,
    author: '김철수',
    authorId: 'user-4',
    authorImage: 'https://i.pravatar.cc/150?img=15',
    content: '다음 주 레슨 기대됩니다!',
    time: '2일 전',
  },
  {
    id: 5,
    author: '정미영',
    authorId: 'user-5',
    authorImage: 'https://i.pravatar.cc/150?img=28',
    content: '드라이버 추천 감사합니다 ^^',
    time: '3일 전',
  },
];

export const MyHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, userProfile } = useAuthStore();

  // 사용자 데이터
  const userData = {
    name: user?.displayName || '골퍼',
    email: user?.email || '',
    profileImage: user?.photoURL || 'https://i.pravatar.cc/150?img=12',
    backgroundImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    phone: user?.phoneNumber || '',
    points: (userProfile as any)?.points || 0,
    membership: (userProfile as any)?.membership || 'FREE',
    handicap: '18',
    todayVisits: 15,
    totalVisits: 1234,
    roundCount: 24,
    avgScore: 4.8,
    friends: 23,
  };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [feedViewerVisible, setFeedViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 무한 스크롤 상태
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 방명록 상태
  const [guestbook, setGuestbook] = useState<GuestbookItem[]>([]);

  // 컨텐츠 관리 모달 상태
  const [contentMenuVisible, setContentMenuVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // 현재 사용자 ID
  const currentUserId = user?.uid || '';

  // 방명록 초기 로드
  useEffect(() => {
    setGuestbook(generateMockGuestbook(userData.name));
  }, [userData.name]);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [selectedTab]);

  const loadInitialData = () => {
    setIsLoading(true);
    setPage(1);

    // 탭에 따른 필터링
    const filtered = filterByTab(allMockContents, selectedTab);
    const initialContents = filtered.slice(0, ITEMS_PER_PAGE);

    setTimeout(() => {
      setContents(initialContents);
      setHasMore(filtered.length > ITEMS_PER_PAGE);
      setIsLoading(false);
    }, 300);
  };

  const filterByTab = (items: ContentItem[], tab: string) => {
    if (tab === 'all') return items;
    if (tab === 'diary') return items.filter(item => item.type === 'diary');
    if (tab === 'photo') return items.filter(item => item.type === 'photo' || item.type === 'video');
    return items;
  };

  // 더 많은 데이터 로드 (무한 스크롤)
  const loadMoreData = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const filtered = filterByTab(allMockContents, selectedTab);
    const start = (nextPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const newContents = filtered.slice(start, end);

    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      if (newContents.length > 0) {
        setContents(prev => [...prev, ...newContents]);
        setPage(nextPage);
        setHasMore(end < filtered.length);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 500);
  }, [page, isLoading, hasMore, selectedTab]);

  // 새로고침
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);

    const filtered = filterByTab(allMockContents, selectedTab);
    const initialContents = filtered.slice(0, ITEMS_PER_PAGE);

    setTimeout(() => {
      setContents(initialContents);
      setHasMore(filtered.length > ITEMS_PER_PAGE);
      setRefreshing(false);
    }, 500);
  }, [selectedTab]);

  // 미디어 클릭 핸들러 - 인스타 스타일 피드 뷰어
  const handleContentPress = (item: ContentItem, index: number) => {
    setSelectedIndex(index);
    setFeedViewerVisible(true);
  };

  const handleFeedViewerClose = () => {
    setFeedViewerVisible(false);
  };

  const handleLike = (itemId: number) => {
    console.log('좋아요:', itemId);
    // TODO: 실제 좋아요 API 연동
  };

  const handleComment = (itemId: number, comment: string) => {
    console.log('댓글:', itemId, comment);
    // TODO: 실제 댓글 API 연동
  };

  // ========== 게시물 관리 (접근 권한: 본인만) ==========

  // 게시물 메뉴 열기 (본인 게시물만)
  const handleContentLongPress = (item: ContentItem) => {
    if (item.authorId !== currentUserId) {
      return; // 본인 게시물이 아니면 무시
    }
    setSelectedContent(item);
    setContentMenuVisible(true);
  };

  // 게시물 삭제
  const handleDeleteContent = () => {
    if (!selectedContent) return;

    // 권한 검증
    if (selectedContent.authorId !== currentUserId) {
      Alert.alert('권한 없음', '본인 게시물만 삭제할 수 있습니다.');
      return;
    }

    Alert.alert(
      '게시물 삭제',
      '정말 이 게시물을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setContents(prev => prev.filter(c => c.id !== selectedContent.id));
            setContentMenuVisible(false);
            setSelectedContent(null);
            Alert.alert('삭제 완료', '게시물이 삭제되었습니다.');
          },
        },
      ],
    );
  };

  // 게시물 수정 (수정 화면으로 이동)
  const handleEditContent = () => {
    if (!selectedContent) return;

    // 권한 검증
    if (selectedContent.authorId !== currentUserId) {
      Alert.alert('권한 없음', '본인 게시물만 수정할 수 있습니다.');
      return;
    }

    setContentMenuVisible(false);
    // TODO: 수정 화면으로 이동
    Alert.alert('게시물 수정', '게시물 수정 화면으로 이동합니다. (개발 예정)');
    // navigation.navigate('EditContent', { contentId: selectedContent.id });
  };

  // 게시물 공개 범위 변경
  const handleChangeVisibility = (newVisibility: Visibility) => {
    if (!selectedContent) return;

    // 권한 검증
    if (selectedContent.authorId !== currentUserId) {
      Alert.alert('권한 없음', '본인 게시물만 수정할 수 있습니다.');
      return;
    }

    setContents(prev =>
      prev.map(c =>
        c.id === selectedContent.id ? { ...c, visibility: newVisibility } : c
      )
    );
    setContentMenuVisible(false);
    setSelectedContent(null);

    const visibilityLabels = {
      public: '전체 공개',
      friends: '친구만',
      private: '나만 보기',
    };
    Alert.alert('변경 완료', `공개 범위가 "${visibilityLabels[newVisibility]}"로 변경되었습니다.`);
  };

  // ========== 방명록 관리 (접근 권한: 본인이 쓴 것만 삭제) ==========

  // 방명록 삭제
  const handleDeleteGuestbook = (item: GuestbookItem) => {
    // 권한 검증: 본인이 쓴 방명록만 삭제 가능
    if (item.authorId !== currentUserId) {
      Alert.alert('권한 없음', '본인이 작성한 방명록만 삭제할 수 있습니다.');
      return;
    }

    Alert.alert(
      '방명록 삭제',
      '정말 이 방명록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setGuestbook(prev => prev.filter(g => g.id !== item.id));
            Alert.alert('삭제 완료', '방명록이 삭제되었습니다.');
          },
        },
      ],
    );
  };

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
      navigation.navigate('Settings' as any);
    } else if (screen === 'Notifications') {
      navigation.navigate('Notifications' as any);
    } else if (screen === 'PointHistory') {
      navigation.navigate('PointHistory' as any);
    } else if (screen === 'Coupons') {
      navigation.navigate('Coupons' as any);
    } else if (screen === 'Support') {
      navigation.navigate('Support' as any);
    } else if (screen === 'Profile') {
      navigation.navigate('Profile' as any);
    } else {
      Alert.alert(screen, `${screen} 화면은 개발 예정입니다.`);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as any);
  };

  // 공개 범위 아이콘
  const getVisibilityIcon = (visibility: Visibility) => {
    switch (visibility) {
      case 'public': return '🌐';
      case 'friends': return '👥';
      case 'private': return '🔒';
    }
  };

  // 컨텐츠 카드 렌더링
  const renderContentItem = ({ item, index }: { item: ContentItem; index: number }) => (
    <TouchableOpacity
      style={[
        styles.contentCard,
        index % 2 === 0 ? styles.contentCardLeft : styles.contentCardRight,
      ]}
      onPress={() => handleContentPress(item, index)}
      onLongPress={() => handleContentLongPress(item)} // 롱프레스로 관리 메뉴
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.contentImage} />
      <View style={styles.contentOverlay}>
        <Text style={styles.contentIcon}>{item.icon}</Text>
      </View>
      {/* 공개 범위 표시 */}
      <View style={styles.visibilityBadge}>
        <Text style={styles.visibilityIcon}>{getVisibilityIcon(item.visibility)}</Text>
      </View>
      {item.mediaType === 'video' && (
        <View style={styles.playIconOverlay}>
          <Text style={styles.playIcon}>▶️</Text>
        </View>
      )}
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
  );

  // 방명록 카드 렌더링
  const renderGuestbookItem = ({ item }: { item: GuestbookItem }) => {
    const isMyEntry = item.authorId === currentUserId; // 본인이 쓴 방명록인지 확인

    return (
      <View style={styles.guestbookCard}>
        <View style={styles.guestbookHeader}>
          <View style={styles.guestbookHeaderLeft}>
            <Image source={{ uri: item.authorImage }} style={styles.guestbookAvatar} />
            <Text style={styles.guestbookAuthor}>{item.author}</Text>
            {isMyEntry && <Text style={styles.myBadge}>내 글</Text>}
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
          <View style={styles.guestbookActions}>
            {/* 본인이 쓴 방명록만 삭제 가능 */}
            {isMyEntry && (
              <TouchableOpacity
                style={styles.deleteGuestbookButton}
                onPress={() => handleDeleteGuestbook(item)}
              >
                <Text style={styles.deleteGuestbookText}>삭제</Text>
              </TouchableOpacity>
            )}
            <View style={styles.guestbookLikes}>
              <Text style={styles.likeIcon}>❤️</Text>
              <Text style={styles.likeCount}>5</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 헤더 컴포넌트 (프로필, 통계, 탭)
  const ListHeader = () => (
    <>
      {/* 프로필 배경 */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: userData.backgroundImage }}
          style={styles.backgroundImage}
          blurRadius={2}
        />
        <View style={styles.overlay} />
        <View style={styles.profileContent}>
          <TouchableOpacity onPress={handleEditProfile}>
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileHandicap}>핸디캡: {userData.handicap}</Text>
          </View>
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
            onPress={() => navigation.navigate('Friends' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{userData.friends}</Text>
            <Text style={styles.statLabel}>골프친구</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 탭 */}
      <View style={styles.tabSection}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, selectedTab === tab.id && styles.tabItemActive]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, selectedTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 방명록 작성 버튼 (방명록 탭일 때만) */}
      {selectedTab === 'guestbook' && (
        <TouchableOpacity
          style={styles.writeGuestbookButton}
          onPress={() => Alert.alert('방명록', '방명록 작성 기능은 개발 예정입니다.')}
        >
          <Text style={styles.writeGuestbookIcon}>✏️</Text>
          <Text style={styles.writeGuestbookText}>방명록 남기기</Text>
        </TouchableOpacity>
      )}
    </>
  );

  // 로딩 푸터
  const ListFooter = () => {
    if (!isLoading) return <View style={styles.bottomSpacing} />;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#10b981" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  };

  // 빈 상태
  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>등록된 게시물이 없습니다</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My 홈피</Text>
          </View>
          <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.hamburgerButton}>
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* 방명록 탭이면 방명록 리스트, 아니면 컨텐츠 그리드 */}
        {selectedTab === 'guestbook' ? (
          <FlatList
            key="guestbook-list"
            data={guestbook}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderGuestbookItem}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={() => <View style={styles.bottomSpacing} />}
            contentContainerStyle={styles.guestbookSection}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            key={`content-grid-${selectedTab}`}
            data={contents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderContentItem}
            numColumns={2}
            columnWrapperStyle={styles.contentRow}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={ListEmpty}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#10b981"
                colors={['#10b981']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          />
        )}

        {/* 인스타그램 스타일 피드 뷰어 */}
        <FeedViewer
          visible={feedViewerVisible}
          items={contents}
          initialIndex={selectedIndex}
          onClose={handleFeedViewerClose}
          onLike={handleLike}
          onComment={handleComment}
          authorName={userData.name}
          authorImage={userData.profileImage}
        />

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
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>메뉴</Text>
                <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                  <Text style={styles.drawerClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.drawerScrollView} showsVerticalScrollIndicator={false}>
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
                <View style={styles.drawerBottomSpacing} />
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* 컨텐츠 관리 모달 (롱프레스 시 표시) */}
        <Modal
          visible={contentMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setContentMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.contentMenuOverlay}
            activeOpacity={1}
            onPress={() => setContentMenuVisible(false)}
          >
            <View style={styles.contentMenuContainer}>
              <Text style={styles.contentMenuTitle}>게시물 관리</Text>

              {/* 수정 */}
              <TouchableOpacity style={styles.contentMenuItem} onPress={handleEditContent}>
                <Text style={styles.contentMenuIcon}>✏️</Text>
                <Text style={styles.contentMenuText}>수정</Text>
              </TouchableOpacity>

              {/* 공개 범위 변경 */}
              <View style={styles.visibilitySection}>
                <Text style={styles.visibilitySectionTitle}>공개 범위</Text>
                <View style={styles.visibilityOptions}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      selectedContent?.visibility === 'public' && styles.visibilityOptionActive,
                    ]}
                    onPress={() => handleChangeVisibility('public')}
                  >
                    <Text style={styles.visibilityOptionIcon}>🌐</Text>
                    <Text style={styles.visibilityOptionText}>전체</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      selectedContent?.visibility === 'friends' && styles.visibilityOptionActive,
                    ]}
                    onPress={() => handleChangeVisibility('friends')}
                  >
                    <Text style={styles.visibilityOptionIcon}>👥</Text>
                    <Text style={styles.visibilityOptionText}>친구만</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      selectedContent?.visibility === 'private' && styles.visibilityOptionActive,
                    ]}
                    onPress={() => handleChangeVisibility('private')}
                  >
                    <Text style={styles.visibilityOptionIcon}>🔒</Text>
                    <Text style={styles.visibilityOptionText}>나만</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 삭제 */}
              <TouchableOpacity style={styles.contentMenuItemDanger} onPress={handleDeleteContent}>
                <Text style={styles.contentMenuIcon}>🗑️</Text>
                <Text style={styles.contentMenuTextDanger}>삭제</Text>
              </TouchableOpacity>

              {/* 취소 */}
              <TouchableOpacity
                style={styles.contentMenuCancel}
                onPress={() => setContentMenuVisible(false)}
              >
                <Text style={styles.contentMenuCancelText}>취소</Text>
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

  // 프로필 배경
  profileHeader: {
    position: 'relative',
    height: 200,
    backgroundColor: '#10b981',
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
    color: '#10b981',
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
    color: '#10b981',
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

  // 탭
  tabSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabItemActive: {
    backgroundColor: '#10b981',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabLabelActive: {
    color: '#fff',
  },

  // 컨텐츠 그리드
  contentContainer: {
    paddingBottom: 20,
  },
  contentRow: {
    paddingHorizontal: 8,
    marginTop: 8,
  },
  contentCard: {
    width: (width - 32) / 2,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  contentCardLeft: {
    marginRight: 4,
  },
  contentCardRight: {
    marginLeft: 4,
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
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playIcon: {
    fontSize: 40,
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  guestbookCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 12,
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
    backgroundColor: '#10b981',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
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

  // 로딩 & 빈 상태
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  bottomSpacing: {
    height: 100,
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
  drawerScrollView: {
    maxHeight: 500,
  },
  drawerContent: {
    paddingVertical: 8,
  },
  drawerBottomSpacing: {
    height: 40,
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

  // 공개 범위 배지
  visibilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  visibilityIcon: {
    fontSize: 12,
  },

  // 방명록 삭제 버튼
  guestbookActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteGuestbookButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteGuestbookText: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: '600',
  },
  myBadge: {
    backgroundColor: '#10b981',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    overflow: 'hidden',
  },

  // 컨텐츠 관리 모달
  contentMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    maxWidth: 340,
    paddingVertical: 20,
  },
  contentMenuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  contentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  contentMenuItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 8,
  },
  contentMenuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  contentMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  contentMenuTextDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
  contentMenuCancel: {
    marginTop: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  contentMenuCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },

  // 공개 범위 선택
  visibilitySection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    marginTop: 8,
  },
  visibilitySectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  visibilityOptionActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  visibilityOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  visibilityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
