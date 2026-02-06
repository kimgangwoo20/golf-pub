// LocationTermsScreen.tsx - 위치기반 서비스 이용약관
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const LocationTermsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>위치기반 서비스 이용약관</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.updateDate}>최종 업데이트: 2025년 1월 1일</Text>

            <Text style={styles.sectionTitle}>제1조 (목적)</Text>
            <Text style={styles.bodyText}>
              이 약관은 골프 Pub(이하 "회사")이 제공하는 위치기반 서비스에 대해 회사와 개인위치정보주체(이하 "이용자")간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </Text>

            <Text style={styles.sectionTitle}>제2조 (이용 목적)</Text>
            <Text style={styles.bodyText}>회사는 위치정보를 다음의 목적으로 이용합니다.</Text>
            <Text style={styles.bulletText}>• 주변 골프장 검색 및 거리 표시</Text>
            <Text style={styles.bulletText}>• 골프장까지의 경로 안내</Text>
            <Text style={styles.bulletText}>• 날씨 정보 제공 (현재 위치 기반)</Text>
            <Text style={styles.bulletText}>• 주변 중고거래 상품 검색</Text>

            <Text style={styles.sectionTitle}>제3조 (위치정보의 수집)</Text>
            <Text style={styles.bodyText}>
              ① 회사는 이용자의 동의를 받아 GPS, Wi-Fi, 기지국 정보를 이용하여 위치정보를 수집합니다.{'\n'}
              ② 위치정보는 서비스 이용 시에만 수집되며, 별도 저장하지 않습니다.
            </Text>

            <Text style={styles.sectionTitle}>제4조 (위치정보의 보유)</Text>
            <Text style={styles.bodyText}>
              회사는 위치정보를 별도로 저장하지 않으며, 서비스 제공 목적 달성 후 즉시 파기합니다. 다만, 관련 법령에 의해 보관이 필요한 경우 해당 기간 동안 보관합니다.
            </Text>

            <Text style={styles.sectionTitle}>제5조 (이용자의 권리)</Text>
            <Text style={styles.bodyText}>
              ① 이용자는 언제든지 위치정보 수집에 대한 동의를 철회할 수 있습니다.{'\n'}
              ② 이용자는 위치정보의 이용·제공에 대한 내역을 열람할 수 있습니다.{'\n'}
              ③ 동의 철회 시 위치기반 서비스 이용이 제한될 수 있습니다.
            </Text>

            <Text style={styles.sectionTitle}>제6조 (위치정보관리책임자)</Text>
            <Text style={styles.bodyText}>성명: 홍길동</Text>
            <Text style={styles.bodyText}>이메일: location@golfpub.kr</Text>
            <Text style={styles.bodyText}>전화: 1588-0000</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E5E5',
  },
  backButton: { padding: 4 },
  backIcon: { fontSize: 32, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  updateDate: { fontSize: 13, color: '#999', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginTop: 24, marginBottom: 8 },
  bodyText: { fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 8 },
  bulletText: { fontSize: 14, lineHeight: 22, color: '#444', paddingLeft: 8, marginBottom: 4 },
});
