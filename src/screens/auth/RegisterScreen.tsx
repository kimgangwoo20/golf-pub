import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';

export const RegisterScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ useAuthStore 사용
  const { register } = useAuthStore();

  const handleRegister = async () => {
    // 유효성 검사
    if (!name || !email || !password || !phone) {
      Alert.alert('알림', '모든 항목을 입력하세요');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다');
      return;
    }

    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    try {
      setLoading(true);

      // ✅ 실제 Firebase 회원가입
      await register({
        email,
        password,
        name,
        phone,
      });

      // 성공 시 자동으로 메인 화면 이동 (useAuthStore에서 처리)
      Alert.alert('회원가입 완료', '환영합니다!');
      
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      Alert.alert('회원가입 실패', error.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>골프 Pub에 오신 것을 환영합니다</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput 
            style={styles.input} 
            placeholder="이름을 입력하세요" 
            value={name} 
            onChangeText={setName}
            editable={!loading}
          />
        </View>

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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput 
            style={styles.input} 
            placeholder="010-1234-5678" 
            value={phone} 
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput 
            style={styles.input} 
            placeholder="비밀번호를 입력하세요 (최소 6자)" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput 
            style={styles.input} 
            placeholder="비밀번호를 다시 입력하세요" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>가입하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingTop: 60 },
  backButton: { fontSize: 16, color: '#007AFF', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
  form: { paddingHorizontal: 24, paddingTop: 24 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, fontSize: 16 },
  registerButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  registerButtonDisabled: { backgroundColor: '#ccc' },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
