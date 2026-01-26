// BookingNavigator.tsx - 부킹 스택
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingListScreen from '../../screens/booking/BookingListScreen';
import BookingDetailScreen from '../../screens/booking/BookingDetailScreen';
import CreateBookingScreen from '../../screens/booking/CreateBookingScreen';
import PaymentScreen from '../../screens/booking/PaymentScreen';
import BookingRequestsScreen from '../../screens/booking/BookingRequestsScreen';
import ApplicantProfileScreen from '../../screens/booking/ApplicantProfileScreen';
import PopularBookingsScreen from '../../screens/booking/PopularBookingsScreen';
import RecommendedBookingsScreen from '../../screens/booking/RecommendedBookingsScreen';
import RequestStatusScreen from '../../screens/booking/RequestStatusScreen';

const Stack = createNativeStackNavigator();

export const BookingNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerBackTitleVisible: false, headerTintColor: '#007AFF' }}>
      <Stack.Screen name="BookingList" component={BookingListScreen} options={{ title: '부킹 목록', headerShown: false }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: '부킹 상세' }} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ title: '부킹 만들기' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: '결제' }} />
      <Stack.Screen name="BookingRequests" component={BookingRequestsScreen} options={{ title: '신청 관리' }} />
      <Stack.Screen name="ApplicantProfile" component={ApplicantProfileScreen} options={{ title: '신청자 정보' }} />
      <Stack.Screen name="PopularBookings" component={PopularBookingsScreen} options={{ title: '인기 부킹' }} />
      <Stack.Screen name="RecommendedBookings" component={RecommendedBookingsScreen} options={{ title: '추천 부킹' }} />
      <Stack.Screen name="RequestStatus" component={RequestStatusScreen} options={{ title: '신청 상태' }} />
    </Stack.Navigator>
  );
}
