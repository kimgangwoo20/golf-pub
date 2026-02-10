// navigation-types.ts - 네비게이션 파라미터 타입 정의

import { GolfCourse } from '@/types/golfcourse-types';

/**
 * 홈 스택 파라미터
 */
export type HomeStackParamList = {
  HomeMain: undefined;
  Membership: undefined;
  MembershipPlan: undefined;
  PlanComparison: undefined;
  MembershipPayment: { plan: string; billingCycle: 'MONTHLY' | 'ANNUAL'; price: number };
  MembershipSuccess: undefined;
  MembershipBenefits: undefined;
  MembershipManage: undefined;
  UpgradePlan: undefined;
  NotificationList: undefined;
};

/**
 * 부킹 스택 파라미터
 */
export type BookingStackParamList = {
  BookingList: undefined;
  BookingDetail: { bookingId: string };
  CreateBooking: undefined;
  Payment: { bookingId: string };
  ApplicantProfile: { requestId?: string; bookingId?: string; userId?: string };
  BookingRequests: { bookingId: string };
  PopularBookings: undefined;
  RecommendedBookings: undefined;
  RequestStatus: { requestId: string };
};

/**
 * My 홈피 스택 파라미터
 */
export type MyHomeStackParamList = {
  MyHomeMain: undefined;
  Friends: undefined;
  FriendProfile: { friendId: string };
  AddFriend: undefined;
  FriendRequests: undefined;
  InviteFriend: undefined;
  CreateGroup: undefined;
  GroupList: undefined;
  Profile: undefined;
  EditProfile: undefined;
  MyBookings: undefined;
  HostedMeetups: undefined;
  JoinedMeetups: undefined;
  MyPosts: undefined;
  MyReviews: undefined;
  MembershipManage: undefined;
  UpgradePlan: undefined;
  Settings: undefined;
  Notifications: undefined;
  PointHistory: undefined;
  Coupons: undefined;
  PaymentHistory: undefined;
  Support: undefined;
  AccountManagement: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  LocationTerms: undefined;
  OpenSource: undefined;
};

/**
 * 중고거래 스택 파라미터
 */
export type MarketplaceStackParamList = {
  MarketplaceMain: undefined;
  ProductDetail: { productId: string };
  CreateProduct: undefined;
  MyProducts: undefined;
  OfferManagement: undefined;
};

/**
 * 골프장/펍 스택 파라미터
 */
export type GolfCourseStackParamList = {
  GolfCourseSearch: undefined;
  GolfCourseDetail: { course: GolfCourse };
  GolfCourseReview: { course?: GolfCourse; courseId?: string; writeReview?: boolean };
  WriteReview: { courseId: string };
  BestPubs: undefined;
  PubDetail: { pubId: string };
  PubReviews: { pubId: string };
};

/**
 * 채팅 스택 파라미터
 */
export type ChatStackParamList = {
  ChatList: undefined;
  ChatScreen: {
    roomId: string;
    chatName?: string;
    roomType?: 'booking' | 'marketplace' | 'direct';
  };
  ChatRoom: { chatId: string; chatName?: string; chatTitle?: string };
  CreateChat: undefined;
  ChatSettings: undefined;
};

/**
 * 피드 스택 파라미터
 */
export type FeedStackParamList = {
  FeedMain: undefined;
  CreatePost: undefined;
  PostDetail: { postId: string };
  NotificationList: undefined;
};
