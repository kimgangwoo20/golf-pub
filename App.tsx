// App.tsx - Expo 앱 진입점 (Firebase + Auth 통합)
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 🔥 Firebase 초기화
import './src/services/firebase/firebaseConfig';

// 홈 화면
import { HomeScreen } from './src/screens/home/HomeScreen';

// 부킹 화면들
import { BookingListScreen } from './src/screens/booking/BookingListScreen';
import { BookingDetailScreen } from './src/screens/booking/BookingDetailScreen';
import { CreateBookingScreen } from './src/screens/booking/CreateBookingScreen';
import { PaymentScreen } from './src/screens/booking/PaymentScreen';

// My 홈피 화면
import { MyHomeScreen } from './src/screens/my/MyHomeScreen';

// 프로필 화면들
import { ProfileScreen } from './src/screens/profile/ProfileScreen';
import { EditProfileScreen } from './src/screens/profile/EditProfileScreen';
import { SettingsScreen } from './src/screens/profile/SettingsScreen';

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

// Feed 화면
import { PostDetailScreen } from './src/screens/feed/PostDetailScreen';

// 골프장 화면들
import { GolfCourseSearchScreen } from './src/screens/golfcourse/GolfCourseSearchScreen';
import { GolfCourseReviewScreen } from './src/screens/golfcourse/GolfCourseReviewScreen';

// 채팅 화면들 (Firebase)
import ChatListScreen from './src/screens/chat/ChatListScreen-Firebase';
import { ChatScreen } from './src/screens/chat/ChatScreen';
import CreateChatScreen from './src/screens/chat/CreateChatScreen-Firebase';
import { ChatSettingsScreen } from './src/screens/chat/ChatSettingsScreen';

// 🔐 인증 관련 import
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { useAuthStore } from './src/store/useAuthStore';

const Tab = createBottomTabNavigator();
const BookingStack = createNativeStackNavigator();
const MyHomeStack = createNativeStackNavigator();
const MarketplaceStack = createNativeStackNavigator();
const GolfCourseStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();

// 임시 Feed 화면 (FeedScreen이 없으므로)
const TempFeedScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
    <Text style={{ fontSize: 32, marginBottom: 10 }}>📱</Text>
    <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Feed 화면</Text>
    <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 5 }}>개발 예정</Text>
  </View>
);

// 부킹 스택 네비게이터
const BookingStackNavigator = () => (
  <BookingStack.Navigator screenOptions={{ headerShown: false }}>
    <BookingStack.Screen name="BookingList" component={BookingListScreen} />
    <BookingStack.Screen name="BookingDetail" component={BookingDetailScreen} />
    <BookingStack.Screen name="CreateBooking" component={CreateBookingScreen} />
    <BookingStack.Screen name="Payment" component={PaymentScreen} />
  </BookingStack.Navigator>
);

// My 홈피 스택 네비게이터
const MyHomeStackNavigator = () => (
  <MyHomeStack.Navigator screenOptions={{ headerShown: false }}>
    <MyHomeStack.Screen name="MyHomeMain" component={MyHomeScreen} />
    {/* 친구 관련 */}
    <MyHomeStack.Screen name="Friends" component={FriendsScreen} />
    <MyHomeStack.Screen name="FriendProfile" component={FriendProfileScreen} />
    <MyHomeStack.Screen name="AddFriend" component={AddFriendScreen} />
    <MyHomeStack.Screen name="FriendRequests" component={FriendRequestsScreen} />
    {/* 프로필 관련 */}
    <MyHomeStack.Screen name="Profile" component={ProfileScreen} />
    <MyHomeStack.Screen name="EditProfile" component={EditProfileScreen} />
    {/* 설정 */}
    <MyHomeStack.Screen name="Settings" component={SettingsScreen} />
  </MyHomeStack.Navigator>
);

// 중고거래 스택 네비게이터
const MarketplaceStackNavigator = () => (
  <MarketplaceStack.Navigator screenOptions={{ headerShown: false }}>
    <MarketplaceStack.Screen name="MarketplaceMain" component={MarketplaceScreen} />
    <MarketplaceStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <MarketplaceStack.Screen name="CreateProduct" component={CreateProductScreen} />
    <MarketplaceStack.Screen name="MyProducts" component={MyProductsScreen} />
  </MarketplaceStack.Navigator>
);

// 골프장 스택 네비게이터
const GolfCourseStackNavigator = () => (
  <GolfCourseStack.Navigator screenOptions={{ headerShown: false }}>
    <GolfCourseStack.Screen name="GolfCourseSearch" component={GolfCourseSearchScreen} />
    <GolfCourseStack.Screen name="GolfCourseReview" component={GolfCourseReviewScreen} />
  </GolfCourseStack.Navigator>
);

// 💬 채팅 스택 네비게이터
const ChatStackNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} />
    <ChatStack.Screen name="ChatScreen" component={ChatScreen} />
    <ChatStack.Screen name="CreateChat" component={CreateChatScreen} />
    <ChatStack.Screen name="ChatSettings" component={ChatSettingsScreen} />
  </ChatStack.Navigator>
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
          height: 60,
          paddingBottom: 8,
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
        component={HomeScreen}
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
        component={TempFeedScreen}
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
