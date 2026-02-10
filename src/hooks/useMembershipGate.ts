// 멤버십 게이팅 훅 — 성별 기반 면제 포함
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { MembershipType } from '@/types/membership';
import { hasPermission } from '@/utils/permissions';
import type { MembershipPermissions } from '@/types/membership';

// 기능명 → MembershipPermissions 키 매핑
const FEATURE_PERMISSION_MAP: Record<string, keyof MembershipPermissions> = {
  chat: 'canChat',
  trade: 'canTrade',
  createPost: 'canCreatePost',
  viewProfile: 'canViewProfiles',
  addFriend: 'canSendMessage',
  createBooking: 'canCreateBooking',
  joinBooking: 'canJoinBooking',
  myHome: 'canAccessPremiumContent',
};

// 기능명 → 한국어 라벨
const FEATURE_LABELS: Record<string, string> = {
  chat: '채팅',
  trade: '중고거래',
  createPost: '게시물 작성',
  viewProfile: '프로필 보기',
  addFriend: '친구 추가',
  createBooking: '모임 만들기',
  joinBooking: '모임 참가',
  myHome: 'My홈피',
};

export const useMembershipGate = () => {
  const { userProfile } = useAuthStore();
  const navigation = useNavigation<any>();

  // 여성 여부
  const isFemale = userProfile?.gender === 'female';

  // 프리미엄/VIP 구독자 여부
  const membership = (userProfile?.membership as MembershipType) || MembershipType.FREE;
  const isPremium = membership === MembershipType.PREMIUM || membership === MembershipType.VIP;

  /**
   * 접근 권한 확인
   * - userProfile null(로딩 중) → 허용 (크래시 방지)
   * - 여성 → 항상 허용
   * - 프리미엄/VIP → 항상 허용
   * - 무료 남성 → 권한 테이블로 판단
   */
  const checkAccess = (feature: string): boolean => {
    // 로딩 중이면 일단 허용
    if (!userProfile) return true;

    // 여성 무조건 허용
    if (isFemale) return true;

    // 프리미엄/VIP 허용
    if (isPremium) return true;

    // 무료 남성 → 권한 테이블 확인
    const permissionKey = FEATURE_PERMISSION_MAP[feature];
    if (permissionKey) {
      return hasPermission(MembershipType.FREE, permissionKey);
    }

    // 매핑 없는 기능은 기본 차단 (보수적 처리)
    return false;
  };

  /**
   * 액션 게이팅 — 접근 가능하면 실행, 아니면 프리미엄 안내
   */
  const gateAction = (feature: string, onAllow: () => void) => {
    if (checkAccess(feature)) {
      onAllow();
      return;
    }

    const label = FEATURE_LABELS[feature] || feature;
    Alert.alert(
      '프리미엄 회원 전용',
      `${label}은(는) 프리미엄 회원 전용 기능입니다.\n프리미엄으로 업그레이드하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '프리미엄 가입하기',
          onPress: () => navigation.navigate('Home', { screen: 'Membership' }),
        },
      ],
    );
  };

  return { checkAccess, gateAction, isFemale, isPremium };
};
