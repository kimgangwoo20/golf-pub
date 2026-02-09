// PrivacyPolicyScreen.tsx - 개인정보 처리방침
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>개인정보 처리방침</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.updateDate}>최종 업데이트: 2026년 2월 9일</Text>

            <Text style={styles.sectionTitle}>1. 개인정보의 수집 및 이용 목적</Text>
            <Text style={styles.bodyText}>
              골프 Pub(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
              개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는
              별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </Text>
            <Text style={styles.bulletText}>
              • 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 부정이용 방지
            </Text>
            <Text style={styles.bulletText}>
              • 서비스 제공: 골프장 부킹, 중고거래, 커뮤니티 서비스 제공
            </Text>
            <Text style={styles.bulletText}>
              • 마케팅 및 광고: 이벤트 및 광고성 정보 제공 (동의 시)
            </Text>

            <Text style={styles.sectionTitle}>2. 수집하는 개인정보 항목</Text>
            <Text style={styles.bodyText}>
              회사는 다음과 같은 개인정보 항목을 수집하고 있습니다.
            </Text>
            <Text style={styles.bulletText}>• 필수항목: 이름, 이메일, 비밀번호, 휴대폰번호</Text>
            <Text style={styles.bulletText}>• 선택항목: 프로필 사진, 핸디캡, 선호 골프장</Text>
            <Text style={styles.bulletText}>• 자동수집: 접속 IP, 기기정보, 서비스 이용 기록</Text>

            <Text style={styles.sectionTitle}>3. 개인정보의 보유 및 이용기간</Text>
            <Text style={styles.bodyText}>
              회원 탈퇴 시까지 보유하며, 관계법령에 의해 보존할 필요가 있는 경우 해당 법령에서 정한
              기간 동안 보존합니다.
            </Text>
            <Text style={styles.bulletText}>• 계약 또는 청약철회 등에 관한 기록: 5년</Text>
            <Text style={styles.bulletText}>• 대금결제 및 재화 등의 공급에 관한 기록: 5년</Text>
            <Text style={styles.bulletText}>• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</Text>

            <Text style={styles.sectionTitle}>4. 개인정보의 제3자 제공</Text>
            <Text style={styles.bodyText}>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에
              동의한 경우 또는 법률에 특별한 규정이 있는 경우에는 예외로 합니다.
            </Text>

            <Text style={styles.sectionTitle}>5. 개인정보의 파기</Text>
            <Text style={styles.bodyText}>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체 없이 해당 개인정보를 파기합니다.
            </Text>

            <Text style={styles.sectionTitle}>6. 정보주체의 권리</Text>
            <Text style={styles.bodyText}>
              이용자는 개인정보 열람, 정정·삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다.
            </Text>

            <Text style={styles.sectionTitle}>7. 개인정보 보호책임자</Text>
            <Text style={styles.bodyText}>성명: 김강우</Text>
            <Text style={styles.bodyText}>이메일: support@golfpub.kr</Text>
            <Text style={styles.bodyText}>연락처: support@golfpub.kr</Text>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
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
  backButton: { padding: 4 },
  backIcon: { fontSize: 32, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  updateDate: { fontSize: 13, color: '#999', marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: { fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 8 },
  bulletText: { fontSize: 14, lineHeight: 22, color: '#444', paddingLeft: 8, marginBottom: 4 },
});
