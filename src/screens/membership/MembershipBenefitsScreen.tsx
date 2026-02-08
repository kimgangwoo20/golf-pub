import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BenefitItem } from '@/components/membership/BenefitItem';

export const MembershipBenefitsScreen: React.FC = () => {
  const benefits = [
    { icon: '⛳', title: '무제한 부킹 참가', description: '제한 없이 모든 골프 모임 참여' },
    { icon: '💬', title: '무제한 채팅', description: '골프 메이트와 자유로운 소통' },
    { icon: '🏌️', title: '골프장 예약', description: '전국 골프장 간편 예약' },
    { icon: '🎁', title: '매월 포인트 적립', description: '사용할수록 쌓이는 혜택' },
    { icon: '🛒', title: '중고거래', description: '골프 용품 거래 가능' },
    { icon: '👨‍🏫', title: '코치 매칭', description: 'VIP는 무료 코치 매칭' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>멤버십 혜택</Text>
        <Text style={styles.subtitle}>프리미엄 회원만의 특별한 혜택</Text>
      </View>
      <View style={styles.content}>
        {benefits.map((benefit, index) => (
          <BenefitItem key={index} {...benefit} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
  content: { padding: 20 },
});
