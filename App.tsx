// App.tsx - Expo 앱 진입점 (Firebase + Auth 통합)
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@/utils/navigationRef';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Firebase 초기화
import '@/services/firebase/firebaseConfig';

// 홈 화면
import { HomeScreen } from '@/screens/home/HomeScreen';

// 멤버십 화면들
import { MembershipIntroScreen } from '@/screens/membership/MembershipIntroScreen';
import { MembershipPlanScreen } from '@/screens/membership/MembershipPlanScreen';
import { PlanComparisonScreen } from '@/screens/membership/PlanComparisonScreen';
import { MembershipPaymentScreen } from '@/screens/membership/MembershipPaymentScreen';
import { MembershipSuccessScreen } from '@/screens/membership/MembershipSuccessScreen';
import { MembershipBenefitsScreen } from '@/screens/membership/MembershipBenefitsScreen';
import { MembershipManageScreen } from '@/screens/membership/MembershipManageScreen';
import { UpgradePlanScreen } from '@/screens/membership/UpgradePlanScreen';

// 부킹 화면들
import { BookingListScreen } from '@/screens/booking/BookingListScreen';
import { BookingDetailScreen } from '@/screens/booking/BookingDetailScreen';
import { CreateBookingScreen } from '@/screens/booking/CreateBookingScreen';
import { PaymentScreen } from '@/screens/booking/PaymentScreen';
import { ApplicantProfileScreen } from '@/screens/booking/ApplicantProfileScreen';
import { BookingRequestsScreen } from '@/screens/booking/BookingRequestsScreen';
import { PopularBookingsScreen } from '@/screens/booking/PopularBookingsScreen';
import { RecommendedBookingsScreen } from '@/screens/booking/RecommendedBookingsScreen';
import { RequestStatusScreen } from '@/screens/booking/RequestStatusScreen';

// My 홈피 화면
import { MyHomeScreen } from '@/screens/my/MyHomeScreen';

// 활동 화면들
import { HostedMeetupsScreen } from '@/screens/my/activity/HostedMeetupsScreen';
import { JoinedMeetupsScreen } from '@/screens/my/activity/JoinedMeetupsScreen';
import { MyPostsScreen } from '@/screens/my/activity/MyPostsScreen';
import { MyReviewsScreen } from '@/screens/my/activity/MyReviewsScreen';
import { MyActivityScreen } from '@/screens/my/activity/MyActivityScreen';

// 프로필 화면들
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { SettingsScreen } from '@/screens/my/settings/SettingsScreen';
import { PointHistoryScreen } from '@/screens/my/settings/PointHistoryScreen';
import { CouponsScreen } from '@/screens/my/settings/CouponsScreen';
import { SupportScreen } from '@/screens/my/settings/SupportScreen';
import { AccountManagementScreen } from '@/screens/my/settings/AccountManagementScreen';
import { PrivacyPolicyScreen } from '@/screens/my/settings/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '@/screens/my/settings/TermsOfServiceScreen';
import { LocationTermsScreen } from '@/screens/my/settings/LocationTermsScreen';
import { OpenSourceScreen } from '@/screens/my/settings/OpenSourceScreen';
import { MyBookingsScreen } from '@/screens/profile/MyBookingsScreen';

// 중고거래 화면들
import { MarketplaceScreen } from '@/screens/marketplace/MarketplaceScreen';
import { ProductDetailScreen } from '@/screens/marketplace/ProductDetailScreen';
import { CreateProductScreen } from '@/screens/marketplace/CreateProductScreen';
import { MyProductsScreen } from '@/screens/marketplace/MyProductsScreen';
import { OfferManagementScreen } from '@/screens/marketplace/OfferManagementScreen';

// 친구 화면들
import { FriendsScreen } from '@/screens/friends/FriendsScreen';
import { FriendProfileScreen } from '@/screens/friends/FriendProfileScreen';
import { AddFriendScreen } from '@/screens/friends/AddFriendScreen';
import { FriendRequestsScreen } from '@/screens/friends/FriendRequestsScreen';

// 친구 그룹/초대 화면들
import { InviteScreen } from '@/screens/friends/InviteScreen';
import { CreateGroupScreen } from '@/screens/friends/CreateGroupScreen';
import { GroupListScreen } from '@/screens/friends/GroupListScreen';

// Feed 화면들
import { FeedScreen } from '@/screens/feed/FeedScreen';
import { CreatePostScreen } from '@/screens/feed/CreatePostScreen';
import { PostDetailScreen } from '@/screens/feed/PostDetailScreen';

// 알림 화면
import { NotificationListScreen } from '@/screens/notification/NotificationListScreen';

// 골프장 화면들
import { GolfCourseSearchScreen } from '@/screens/golfcourse/GolfCourseSearchScreen';
import { GolfCourseDetailScreen } from '@/screens/golfcourse/GolfCourseDetailScreen';
import { GolfCourseReviewScreen } from '@/screens/golfcourse/GolfCourseReviewScreen';
import { WriteReviewScreen } from '@/screens/golfcourse/WriteReviewScreen';

// 펍 화면들
import { BestPubsScreen } from '@/screens/pub/BestPubsScreen';
import { PubDetailScreen } from '@/screens/pub/PubDetailScreen';
import { PubReviewsScreen } from '@/screens/pub/PubReviewsScreen';

