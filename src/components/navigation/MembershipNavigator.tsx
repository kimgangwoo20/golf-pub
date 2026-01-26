// MembershipNavigator.tsx - 멤버십 스택
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MembershipIntroScreen from '../screens/membership/MembershipIntroScreen';
import MembershipPlanScreen from '../screens/membership/MembershipPlanScreen';
import PlanComparisonScreen from '../screens/membership/PlanComparisonScreen';
import MembershipPaymentScreen from '../screens/membership/MembershipPaymentScreen';
import MembershipSuccessScreen from '../screens/membership/MembershipSuccessScreen';
import MembershipBenefitsScreen from '../screens/membership/MembershipBenefitsScreen';
import MembershipManageScreen from '../screens/membership/MembershipManageScreen';
import UpgradePlanScreen from '../screens/membership/UpgradePlanScreen';

const Stack = createNativeStackNavigator();

export default function MembershipNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen name="MembershipIntro" component={MembershipIntroScreen} options={{ title: '멤버십' }} />
      <Stack.Screen name="MembershipPlan" component={MembershipPlanScreen} options={{ title: '플랜 선택' }} />
      <Stack.Screen name="PlanComparison" component={PlanComparisonScreen} options={{ title: '플랜 비교' }} />
      <Stack.Screen name="MembershipPayment" component={MembershipPaymentScreen} options={{ title: '결제' }} />
      <Stack.Screen name="MembershipSuccess" component={MembershipSuccessScreen} options={{ title: '완료', headerShown: false }} />
      <Stack.Screen name="MembershipBenefits" component={MembershipBenefitsScreen} options={{ title: '혜택' }} />
      <Stack.Screen name="MembershipManage" component={MembershipManageScreen} options={{ title: '멤버십 관리' }} />
      <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} options={{ title: '업그레이드' }} />
    </Stack.Navigator>
  );
}
