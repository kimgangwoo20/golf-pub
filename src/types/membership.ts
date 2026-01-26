// 멤버십 타입 정의
export enum MembershipType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

export interface MembershipPlan {
  id: string;
  type: MembershipType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  monthlyPoints: number;
  badge: string;
  color: string;
  isPopular: boolean;
}

export interface MembershipFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface UserMembership {
  userId: string;
  membershipType: MembershipType;
  status: MembershipStatus;
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  billingCycle: BillingCycle;
  autoRenew: boolean;
  totalPoints: number;
}

export interface MembershipPermissions {
  canCreateBooking: boolean;
  canJoinBooking: boolean;
  canChat: boolean;
  canCreatePost: boolean;
  canComment: boolean;
  canTrade: boolean;
  canReserveGolfCourse: boolean;
  canSendMessage: boolean;
  canViewProfiles: boolean;
  canAccessPremiumContent: boolean;
}
