import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BenefitItem } from '../../components/membership/BenefitItem';

export const MembershipIntroScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const benefits = [
    {
      icon: '⛳',
      title: '무제한 부킹 참가',
      description: '제한 없이 모든 골프 모임에 참여하세요',
    },
    {
      icon: '💬',
      title: '무제한 채팅',
      description: '골프 메이트와 자유롭게 소통하세요',
    },
    {
      icon: '🏌️',
      title: '골프장 예약',
      description: '전국 골프장을 간편하게 예약하세요',
    },
    {
      icon: '🎁',
      title: '매월 포인트 적립',
      description: '사용할수록 쌓이는 포인트 혜택',
    },
    {
      icon: '🛒',
      title: '중고거래 참여',
      description: '골프 용품을 사고팔 수 있어요',
    },
    {
      icon: '👨‍🏫',
      title: '코치 매칭',
      description: '나에게 맞는 골프 코치를 찾아보세요',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>골프 Pub</Text>
          <Text style={styles.titleHighlight}>프리미엄 멤버십</Text>
          <Text style={styles.subtitle}>
            골프를 더 즐겁게, 더 편리하게
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>멤버십 혜택</Text>
          {benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>7만+</Text>
            <Text style={styles.statLabel}>활성 회원</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5,000+</Text>
            <Text style={styles.statLabel}>월간 모임</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>평균 평점</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MembershipPlan' as any)}
        >
          <Text style={styles.buttonText}>플랜 선택하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  titleHighlight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  benefitsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
