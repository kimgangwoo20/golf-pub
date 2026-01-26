// App.tsx - Expo 앱 진입점 (친구 탭 통합 버전)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { BookingListScreen } from './src/screens/booking/BookingListScreen';
import { BookingDetailScreen } from './src/screens/booking/BookingDetailScreen';
import { CreateBookingScreen } from './src/screens/booking/CreateBookingScreen';
import { PaymentScreen } from './src/screens/booking/PaymentScreen';
import { MyHomeScreen } from './src/screens/my/MyHomeScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';
import { EditProfileScreen } from './src/screens/profile/EditProfileScreen';
import { PointHistoryScreen } from './src/screens/my/payment/PointHistoryScreen';
import { CouponScreen } from './src/screens/my/payment/CouponScreen';
import { MyReviewsScreen } from './src/screens/my/activity/MyReviewsScreen';
import { MyPostsScreen } from './src/screens/my/activity/MyPostsScreen';
import { JoinedMeetupsScreen } from './src/screens/my/activity/JoinedMeetupsScreen';
import { HostedMeetupsScreen } from './src/screens/my/activity/HostedMeetupsScreen';
import { NotificationSettingsScreen } from './src/screens/my/settings/NotificationSettingsScreen';
import { SupportScreen } from './src/screens/my/settings/SupportScreen';
import { SettingsScreen } from './src/screens/my/settings/SettingsScreen';
import { MarketplaceScreen } from './src/screens/marketplace/MarketplaceScreen';
import { ProductDetailScreen } from './src/screens/marketplace/ProductDetailScreen';
import { CreateProductScreen } from './src/screens/marketplace/CreateProductScreen';
import { MyProductsScreen } from './src/screens/marketplace/MyProductsScreen';
import { FriendsScreen } from './src/screens/friends/FriendsScreen';
import { FriendProfileScreen } from './src/screens/friends/FriendProfileScreen';
import { AddFriendScreen } from './src/screens/friends/AddFriendScreen';
import { FriendRequestsScreen } from './src/screens/friends/FriendRequestsScreen';
import { FeedScreen } from './src/screens/feed/FeedScreen';
import { CreatePostScreen } from './src/screens/feed/CreatePostScreen';
import { PostDetailScreen } from './src/screens/feed/PostDetailScreen';
import { GolfCourseSearchScreen } from './src/screens/golfcourse/GolfCourseSearchScreen';
import { GolfCourseDetailScreen } from './src/screens/golfcourse/GolfCourseDetailScreen';
import { GolfCourseReviewScreen } from './src/screens/golfcourse/GolfCourseReviewScreen';

const Tab = createBottomTabNavigator();
const BookingStack = createNativeStackNavigator();
const MyHomeStack = createNativeStackNavigator();
const MarketplaceStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const GolfCourseStack = createNativeStackNavigator();

// 부킹 스택 네비게이터 (목록 → 상세 → 작성 → 결제)
const BookingStackNavigator = () => (
  <BookingStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <BookingStack.Screen name="BookingList" component={BookingListScreen} />
    <BookingStack.Screen name="BookingDetail" component={BookingDetailScreen} />
    <BookingStack.Screen name="CreateBooking" component={CreateBookingScreen} />
    <BookingStack.Screen name="Payment" component={PaymentScreen} />
  </BookingStack.Navigator>
);

