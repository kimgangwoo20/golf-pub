// MyHomeScreen.tsx - Witty 스타일 My 홈피 (무한 스크롤)

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore, FavoriteCourse } from '@/store/useProfileStore';
import { FeedViewer } from '@/components/media';
import {
  firestore as firebaseFirestore,
  FirestoreTimestamp,
} from '@/services/firebase/firebaseConfig';
import { DEFAULT_AVATAR } from '@/constants/images';
import { ImageViewerModal } from '@/components/common/ImageViewerModal';
import { BackgroundMediaEditor } from '@/components/common/BackgroundMediaEditor';
import { colors, fontWeight as fw } from '@/styles/theme';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 6;
const HERO_HEIGHT = 480;

// 프로필 전용 컬러 팔레트
const pc = {
  greenDeep: '#1a472a',
  greenMain: '#2d6a4f',
  greenLight: '#40916c',
  greenAccent: colors.primary,
  greenPale: '#b7e4c7',
  greenMist: '#d8f3dc',
  gold: '#c9a96e',
  goldLight: '#e8d5a8',
  cream: '#faf8f2',
  heart: '#ff6b6b',
};

// 라운딩 스타일 옵션
const ROUNDING_STYLE_OPTIONS = [
  '🌅 새벽 티업',
  '🍻 에프터 좋아함',
  '😄 즐골파',
  '🏆 진지한 경기',
  '🚗 원정 라운딩',
  '👥 단체 라운딩',
  '🎓 레슨 라운딩',
  '🌙 야간 라운딩',
  '⛳ 숏게임 위주',
  '🏌️ 드라이버 장타',
  '🧘 힐링 라운딩',
];

// 관심사 옵션 (골프 외 라이프스타일)
const INTEREST_OPTIONS = [
  '✈️ 여행',
  '🍷 와인',
  '🍽️ 맛집탐방',
  '🎣 낚시',
  '⛰️ 등산',
  '🏕️ 캠핑',
  '🚴 자전거',
  '🎵 음악',
  '📚 독서',
  '🎬 영화',
  '📸 사진',
  '🐾 반려동물',
  '💪 헬스',
  '🍳 요리',
  '🎾 테니스',
  '🏊 수영',
];

// 스탯별 선택 옵션
const STAT_OPTIONS: Record<string, string[]> = {
  평균타수: ['70대', '80-90', '90-100', '100-110', '110-120', '120+'],
  골프경력: ['1년 미만', '1-2년', '2-3년', '4-5년', '5-10년', '10년 이상'],
  월라운드: ['1회 미만', '1-2회', '2-3회', '4회 이상', '주 1회 이상'],
  해외골프: ['없음', '1-2회', '3-5회', '5회 이상', '매년'],
};

// string[] → FavoriteCourse[] 마이그레이션 헬퍼
const normalizeCourses = (courses: any[]): FavoriteCourse[] => {
  if (!courses || courses.length === 0) return [];
  return courses.map((c: any) => (typeof c === 'string' ? { name: c } : c));
};

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

// 히어로 영상 슬라이드 (expo-video 사용, 로드 실패 시 썸네일 폴백)
let VideoView: any = null;
let useVideoPlayer: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const expoVideo = require('expo-video');
  VideoView = expoVideo.VideoView;
  useVideoPlayer = expoVideo.useVideoPlayer;
} catch {
  // expo-video 네이티브 모듈 미사용 가능 시 폴백
}

const HeroVideoSlide: React.FC<{ uri: string; shouldPlay: boolean }> = ({ uri, shouldPlay }) => {
  // expo-video 사용 가능하면 VideoView, 아니면 썸네일+재생 아이콘
  if (useVideoPlayer && VideoView) {
    return <HeroVideoPlayer uri={uri} shouldPlay={shouldPlay} />;
  }
  // 폴백: 정적 썸네일 + 재생 아이콘
  return (
    <View style={{ width, height: HERO_HEIGHT, backgroundColor: '#000' }}>
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      >
        <Text style={{ fontSize: 48 }}>▶️</Text>
      </View>
    </View>
  );
};

