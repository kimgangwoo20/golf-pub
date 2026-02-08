// 🔐 LoginScreen - 로그인 화면 (카카오 + 이메일)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { kakaoLogin } from '@/services/kakao/kakaoLogin';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const { login, signInWithEmailAndPassword } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleKakaoLogin = async () => {
    try {
      setKakaoLoading(true);

      const result = await kakaoLogin();

      if (!result.success) {
        Alert.alert('로그인 실패', result.error || '로그인에 실패했습니다.');
        return;
      }

      if (!result.profile) {
        Alert.alert('로그인 실패', '프로필 정보를 가져올 수 없습니다.');
        return;
      }

      await login(result.profile.id, result.profile);
    } catch (error: any) {
      Alert.alert('로그인 오류', error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setKakaoLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력하세요.');
      return;
    }

    try {
      setEmailLoading(true);
      await signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      let message = '로그인에 실패했습니다.';
      if (error.code === 'auth/user-not-found') {
        message = '등록되지 않은 이메일입니다.';
      } else if (error.code === 'auth/wrong-password') {
        message = '비밀번호가 올바르지 않습니다.';
      } else if (error.code === 'auth/invalid-email') {
        message = '이메일 형식이 올바르지 않습니다.';
      }
      Alert.alert('로그인 실패', message);
    } finally {
      setEmailLoading(false);
    }
  };

  const loading = kakaoLoading || emailLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient colors={['#10b981', '#1B5E20']} style={styles.gradient}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 로고 영역 */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>⛳</Text>
              </View>
              <Text style={styles.logoText}>골프 Pub</Text>
              <Text style={styles.logoSubtext}>골프를 사랑하는 사람들의 모임</Text>
            </View>

            {/* 로그인 버튼 영역 */}
            <View style={styles.loginContainer}>
              {/* 카카오 로그인 */}
              <TouchableOpacity
                style={styles.kakaoButton}
                onPress={handleKakaoLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {kakaoLoading ? (
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

              {/* 구분선 */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 이메일 로그인 토글 / 폼 */}
              {!showEmailLogin ? (
                <TouchableOpacity
                  style={styles.emailToggleButton}
                  onPress={() => setShowEmailLogin(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emailToggleText}>이메일로 로그인</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.emailForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="이메일"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="비밀번호"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.emailLoginButton}
                    onPress={handleEmailLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {emailLoading ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <Text style={styles.emailLoginButtonText}>로그인</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* 하단 링크들 */}
              <View style={styles.bottomLinks}>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.linkText}>회원가입</Text>
                </TouchableOpacity>
                <Text style={styles.linkDivider}>|</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.linkText}>비밀번호 찾기</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.termsText}>
                로그인 시 <Text style={styles.termsLink}>이용약관</Text> 및{' '}
                <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의합니다.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
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
  loginContainer: {
    gap: 12,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginHorizontal: 12,
  },
  emailToggleButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  emailToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emailForm: {
    gap: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  emailLoginButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  emailLoginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  linkDivider: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
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