// My 홈피 스택 네비게이터 (홈피 메인 → 상세 화면들 + 친구 화면들)
const MyHomeStackNavigator = () => (
  <MyHomeStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <MyHomeStack.Screen name="MyHomeMain" component={MyHomeScreen} />

    {/* 친구 관련 화면들 (My 홈피에서 접근) */}
    <MyHomeStack.Screen name="Friends" component={FriendsScreen} />
    <MyHomeStack.Screen name="FriendProfile" component={FriendProfileScreen} />
    <MyHomeStack.Screen name="AddFriend" component={AddFriendScreen} />
    <MyHomeStack.Screen name="FriendRequests" component={FriendRequestsScreen} />

    {/* 프로필 관련 */}
    <MyHomeStack.Screen name="Profile" component={ProfileScreen} />
    <MyHomeStack.Screen name="EditProfile" component={EditProfileScreen} />

    {/* 포인트/쿠폰 */}
    <MyHomeStack.Screen name="PointHistory" component={PointHistoryScreen} />
    <MyHomeStack.Screen name="Coupons" component={CouponScreen} />

    {/* 내 활동 */}
    <MyHomeStack.Screen name="MyReviews" component={MyReviewsScreen} />
    <MyHomeStack.Screen name="MyPosts" component={MyPostsScreen} />
    <MyHomeStack.Screen name="JoinedMeetups" component={JoinedMeetupsScreen} />
    <MyHomeStack.Screen name="HostedMeetups" component={HostedMeetupsScreen} />

    {/* 설정 */}
    <MyHomeStack.Screen name="Notifications" component={NotificationSettingsScreen} />
    <MyHomeStack.Screen name="Support" component={SupportScreen} />
    <MyHomeStack.Screen name="Settings" component={SettingsScreen} />
  </MyHomeStack.Navigator>
);

// 중고거래 스택 네비게이터 (목록 → 상세/등록/내판매)
const MarketplaceStackNavigator = () => (
  <MarketplaceStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <MarketplaceStack.Screen name="MarketplaceMain" component={MarketplaceScreen} />
    <MarketplaceStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <MarketplaceStack.Screen name="CreateProduct" component={CreateProductScreen} />
    <MarketplaceStack.Screen name="MyProducts" component={MyProductsScreen} />
  </MarketplaceStack.Navigator>
);

// Feed 스택 네비게이터 (목록 → 작성/상세)
const FeedStackNavigator = () => (
  <FeedStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <FeedStack.Screen name="FeedMain" component={FeedScreen} />
    <FeedStack.Screen name="CreatePost" component={CreatePostScreen} />
    <FeedStack.Screen name="PostDetail" component={PostDetailScreen} />
  </FeedStack.Navigator>
);

// 골프장 스택 네비게이터 (검색 → 상세 → 리뷰)
const GolfCourseStackNavigator = () => (
  <GolfCourseStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <GolfCourseStack.Screen name="GolfCourseSearch" component={GolfCourseSearchScreen} />
    <GolfCourseStack.Screen name="GolfCourseDetail" component={GolfCourseDetailScreen} />
    <GolfCourseStack.Screen name="GolfCourseReview" component={GolfCourseReviewScreen} />
  </GolfCourseStack.Navigator>
);

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        {/* 홈 */}
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: '홈',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
                🏠
              </Text>
            ),
          }}
        />

        {/* 부킹 */}
        <Tab.Screen
          name="Bookings"
          component={BookingStackNavigator}
          options={{
            tabBarLabel: '부킹',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
                ⛳
              </Text>
            ),
          }}
        />

        {/* 중고거래 */}
        <Tab.Screen
          name="Marketplace"
          component={MarketplaceStackNavigator}
          options={{
            tabBarLabel: '중고거래',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
                🛒
              </Text>
            ),
          }}
        />

        {/* Feed */}
        <Tab.Screen
          name="Feed"
          component={FeedStackNavigator}
          options={{
            tabBarLabel: 'Feed',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
                📱
              </Text>
            ),
          }}
        />

        {/* 골프장 */}
        <Tab.Screen
          name="GolfCourse"
          component={GolfCourseStackNavigator}
          options={{
            tabBarLabel: '골프장',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
                🏌️
              </Text>
            ),
          }}
        />

        {/* 친구 탭 제거! - My 홈피에서 접근 */}

        {/* My 홈피 (친구 포함) */}
        <Tab.Screen
          name="MyHome"
          component={MyHomeStackNavigator}
          options={{
            tabBarLabel: 'My홈피',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>
                🏡
              </Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}