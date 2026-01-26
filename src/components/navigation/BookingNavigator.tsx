// BookingNavigator.tsx - 부킹 스택
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingListScreen from '../screens/booking/BookingListScreen';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import CreateBookingScreen from '../screens/booking/CreateBookingScreen';
import BookingApprovalScreen from '../screens/booking/BookingApprovalScreen';
import ApplicantDetailScreen from '../screens/booking/ApplicantDetailScreen';
import ApprovalHistoryScreen from '../screens/booking/ApprovalHistoryScreen';

const Stack = createNativeStackNavigator();

export default function BookingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerBackTitleVisible: false, headerTintColor: '#007AFF' }}>
      <Stack.Screen name="BookingList" component={BookingListScreen} options={{ title: '부킹 목록', headerShown: false }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: '부킹 상세' }} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ title: '부킹 만들기' }} />
      <Stack.Screen name="BookingApproval" component={BookingApprovalScreen} options={{ title: '승인 관리' }} />
      <Stack.Screen name="ApplicantDetail" component={ApplicantDetailScreen} options={{ title: '신청자 정보' }} />
      <Stack.Screen name="ApprovalHistory" component={ApprovalHistoryScreen} options={{ title: '승인 내역' }} />
    </Stack.Navigator>
  );
}
