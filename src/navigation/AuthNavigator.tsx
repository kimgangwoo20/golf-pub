// 🧭 AuthNavigator - 인증 상태에 따른 네비게이션
// 로그인 전: LoginScreen
// 로그인 후: MainTabNavigator

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { useAuthStore } from '@/store/useAuthStore';

// MainTabNavigator는 기존 프로젝트에 있어야 함
// import { MainTabNavigator } from '@/navigation/MainTabNavigator';

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuthStore();

  // ✅ useEffect 제거! App.tsx에서 이미 loadUserFromStorage() 호출함

  // 로딩 중 화면
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && user ? (
        <>
          <Stack.Screen
            name="Main"
            component={PlaceholderMainScreen}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      )}
    </Stack.Navigator>
  );
};

// 임시 메인 화면 (MainTabNavigator 연결 전)
const PlaceholderMainScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();

  return (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderContent}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>로그인 성공!</Text>
        <Text style={styles.successText}>
          환영합니다, {user?.nickname}님!
        </Text>
        <Text style={styles.infoText}>
          MainTabNavigator를 연결하면{'\n'}
          실제 앱 화면이 표시됩니다.
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await signOut();
            // Kakao 로그아웃도 필요하면 추가
          }}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  placeholderContent: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
});