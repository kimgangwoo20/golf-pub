import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '@/services/authService';

export const ForgotPasswordScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      await authService.sendPasswordResetEmail(email);
      setSent(true);
      Alert.alert(
        '발송 완료',
        '비밀번호 재설정 링크가 이메일로 발송되었습니다.\n이메일을 확인해주세요.',
      );
    } catch (error: any) {
      let message = '이메일 발송에 실패했습니다.';
      if (error.code === 'auth/user-not-found') {
        message = '등록되지 않은 이메일입니다.';
      } else if (error.code === 'auth/invalid-email') {
        message = '이메일 형식이 올바르지 않습니다.';
      }
      Alert.alert('발송 실패', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>비밀번호 찾기</Text>
        <Text style={styles.subtitle}>가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일을 입력하세요"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>{sent ? '재발송' : '재설정 링크 받기'}</Text>
          )}
        </TouchableOpacity>

        {sent && (
          <Text style={styles.sentMessage}>이메일이 발송되었습니다. 메일함을 확인해주세요.</Text>
        )}

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation?.goBack()}>
          <Text style={styles.loginLinkText}>로그인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingTop: 16 },
  backButton: { fontSize: 16, color: '#10b981', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 20 },
  form: { paddingHorizontal: 24, paddingTop: 24 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonDisabled: { backgroundColor: '#a5d6a7' },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sentMessage: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  loginLink: { alignItems: 'center', marginTop: 32 },
  loginLinkText: { fontSize: 14, color: '#10b981', fontWeight: '600' },
});