// expo-video 기반 비디오 재생 컴포넌트
const HeroVideoPlayer: React.FC<{ uri: string; shouldPlay: boolean }> = ({ uri, shouldPlay }) => {
  const player = useVideoPlayer(uri, (p: any) => {
    p.loop = true;
    p.muted = true;
    if (shouldPlay) p.play();
  });

  useEffect(() => {
    if (!player) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  return (
    <VideoView
      player={player}
      style={{ width, height: HERO_HEIGHT }}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

export const MyHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, userProfile } = useAuthStore();
  const { profile, loadProfile, updateProfile } = useProfileStore();

  // 프로필 로드
  useEffect(() => {
    if (user?.uid) loadProfile(user.uid);
  }, [user?.uid, loadProfile]);

  // 사용자 프로필 데이터 (Firestore userProfile에서 실제 값 사용)
  const profileData = userProfile as any;
  const userData = {
    name: profile?.displayName || user?.displayName || '골퍼',
    email: user?.email || '',
    profileImage: user?.photoURL || DEFAULT_AVATAR,
    phone: user?.phoneNumber || '',
    points: profileData?.points || 0,
    membership: profileData?.membership || 'FREE',
    handicap: profileData?.handicap || '18',
    todayVisits: profileData?.stats?.todayVisits || 0,
    totalVisits: profileData?.stats?.totalVisits || 0,
    roundCount: profileData?.stats?.roundCount || 0,
    avgScore: profileData?.stats?.avgScore || 0,
    friends: profileData?.stats?.friendsCount || 0,
    bio: profile?.bio || '골프를 사랑하는 골퍼입니다 🏌️\n함께 라운딩 갈 골프 친구 찾고 있어요!',
    location: profile?.location || '서울',
    favoriteCourses: normalizeCourses(profile?.favoriteCourses || []),
    roundingStyles: (profile as any)?.roundingStyles || [],
    golfExperience: (profile as any)?.golfExperience || '',
    monthlyRounds: (profile as any)?.monthlyRounds || '',
    overseasGolf: (profile as any)?.overseasGolf || '',
    averageScore: profile?.stats?.averageScore || 0,
    interests: (profile as any)?.interests || [],
  };

  // 배경 미디어 목록 (프로필 이미지와 분리)
  const backgroundMedia: { url: string; type: 'image' | 'video'; order: number }[] = profile
    ?.backgroundMedia?.length
    ? profile.backgroundMedia
    : [];

  // photoList를 URL 기반으로 메모이제이션 → 프로필 리로드 시 불필요한 ScrollView 리셋 방지
  const photoListKey = backgroundMedia.map((m) => m.url).join('|');
  const photoList: (string | null)[] = useMemo(
    () => (backgroundMedia.length > 0 ? backgroundMedia.map((m) => m.url) : [null]),
    [photoListKey],
  );

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

  // 골프장 추가 모달 상태
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [courseInputText, setCourseInputText] = useState('');
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  // 라운딩 스타일 모달 상태
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [styleSubmitting, setStyleSubmitting] = useState(false);

  // 관심사 모달 상태
  const [interestModalVisible, setInterestModalVisible] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [customInterestText, setCustomInterestText] = useState('');

  // 스탯 편집 모달 상태
  const [statModalVisible, setStatModalVisible] = useState(false);
  const [editingStat, setEditingStat] = useState<{ label: string; key: string } | null>(null);
  const [statInputValue, setStatInputValue] = useState('');
  const [statSubmitting, setStatSubmitting] = useState(false);

  // 프로필 이미지 확대 뷰어 상태
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImageUri, setViewerImageUri] = useState<string | null>(null);

  // 배경 미디어 편집기 상태
  const [bgEditorVisible, setBgEditorVisible] = useState(false);

  // 현재 사용자 ID
  const currentUserId = user?.uid || '';

  // 포토 히어로 상태
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const photoScrollRef = useRef<ScrollView>(null);
  const handlePhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== currentPhotoIndex) setCurrentPhotoIndex(idx);
  };

  const goToSlide = (idx: number) => {
    photoScrollRef.current?.scrollTo({ x: idx * width, animated: true });
    setCurrentPhotoIndex(idx);
  };

  // 프로필 likeCount 동기화
  useEffect(() => {
    setLikeCount(profile?.likeCount || 0);
  }, [profile?.likeCount]);

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

  // 초기 데이터 로드 (탭 전환 시 불필요한 재로드 방지)
  useEffect(() => {
    loadInitialData();
  }, [user?.uid]);

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
      Alert.alert(
        '변경 완료',
        `공개 범위가 "${visibilityLabels[newVisibility]}"로 변경되었습니다.`,
      );
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

  // ========== 골프장 / 스타일 / 스탯 편집 핸들러 ==========

  // 골프장 추가
  const handleAddCourse = async () => {
    const name = courseInputText.trim();
    if (!name || !user?.uid) return;

    setCourseSubmitting(true);
    try {
      const current = normalizeCourses(profile?.favoriteCourses || []);
      const updated = [...current, { name }];
      await updateProfile(user.uid, { favoriteCourses: updated } as any);
      setCourseInputText('');
      setCourseModalVisible(false);
      Alert.alert('완료', `"${name}" 골프장이 추가되었습니다.`);
    } catch (error: any) {
      Alert.alert('오류', error.message || '골프장 추가에 실패했습니다.');
    } finally {
      setCourseSubmitting(false);
    }
  };

  // 골프장 삭제 (롱프레스)
  const handleDeleteCourse = (course: FavoriteCourse, index: number) => {
    Alert.alert('골프장 삭제', `"${course.name}"을(를) 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (!user?.uid) return;
          try {
            const current = normalizeCourses(profile?.favoriteCourses || []);
            const updated = current.filter((_, i) => i !== index);
            await updateProfile(user.uid, { favoriteCourses: updated } as any);
          } catch (error: any) {
            Alert.alert('오류', error.message || '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 라운딩 스타일 모달 열기
  const handleOpenStyleModal = () => {
    setSelectedStyles(userData.roundingStyles.length > 0 ? [...userData.roundingStyles] : []);
    setStyleModalVisible(true);
  };

  // 라운딩 스타일 토글
  const handleToggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : prev.length < 5
          ? [...prev, style]
          : prev,
    );
  };

  // 라운딩 스타일 저장
  const handleSaveStyles = async () => {
    if (!user?.uid) return;
    setStyleSubmitting(true);
    try {
      await updateProfile(user.uid, { roundingStyles: selectedStyles } as any);
      setStyleModalVisible(false);
      Alert.alert('완료', '라운딩 스타일이 저장되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '저장에 실패했습니다.');
    } finally {
      setStyleSubmitting(false);
    }
  };

  // 관심사 모달 열기
  const handleOpenInterestModal = () => {
    setSelectedInterests(userData.interests.length > 0 ? [...userData.interests] : []);
    setCustomInterestText('');
    setInterestModalVisible(true);
  };

  // 관심사 토글 (최대 7개)
  const handleToggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((s) => s !== interest)
        : prev.length < 7
          ? [...prev, interest]
          : prev,
    );
  };

  // 직접 입력 관심사 추가
  const handleAddCustomInterest = () => {
    const text = customInterestText.trim();
    if (!text) return;
    if (selectedInterests.length >= 7) {
      Alert.alert('알림', '관심사는 최대 7개까지 선택 가능합니다.');
      return;
    }
    if (selectedInterests.includes(text)) {
      Alert.alert('알림', '이미 추가된 관심사입니다.');
      return;
    }
    setSelectedInterests((prev) => [...prev, text]);
    setCustomInterestText('');
  };

  // 관심사 저장
  const handleSaveInterests = async () => {
    if (!user?.uid) return;
    setInterestSubmitting(true);
    try {
      await updateProfile(user.uid, { interests: selectedInterests } as any);
      setInterestModalVisible(false);
      Alert.alert('완료', '관심사가 저장되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '저장에 실패했습니다.');
    } finally {
      setInterestSubmitting(false);
    }
  };

  // 스탯 편집 모달 열기
  const handleOpenStatEdit = (label: string, key: string, currentValue: string) => {
    setEditingStat({ label, key });
    setStatInputValue(currentValue);
    setStatModalVisible(true);
  };

  // 스탯 저장
  const handleSaveStat = async (value: string) => {
    if (!user?.uid || !editingStat) return;
    setStatSubmitting(true);
    try {
      const updateData: Record<string, any> = {};
      if (editingStat.key === 'averageScore') {
        updateData.stats = { ...(profile?.stats || {}), averageScore: parseInt(value, 10) || 0 };
      } else {
        updateData[editingStat.key] = value;
      }
      await updateProfile(user.uid, updateData as any);
      setStatModalVisible(false);
      setEditingStat(null);
      Alert.alert('완료', `${editingStat.label}이(가) 업데이트되었습니다.`);
    } catch (error: any) {
      Alert.alert('오류', error.message || '저장에 실패했습니다.');
    } finally {
      setStatSubmitting(false);
    }
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

  // 방명록 카드 렌더링
  const renderGuestbookItem = ({ item }: { item: GuestbookItem }) => {
    const isMyEntry = item.authorId === currentUserId; // 본인이 쓴 방명록인지 확인

    return (
      <View style={styles.guestbookCard}>
        <View style={styles.guestbookHeader}>
          <View style={styles.guestbookHeaderLeft}>
            <Image
              source={{ uri: item.authorImage }}
              style={styles.guestbookAvatar}
              onError={() => {}}
            />
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

  // 단일 FlatList용 통합 데이터: 탭에 따라 데이터와 렌더링 분기
  // 컨텐츠 탭(all/diary)은 2개씩 묶어 행 단위로 표시
  type ContentRow = { key: string; items: ContentItem[] };
  const contentRows: ContentRow[] = useMemo(() => {
    const rows: ContentRow[] = [];
    for (let i = 0; i < contents.length; i += 2) {
      const rowItems = contents.slice(i, i + 2);
      rows.push({ key: `row-${i}`, items: rowItems });
    }
    return rows;
  }, [contents]);

  // 통합 리스트 데이터 (타입 구분을 위해 any 사용)
  const unifiedData: any[] = useMemo(() => {
    if (selectedTab === 'guestbook') {
      return guestbook;
    }
    return contentRows;
  }, [selectedTab, guestbook, contentRows]);

  // 통합 renderItem
  const renderUnifiedItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (selectedTab === 'guestbook') {
        return renderGuestbookItem({ item });
      }
      // 컨텐츠 행 렌더링 (2개씩 가로 배치)
      const row = item as ContentRow;
      return (
        <View style={styles.contentRow}>
          {row.items.map((contentItem: ContentItem, colIndex: number) => {
            const globalIndex = index * 2 + colIndex;
            return (
              <TouchableOpacity
                key={contentItem.id}
                style={[
                  styles.contentCard,
                  colIndex === 0 ? styles.contentCardLeft : styles.contentCardRight,
                ]}
                onPress={() => handleContentPress(contentItem, globalIndex)}
                onLongPress={() => handleContentLongPress(contentItem)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: contentItem.image }}
                  style={styles.contentImage}
                  onError={() => {}}
                />
                <View style={styles.contentOverlay}>
                  <Text style={styles.contentIcon}>{contentItem.icon}</Text>
                </View>
                <View style={styles.visibilityBadge}>
                  <Text style={styles.visibilityIcon}>
                    {getVisibilityIcon(contentItem.visibility)}
                  </Text>
                </View>
                {contentItem.mediaType === 'video' && (
                  <View style={styles.playIconOverlay}>
                    <Text style={styles.playIcon}>▶️</Text>
                  </View>
                )}
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle} numberOfLines={1}>
                    {contentItem.title}
                  </Text>
                  <View style={styles.contentStats}>
                    <View style={styles.contentStatItem}>
                      <Text style={styles.contentStatIcon}>❤️</Text>
                      <Text style={styles.contentStatText}>{contentItem.likes}</Text>
                    </View>
                    <View style={styles.contentStatItem}>
                      <Text style={styles.contentStatIcon}>💬</Text>
                      <Text style={styles.contentStatText}>{contentItem.comments}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          {/* 홀수 개일 때 빈 공간 채우기 */}
          {row.items.length === 1 && (
            <View style={[styles.contentCard, styles.contentCardRight, { opacity: 0 }]} />
          )}
        </View>
      );
    },
    [selectedTab, handleContentPress, handleContentLongPress, getVisibilityIcon],
  );

  // 통합 keyExtractor
  const unifiedKeyExtractor = useCallback(
    (item: any) => {
      if (selectedTab === 'guestbook') return item.id?.toString();
      return (item as ContentRow).key;
    },
    [selectedTab],
  );

  // 헤더 (JSX 엘리먼트로 전달 → FlatList가 리마운트 대신 reconciliation 수행, ScrollView 스크롤 위치 보존)
  const listHeader = (
    <>
      {/* ── Photo Hero ── */}
      <View style={styles.heroWrap}>
        <ScrollView
          ref={photoScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePhotoScroll}
          scrollEventThrottle={16}
        >
          {photoList.map((photo, i) => {
            const mediaItem = backgroundMedia[i];
            const isVideo = mediaItem?.type === 'video';
            return (
              <View key={i} style={styles.heroSlide}>
                {photo ? (
                  isVideo ? (
                    <HeroVideoSlide uri={photo} shouldPlay={currentPhotoIndex === i} />
                  ) : (
                    <Image
                      source={{ uri: photo }}
                      style={styles.heroSlideImage}
                      resizeMode="cover"
                      onError={() => {}}
                    />
                  )
                ) : (
                  <LinearGradient
                    colors={
                      i === 0
                        ? [pc.greenMain, pc.greenLight, pc.greenAccent, pc.greenMist]
                        : [pc.greenDeep, pc.greenMain, pc.greenAccent]
                    }
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={styles.heroSlideGradient}
                  >
                    <Text style={styles.heroPlaceholder}>{i === 0 ? '🏌️' : '⛳'}</Text>
                  </LinearGradient>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* 상단 네비게이션 오버레이 */}
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent']}
          style={styles.heroNavOverlay}
          pointerEvents="box-none"
        >
          <View style={styles.heroNavRow}>
            <Text style={styles.heroNavTitle}>My 홈피</Text>
            <View style={styles.heroNavRight}>
              <View style={styles.heroPhotoCounter}>
                <Text style={styles.heroCounterText}>
                  {currentPhotoIndex + 1}/{photoList.length}
                </Text>
                <Text style={{ fontSize: 13 }}>📷</Text>
              </View>
              <TouchableOpacity style={styles.heroNavBtn} onPress={() => setBgEditorVisible(true)}>
                <Text style={{ fontSize: 16, color: '#fff' }}>🖼️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroNavBtn} onPress={() => setDrawerVisible(true)}>
                <Text style={styles.heroHamburger}>☰</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* 슬라이드 인디케이터 */}
        {photoList.length > 1 && (
          <View style={styles.heroDotsRow}>
            {photoList.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.heroDot, currentPhotoIndex === i && styles.heroDotActive]}
                onPress={() => goToSlide(i)}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── Profile Card (히어로 위로 겹침) ── */}
      <Animated.View style={[styles.heroCard]}>
        {/* 아바타 (탭하여 확대 보기) */}
        <TouchableOpacity
          style={styles.heroAvatarWrap}
          activeOpacity={0.8}
          onPress={() => {
            if (userData.profileImage && userData.profileImage !== DEFAULT_AVATAR) {
              setViewerImageUri(userData.profileImage);
              setViewerVisible(true);
            }
          }}
        >
          <View style={styles.heroAvatarBox}>
            {userData.profileImage && userData.profileImage !== DEFAULT_AVATAR ? (
              <Image
                source={{ uri: userData.profileImage }}
                style={styles.heroAvatarImg}
                onError={() => {}}
              />
            ) : (
              <LinearGradient
                colors={[pc.greenPale, pc.greenMist]}
                style={styles.heroAvatarFallback}
              >
                <Text style={{ fontSize: 28 }}>⛳</Text>
              </LinearGradient>
            )}
          </View>
          <View style={styles.heroOnlineDot} />
        </TouchableOpacity>

        {/* 이름 + 좋아요 */}
        <View style={styles.heroInfoHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroUserName}>{userData.name}</Text>
            <View style={styles.heroMetaRow}>
              <Text style={{ fontSize: 14, color: pc.greenAccent }}>📍</Text>
              <Text style={styles.heroMetaText}>{userData.location}</Text>
            </View>
          </View>
          <View style={styles.heroLikeBox}>
            <Text style={{ fontSize: 18 }}>🧡</Text>
            <Text style={styles.heroLikeNum}>{likeCount}</Text>
            <Text style={styles.heroLikeUnit}>개</Text>
          </View>
        </View>

        {/* 소개 */}
        <View style={styles.heroBioBox}>
          <Text style={styles.heroBioText}>{userData.bio}</Text>
          <TouchableOpacity style={{ marginTop: 8 }} onPress={handleEditProfile}>
            <Text style={{ fontSize: 12, color: pc.greenMain, fontWeight: fw.medium }}>
              ✏️ 소개 수정
            </Text>
          </TouchableOpacity>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.heroActionRow}>
          <TouchableOpacity
            style={[styles.heroActionBtn, styles.heroActionOutline]}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.heroActionOutlineText}>✏️ 프로필 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heroActionBtn, styles.heroActionFill]}
            onPress={() => navigation.navigate('Friends' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.heroActionFillText}>👥 골프친구</Text>
          </TouchableOpacity>
        </View>

        {/* Today / Total */}
        <View style={styles.heroTtBox}>
          <View style={styles.heroTtItem}>
            <Text style={styles.heroTtLabel}>TODAY</Text>
            <Text style={styles.heroTtValue}>{userData.todayVisits}</Text>
          </View>
          <View style={styles.heroTtDivider} />
          <View style={styles.heroTtItem}>
            <Text style={styles.heroTtLabel}>TOTAL</Text>
            <Text style={styles.heroTtValue}>{userData.totalVisits}</Text>
          </View>
        </View>

        {/* 골프 스탯 4칸 (터치하여 편집) */}
        <View style={styles.heroStatsGrid}>
          {[
            {
              emoji: '🎯',
              label: '평균타수',
              key: 'averageScore',
              value: userData.averageScore > 0 ? `${userData.averageScore}` : '90-100',
            },
            {
              emoji: '📅',
              label: '골프경력',
              key: 'golfExperience',
              value: userData.golfExperience || '4-5년',
            },
            {
              emoji: '⛳',
              label: '월라운드',
              key: 'monthlyRounds',
              value: userData.monthlyRounds
                ? `${userData.monthlyRounds}회`
                : `${userData.roundCount || '2-3'}회`,
            },
            {
              emoji: '✈️',
              label: '해외골프',
              key: 'overseasGolf',
              value: userData.overseasGolf || '1-2회',
            },
          ].map((stat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.heroStatChip}
              onPress={() => handleOpenStatEdit(stat.label, stat.key, stat.value.replace('회', ''))}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22, marginBottom: 6 }}>{stat.emoji}</Text>
              <Text style={styles.heroStatChipLabel}>{stat.label}</Text>
              <Text style={styles.heroStatChipValue}>{stat.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 자주 가는 골프장 */}
        <View style={{ marginBottom: 18 }}>
          <View style={styles.heroSectionTitleRow}>
            <Text style={styles.heroSectionTitle}>자주 가는 골프장</Text>
            <TouchableOpacity style={styles.heroAddBtn} onPress={() => setCourseModalVisible(true)}>
              <Text style={styles.heroAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroTagWrap}>
            {(userData.favoriteCourses.length > 0
              ? userData.favoriteCourses
              : [{ name: '남서울CC' }, { name: '블루원 용인' }, { name: '이스트밸리' }]
            ).map((course: FavoriteCourse, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.heroFavTag}
                activeOpacity={0.7}
                onLongPress={() =>
                  userData.favoriteCourses.length > 0 && handleDeleteCourse(course, i)
                }
              >
                <Text style={styles.heroFavTagText}>{course.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 라운딩 스타일 */}
        <View style={{ marginBottom: 18 }}>
          <View style={styles.heroSectionTitleRow}>
            <Text style={styles.heroSectionTitle}>라운딩 스타일</Text>
            <TouchableOpacity style={styles.heroAddBtn} onPress={handleOpenStyleModal}>
              <Text style={styles.heroAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroTagWrap}>
            {(userData.roundingStyles.length > 0
              ? userData.roundingStyles
              : ['🌅 새벽 티업', '🍻 에프터 좋아함', '😄 즐골파']
            ).map((tag: string, i: number) => (
              <View key={i} style={styles.heroStyleTag}>
                <Text style={styles.heroStyleTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 내 관심사 */}
        <View style={{ marginBottom: 18 }}>
          <View style={styles.heroSectionTitleRow}>
            <Text style={styles.heroSectionTitle}>내 관심사</Text>
            <TouchableOpacity style={styles.heroAddBtn} onPress={handleOpenInterestModal}>
              <Text style={styles.heroAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroTagWrap}>
            {(userData.interests.length > 0
              ? userData.interests
              : ['✈️ 여행', '🍽️ 맛집탐방', '🎵 음악']
            ).map((tag: string, i: number) => (
              <View key={i} style={styles.heroInterestTag}>
                <Text style={styles.heroInterestTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

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
    <View style={styles.container}>
      {/* 단일 FlatList (탭 전환 시 스크롤 위치 유지) */}
      <FlatList
        data={unifiedData}
        keyExtractor={unifiedKeyExtractor}
        renderItem={renderUnifiedItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          selectedTab === 'guestbook' ? () => <View style={styles.bottomSpacing} /> : ListFooter
        }
        ListEmptyComponent={selectedTab !== 'guestbook' ? ListEmpty : undefined}
        onEndReached={selectedTab !== 'guestbook' ? loadMoreData : undefined}
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
        contentContainerStyle={
          selectedTab === 'guestbook' ? styles.guestbookSection : styles.contentContainer
        }
      />

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
              <Text style={styles.guestbookModalCharCount}>{guestbookText.length} / 200</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.guestbookModalSubmit,
                (!guestbookText.trim() || guestbookSubmitting) &&
                  styles.guestbookModalSubmitDisabled,
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

      {/* 골프장 추가 모달 */}
      <Modal
        visible={courseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCourseModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.guestbookModalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            style={styles.guestbookModalOverlay}
            activeOpacity={1}
            onPress={() => setCourseModalVisible(false)}
          />
          <View style={styles.courseModalContainer}>
            <View style={styles.guestbookModalHeader}>
              <Text style={styles.guestbookModalTitle}>골프장 추가</Text>
              <TouchableOpacity onPress={() => setCourseModalVisible(false)}>
                <Text style={styles.guestbookModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.guestbookModalBody}>
              <TextInput
                style={styles.courseModalInput}
                placeholder="골프장 이름을 입력하세요"
                placeholderTextColor="#999"
                maxLength={30}
                value={courseInputText}
                onChangeText={setCourseInputText}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[
                styles.guestbookModalSubmit,
                (!courseInputText.trim() || courseSubmitting) &&
                  styles.guestbookModalSubmitDisabled,
              ]}
              onPress={handleAddCourse}
              disabled={!courseInputText.trim() || courseSubmitting}
            >
              {courseSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.guestbookModalSubmitText}>추가</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 라운딩 스타일 선택 모달 */}
      <Modal
        visible={styleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStyleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.contentMenuOverlay}
          activeOpacity={1}
          onPress={() => setStyleModalVisible(false)}
        >
          <View style={styles.styleModalContainer}>
            <Text style={styles.contentMenuTitle}>라운딩 스타일 선택</Text>
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 16 }}>
              최대 5개까지 선택 가능
            </Text>
            <View style={styles.styleOptionsGrid}>
              {ROUNDING_STYLE_OPTIONS.map((style, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.styleOptionChip,
                    selectedStyles.includes(style) && styles.styleOptionChipActive,
                  ]}
                  onPress={() => handleToggleStyle(style)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.styleOptionChipText,
                      selectedStyles.includes(style) && styles.styleOptionChipTextActive,
                    ]}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.styleModalActions}>
              <TouchableOpacity
                style={styles.styleModalCancel}
                onPress={() => setStyleModalVisible(false)}
              >
                <Text style={styles.styleModalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.styleModalSave, styleSubmitting && { opacity: 0.6 }]}
                onPress={handleSaveStyles}
                disabled={styleSubmitting}
              >
                {styleSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.styleModalSaveText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 관심사 선택 모달 (하단 시트) */}
      <Modal
        visible={interestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInterestModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.guestbookModalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            style={styles.guestbookModalOverlay}
            activeOpacity={1}
            onPress={() => setInterestModalVisible(false)}
          />
          <View style={styles.interestModalContainer}>
            <View style={styles.guestbookModalHeader}>
              <Text style={styles.guestbookModalTitle}>내 관심사 선택</Text>
              <TouchableOpacity onPress={() => setInterestModalVisible(false)}>
                <Text style={styles.guestbookModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.interestModalSubtitle}>최대 7개까지 선택 가능</Text>
            <ScrollView
              style={styles.interestModalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.styleOptionsGrid}>
                {INTEREST_OPTIONS.map((interest, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.styleOptionChip,
                      selectedInterests.includes(interest) && styles.interestOptionChipActive,
                    ]}
                    onPress={() => handleToggleInterest(interest)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.styleOptionChipText,
                        selectedInterests.includes(interest) && styles.interestOptionChipTextActive,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
                {/* 직접 입력으로 추가된 커스텀 관심사 (프리셋에 없는 것만) */}
                {selectedInterests
                  .filter((s) => !INTEREST_OPTIONS.includes(s))
                  .map((custom, i) => (
                    <TouchableOpacity
                      key={`custom-${i}`}
                      style={[styles.styleOptionChip, styles.interestOptionChipActive]}
                      onPress={() => handleToggleInterest(custom)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.styleOptionChipText, styles.interestOptionChipTextActive]}
                      >
                        {custom}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
            {/* 직접 입력 */}
            <View style={styles.customInterestRow}>
              <TextInput
                style={styles.customInterestInput}
                placeholder="직접 입력 (예: 서핑)"
                placeholderTextColor="#999"
                maxLength={10}
                value={customInterestText}
                onChangeText={setCustomInterestText}
                onSubmitEditing={handleAddCustomInterest}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.customInterestAddBtn,
                  !customInterestText.trim() && { opacity: 0.4 },
                ]}
                onPress={handleAddCustomInterest}
                disabled={!customInterestText.trim()}
              >
                <Text style={styles.customInterestAddBtnText}>추가</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.styleModalActions}>
              <TouchableOpacity
                style={styles.styleModalCancel}
                onPress={() => setInterestModalVisible(false)}
              >
                <Text style={styles.styleModalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.styleModalSave, interestSubmitting && { opacity: 0.6 }]}
                onPress={handleSaveInterests}
                disabled={interestSubmitting}
              >
                {interestSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.styleModalSaveText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 프로필 이미지 확대 뷰어 */}
      <ImageViewerModal
        visible={viewerVisible}
        imageUri={viewerImageUri}
        onClose={() => {
          setViewerVisible(false);
          setViewerImageUri(null);
        }}
      />

      {/* 배경 미디어 편집기 */}
      <BackgroundMediaEditor
        visible={bgEditorVisible}
        media={backgroundMedia}
        onClose={() => setBgEditorVisible(false)}
        onUpdate={() => {
          // 프로필 재로드하여 배경 미디어 갱신
          if (user?.uid) loadProfile(user.uid);
        }}
      />

      {/* 스탯 편집 모달 */}
      <Modal
        visible={statModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.contentMenuOverlay}
          activeOpacity={1}
          onPress={() => setStatModalVisible(false)}
        >
          <View style={styles.statModalContainer}>
            <Text style={styles.contentMenuTitle}>{editingStat?.label || ''} 수정</Text>
            {editingStat && STAT_OPTIONS[editingStat.label] ? (
              <View style={styles.statOptionsGrid}>
                {STAT_OPTIONS[editingStat.label].map((option, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.statOptionChip,
                      statInputValue === option && styles.statOptionChipActive,
                    ]}
                    onPress={() => setStatInputValue(option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.statOptionChipText,
                        statInputValue === option && styles.statOptionChipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {editingStat?.label === '평균타수' && (
              <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                <TextInput
                  style={styles.courseModalInput}
                  placeholder="직접 입력 (숫자)"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={3}
                  value={statInputValue}
                  onChangeText={setStatInputValue}
                />
              </View>
            )}
            <View style={styles.styleModalActions}>
              <TouchableOpacity
                style={styles.styleModalCancel}
                onPress={() => setStatModalVisible(false)}
              >
                <Text style={styles.styleModalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.styleModalSave,
                  (!statInputValue || statSubmitting) && { opacity: 0.6 },
                ]}
                onPress={() => handleSaveStat(statInputValue)}
                disabled={!statInputValue || statSubmitting}
              >
                {statSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.styleModalSaveText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ── Photo Hero ──
  heroWrap: {
    position: 'relative',
    width: width,
    height: HERO_HEIGHT,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  heroSlide: {
    width: width,
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSlideImage: {
    width: '100%',
    height: '100%',
  },
  heroSlideGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholder: {
    fontSize: 80,
    opacity: 0.35,
  },
  heroNavOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroNavTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHamburger: {
    fontSize: 20,
    color: '#fff',
  },
  heroPhotoCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroCounterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  heroDotsRow: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroDotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  // ── Profile Card (겹침) ──
  heroCard: {
    marginTop: -80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 0,
    minHeight: 200,
  },
  heroAvatarWrap: {
    position: 'absolute',
    top: -30,
    left: 20,
    zIndex: 10,
  },
  heroAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  heroAvatarImg: {
    width: '100%',
    height: '100%',
  },
  heroAvatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  heroInfoHeader: {
    paddingTop: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  heroUserName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  heroMetaText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  heroLikeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff0f0',
  },
  heroLikeNum: {
    fontSize: 16,
    fontWeight: '700',
    color: pc.heart,
  },
  heroLikeUnit: {
    fontSize: 12,
    color: pc.heart,
    opacity: 0.7,
  },
  heroBioBox: {
    marginTop: 14,
    marginBottom: 18,
    padding: 14,
    paddingLeft: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: pc.greenAccent,
  },
  heroBioText: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  heroActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionOutline: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: pc.greenMain,
  },
  heroActionOutlineText: {
    fontSize: 15,
    fontWeight: '600',
    color: pc.greenMain,
  },
  heroActionFill: {
    backgroundColor: pc.greenMain,
    borderWidth: 1.5,
    borderColor: pc.greenMain,
  },
  heroActionFillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  heroTtBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 18,
  },
  heroTtItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroTtLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTtValue: {
    fontSize: 26,
    fontWeight: '700',
    color: pc.greenMain,
  },
  heroTtDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e8e8e8',
  },
  heroStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  heroStatChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  heroStatChipLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
    marginBottom: 4,
  },
  heroStatChipValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  heroTagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroFavTag: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: pc.greenMist,
    borderWidth: 1,
    borderColor: pc.greenPale,
  },
  heroFavTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: pc.greenDeep,
  },
  heroStyleTag: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: pc.cream,
    borderWidth: 1,
    borderColor: pc.goldLight,
  },
  heroStyleTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: pc.gold,
  },
  // 관심사 태그
  heroInterestTag: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#fcd5c0',
  },
  heroInterestTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#d97706',
  },

  // 관심사 모달 활성 칩
  interestOptionChipActive: {
    backgroundColor: '#fff5f0',
    borderColor: '#f59e0b',
  },
  interestOptionChipTextActive: {
    color: '#92400e',
    fontWeight: '600',
  },

  // 관심사 모달 (하단 시트)
  interestModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 48,
    maxHeight: '80%',
  },
  interestModalSubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -4,
  },
  interestModalScroll: {
    maxHeight: 260,
    paddingBottom: 4,
  },

  // 직접 입력 관심사
  customInterestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  customInterestInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 42,
  },
  customInterestAddBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInterestAddBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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

  // 섹션 제목 행 (제목 + 추가 버튼)
  heroSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: pc.greenAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAddBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: -1,
  },

  // 골프장 모달
  courseModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 48,
  },
  courseModalInput: {
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    height: 50,
  },

  // 스타일 선택 모달
  styleModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 380,
    paddingVertical: 20,
  },
  styleOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  styleOptionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  styleOptionChipActive: {
    backgroundColor: pc.greenMist,
    borderColor: pc.greenAccent,
  },
  styleOptionChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  styleOptionChipTextActive: {
    color: pc.greenDeep,
    fontWeight: '600',
  },
  styleModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  styleModalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  styleModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  styleModalSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: pc.greenMain,
    alignItems: 'center',
  },
  styleModalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // 스탯 편집 모달
  statModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    maxWidth: 340,
    paddingVertical: 20,
  },
  statOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  statOptionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  statOptionChipActive: {
    backgroundColor: pc.greenMist,
    borderColor: pc.greenAccent,
  },
  statOptionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  statOptionChipTextActive: {
    color: pc.greenDeep,
    fontWeight: '600',
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
