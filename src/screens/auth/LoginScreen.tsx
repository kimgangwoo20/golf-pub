import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';

export const LoginScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력하세요');
      return;
    }
    Alert.alert('로그인 성공', '환영합니다!');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.logo}>⛳</Text>
        <Text style={styles.title}>골프 Pub</Text>
        <Text style={styles.subtitle}>골프 메이트와 함께하는 즐거운 라운딩</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput style={styles.input} placeholder="이메일을 입력하세요" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput style={styles.input} placeholder="비밀번호를 입력하세요" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>🍎 Apple로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>📱 카카오로 계속하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>계정이 없으신가요? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logo: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
  form: { paddingHorizontal: 24 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, fontSize: 16 },
  forgotPassword: { color: '#007AFF', fontSize: 14, textAlign: 'right', marginBottom: 24 },
  loginButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { marginHorizontal: 16, color: '#666', fontSize: 14 },
  socialButton: { borderWidth: 1, borderColor: '#e0e0e0', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  socialButtonText: { fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 24 },
  footerText: { color: '#666', fontSize: 14 },
  signupText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
});
