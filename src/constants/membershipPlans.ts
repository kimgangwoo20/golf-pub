import { MembershipType, BillingCycle, MembershipPlan, MembershipPermissions } from '../types/membership';

// 멤버십 플랜 정의
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    type: MembershipType.FREE,
    name: '무료 회원',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: '기본 기능을 무료로 이용하세요',
    features: [
      '부킹 조회만 가능',
      '프로필 열람 제한',
      '광고 표시',
      '기본 고객센터',
    ],
    monthlyPoints: 0,
    badge: '⭐',
    color: '#95a5a6',
    isPopular: false,
  },
  {
    id: 'premium',
    type: MembershipType.PREMIUM,
    name: '프리미엄',
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    description: '모든 기능을 자유롭게 이용하세요',
    features: [
      '무제한 부킹 참가',
      '무제한 채팅',
      '중고거래 가능',
      '골프장 예약',
      '매월 5,000P 적립',
      '광고 제거',
      '프리미엄 배지',
      '우선 고객센터',
    ],
    monthlyPoints: 5000,
    badge: '👑',
    color: '#3498db',
    isPopular: true,
  },
  {
    id: 'vip',
    type: MembershipType.VIP,
    name: 'VIP',
    monthlyPrice: 29900,
    yearlyPrice: 299000,
    description: 'VIP 전용 혜택을 누리세요',
    features: [
      '프리미엄 모든 혜택',
      '코치 매칭 무료',
      '골프장 예약 15% 할인',
      '프리미엄 라운지 이용',
      '매월 20,000P 적립',
      'VIP 배지',
      '전용 고객센터',
      '우선 예약권',
    ],
    monthlyPoints: 20000,
    badge: '💎',
    color: '#9b59b6',
    isPopular: false,
  },
];

// 멤버십별 권한 매핑
export const MEMBERSHIP_PERMISSIONS: Record<MembershipType, MembershipPermissions> = {
  [MembershipType.FREE]: {
    canCreateBooking: false,
    canJoinBooking: false,
    canChat: false,
    canCreatePost: false,
    canComment: false,
    canTrade: false,
    canReserveGolfCourse: false,
    canSendMessage: false,
    canViewProfiles: true,
    canAccessPremiumContent: false,
  },
  [MembershipType.PREMIUM]: {
    canCreateBooking: true,
    canJoinBooking: true,
    canChat: true,
    canCreatePost: true,
    canComment: true,
    canTrade: true,
    canReserveGolfCourse: true,
    canSendMessage: true,
    canViewProfiles: true,
    canAccessPremiumContent: true,
  },
  [MembershipType.VIP]: {
    canCreateBooking: true,
    canJoinBooking: true,
    canChat: true,
    canCreatePost: true,
    canComment: true,
    canTrade: true,
    canReserveGolfCourse: true,
    canSendMessage: true,
    canViewProfiles: true,
    canAccessPremiumContent: true,
  },
};

// 멤버십 비교표 데이터
export const MEMBERSHIP_COMPARISON = [
  { feature: '부킹 조회', free: '✓', premium: '✓', vip: '✓' },
  { feature: '부킹 참가', free: '✗', premium: '✓', vip: '✓' },
  { feature: '채팅', free: '✗', premium: '무제한', vip: '무제한' },
  { feature: '게시물 작성', free: '✗', premium: '✓', vip: '✓' },
  { feature: '중고거래', free: '✗', premium: '✓', vip: '✓' },
  { feature: '골프장 예약', free: '✗', premium: '✓', vip: '15% 할인' },
  { feature: '월 포인트', free: '-', premium: '5,000P', vip: '20,000P' },
  { feature: '광고', free: '표시', premium: '제거', vip: '제거' },
  { feature: '배지', free: '-', premium: '👑', vip: '💎' },
  { feature: '코치 매칭', free: '✗', premium: '유료', vip: '무료' },
  { feature: '고객센터', free: '기본', premium: '우선', vip: '전용' },
];

// 할인율 계산
export const YEARLY_DISCOUNT = 0.17; // 17% 할인
