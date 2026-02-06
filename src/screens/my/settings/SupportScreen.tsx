// SupportScreen.tsx - 고객센터
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  { id: '1', question: '부킹은 어떻게 하나요?', answer: '홈 화면에서 "부킹" 탭을 선택한 후, 원하는 골프장과 날짜를 선택하여 부킹할 수 있습니다. 모임을 만들거나 다른 사람이 만든 모임에 참가할 수도 있습니다.' },
  { id: '2', question: '포인트는 어떻게 적립되나요?', answer: '라운딩 완료, 리뷰 작성, 친구 초대, 출석 체크 등 다양한 활동을 통해 포인트가 적립됩니다. 적립된 포인트는 부킹 할인이나 쿠폰 교환에 사용할 수 있습니다.' },
  { id: '3', question: '중고거래는 안전한가요?', answer: '모든 거래는 앱 내 채팅을 통해 진행되며, 사용자 인증과 리뷰 시스템을 통해 안전한 거래 환경을 제공합니다. 거래 분쟁 시 고객센터로 문의해 주세요.' },
  { id: '4', question: '멤버십 혜택은 무엇인가요?', answer: 'PRO 멤버십 가입 시 부킹 우선 예약, 추가 포인트 적립, 프리미엄 골프장 할인 등 다양한 혜택을 받으실 수 있습니다.' },
  { id: '5', question: '계정을 삭제하고 싶어요', answer: '설정 > 기타 > 회원 탈퇴에서 계정을 삭제할 수 있습니다. 탈퇴 시 모든 데이터가 영구 삭제되며 복구할 수 없으니 신중하게 결정해 주세요.' },
];

export const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>고객센터</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 문의 방법 */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>문의하기</Text>
            <View style={styles.contactCards}>
              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => Linking.openURL('tel:1588-0000')}
              >
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactLabel}>전화 문의</Text>
                <Text style={styles.contactInfo}>1588-0000</Text>
                <Text style={styles.contactTime}>평일 09:00 - 18:00</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => Linking.openURL('mailto:support@golfpub.kr')}
              >
                <Text style={styles.contactIcon}>📧</Text>
                <Text style={styles.contactLabel}>이메일 문의</Text>
                <Text style={styles.contactInfo}>support@golfpub.kr</Text>
                <Text style={styles.contactTime}>24시간 접수</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
            {FAQ_DATA.map(item => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <Text style={styles.faqQuestion}>Q. {item.question}</Text>
                  <Text style={styles.faqArrow}>{expandedId === item.id ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {expandedId === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>A. {item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
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
  contactSection: { margin: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  contactCards: { flexDirection: 'row', gap: 12 },
  contactCard: {
    flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  contactIcon: { fontSize: 32, marginBottom: 8 },
  contactLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  contactInfo: { fontSize: 13, fontWeight: '600', color: '#10b981', marginBottom: 2 },
  contactTime: { fontSize: 11, color: '#999' },
  faqSection: { margin: 16 },
  faqItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8,
  },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginRight: 8 },
  faqArrow: { fontSize: 12, color: '#999' },
  faqAnswer: {
    backgroundColor: '#f8f8f8', padding: 16, borderRadius: 12, marginTop: -4, marginBottom: 8,
  },
  faqAnswerText: { fontSize: 14, lineHeight: 22, color: '#444' },
});
