/**
 * useRequireAuth Hook
 * 화면에서 인증을 요구하는 커스텀 훅
 */

import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';

interface UseRequireAuthOptions {
  redirectTo?: string;
  message?: string;
  onUnauthenticated?: () => void;
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const {
    redirectTo = 'Login',
    message = '로그인이 필요한 서비스입니다.',
    onUnauthenticated,
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        Alert.alert('로그인 필요', message, [
          {
            text: '취소',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
          {
            text: '로그인',
            onPress: () => navigation.navigate(redirectTo as never),
          },
        ]);
      }
    }
  }, [isAuthenticated, user, message, redirectTo, navigation, onUnauthenticated]);

  return {
    user,
    isAuthenticated,
    userId: user?.id || null,
  };
};

export default useRequireAuth;
