import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { profileAPI } from '../../services/api/profileAPI';

export const EditProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [handicap, setHandicap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileAPI.getMyProfile();
      if (profile) {
        setName(profile.name || '');
        setBio(profile.bio || '');
        setPhone(profile.phone || '');
        setHandicap(profile.handicap?.toString() || '0');
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await profileAPI.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        handicap: parseInt(handicap, 10) || 0,
      });
      Alert.alert('저장 완료', '프로필이 수정되었습니다!', [
        { text: '확인', onPress: () => navigation?.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>프로필 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>프로필 수정</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력하세요"
            maxLength={20}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>소개</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            placeholder="자기소개를 입력하세요"
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="010-0000-0000"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>핸디캡</Text>
          <TextInput
            style={styles.input}
            value={handicap}
            onChangeText={(text) => setHandicap(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="0"
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  header: { padding: 24, paddingTop: 60 },
  backButton: { fontSize: 16, color: '#007AFF', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  form: { paddingHorizontal: 24, paddingTop: 24 },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveButtonDisabled: { opacity: 0.7 },
});
