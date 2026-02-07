// AccountManagementScreen.tsx - 계정 관리 (비밀번호 변경 포함)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '@/store/useAuthStore';

export const AccountManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('오류', '현재 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('오류', '새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const currentUser = auth().currentUser;
      if (!currentUser || !currentUser.email) {
        Alert.alert('오류', '로그인 상태를 확인해주세요.');
        return;
      }

      // 현재 비밀번호로 재인증
      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await currentUser.reauthenticateWithCredential(credential);

      // 비밀번호 변경
      await currentUser.updatePassword(newPassword);

      Alert.alert('완료', '비밀번호가 변경되었습니다.', [
        { text: '확인', onPress: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordSection(false);
        }},
      ]);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('오류', '현재 비밀번호가 올바르지 않습니다.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('오류', '새 비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.');
      } else {
        Alert.alert('오류', '비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = () => {
    Alert.alert('이메일 변경', '이메일 변경 기능은 준비 중입니다.');
  };

  const handleLinkKakao = () => {
    Alert.alert('카카오 연동', '카카오 계정 연동 기능은 준비 중입니다.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>계정 관리</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 계정 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정 정보</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이메일</Text>
                <Text style={styles.infoValue}>{user?.email || userProfile?.email || '미설정'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이름</Text>
                <Text style={styles.infoValue}>{user?.displayName || userProfile?.nickname || '골퍼'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>로그인 방식</Text>
                <Text style={styles.infoValue}>{userProfile?.provider === 'kakao' ? '카카오 로그인' : '이메일 로그인'}</Text>
              </View>
            </View>
          </View>

          {/* 비밀번호 변경 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>비밀번호 변경</Text>
            <View style={styles.menuCard}>
              {!showPasswordSection ? (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setShowPasswordSection(true)}
                >
                  <Text style={styles.menuLabel}>비밀번호 변경</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.passwordSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>현재 비밀번호</Text>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                      placeholder="현재 비밀번호 입력"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>새 비밀번호</Text>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholder="새 비밀번호 입력 (6자 이상)"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholder="새 비밀번호 다시 입력"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowPasswordSection(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmButton, isChangingPassword && styles.confirmButtonDisabled]}
                      onPress={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.confirmButtonText}>변경</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* 연동 관리 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소셜 계정 연동</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={handleLinkKakao}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.kakaoIcon}>💬</Text>
                  <Text style={styles.menuLabel}>카카오 계정 연동</Text>
                </View>
                <Text style={[styles.linkStatus, userProfile?.provider === 'kakao' ? styles.linked : styles.notLinked]}>
                  {userProfile?.provider === 'kakao' ? '연동됨' : '미연동'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E5E5',
  },
  backButton: { padding: 4 },
  backIcon: { fontSize: 32, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scrollView: { flex: 1 },
  section: { marginTop: 20, marginHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 12, paddingHorizontal: 4 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
  },
  infoLabel: { fontSize: 15, color: '#666' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 20 },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 20,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  menuArrow: { fontSize: 20, color: '#999' },
  kakaoIcon: { fontSize: 20, marginRight: 10 },
  linkStatus: { fontSize: 14, fontWeight: '600' },
  linked: { color: '#4CAF50' },
  notLinked: { color: '#999' },
  passwordSection: { padding: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6 },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: '#1A1A1A',
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F0F0F0', alignItems: 'center',
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: '#666' },
  confirmButton: {
    flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#6ee7b7',
  },
  confirmButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
