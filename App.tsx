// App.tsx - Expo 앱 진입점 (Firebase + Auth 통합)
import React, { Suspense, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/utils/navigationRef';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Firebase 초기화
import './src/services/firebase/firebaseConfig';

// 홈 화면
import { HomeScreen } from './src/screens/home/HomeScreen';

// 멤버십 화면들 (lazy import - 필요 시에만 로드)
const MembershipIntroScreen = React.lazy(() => import('./src/screens/membership/MembershipIntroScreen').then(m => ({ default: m.MembershipIntroScreen })));
const MembershipPlanScreen = React.lazy(() => import('./src/screens/membership/MembershipPlanScreen').then(m => ({ default: m.MembershipPlanScreen })));
const PlanComparisonScreen = React.lazy(() => import('./src/screens/membership/PlanComparisonScreen').then(m => ({ default: m.PlanComparisonScreen })));
const MembershipPaymentScreen = React.lazy(() => import('./src/screens/membership/MembershipPaymentScreen').then(m => ({ default: m.MembershipPaymentScreen })));
const MembershipSuccessScreen = React.lazy(() => import('./src/screens/membership/MembershipSuccessScreen').then(m => ({ default: m.MembershipSuccessScreen })));
const MembershipBenefitsScreen = React.lazy(() => import('./src/screens/membership/MembershipBenefitsScreen').then(m => ({ default: m.MembershipBenefitsScreen })));
const MembershipManageScreen = React.lazy(() => import('./src/screens/membership/MembershipManageScreen').then(m => ({ default: m.MembershipManageScreen })));
const UpgradePlanScreen = React.lazy(() => import('./src/screens/membership/UpgradePlanScreen').then(m => ({ default: m.UpgradePlanScreen })));

// 부킹 화면들
import { BookingListScreen } from './src/screens/booking/BookingListScreen';
import { BookingDetailScreen } from './src/screens/booking/BookingDetailScreen';
import { CreateBookingScreen } from './src/screens/booking/CreateBookingScreen';
import { PaymentScreen } from './src/screens/booking/PaymentScreen';
import { ApplicantProfileScreen } from './src/screens/booking/ApplicantProfileScreen';
import { BookingRequestsScreen } from './src/screens/booking/BookingRequestsScreen';
import { PopularBookingsScreen } from './src/screens/booking/PopularBookingsScreen';
import { RecommendedBookingsScreen } from './src/screens/booking/RecommendedBookingsScreen';
import { RequestStatusScreen } from './src/screens/booking/RequestStatusScreen';

// My 홈피 화면
import { MyHomeScreen } from './src/screens/my/MyHomeScreen';

// 활동 화면들
import { HostedMeetupsScreen } from './src/screens/my/activity/HostedMeetupsScreen';
import { JoinedMeetupsScreen } from './src/screens/my/activity/JoinedMeetupsScreen';
import { MyPostsScreen } from './src/screens/my/activity/MyPostsScreen';
import { MyReviewsScreen } from './src/screens/my/activity/MyReviewsScreen';

// 프로필 화면들
import { ProfileScreen } from './src/screens/profile/ProfileScreen';
import { EditProfileScreen } from './src/screens/profile/EditProfileScreen';
import { SettingsScreen } from './src/screens/my/settings/SettingsScreen';
import { PointHistoryScreen } from './src/screens/my/settings/PointHistoryScreen';
import { CouponsScreen } from './src/screens/my/settings/CouponsScreen';
import { SupportScreen } from './src/screens/my/settings/SupportScreen';
import { AccountManagementScreen } from './src/screens/my/settings/AccountManagementScreen';
import { PrivacyPolicyScreen } from './src/screens/my/settings/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './src/screens/my/settings/TermsOfServiceScreen';
import { LocationTermsScreen } from './src/screens/my/settings/LocationTermsScreen';
import { OpenSourceScreen } from './src/screens/my/settings/OpenSourceScreen';
import { MyBookingsScreen } from './src/screens/profile/MyBookingsScreen';

// 중고거래 화면들
import { MarketplaceScreen } from './src/screens/marketplace/MarketplaceScreen';
import { ProductDetailScreen } from './src/screens/marketplace/ProductDetailScreen';
import { CreateProductScreen } from './src/screens/marketplace/CreateProductScreen';
import { MyProductsScreen } from './src/screens/marketplace/MyProductsScreen';
import { OfferManagementScreen } from './src/screens/marketplace/OfferManagementScreen';

// 친구 화면들
import { FriendsScreen } from './src/screens/friends/FriendsScreen';
import { FriendProfileScreen } from './src/screens/friends/FriendProfileScreen';
import { AddFriendScreen } from './src/screens/friends/AddFriendScreen';
import { FriendRequestsScreen } from './src/screens/friends/FriendRequestsScreen';

// 친구 그룹/초대 화면들 (lazy import)
const InviteScreen = React.lazy(() => import('./src/screens/friend/InviteScreen').then(m => ({ default: m.InviteScreen })));
const CreateGroupScreen = React.lazy(() => import('./src/screens/friend/CreateGroupScreen').then(m => ({ default: m.CreateGroupScreen })));
const GroupListScreen = React.lazy(() => import('./src/screens/friend/GroupListScreen').then(m => ({ default: m.GroupListScreen })));

// Feed 화면들
import { FeedScreen } from './src/screens/feed/FeedScreen';
import { CreatePostScreen } from './src/screens/feed/CreatePostScreen';
import { PostDetailScreen } from './src/screens/feed/PostDetailScreen';

// 알림 화면
import { NotificationListScreen } from './src/screens/notification/NotificationListScreen';

// 골프장 화면들
import { GolfCourseSearchScreen } from './src/screens/golfcourse/GolfCourseSearchScreen';
import { GolfCourseDetailScreen } from './src/screens/golfcourse/GolfCourseDetailScreen';
import { GolfCourseReviewScreen } from './src/screens/golfcourse/GolfCourseReviewScreen';
import { WriteReviewScreen } from './src/screens/golfcourse/WriteReviewScreen';

// 펍 화면들
import { BestPubsScreen } from './src/screens/pub/BestPubsScreen';
import { PubDetailScreen } from './src/screens/pub/PubDetailScreen';
import { PubReviewsScreen } from './src/screens/pub/PubReviewsScreen';

// 채팅 화면들 (Firebase)
import { ChatListScreen } from './src/screens/chat/ChatListScreen-Firebase';
import { ChatScreen } from './src/screens/chat/ChatScreen';
import { ChatRoomScreen } from './src/screens/chat/ChatRoomScreen';
import { CreateChatScreen } from './src/screens/chat/CreateChatScreen-Firebase';
import { ChatSettingsScreen } from './src/screens/chat/ChatSettingsScreen';

// 인증 관련
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { useAuthStore } from './src/store/useAuthStore';

// 알림
import { firebaseMessaging } from './src/services/firebase/firebaseMessaging';
import { useNotificationStore } from './src/store/useNotificationStore';

// Error Boundary
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

// 결제 내역
import { PaymentHistoryScreen } from './src/screens/profile/PaymentHistoryScreen';

// Lazy 스크린 래퍼 (Suspense fallback)
const LazyFallback = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="small" color="#10b981" />
  </View>
);

