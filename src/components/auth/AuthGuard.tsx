/**
 * AuthGuard Component
 * 인증이 필요한 화면을 보호하는 HOC 컴포넌트
 */

import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  message?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = 'Login',
  message = '로그인이 필요한 서비스입니다.',
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      Alert.alert('알림', message, [
        {
          text: '로그인',
          onPress: () => navigation.navigate(redirectTo as never),
        },
        {
          text: '취소',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]);
    }
  }, [isAuthenticated, user, message, redirectTo, navigation]);

  // 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
