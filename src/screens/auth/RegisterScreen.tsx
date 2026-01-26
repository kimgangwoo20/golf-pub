import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

export const RegisterScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('알림', '모든 항목을 입력하세요');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다');
      return;
    }
    navigation.navigate('Verification');
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
          <TextInput style={styles.input} placeholder="이름을 입력하세요" value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput style={styles.input} placeholder="이메일을 입력하세요" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput style={styles.input} placeholder="비밀번호를 입력하세요" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput style={styles.input} placeholder="비밀번호를 다시 입력하세요" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>가입하기</Text>
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
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
