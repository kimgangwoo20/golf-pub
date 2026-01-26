// SupportScreen.tsx - 고객센터 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Mock FAQ 데이터
const mockFAQs = [
  {
    id: 1,
    category: '모임',
    question: '모임을 취소하고 싶어요',
    answer: '모임 상세 페이지에서 "취소하기" 버튼을 눌러 취소할 수 있습니다. 단, 출발 24시간 전까지만 취소가 가능하며, 취소 수수료가 발생할 수 있습니다.',
  },
  {
    id: 2,
    category: '결제',
    question: '결제는 어떻게 하나요?',
    answer: '골프 Pub은 안전한 에스크로 결제 시스템을 사용합니다. 모임 참가 신청 시 결제하면 플랫폼에서 보관하다가 모임 완료 후 호스트에게 전달됩니다.',
  },
  {
    id: 3,
    category: '포인트',
    question: '포인트는 어떻게 사용하나요?',
    answer: '포인트는 모임 참가 시 할인 혜택으로 사용할 수 있습니다. 1포인트 = 1원으로 사용 가능하며, 최소 1,000포인트부터 사용할 수 있습니다.',
  },
  {
    id: 4,
    category: '회원',
    question: '회원 탈퇴는 어떻게 하나요?',
    answer: '설정 > 계정 관리 > 회원 탈퇴에서 진행할 수 있습니다. 진행 중인 모임이 있거나 미정산 금액이 있는 경우 탈퇴가 제한될 수 있습니다.',
  },
  {
    id: 5,
    category: '중고거래',
    question: '중고 물품 거래는 안전한가요?',
    answer: '골프 Pub은 직거래를 원칙으로 하며, 사기 피해 방지를 위해 거래 전 충분한 대화와 실물 확인을 권장드립니다. 의심스러운 거래는 신고해주세요.',
  },
];

export const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleFAQPress = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContact = () => {
    Alert.alert(
      '1:1 문의',
      '이메일: support@golfpub.kr\n운영시간: 평일 09:00-18:00',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '이메일 보내기',
          onPress: () => Linking.openURL('mailto:support@golfpub.kr'),
        },
      ]
    );
  };

  const handleKakao = () => {
    Alert.alert('카카오톡 문의', '카카오톡 채널은 개발 예정입니다.');
  };

  const handlePhone = () => {
    Alert.alert(
      '전화 문의',
      '1588-0000\n평일 09:00-18:00 (주말/공휴일 휴무)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전화 걸기',
          onPress: () => Linking.openURL('tel:1588-0000'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>고객센터</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 문의하기 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>문의하기</Text>
            <View style={styles.contactCard}>
              <TouchableOpacity style={styles.contactItem} onPress={handleContact}>
                <Text style={styles.contactIcon}>✉️</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>이메일 문의</Text>
                  <Text style={styles.contactDescription}>support@golfpub.kr</Text>
                </View>
                <Text style={styles.contactArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.contactItem} onPress={handleKakao}>
                <Text style={styles.contactIcon}>💬</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>카카오톡 문의</Text>
                  <Text style={styles.contactDescription}>평일 09:00-18:00</Text>
                </View>
                <Text style={styles.contactArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.contactItem} onPress={handlePhone}>
                <Text style={styles.contactIcon}>📞</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>전화 문의</Text>
                  <Text style={styles.contactDescription}>1588-0000</Text>
                </View>
                <Text style={styles.contactArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
            <View style={styles.faqCard}>
              {mockFAQs.map((faq, index) => (
                <View key={faq.id}>
                  <TouchableOpacity
                    style={styles.faqItem}
                    onPress={() => handleFAQPress(faq.id)}
                  >
                    <View style={styles.faqHeader}>
                      <View style={styles.faqLeft}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{faq.category}</Text>
                        </View>
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                      </View>
                      <Text style={[
                        styles.faqIcon,
                        expandedFAQ === faq.id && styles.faqIconExpanded
                      ]}>
                        ›
                      </Text>
                    </View>
                    {expandedFAQ === faq.id && (
                      <View style={styles.faqAnswer}>
                        <Text style={styles.answerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {index < mockFAQs.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>

          {/* 이용 가이드 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>이용 가이드</Text>
            <View style={styles.guideCard}>
              <TouchableOpacity style={styles.guideItem}>
                <Text style={styles.guideIcon}>📖</Text>
                <Text style={styles.guideLabel}>서비스 이용 가이드</Text>
                <Text style={styles.guideArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.guideItem}>
                <Text style={styles.guideIcon}>⚠️</Text>
                <Text style={styles.guideLabel}>안전 거래 가이드</Text>
                <Text style={styles.guideArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.guideItem}>
                <Text style={styles.guideIcon}>🎯</Text>
                <Text style={styles.guideLabel}>포인트 적립 가이드</Text>
                <Text style={styles.guideArrow}>›</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 13,
    color: '#666',
  },
  contactArrow: {
    fontSize: 20,
    color: '#999',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqLeft: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  faqIcon: {
    fontSize: 20,
    color: '#999',
    transform: [{ rotate: '90deg' }],
  },
  faqIconExpanded: {
    transform: [{ rotate: '270deg' }],
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  guideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  guideIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  guideLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  guideArrow: {
    fontSize: 20,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});