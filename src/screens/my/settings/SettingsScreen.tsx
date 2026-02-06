// SettingsScreen.tsx - 설정 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [showWithdrawalConfirm, setShowWithdrawalConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const appVersion = '1.0.0';

  const handleAccountManagement = () => {
    navigation.navigate('AccountManagement');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleTermsOfService = () => {
    navigation.navigate('TermsOfService');
  };

  const handleLocationTerms = () => {
    navigation.navigate('LocationTerms');
  };

  const handleOpenSource = () => {
    navigation.navigate('OpenSource');
  };

  const handleCache = () => {
    Alert.alert(
      '캐시 삭제',
      '캐시를 삭제하시겠습니까? 앱이 재시작됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().clearPersistence();
              Alert.alert('완료', '캐시가 삭제되었습니다. 앱을 재시작해주세요.');
            } catch {
              Alert.alert('완료', '캐시가 삭제되었습니다.');
            }
          },
        },
      ]
    );
  };

  const handleWithdrawal = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말 탈퇴하시겠습니까? 모든 정보가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => {
            setShowWithdrawalConfirm(true);
            setWithdrawalPassword('');
          },
        },
      ]
    );
  };

  const handleConfirmWithdrawal = async () => {
    if (!withdrawalPassword) {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsWithdrawing(true);
      const currentUser = auth().currentUser;
      if (!currentUser || !currentUser.email) {
        Alert.alert('오류', '로그인 상태를 확인해주세요.');
        return;
      }

      // 재인증
      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        withdrawalPassword
      );
      await currentUser.reauthenticateWithCredential(credential);

      // Firestore 사용자 데이터 삭제
      await firestore().collection('users').doc(currentUser.uid).delete();

      // Firebase Auth 계정 삭제
      await currentUser.delete();

      setShowWithdrawalConfirm(false);
      Alert.alert('완료', '회원 탈퇴가 완료되었습니다.');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('오류', '비밀번호가 올바르지 않습니다.');
      } else {
        Alert.alert('오류', '회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCheckUpdate = () => {
    Alert.alert('업데이트 확인', '최신 버전을 사용하고 있습니다.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>설정</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 계정 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={handleAccountManagement}>
                <Text style={styles.menuLabel}>계정 관리</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 약관 및 정책 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>약관 및 정책</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
                <Text style={styles.menuLabel}>개인정보 처리방침</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleTermsOfService}>
                <Text style={styles.menuLabel}>서비스 이용약관</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleLocationTerms}>
                <Text style={styles.menuLabel}>위치기반 서비스 이용약관</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleOpenSource}>
                <Text style={styles.menuLabel}>오픈소스 라이선스</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 앱 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>앱 정보</Text>
            <View style={styles.menuCard}>
              <View style={styles.menuItem}>
                <Text style={styles.menuLabel}>버전 정보</Text>
                <Text style={styles.versionText}>{appVersion}</Text>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleCheckUpdate}>
                <Text style={styles.menuLabel}>업데이트 확인</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 기타 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기타</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={handleCache}>
                <Text style={styles.menuLabel}>캐시 삭제</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleWithdrawal}>
                <Text style={[styles.menuLabel, styles.dangerText]}>회원 탈퇴</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 회원 탈퇴 비밀번호 확인 */}
          {showWithdrawalConfirm && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>본인 확인</Text>
              <View style={styles.menuCard}>
                <View style={styles.withdrawalSection}>
                  <Text style={styles.withdrawalInfo}>
                    회원 탈퇴를 위해 비밀번호를 입력해주세요.
                  </Text>
                  <TextInput
                    style={styles.withdrawalInput}
                    value={withdrawalPassword}
                    onChangeText={setWithdrawalPassword}
                    secureTextEntry
                    placeholder="비밀번호 입력"
                    placeholderTextColor="#999"
                    editable={!isWithdrawing}
                  />
                  <View style={styles.withdrawalButtons}>
                    <TouchableOpacity
                      style={styles.withdrawalCancelButton}
                      onPress={() => {
                        setShowWithdrawalConfirm(false);
                        setWithdrawalPassword('');
                      }}
                      disabled={isWithdrawing}
                    >
                      <Text style={styles.withdrawalCancelText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.withdrawalConfirmButton, isWithdrawing && styles.withdrawalConfirmDisabled]}
                      onPress={handleConfirmWithdrawal}
                      disabled={isWithdrawing}
                    >
                      {isWithdrawing ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.withdrawalConfirmText}>탈퇴 확인</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 앱 정보 카드 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>골프 Pub</Text>
            <Text style={styles.infoText}>골프 모임 & 중고거래 플랫폼</Text>
            <Text style={styles.infoText}>© 2025 Golf Pub. All rights reserved.</Text>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  menuArrow: {
    fontSize: 20,
    color: '#999',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
  dangerText: {
    color: '#FF3B30',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 32,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  withdrawalSection: {
    padding: 20,
  },
  withdrawalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  withdrawalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  withdrawalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  withdrawalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  withdrawalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  withdrawalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  withdrawalConfirmDisabled: {
    backgroundColor: '#FF8A80',
  },
  withdrawalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacing: {
    height: 40,
  },
});