import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

export const VerificationScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [code, setCode] = useState('');

  const handleVerify = () => {
    if (code.length !== 6) {
      Alert.alert('알림', '6자리 인증 번호를 입력하세요');
      return;
    }
    Alert.alert('인증 완료', '인증이 완료되었습니다!');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>인증 번호 입력</Text>
        <Text style={styles.subtitle}>이메일로 발송된 6자리 인증 번호를 입력하세요</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.codeInput} placeholder="000000" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} />
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>인증 완료</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendButtonText}>인증 코드 재발송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingTop: 60 },
  backButton: { fontSize: 16, color: '#007AFF', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
  form: { paddingHorizontal: 24, paddingTop: 24 },
  inputContainer: { marginBottom: 20, alignItems: 'center' },
  codeInput: { borderWidth: 2, borderColor: '#007AFF', borderRadius: 12, padding: 20, fontSize: 32, fontWeight: 'bold', textAlign: 'center', width: 200, letterSpacing: 10 },
  verifyButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendButton: { padding: 16, alignItems: 'center', marginTop: 12 },
  resendButtonText: { color: '#007AFF', fontSize: 14 },
});