// React.lazy 컴포넌트를 React Navigation과 호환되게 래핑
const withSuspense = (LazyComponent: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (props: any) => (
    <Suspense fallback={<LazyFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// lazy 화면 Suspense 래핑
const MembershipIntroSuspense = withSuspense(MembershipIntroScreen);
const MembershipPlanSuspense = withSuspense(MembershipPlanScreen);
const PlanComparisonSuspense = withSuspense(PlanComparisonScreen);
const MembershipPaymentSuspense = withSuspense(MembershipPaymentScreen);
const MembershipSuccessSuspense = withSuspense(MembershipSuccessScreen);
const MembershipBenefitsSuspense = withSuspense(MembershipBenefitsScreen);
const MembershipManageSuspense = withSuspense(MembershipManageScreen);
const UpgradePlanSuspense = withSuspense(UpgradePlanScreen);
const InviteSuspense = withSuspense(InviteScreen);
const CreateGroupSuspense = withSuspense(CreateGroupScreen);
const GroupListSuspense = withSuspense(GroupListScreen);

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BookingStack = createNativeStackNavigator();
const MyHomeStack = createNativeStackNavigator();
const MarketplaceStack = createNativeStackNavigator();
const GolfCourseStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();

// 홈 스택 (멤버십 포함)
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Membership" component={MembershipIntroSuspense} />
    <HomeStack.Screen name="MembershipPlan" component={MembershipPlanSuspense} />
    <HomeStack.Screen name="PlanComparison" component={PlanComparisonSuspense} />
    <HomeStack.Screen name="MembershipPayment" component={MembershipPaymentSuspense} />
    <HomeStack.Screen name="MembershipSuccess" component={MembershipSuccessSuspense} />
    <HomeStack.Screen name="MembershipBenefits" component={MembershipBenefitsSuspense} />
    <HomeStack.Screen name="MembershipManage" component={MembershipManageSuspense} />
    <HomeStack.Screen name="UpgradePlan" component={UpgradePlanSuspense} />
    <HomeStack.Screen name="NotificationList" component={NotificationListScreen} />
  </HomeStack.Navigator>
);

// 부킹 스택 (전체)
const BookingStackNavigator = () => (
  <BookingStack.Navigator screenOptions={{ headerShown: false }}>
    <BookingStack.Screen name="BookingList" component={BookingListScreen} />
    <BookingStack.Screen name="BookingDetail" component={BookingDetailScreen} />
    <BookingStack.Screen name="CreateBooking" component={CreateBookingScreen} />
    <BookingStack.Screen name="Payment" component={PaymentScreen} />
    <BookingStack.Screen name="ApplicantProfile" component={ApplicantProfileScreen} />
    <BookingStack.Screen name="BookingRequests" component={BookingRequestsScreen} />
    <BookingStack.Screen name="PopularBookings" component={PopularBookingsScreen} />
    <BookingStack.Screen name="RecommendedBookings" component={RecommendedBookingsScreen} />
    <BookingStack.Screen name="RequestStatus" component={RequestStatusScreen} />
  </BookingStack.Navigator>
);

// My 홈피 스택 (친구그룹, 내예약, 활동 포함)
const MyHomeStackNavigator = () => (
  <MyHomeStack.Navigator screenOptions={{ headerShown: false }}>
    <MyHomeStack.Screen name="MyHomeMain" component={MyHomeScreen} />
    {/* 친구 관련 */}
    <MyHomeStack.Screen name="Friends" component={FriendsScreen} />
    <MyHomeStack.Screen name="FriendProfile" component={FriendProfileScreen} />
    <MyHomeStack.Screen name="AddFriend" component={AddFriendScreen} />
    <MyHomeStack.Screen name="FriendRequests" component={FriendRequestsScreen} />
    {/* 친구 그룹/초대 */}
    <MyHomeStack.Screen name="InviteFriend" component={InviteSuspense} />
    <MyHomeStack.Screen name="CreateGroup" component={CreateGroupSuspense} />
    <MyHomeStack.Screen name="GroupList" component={GroupListSuspense} />
    {/* 프로필 관련 */}
    <MyHomeStack.Screen name="Profile" component={ProfileScreen} />
    <MyHomeStack.Screen name="EditProfile" component={EditProfileScreen} />
    <MyHomeStack.Screen name="MyBookings" component={MyBookingsScreen} />
    {/* 활동 화면들 */}
    <MyHomeStack.Screen name="HostedMeetups" component={HostedMeetupsScreen} />
    <MyHomeStack.Screen name="JoinedMeetups" component={JoinedMeetupsScreen} />
    <MyHomeStack.Screen name="MyPosts" component={MyPostsScreen} />
    <MyHomeStack.Screen name="MyReviews" component={MyReviewsScreen} />
    {/* 멤버십 관리 (프로필에서 접근) */}
    <MyHomeStack.Screen name="MembershipManage" component={MembershipManageSuspense} />
    <MyHomeStack.Screen name="UpgradePlan" component={UpgradePlanSuspense} />
    {/* 설정 & 알림 */}
    <MyHomeStack.Screen name="Settings" component={SettingsScreen} />
    <MyHomeStack.Screen name="Notifications" component={NotificationListScreen} />
    {/* 포인트, 쿠폰, 고객센터 */}
    <MyHomeStack.Screen name="PointHistory" component={PointHistoryScreen} />
    <MyHomeStack.Screen name="Coupons" component={CouponsScreen} />
    <MyHomeStack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    <MyHomeStack.Screen name="Support" component={SupportScreen} />
    {/* 설정 하위 화면들 */}
    <MyHomeStack.Screen name="AccountManagement" component={AccountManagementScreen} />
    <MyHomeStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <MyHomeStack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    <MyHomeStack.Screen name="LocationTerms" component={LocationTermsScreen} />
    <MyHomeStack.Screen name="OpenSource" component={OpenSourceScreen} />
  </MyHomeStack.Navigator>
);

// 중고거래 스택
const MarketplaceStackNavigator = () => (
  <MarketplaceStack.Navigator screenOptions={{ headerShown: false }}>
    <MarketplaceStack.Screen name="MarketplaceMain" component={MarketplaceScreen} />
    <MarketplaceStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <MarketplaceStack.Screen name="CreateProduct" component={CreateProductScreen} />
    <MarketplaceStack.Screen name="MyProducts" component={MyProductsScreen} />
    <MarketplaceStack.Screen name="OfferManagement" component={OfferManagementScreen} />
  </MarketplaceStack.Navigator>
);

// 골프장 + 펍 스택
const GolfCourseStackNavigator = () => (
  <GolfCourseStack.Navigator screenOptions={{ headerShown: false }}>
    <GolfCourseStack.Screen name="GolfCourseSearch" component={GolfCourseSearchScreen} />
    <GolfCourseStack.Screen name="GolfCourseDetail" component={GolfCourseDetailScreen} />
    <GolfCourseStack.Screen name="GolfCourseReview" component={GolfCourseReviewScreen as any} />
    <GolfCourseStack.Screen name="WriteReview" component={WriteReviewScreen} />
    <GolfCourseStack.Screen name="BestPubs" component={BestPubsScreen} />
    <GolfCourseStack.Screen name="PubDetail" component={PubDetailScreen} />
    <GolfCourseStack.Screen name="PubReviews" component={PubReviewsScreen} />
  </GolfCourseStack.Navigator>
);

// 채팅 스택
const ChatStackNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} />
    <ChatStack.Screen name="ChatScreen" component={ChatScreen as any} />
    <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    <ChatStack.Screen name="CreateChat" component={CreateChatScreen} />
    <ChatStack.Screen name="ChatSettings" component={ChatSettingsScreen} />
  </ChatStack.Navigator>
);

