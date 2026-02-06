import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MEMBERSHIP_PLANS } from '../../constants/membershipPlans';
import { MembershipType, BillingCycle } from '../../types/membership';
import { PlanCard } from '../../components/membership/PlanCard';

export const MembershipPlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<MembershipType>(MembershipType.PREMIUM);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);

  const handleSelectPlan = (planType: MembershipType) => {
    setSelectedPlan(planType);
  };

  const handleContinue = () => {
    if (selectedPlan === MembershipType.FREE) {
      Alert.alert('알림', '무료 플랜은 별도 결제가 필요없습니다.');
      return;
    }

    const plan = MEMBERSHIP_PLANS.find(p => p.type === selectedPlan);
    const price = billingCycle === BillingCycle.MONTHLY 
      ? plan?.monthlyPrice 
      : plan?.yearlyPrice;

    navigation.navigate('MembershipPayment' as never, {
      plan: selectedPlan,
      billingCycle,
      price,
    } as never);
  };

  const getPrice = () => {
    const plan = MEMBERSHIP_PLANS.find(p => p.type === selectedPlan);
    if (!plan) return 0;
    return billingCycle === BillingCycle.MONTHLY ? plan.monthlyPrice : plan.yearlyPrice;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>멤버십 플랜 선택</Text>
          <Text style={styles.subtitle}>나에게 맞는 플랜을 선택하세요</Text>
        </View>

        {/* Billing Cycle Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === BillingCycle.MONTHLY && styles.toggleButtonActive,
            ]}
            onPress={() => setBillingCycle(BillingCycle.MONTHLY)}
          >
            <Text
              style={[
                styles.toggleText,
                billingCycle === BillingCycle.MONTHLY && styles.toggleTextActive,
              ]}
            >
              월간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === BillingCycle.YEARLY && styles.toggleButtonActive,
            ]}
            onPress={() => setBillingCycle(BillingCycle.YEARLY)}
          >
            <Text
              style={[
                styles.toggleText,
                billingCycle === BillingCycle.YEARLY && styles.toggleTextActive,
              ]}
            >
              연간 (17% 할인)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansContainer}>
          {MEMBERSHIP_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan.type)}
              isSelected={selectedPlan === plan.type}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 언제든지 플랜 변경 및 해지가 가능합니다
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>
            {billingCycle === BillingCycle.MONTHLY ? '월' : '연'} 결제 금액
          </Text>
          <Text style={styles.priceValue}>
            {getPrice().toLocaleString()}원
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>계속하기</Text>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#10b981',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  plansContainer: {
    padding: 20,
    paddingTop: 0,
  },
  infoBox: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
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
