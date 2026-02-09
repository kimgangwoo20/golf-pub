// MyHomeScreen.tsx - Witty 스타일 My 홈피 (무한 스크롤)

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { FeedViewer } from '@/components/media';
import { firestore as firebaseFirestore, FirestoreTimestamp } from '@/services/firebase/firebaseConfig';
import { DEFAULT_AVATAR } from '@/constants/images';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 6;

// 공개 범위 타입
type Visibility = 'public' | 'friends' | 'private';

// 컨텐츠 타입 정의
interface ContentItem {
  id: string; // Firestore 문서 ID
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
  id: string; // Firestore 문서 ID
  author: string;
  authorId: string; // 작성자 ID (접근 권한용)
  authorImage: string;
  content: string;
  time: string;
}

// Firestore 문서를 ContentItem으로 변환하는 헬퍼
const mapPostDocToContentItem = (doc: any): ContentItem => {
  const data = doc.data();
  const createdAt = data.createdAt?.toDate?.() || new Date();
  const images: string[] = data.images || [];
  const hasVideo = data.mediaType === 'video' || data.type === 'video';

  // 게시글 타입: 사진첩 카테고리 제거로 모두 다이어리로 통합 (video만 별도)
  const type = hasVideo ? 'video' : 'diary';

  // 타입별 아이콘
  const iconMap: Record<string, string> = { diary: '📖', video: '🎥' };

  return {
    id: doc.id,
    type,
    mediaType: hasVideo ? 'video' : 'image',
    icon: iconMap[type] || '📷',
    title: data.title || data.content?.substring(0, 20) || '',
    description: data.content || '',
    image: images[0] || data.image || '',
    mediaUrl: hasVideo ? data.videoUrl || data.mediaUrl || '' : images[0] || data.image || '',
    mediaUrls: images.length > 1 ? images : undefined,
    likes: data.likes || 0,
    comments: data.comments || 0,
    date: createdAt.toISOString().split('T')[0],
    authorId: data.author?.id || data.userId || '',
    visibility: data.visibility || 'public',
  };
};

// 상대 시간 포맷팅 헬퍼
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
};