// Feed 스택
const FeedStackNavigator = () => (
  <FeedStack.Navigator screenOptions={{ headerShown: false }}>
    <FeedStack.Screen name="FeedMain" component={FeedScreen} />
    <FeedStack.Screen name="CreatePost" component={CreatePostScreen} />
    <FeedStack.Screen name="PostDetail" component={PostDetailScreen as any} />
    <FeedStack.Screen name="NotificationList" component={NotificationListScreen} />
  </FeedStack.Navigator>
);

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 12),
          height: 58 + Math.max(insets.bottom, 12),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
              🏠
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingStackNavigator}
        options={{
          tabBarLabel: '부킹',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
              ⛳
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedStackNavigator}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
              📱
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
              💬
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceStackNavigator}
        options={{
          tabBarLabel: '중고거래',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
              🛒
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="GolfCourse"
        component={GolfCourseStackNavigator}
        options={{
          tabBarLabel: '골프장',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
              🏌️
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyHome"
        component={MyHomeStackNavigator}
        options={{
          tabBarLabel: 'My홈피',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
              🏡
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Deep Linking 설정
const linking = {
  prefixes: ['golfpub://', 'https://golfpub.app'],
  config: {
    screens: {
      Home: {
        screens: {
          HomeMain: 'home',
          NotificationList: 'notifications',
        },
      },
      Bookings: {
        screens: {
          BookingList: 'bookings',
          BookingDetail: 'bookings/:bookingId',
        },
      },
      Feed: {
        screens: {
          FeedMain: 'feed',
          PostDetail: 'feed/:postId',
        },
      },
      Chat: {
        screens: {
          ChatList: 'chat',
          ChatRoom: 'chat/:chatId',
        },
      },
      Marketplace: {
        screens: {
          MarketplaceMain: 'marketplace',
          ProductDetail: 'marketplace/:productId',
        },
      },
      GolfCourse: {
        screens: {
          GolfCourseSearch: 'golfcourse',
          GolfCourseDetail: 'golfcourse/:courseId',
        },
      },
      MyHome: {
        screens: {
          MyHomeMain: 'myhome',
          Profile: 'profile',
          PointHistory: 'points',
          Coupons: 'coupons',
          PaymentHistory: 'payments',
        },
      },
    },
  },
};

export default function App() {
  const { user, loading, initAuth } = useAuthStore();
  const { subscribeToUnreadCount, unsubscribeFromUnreadCount } = useNotificationStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return unsubscribe;
  }, []);

  // FCM 초기화 + 알림 구독 (로그인 후)
  useEffect(() => {
    if (user?.uid) {
      firebaseMessaging.initialize(user.uid);
      subscribeToUnreadCount(user.uid);
    }
    return () => {
      unsubscribeFromUnreadCount();
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer ref={navigationRef} linking={linking}>
          {user ? <AppContent /> : <AuthNavigator />}
        </NavigationContainer>
      </ErrorBoundary>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
