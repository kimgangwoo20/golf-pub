// TermsOfServiceScreen.tsx - 서비스 이용약관
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>서비스 이용약관</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.updateDate}>최종 업데이트: 2025년 1월 1일</Text>

            <Text style={styles.sectionTitle}>제1조 (목적)</Text>
            <Text style={styles.bodyText}>
              이 약관은 골프 Pub(이하 "회사")이 제공하는 모바일 애플리케이션 서비스(이하 "서비스")의
              이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </Text>

            <Text style={styles.sectionTitle}>제2조 (정의)</Text>
            <Text style={styles.bulletText}>
              ① "서비스"란 회사가 제공하는 골프 부킹, 중고거래, 커뮤니티 등 모든 서비스를
              의미합니다.
            </Text>
            <Text style={styles.bulletText}>
              ② "회원"이란 서비스에 가입하여 이용계약을 체결한 자를 말합니다.
            </Text>
            <Text style={styles.bulletText}>
              ③ "포인트"란 서비스 내에서 사용 가능한 가상 화폐를 의미합니다.
            </Text>

            <Text style={styles.sectionTitle}>제3조 (약관의 효력 및 변경)</Text>
            <Text style={styles.bodyText}>
              ① 이 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.{'\n'}② 회사는 필요한
              경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.
            </Text>

            <Text style={styles.sectionTitle}>제4조 (서비스의 제공)</Text>
            <Text style={styles.bodyText}>회사는 다음과 같은 서비스를 제공합니다.</Text>
            <Text style={styles.bulletText}>• 골프장 부킹 및 모임 서비스</Text>
            <Text style={styles.bulletText}>• 골프 용품 중고거래 서비스</Text>
            <Text style={styles.bulletText}>• 골프 커뮤니티 (피드, 채팅) 서비스</Text>
            <Text style={styles.bulletText}>• 멤버십 서비스</Text>
            <Text style={styles.bulletText}>• 기타 회사가 정하는 서비스</Text>

            <Text style={styles.sectionTitle}>제5조 (회원의 의무)</Text>
            <Text style={styles.bodyText}>
              ① 회원은 관계법령, 약관의 규정 등을 준수하여야 합니다.{'\n'}② 회원은 타인의 개인정보를
              침해하거나 허위 정보를 등록하여서는 안 됩니다.{'\n'}③ 회원은 서비스를 이용하여 불법
              행위를 하여서는 안 됩니다.
            </Text>

            <Text style={styles.sectionTitle}>제6조 (서비스 이용의 제한)</Text>
            <Text style={styles.bodyText}>
              회사는 회원이 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 이용을
              제한하거나 회원자격을 상실시킬 수 있습니다.
            </Text>

            <Text style={styles.sectionTitle}>제7조 (책임의 제한)</Text>
            <Text style={styles.bodyText}>
              회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
              책임이 면제됩니다.
            </Text>

            <Text style={styles.sectionTitle}>제8조 (분쟁 해결)</Text>
            <Text style={styles.bodyText}>
              서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 회원은 상호 협의하여 해결하도록
              노력합니다.
            </Text>
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
