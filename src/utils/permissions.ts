import { MembershipType, MembershipPermissions } from '@/types/membership';
import { MEMBERSHIP_PERMISSIONS } from '@/constants/membershipPlans';

// 멤버십 타입에 따른 권한 가져오기
export const getMembershipPermissions = (type: MembershipType): MembershipPermissions => {
  return MEMBERSHIP_PERMISSIONS[type];
};

// 특정 권한 확인
export const hasPermission = (
  type: MembershipType,
  permission: keyof MembershipPermissions,
): boolean => {
  const permissions = getMembershipPermissions(type);
  return permissions[permission];
};

// 부킹 참가 가능 여부
export const canJoinBooking = (type: MembershipType): boolean => {
  return hasPermission(type, 'canJoinBooking');
};

// 부킹 생성 가능 여부
export const canCreateBooking = (type: MembershipType): boolean => {
  return hasPermission(type, 'canCreateBooking');
};

// 채팅 가능 여부
export const canChat = (type: MembershipType): boolean => {
  return hasPermission(type, 'canChat');
};

// 게시물 작성 가능 여부
export const canCreatePost = (type: MembershipType): boolean => {
  return hasPermission(type, 'canCreatePost');
};

// 프리미엄 회원 여부
export const isPremiumMember = (type: MembershipType): boolean => {
  return type === MembershipType.PREMIUM || type === MembershipType.VIP;
};

// VIP 회원 여부
export const isVIPMember = (type: MembershipType): boolean => {
  return type === MembershipType.VIP;
};

// 무료 회원 여부
export const isFreeMember = (type: MembershipType): boolean => {
  return type === MembershipType.FREE;
};

// 권한 없음 메시지 가져오기
export const getPermissionDeniedMessage = (
  feature: string,
  membershipType: MembershipType,
): string => {
  if (membershipType === MembershipType.FREE) {
    return `${feature}은(는) 프리미엄 회원 전용 기능입니다.\n프리미엄으로 업그레이드하시겠습니까?`;
  }
  return `이 기능을 사용할 수 없습니다.`;
};

// 멤버십 게이트 (권한 체크 후 업그레이드 유도)
export const membershipGate = (
  membershipType: MembershipType,
  permission: keyof MembershipPermissions,
  onUpgrade: () => void,
  onProceed: () => void,
): void => {
  if (hasPermission(membershipType, permission)) {
    onProceed();
  } else {
    onUpgrade();
  }
};
