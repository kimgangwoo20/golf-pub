// 🔐 LoginScreen - Kakao 로그인 화면
// 앱 첫 진입 시 표시되는 로그인 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { kakaoLogin } from '@/services/kakao/kakaoLogin';
import { useAuthStore } from '@/store/useAuthStore';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleKakaoLogin = async () => {
    try {
      setLoading(true);
      console.log('🔐 Kakao 로그인 시작...');

      // 1. Kakao 로그인
      const result = await kakaoLogin();

      if (!result.success) {
        Alert.alert('로그인 실패', result.error || '로그인에 실패했습니다.');
        setLoading(false);
        return;
      }

      if (!result.profile) {
        Alert.alert('로그인 실패', '프로필 정보를 가져올 수 없습니다.');
        setLoading(false);
        return;
      }

      console.log('✅ Kakao 로그인 성공:', result.profile);

      // 2. 사용자 정보 저장 (Firebase + AsyncStorage)
      await login(result.profile.id, result.profile);

      console.log('✅ 전체 로그인 프로세스 완료');
      
      // 자동으로 MainTabNavigator로 이동됨 (AuthNavigator에서 처리)
    } catch (error: any) {
      console.error('❌ 로그인 오류:', error);
      Alert.alert(
        '로그인 오류',
        error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.gradient}
      >
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>⛳</Text>
          </View>
          <Text style={styles.logoText}>골프 Pub</Text>
          <Text style={styles.logoSubtext}>골프를 사랑하는 사람들의 모임</Text>
        </View>

        {/* 설명 영역 */}
        <View style={styles.featureContainer}>
          <FeatureItem icon="⛳" text="골프장 예약 및 모임" />
          <FeatureItem icon="👥" text="새로운 골프 친구 만나기" />
          <FeatureItem icon="💬" text="실시간 채팅 및 소통" />
          <FeatureItem icon="🛒" text="중고 골프 용품 거래" />
        </View>

        {/* 로그인 버튼 영역 */}
        <View style={styles.loginContainer}>
          <TouchableOpacity
            style={styles.kakaoButton}
            onPress={handleKakaoLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <>
                <View style={styles.kakaoLogoPlaceholder}>
                  <Text style={styles.kakaoLogoText}>K</Text>
                </View>
                <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            로그인 시 <Text style={styles.termsLink}>이용약관</Text> 및{'\n'}
            <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의합니다.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// 기능 소개 아이템
const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 64,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featureContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginContainer: {
    gap: 16,
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE500',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  kakaoLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3C1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoLogoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FEE500',
  },
  kakaoButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: '#FFFFFF',
  },
});
