// MainTabNavigator.tsx - 하단 탭 (카카오톡 스타일)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../../screens/home/HomeScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import MembershipNavigator from './MembershipNavigator';
import BookingNavigator from './BookingNavigator';
import ChatNavigator from './ChatNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 임시 Marketplace 화면
const MarketplaceScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.emoji}>🛒</Text>
    <Text style={styles.title}>중고거래</Text>
    <Text style={styles.subtitle}>개발 예정</Text>
  </View>
);

// Home Stack (Membership 포함)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Membership" component={MembershipNavigator} />
    </Stack.Navigator>
  );
}

// Profile Stack (Settings 등 포함)
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingNavigator}
        options={{
          tabBarLabel: '부킹',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⛳</Text>,
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: '중고거래',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatNavigator}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>,
          tabBarBadge: 3,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: '프로필',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