export const MyHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, userProfile } = useAuthStore();

  // 사용자 프로필 데이터 (Firestore userProfile에서 실제 값 사용)
  const profileData = userProfile as any;
  const userData = {
    name: user?.displayName || '골퍼',
    email: user?.email || '',
    profileImage: user?.photoURL || DEFAULT_AVATAR,
    backgroundImage:
      profileData?.backgroundImage ||
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    phone: user?.phoneNumber || '',
    points: profileData?.points || 0,
    membership: profileData?.membership || 'FREE',
    handicap: profileData?.handicap || '18',
    todayVisits: profileData?.stats?.todayVisits || 0,
    totalVisits: profileData?.stats?.totalVisits || 0,
    roundCount: profileData?.stats?.roundCount || 0,
    avgScore: profileData?.stats?.avgScore || 0,
    friends: profileData?.stats?.friendsCount || 0,
  };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [feedViewerVisible, setFeedViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 무한 스크롤 상태
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Firestore 페이지네이션 커서
  const lastDocRef = useRef<any>(null);

  // 방명록 상태
  const [guestbook, setGuestbook] = useState<GuestbookItem[]>([]);

  // 방명록 작성 모달 상태
  const [guestbookModalVisible, setGuestbookModalVisible] = useState(false);
  const [guestbookText, setGuestbookText] = useState('');
  const [guestbookSubmitting, setGuestbookSubmitting] = useState(false);

  // 컨텐츠 관리 모달 상태
  const [contentMenuVisible, setContentMenuVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // 현재 사용자 ID
  const currentUserId = user?.uid || '';

  // 방명록 Firestore 로드
  useEffect(() => {
    loadGuestbook();
  }, [user?.uid]);

  // 방명록 Firestore 쿼리
  const loadGuestbook = async () => {
    if (!user?.uid) return;
    try {
      const snapshot = await firebaseFirestore
        .collection('users')
        .doc(user.uid)
        .collection('guestbook')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const entries: GuestbookItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        return {
          id: doc.id,
          author: data.authorName || '익명',
          authorId: data.authorId || '',
          authorImage: data.authorImage || '',
          content: data.content || '',
          time: formatRelativeTime(createdAt),
        };
      });
      setGuestbook(entries);
    } catch (error: any) {
      console.error('방명록 로드 실패:', error);
    }
  };

  // 방명록 작성 제출
  const handleSubmitGuestbook = async () => {
    if (!guestbookText.trim() || !user?.uid) return;

    setGuestbookSubmitting(true);
    try {
      await firebaseFirestore
        .collection('users')
        .doc(user.uid)
        .collection('guestbook')
        .add({
          authorId: user.uid,
          authorName: user.displayName || '익명',
          authorImage: user.photoURL || '',
          content: guestbookText.trim(),
          createdAt: FirestoreTimestamp.now(),
        });

      setGuestbookText('');
      setGuestbookModalVisible(false);
      await loadGuestbook();
      Alert.alert('완료', '방명록이 등록되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '방명록 등록에 실패했습니다.');
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  // FAB 버튼 핸들러
  const handleFabPress = () => {
    if (selectedTab === 'guestbook') {
      if (!user?.uid) {
        Alert.alert('알림', '로그인이 필요합니다.');
        return;
      }
      setGuestbookModalVisible(true);
    } else {
      // all, diary 탭 → CreatePost 화면으로 이동 (diary 타입)
      (navigation as any).navigate('Feed', {
        screen: 'CreatePost',
        params: { type: 'diary' },
      });
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [selectedTab, user?.uid]);

  // Firestore에서 posts 컬렉션 쿼리 (현재 사용자의 게시물)
  const loadInitialData = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    lastDocRef.current = null;

    try {
      // 탭에 따른 Firestore 쿼리 구성
      const query = buildPostsQuery(selectedTab);
      const snapshot = await query.limit(ITEMS_PER_PAGE).get();

      const items = snapshot.docs.map(mapPostDocToContentItem);

      // 페이지네이션 커서 저장
      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      setContents(items);
      setHasMore(snapshot.docs.length >= ITEMS_PER_PAGE);
    } catch (error: any) {
      console.error('컨텐츠 로드 실패:', error);
      setContents([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 탭별 Firestore 쿼리 빌더 (사진첩 제거 후: all과 diary 모두 전체 게시물)
  const buildPostsQuery = (_tab: string) => {
    return firebaseFirestore
      .collection('posts')
      .where('author.id', '==', user?.uid)
      .orderBy('createdAt', 'desc');
  };

  // 더 많은 데이터 로드 (무한 스크롤 - Firestore startAfter 페이지네이션)
  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore || !user?.uid || !lastDocRef.current) return;

    setIsLoading(true);
    try {
      const query = buildPostsQuery(selectedTab);
      const snapshot = await query.startAfter(lastDocRef.current).limit(ITEMS_PER_PAGE).get();

      const newItems = snapshot.docs.map(mapPostDocToContentItem);

      if (newItems.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        setContents((prev) => [...prev, ...newItems]);
        setHasMore(snapshot.docs.length >= ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('추가 컨텐츠 로드 실패:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, selectedTab, user?.uid]);

  // 새로고침 (풀-투-리프레시)
  const handleRefresh = useCallback(async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    lastDocRef.current = null;

    try {
      const query = buildPostsQuery(selectedTab);
      const snapshot = await query.limit(ITEMS_PER_PAGE).get();

      const items = snapshot.docs.map(mapPostDocToContentItem);

      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      setContents(items);
      setHasMore(snapshot.docs.length >= ITEMS_PER_PAGE);

      // 방명록도 새로고침
      await loadGuestbook();
    } catch (error: any) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedTab, user?.uid]);

  // 미디어 클릭 핸들러 - 인스타 스타일 피드 뷰어
  const handleContentPress = (item: ContentItem, index: number) => {
    setSelectedIndex(index);
    setFeedViewerVisible(true);
  };

  const handleFeedViewerClose = () => {
    setFeedViewerVisible(false);
  };

  const handleLike = (itemId: string | number) => {
    // 로컬 상태 업데이트 (낙관적 UI)
    setContents((prev) => prev.map((c) => (c.id === itemId ? { ...c, likes: c.likes + 1 } : c)));
  };

  const handleComment = (itemId: string | number, comment: string) => {
    if (!comment.trim()) return;
    // 로컬 상태 업데이트 (낙관적 UI)
    setContents((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, comments: c.comments + 1 } : c)),
    );
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

    Alert.alert('게시물 삭제', '정말 이 게시물을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await firebaseFirestore.collection('posts').doc(selectedContent.id).delete();
            setContents((prev) => prev.filter((c) => c.id !== selectedContent.id));
            setContentMenuVisible(false);
            setSelectedContent(null);
            Alert.alert('삭제 완료', '게시물이 삭제되었습니다.');
          } catch (error: any) {
            Alert.alert('오류', error.message || '삭제에 실패했습니다.');
          }
        },
      },
    ]);
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
    (navigation as any).navigate('Feed', {
      screen: 'CreatePost',
      params: { editId: selectedContent.id },
    });
  };

  // 게시물 공개 범위 변경
  const handleChangeVisibility = async (newVisibility: Visibility) => {
    if (!selectedContent) return;

    // 권한 검증
    if (selectedContent.authorId !== currentUserId) {
      Alert.alert('권한 없음', '본인 게시물만 수정할 수 있습니다.');
      return;
    }

    try {
      await firebaseFirestore.collection('posts').doc(selectedContent.id).update({
        visibility: newVisibility,
      });
      setContents((prev) =>
        prev.map((c) => (c.id === selectedContent.id ? { ...c, visibility: newVisibility } : c)),
      );
      setContentMenuVisible(false);
      setSelectedContent(null);

      const visibilityLabels = {
        public: '전체 공개',
        friends: '친구만',
        private: '나만 보기',
      };
      Alert.alert('변경 완료', `공개 범위가 "${visibilityLabels[newVisibility]}"로 변경되었습니다.`);
    } catch (error: any) {
      Alert.alert('오류', error.message || '변경에 실패했습니다.');
    }
  };

  // ========== 방명록 관리 (접근 권한: 본인이 쓴 것만 삭제) ==========

  // 방명록 삭제
  const handleDeleteGuestbook = (item: GuestbookItem) => {
    // 권한 검증: 본인이 쓴 방명록만 삭제 가능
    if (item.authorId !== currentUserId) {
      Alert.alert('권한 없음', '본인이 작성한 방명록만 삭제할 수 있습니다.');
      return;
    }

    Alert.alert('방명록 삭제', '정말 이 방명록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await firebaseFirestore
              .collection('users')
              .doc(currentUserId)
              .collection('guestbook')
              .doc(item.id)
              .delete();
            setGuestbook((prev) => prev.filter((g) => g.id !== item.id));
            Alert.alert('삭제 완료', '방명록이 삭제되었습니다.');
          } catch (error: any) {
            Alert.alert('오류', error.message || '삭제에 실패했습니다.');
          }
        },
      },
    ]);
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
      Alert.alert(screen, `${screen} 기능은 곧 출시됩니다.`);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as any);
  };

  // 공개 범위 아이콘
  const getVisibilityIcon = (visibility: Visibility) => {
    switch (visibility) {
      case 'public':
        return '🌐';
      case 'friends':
        return '👥';
      case 'private':
        return '🔒';
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
            onPress={() => Alert.alert('답글', '답글 기능은 곧 출시됩니다.')}
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

  // 헤더 컴포넌트 (프로필 카드 + 탭)
  const ListHeader = () => (
    <>
      {/* 배경 이미지 영역 (컨텐츠 없음, 배경만) */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: userData.backgroundImage }}
          style={styles.backgroundImage}
          blurRadius={2}
        />
        <View style={styles.overlay} />
      </View>

      {/* 프로필 카드 (배경 위로 오프셋) */}
      <View style={styles.profileCard}>
        {/* 프로필 사진 (배경 하단에 걸침) */}
        <View style={styles.profileImageWrapper}>
          <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
        </View>

        {/* 이름 + 핸디캡 */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileHandicap}>핸디캡: {userData.handicap}</Text>
        </View>

        {/* 프로필 수정 버튼 */}
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Text style={styles.editProfileText}>프로필 수정</Text>
        </TouchableOpacity>

        {/* 구분선 */}
        <View style={styles.profileDivider} />

        {/* 방문자 카운터 (인라인) */}
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

        {/* 구분선 */}
        <View style={styles.profileDivider} />

        {/* 통계 (프로필 카드 내부 통합) */}
        <View style={styles.statsRow}>
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

        {/* FAB 버튼 */}
        <TouchableOpacity style={styles.fabButton} onPress={handleFabPress}>
          <Text style={styles.fabIcon}>✏️</Text>
        </TouchableOpacity>

        {/* 방명록 작성 모달 */}
        <Modal
          visible={guestbookModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setGuestbookModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.guestbookModalWrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableOpacity
              style={styles.guestbookModalOverlay}
              activeOpacity={1}
              onPress={() => setGuestbookModalVisible(false)}
            />
            <View style={styles.guestbookModalContainer}>
              <View style={styles.guestbookModalHeader}>
                <Text style={styles.guestbookModalTitle}>방명록 남기기</Text>
                <TouchableOpacity onPress={() => setGuestbookModalVisible(false)}>
                  <Text style={styles.guestbookModalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.guestbookModalBody}>
                <TextInput
                  style={styles.guestbookModalInput}
                  placeholder="방명록을 남겨주세요..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={200}
                  value={guestbookText}
                  onChangeText={setGuestbookText}
                />
                <Text style={styles.guestbookModalCharCount}>
                  {guestbookText.length} / 200
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.guestbookModalSubmit,
                  (!guestbookText.trim() || guestbookSubmitting) && styles.guestbookModalSubmitDisabled,
                ]}
                onPress={handleSubmitGuestbook}
                disabled={!guestbookText.trim() || guestbookSubmitting}
              >
                {guestbookSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.guestbookModalSubmitText}>등록</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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

  // 프로필 배경 (컨텐츠 없음, 배경만)
  profileHeader: {
    position: 'relative',
    height: 160,
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

  // 프로필 카드 (배경 위로 오프셋)
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -50,
    borderRadius: 16,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageWrapper: {
    marginTop: -45,
    marginBottom: 12,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#E5E5E5',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileHandicap: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 16,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  profileDivider: {
    width: '85%',
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  visitorCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  counterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginBottom: 2,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  counterDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E5E5',
  },

  // 통계 행 (프로필 카드 내부)
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 17,
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
    marginHorizontal: 4,
  },

  // 탭
  tabSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 16,
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
    paddingBottom: 20,
  },
  guestbookCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 12,
    marginHorizontal: 16,
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

  // FAB 버튼
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
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

  // 방명록 작성 모달
  guestbookModalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  guestbookModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  guestbookModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  guestbookModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  guestbookModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  guestbookModalClose: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  guestbookModalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  guestbookModalInput: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  guestbookModalCharCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  guestbookModalSubmit: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 50,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestbookModalSubmitDisabled: {
    backgroundColor: '#E5E5E5',
  },
  guestbookModalSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