// 채팅 화면들 (Firebase)
import { ChatListScreen } from '@/screens/chat/ChatListScreen-Firebase';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { ChatRoomScreen } from '@/screens/chat/ChatRoomScreen';
import { CreateChatScreen } from '@/screens/chat/CreateChatScreen-Firebase';
import { ChatSettingsScreen } from '@/screens/chat/ChatSettingsScreen';

// 인증 관련
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { useAuthStore } from '@/store/useAuthStore';

// 알림
import { firebaseMessaging, FirebaseMessagingService } from '@/services/firebase/firebaseMessaging';
import { useNotificationStore } from '@/store/useNotificationStore';

// FCM 백그라운드 핸들러 (최상위에서 호출 필수)
FirebaseMessagingService.setBackgroundMessageHandler();

// Error Boundary
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// 결제 내역
import { PaymentHistoryScreen } from '@/screens/profile/PaymentHistoryScreen';

// 성별 미설정 유저용 모달
import { GenderSelectModal } from '@/components/common/GenderSelectModal';

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
    <HomeStack.Screen name="Membership" component={MembershipIntroScreen} />
    <HomeStack.Screen name="MembershipPlan" component={MembershipPlanScreen} />
    <HomeStack.Screen name="PlanComparison" component={PlanComparisonScreen} />
    <HomeStack.Screen name="MembershipPayment" component={MembershipPaymentScreen} />
    <HomeStack.Screen name="MembershipSuccess" component={MembershipSuccessScreen} />
    <HomeStack.Screen name="MembershipBenefits" component={MembershipBenefitsScreen} />
    <HomeStack.Screen name="MembershipManage" component={MembershipManageScreen} />
    <HomeStack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
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
    <MyHomeStack.Screen name="InviteFriend" component={InviteScreen} />
    <MyHomeStack.Screen name="CreateGroup" component={CreateGroupScreen} />
    <MyHomeStack.Screen name="GroupList" component={GroupListScreen} />
    {/* 프로필 관련 */}
    <MyHomeStack.Screen name="Profile" component={ProfileScreen} />
    <MyHomeStack.Screen name="EditProfile" component={EditProfileScreen} />
    <MyHomeStack.Screen name="MyBookings" component={MyBookingsScreen} />
    {/* 활동 화면들 */}
    <MyHomeStack.Screen name="MyActivity" component={MyActivityScreen} />
    <MyHomeStack.Screen name="HostedMeetups" component={HostedMeetupsScreen} />
    <MyHomeStack.Screen name="JoinedMeetups" component={JoinedMeetupsScreen} />
    <MyHomeStack.Screen name="MyPosts" component={MyPostsScreen} />
    <MyHomeStack.Screen name="MyReviews" component={MyReviewsScreen} />
    {/* 멤버십 관리 (프로필에서 접근) */}
    <MyHomeStack.Screen name="MembershipManage" component={MembershipManageScreen} />
    <MyHomeStack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
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
    <GolfCourseStack.Screen name="GolfCourseReview" component={GolfCourseReviewScreen} />
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
    <FeedStack.Screen name="PostDetail" component={PostDetailScreen} />
    <FeedStack.Screen name="NotificationList" component={NotificationListScreen} />
    <FeedStack.Screen name="Profile" component={ProfileScreen} />
    <FeedStack.Screen name="EditProfile" component={EditProfileScreen} />
    <FeedStack.Screen name="UserHome" component={MyHomeScreen} />
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
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingStackNavigator}
        options={{
          tabBarLabel: '부킹',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>⛳</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedStackNavigator}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>📱</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceStackNavigator}
        options={{
          tabBarLabel: '중고거래',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>🛒</Text>
          ),
        }}
      />
      <Tab.Screen
        name="GolfCourse"
        component={GolfCourseStackNavigator}
        options={{
          tabBarLabel: '골프장',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>🏌️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyHome"
        component={MyHomeStackNavigator}
        options={{
          tabBarLabel: 'My홈피',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>🏡</Text>
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
  const { user, userProfile, loading, initAuth } = useAuthStore();
  const { subscribeToUnreadCount, unsubscribeFromUnreadCount } = useNotificationStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return unsubscribe;
  }, []);

  // FCM 초기화 + 알림 구독 (로그인 후) / 정리 (로그아웃 시)
  useEffect(() => {
    if (user?.uid) {
      firebaseMessaging.initialize(user.uid);
      subscribeToUnreadCount(user.uid);
    } else {
      // 로그아웃 시 FCM 리스너 정리 + 뱃지 초기화
      firebaseMessaging.cleanup();
      firebaseMessaging.updateBadgeCount(0);
    }
    return () => {
      unsubscribeFromUnreadCount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>로딩 중...</Text>
      </View>
    );
  }

  // 성별 미설정 여부 (로그인 상태 + 프로필 존재 + gender 없음)
  const showGenderModal = !!user && !!userProfile && !userProfile.gender;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer ref={navigationRef} linking={linking}>
          {user ? <AppContent /> : <AuthNavigator />}
        </NavigationContainer>
        {showGenderModal && <GenderSelectModal />}
      </ErrorBoundary>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
