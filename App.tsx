// App.tsx - Expo 앱 진입점 (Firebase + Auth 통합)
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Firebase 초기화
import './src/services/firebase/firebaseConfig';

// 홈 화면
import { HomeScreen } from './src/screens/home/HomeScreen';

// 멤버십 화면들
import { MembershipIntroScreen } from './src/screens/membership/MembershipIntroScreen';
import { MembershipPlanScreen } from './src/screens/membership/MembershipPlanScreen';
import { PlanComparisonScreen } from './src/screens/membership/PlanComparisonScreen';
import { MembershipPaymentScreen } from './src/screens/membership/MembershipPaymentScreen';
import { MembershipSuccessScreen } from './src/screens/membership/MembershipSuccessScreen';
import { MembershipBenefitsScreen } from './src/screens/membership/MembershipBenefitsScreen';
import { MembershipManageScreen } from './src/screens/membership/MembershipManageScreen';
import { UpgradePlanScreen } from './src/screens/membership/UpgradePlanScreen';

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

// 프로필 화면들
import { ProfileScreen } from './src/screens/profile/ProfileScreen';
import { EditProfileScreen } from './src/screens/profile/EditProfileScreen';
import { SettingsScreen } from './src/screens/profile/SettingsScreen';
import { MyBookingsScreen } from './src/screens/profile/MyBookingsScreen';

// 중고거래 화면들
import { MarketplaceScreen } from './src/screens/marketplace/MarketplaceScreen';
import { ProductDetailScreen } from './src/screens/marketplace/ProductDetailScreen';
import { CreateProductScreen } from './src/screens/marketplace/CreateProductScreen';
import { MyProductsScreen } from './src/screens/marketplace/MyProductsScreen';

// 친구 화면들
import { FriendsScreen } from './src/screens/friends/FriendsScreen';
import { FriendProfileScreen } from './src/screens/friends/FriendProfileScreen';
import { AddFriendScreen } from './src/screens/friends/AddFriendScreen';
import { FriendRequestsScreen } from './src/screens/friends/FriendRequestsScreen';

// 친구 그룹/초대 화면들
import { InviteScreen } from './src/screens/friend/InviteScreen';
import { CreateGroupScreen } from './src/screens/friend/CreateGroupScreen';
import { GroupListScreen } from './src/screens/friend/GroupListScreen';

// Feed 화면
import { PostDetailScreen } from './src/screens/feed/PostDetailScreen';

// 골프장 화면들
import { GolfCourseSearchScreen } from './src/screens/golfcourse/GolfCourseSearchScreen';
import { GolfCourseReviewScreen } from './src/screens/golfcourse/GolfCourseReviewScreen';

// 펍 화면들
import { BestPubsScreen } from './src/screens/pub/BestPubsScreen';
import { PubDetailScreen } from './src/screens/pub/PubDetailScreen';
import { PubReviewsScreen } from './src/screens/pub/PubReviewsScreen';

// 채팅 화면들 (Firebase)
import { ChatListScreen } from './src/screens/chat/ChatListScreen-Firebase';
import { ChatScreen } from './src/screens/chat/ChatScreen';
import { CreateChatScreen } from './src/screens/chat/CreateChatScreen-Firebase';
import { ChatSettingsScreen } from './src/screens/chat/ChatSettingsScreen';

// 인증 관련
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { useAuthStore } from './src/store/useAuthStore';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BookingStack = createNativeStackNavigator();
const MyHomeStack = createNativeStackNavigator();
const MarketplaceStack = createNativeStackNavigator();
const GolfCourseStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();

// 임시 Feed 메인 화면
const TempFeedScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
    <Text style={{ fontSize: 32, marginBottom: 10 }}>📱</Text>
    <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Feed 화면</Text>
    <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 5 }}>개발 예정</Text>
  </View>
);

// 홈 스택 (멤버십 포함)
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="MembershipIntro" component={MembershipIntroScreen} />
    <HomeStack.Screen name="MembershipPlan" component={MembershipPlanScreen} />
    <HomeStack.Screen name="PlanComparison" component={PlanComparisonScreen} />
    <HomeStack.Screen name="MembershipPayment" component={MembershipPaymentScreen} />
    <HomeStack.Screen name="MembershipSuccess" component={MembershipSuccessScreen} />
    <HomeStack.Screen name="MembershipBenefits" component={MembershipBenefitsScreen} />
    <HomeStack.Screen name="MembershipManage" component={MembershipManageScreen} />
    <HomeStack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
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

// My 홈피 스택 (친구그룹, 내예약 포함)
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
    {/* 멤버십 관리 (프로필에서 접근) */}
    <MyHomeStack.Screen name="MembershipManage" component={MembershipManageScreen} />
    <MyHomeStack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
    {/* 설정 */}
    <MyHomeStack.Screen name="Settings" component={SettingsScreen} />
  </MyHomeStack.Navigator>
);

// 중고거래 스택
const MarketplaceStackNavigator = () => (
  <MarketplaceStack.Navigator screenOptions={{ headerShown: false }}>
    <MarketplaceStack.Screen name="MarketplaceMain" component={MarketplaceScreen} />
    <MarketplaceStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <MarketplaceStack.Screen name="CreateProduct" component={CreateProductScreen} />
    <MarketplaceStack.Screen name="MyProducts" component={MyProductsScreen} />
  </MarketplaceStack.Navigator>
);

// 골프장 + 펍 스택
const GolfCourseStackNavigator = () => (
  <GolfCourseStack.Navigator screenOptions={{ headerShown: false }}>
    <GolfCourseStack.Screen name="GolfCourseSearch" component={GolfCourseSearchScreen} />
    <GolfCourseStack.Screen name="GolfCourseReview" component={GolfCourseReviewScreen as any} />
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
    <ChatStack.Screen name="CreateChat" component={CreateChatScreen} />
    <ChatStack.Screen name="ChatSettings" component={ChatSettingsScreen} />
  </ChatStack.Navigator>
);

// Feed 스택
const FeedStackNavigator = () => (
  <FeedStack.Navigator screenOptions={{ headerShown: false }}>
    <FeedStack.Screen name="FeedMain" component={TempFeedScreen} />
    <FeedStack.Screen name="PostDetail" component={PostDetailScreen as any} />
  </FeedStack.Navigator>
);

function AppContent() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingTop: 8,
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
        name="Booking"
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

export default function App() {
  const { user, loading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

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
      <NavigationContainer>
        {user ? <AppContent /> : <AuthNavigator />}
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
