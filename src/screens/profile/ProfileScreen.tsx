import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { colors, spacing, fontSize, fontWeight } from '@/styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 480;

// 프로필 전용 컬러 팔레트 (클래식 골프 느낌 + 앱 테마 조화)
const pc = {
  greenDeep: '#1a472a',
  greenMain: '#2d6a4f',
  greenLight: '#40916c',
  greenAccent: colors.primary, // #10b981 앱 메인 컬러
  greenPale: '#b7e4c7',
  greenMist: '#d8f3dc',
  gold: '#c9a96e',
  goldLight: '#e8d5a8',
  cream: '#faf8f2',
  heart: '#ff6b6b',
};

export const ProfileScreen: React.FC<{ navigation?: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { user, signOut } = useAuthStore();
  const { profile, loadProfile, toggleProfileLike, checkProfileLiked } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const photoScrollRef = useRef<ScrollView>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  // 본인 프로필인지 다른 유저 프로필인지
  const targetUserId = route?.params?.userId;
  const isOwnProfile = !targetUserId || targetUserId === user?.uid;

  // 사진 목록 (여러 장 또는 프로필 사진 1장)
  const photoList: (string | null)[] =
    (profile as any)?.photos?.length > 0
      ? (profile as any).photos
      : profile?.photoURL
        ? [profile.photoURL]
        : [null, null]; // 사진 없으면 그라데이션 플레이스홀더

  useEffect(() => {
    const uid = targetUserId || user?.uid;
    if (uid) {
      loadProfile(uid);
    }
  }, [targetUserId, user?.uid, loadProfile]);

  // 프로필 likeCount 동기화
  useEffect(() => {
    setLikeCount(profile?.likeCount || 0);
  }, [profile?.likeCount]);

  // 좋아요 상태 확인 (타인 프로필만)
  useEffect(() => {
    const targetUid = targetUserId || user?.uid;
    if (!isOwnProfile && targetUid && user?.uid) {
      checkProfileLiked(targetUid, user.uid).then(setLiked);
    }
  }, [isOwnProfile, targetUserId, user?.uid, checkProfileLiked]);

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    const uid = targetUserId || user?.uid;
    if (!uid) return;
    setRefreshing(true);
    await loadProfile(uid);
    setRefreshing(false);
  }, [targetUserId, user?.uid, loadProfile]);

  const handlePhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== currentPhotoIndex) setCurrentPhotoIndex(idx);
  };

  const goToSlide = (idx: number) => {
    photoScrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
    setCurrentPhotoIndex(idx);
  };

  const handleLike = async () => {
    if (isOwnProfile) return; // 본인 프로필 좋아요 불가
    const targetUid = targetUserId || user?.uid;
    if (!targetUid || !user?.uid) return;

    // 낙관적 UI
    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikeCount((prev) => (prevLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      await toggleProfileLike(targetUid, user.uid);
    } catch {
      // 실패 시 롤백
      setLiked(prevLiked);
      setLikeCount((prev) => (prevLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('오류', '로그아웃에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 프로필 데이터
  const displayName = profile?.displayName || user?.displayName || '골퍼';
  const bio =
    profile?.bio ||
    '골프를 사랑하는 골퍼입니다 🏌️\n함께 라운딩 갈 골프 친구 찾고 있어요!\n편하게 골친 신청 주세요 😊';
  const location = profile?.location || '서울';
  const totalRounds = profile?.totalRounds || profile?.stats?.gamesPlayed || 0;
  const averageScore = profile?.stats?.averageScore || 0;
  const favoriteCourses = profile?.favoriteCourses || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
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
          {photoList.map((photo, i) => (
            <View key={i} style={styles.slide}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={styles.slideImage}
                  resizeMode="cover"
                  onError={() => {}}
                />
              ) : (
                <LinearGradient
                  colors={
                    i === 0
                      ? [pc.greenMain, pc.greenLight, pc.greenAccent, pc.greenMist]
                      : [pc.greenDeep, pc.greenMain, pc.greenAccent]
                  }
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={styles.slideGradient}
                >
                  <Text style={styles.slidePlaceholder}>{i === 0 ? '🏌️' : '⛳'}</Text>
                </LinearGradient>
              )}
            </View>
          ))}
        </ScrollView>

        {/* 상단 네비게이션 */}
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent']}
          style={styles.navOverlay}
          pointerEvents="box-none"
        >
          <View style={styles.navRow}>
            {!isOwnProfile ? (
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}>
                <Text style={styles.navBtnText}>‹</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
            <Text style={styles.navTitle}>프로필</Text>
            <View style={styles.navRightGroup}>
              <View style={styles.photoCounter}>
                <Text style={styles.counterText}>
                  {currentPhotoIndex + 1}/{photoList.length}
                </Text>
                <Text style={{ fontSize: 13 }}>📷</Text>
              </View>
              {isOwnProfile && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => navigation?.navigate('Settings')}
                >
                  <Text style={{ fontSize: 16 }}>⚙️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* 신고 버튼 (타인 프로필) */}
        {!isOwnProfile && (
          <TouchableOpacity style={styles.reportBtn}>
            <Text style={styles.reportText}>🚩 신고하기</Text>
          </TouchableOpacity>
        )}

        {/* 슬라이드 인디케이터 */}
        {photoList.length > 1 && (
          <View style={styles.dotsRow}>
            {photoList.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dot, currentPhotoIndex === i && styles.dotActive]}
                onPress={() => goToSlide(i)}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── Profile Card (사진 위로 겹침) ── */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* 아바타 (카드 위에 떠있는 형태) */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarBox}>
            {profile?.photoURL || user?.photoURL ? (
              <Image
                source={{ uri: profile?.photoURL || user?.photoURL || '' }}
                style={styles.avatarImg}
              />
            ) : (
              <LinearGradient colors={[pc.greenPale, pc.greenMist]} style={styles.avatarFallback}>
                <Text style={{ fontSize: 28 }}>⛳</Text>
              </LinearGradient>
            )}
          </View>
          <View style={styles.onlineDot} />
        </View>

        {/* 이름 + 좋아요 */}
        <View style={styles.infoHeader}>
          <View style={styles.infoLeft}>
            <Text style={styles.userName}>{displayName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaPin}>📍</Text>
              <Text style={styles.metaText}>{location}</Text>
            </View>
          </View>
          {isOwnProfile ? (
            <View style={styles.likeBox}>
              <Text style={styles.likeHeart}>🧡</Text>
              <Text style={styles.likeNum}>{likeCount}</Text>
              <Text style={styles.likeUnit}>개</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.likeBox, liked && styles.likeBoxLiked]}
              onPress={handleLike}
              activeOpacity={0.8}
            >
              <Text style={styles.likeHeart}>{liked ? '❤️' : '🧡'}</Text>
              <Text style={styles.likeNum}>{likeCount}</Text>
              <Text style={styles.likeUnit}>개</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 소개 */}
        <View style={styles.bioBox}>
          <Text style={styles.bioText}>{bio}</Text>
          {isOwnProfile && (
            <TouchableOpacity
              style={styles.bioEditBtn}
              onPress={() => navigation?.navigate('EditProfile')}
            >
              <Text style={styles.bioEditText}>✏️ 소개 수정</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionRow}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionOutline]}
                onPress={() => navigation?.navigate('EditProfile')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionOutlineText}>✏️ 프로필 수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionFill]}
                onPress={() => navigation?.navigate('MyHomeMain')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionFillText}>🏠 My홈피</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionOutline]}
                activeOpacity={0.7}
              >
                <Text style={styles.actionOutlineText}>👥 골친 신청</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionFill]} activeOpacity={0.7}>
                <Text style={styles.actionFillText}>💬 메세지</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Today / Total */}
        <View style={styles.ttBox}>
          <View style={styles.ttItem}>
            <Text style={styles.ttLabel}>TODAY</Text>
            <Text style={styles.ttValue}>{(profile as any)?.stats?.todayVisits || 0}</Text>
          </View>
          <View style={styles.ttDivider} />
          <View style={styles.ttItem}>
            <Text style={styles.ttLabel}>TOTAL</Text>
            <Text style={styles.ttValue}>{totalRounds > 0 ? totalRounds : 0}</Text>
          </View>
        </View>

        {/* 골프 스탯 */}
        <View style={styles.statsGrid}>
          {[
            {
              emoji: '🎯',
              label: '평균타수',
              value: averageScore > 0 ? `${averageScore}` : '90-100',
            },
            {
              emoji: '📅',
              label: '골프경력',
              value: (profile as any)?.golfExperience || '4-5년',
            },
            {
              emoji: '⛳',
              label: '월라운드',
              value: (profile as any)?.monthlyRounds
                ? `${(profile as any).monthlyRounds}회`
                : '2-3회',
            },
            {
              emoji: '✈️',
              label: '해외골프',
              value: (profile as any)?.overseasGolf || '1-2회',
            },
          ].map((stat, i) => (
            <View key={i} style={styles.statChip}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={styles.statChipLabel}>{stat.label}</Text>
              <Text style={styles.statChipValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* 자주 가는 골프장 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자주 가는 골프장</Text>
          <View style={styles.tagWrap}>
            {(favoriteCourses.length > 0
              ? favoriteCourses
              : [{ name: '남서울CC' }, { name: '블루원 용인' }, { name: '이스트밸리' }]
            ).map((course, i) => (
              <TouchableOpacity key={i} style={styles.favTag} activeOpacity={0.7}>
                <Text style={styles.favTagText}>
                  {typeof course === 'string' ? course : course.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 라운딩 스타일 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>라운딩 스타일</Text>
          <View style={styles.tagWrap}>
            {((profile as any)?.roundingStyles?.length > 0
              ? (profile as any).roundingStyles
              : ['🌅 새벽 티업', '🍻 에프터 좋아함', '😄 즐골파']
            ).map((tag: string, i: number) => (
              <View key={i} style={styles.styleTag}>
                <Text style={styles.styleTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 내 관심사 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 관심사</Text>
          <View style={styles.tagWrap}>
            {((profile as any)?.interests?.length > 0
              ? (profile as any).interests
              : ['✈️ 여행', '🍽️ 맛집탐방', '🎵 음악']
            ).map((tag: string, i: number) => (
              <View key={i} style={styles.interestTag}>
                <Text style={styles.interestTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 메뉴 (본인 프로필) */}
        {isOwnProfile && (
          <View style={styles.menuBox}>
            {[
              { icon: '⛳', label: '내 부킹 목록', screen: 'MyBookings' },
              { icon: '👑', label: '멤버십 관리', screen: 'MembershipManage' },
              { icon: '💰', label: '포인트 내역', screen: 'PointHistory' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.menuItem, i > 0 && styles.menuItemBorder]}
                onPress={() => navigation?.navigate(item.screen)}
                activeOpacity={0.6}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 로그아웃 */}
        {isOwnProfile && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // ── Photo Hero ──
  heroWrap: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidePlaceholder: {
    fontSize: 80,
    opacity: 0.35,
  },

  // 상단 내비게이션
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: fontWeight.bold,
    marginTop: -2,
  },
  navTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  counterText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: '#fff',
  },

  // 신고
  reportBtn: {
    position: 'absolute',
    top: 110,
    right: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  reportText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },

  // 슬라이드 인디케이터
  dotsRow: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  // ── Profile Card ──
  card: {
    marginTop: -80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 400,
  },

  // 아바타
  avatarWrap: {
    position: 'absolute',
    top: -30,
    left: 20,
    zIndex: 10,
  },
  avatarBox: {
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
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
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

  // 이름 + 좋아요
  infoHeader: {
    paddingTop: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  infoLeft: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaPin: {
    fontSize: 14,
    color: pc.greenAccent,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  likeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff0f0',
  },
  likeBoxLiked: {
    backgroundColor: '#ffe0e0',
  },
  likeHeart: {
    fontSize: 18,
  },
  likeNum: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: pc.heart,
  },
  likeUnit: {
    fontSize: 12,
    color: pc.heart,
    opacity: 0.7,
  },

  // 소개
  bioBox: {
    marginTop: 14,
    marginBottom: 18,
    padding: 14,
    paddingLeft: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: pc.greenAccent,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  bioEditBtn: {
    marginTop: 8,
  },
  bioEditText: {
    fontSize: 12,
    color: pc.greenMain,
    fontWeight: fontWeight.medium,
  },

  // 액션 버튼
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutline: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: pc.greenMain,
  },
  actionOutlineText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: pc.greenMain,
  },
  actionFill: {
    backgroundColor: pc.greenMain,
    borderWidth: 1.5,
    borderColor: pc.greenMain,
  },
  actionFillText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },

  // Today / Total
  ttBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 18,
  },
  ttItem: {
    flex: 1,
    alignItems: 'center',
  },
  ttLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ttValue: {
    fontSize: 26,
    fontWeight: fontWeight.bold,
    color: pc.greenMain,
  },
  ttDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e8e8e8',
  },

  // 골프 스탯 그리드
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  statChipLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: fontWeight.medium,
    marginBottom: 4,
  },
  statChipValue: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },

  // 섹션 공통
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // 자주 가는 골프장 태그
  favTag: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: pc.greenMist,
    borderWidth: 1,
    borderColor: pc.greenPale,
  },
  favTagText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: pc.greenDeep,
  },

  // 라운딩 스타일 태그
  styleTag: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: pc.cream,
    borderWidth: 1,
    borderColor: pc.goldLight,
  },
  styleTagText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: pc.gold,
  },

  // 관심사 태그
  interestTag: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#fcd5c0',
  },
  interestTagText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: '#d97706',
  },

  // 메뉴
  menuBox: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  menuArrow: {
    fontSize: 22,
    color: '#ccc',
  },

  // 로그아웃
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: fontWeight.semibold,
  },
});
