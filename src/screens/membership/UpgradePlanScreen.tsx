import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlanCard } from '../../components/membership/PlanCard';
import { MEMBERSHIP_PLANS } from '../../constants/membershipPlans';
import { MembershipType } from '../../types/membership';

export const UpgradePlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentType = MembershipType.FREE;
  
  const upgradePlans = MEMBERSHIP_PLANS.filter(plan => 
    plan.type !== MembershipType.FREE && plan.type !== currentType
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>플랜 업그레이드</Text>
          <Text style={styles.subtitle}>더 많은 혜택을 누려보세요</Text>
        </View>
        
        <View style={styles.plansContainer}>
          {upgradePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => navigation.navigate('MembershipPayment' as never, { plan: plan.type } as never)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
  plansContainer: { padding: 20 },
});
