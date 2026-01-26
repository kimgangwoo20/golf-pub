// SettingsScreen.tsx - 설정 화면

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const appVersion = '1.0.0';

  const handleAccountManagement = () => {
    Alert.alert('계정 관리', '계정 관리 기능은 개발 예정입니다.');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('개인정보 처리방침', '웹페이지로 이동합니다.');
    // Linking.openURL('https://golfpub.kr/privacy');
  };

  const handleTermsOfService = () => {
    Alert.alert('서비스 이용약관', '웹페이지로 이동합니다.');
    // Linking.openURL('https://golfpub.kr/terms');
  };

  const handleLocationTerms = () => {
    Alert.alert('위치기반 서비스 이용약관', '웹페이지로 이동합니다.');
  };

  const handleOpenSource = () => {
    Alert.alert('오픈소스 라이선스', '오픈소스 라이선스 정보는 개발 예정입니다.');
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
          onPress: () => console.log('캐시 삭제'),
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
          onPress: () => console.log('회원 탈퇴'),
        },
      ]
    );
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
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});