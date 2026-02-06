import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from './components/HomeHeader';
import { SearchBar } from './components/SearchBar';
import { MembershipBanner } from './components/MembershipBanner';
import { AttendanceBanner } from './components/AttendanceBanner';
import { FilterChips } from './components/FilterChips';
import { BookingList } from './components/BookingList';
import { CreateBookingButton } from './components/CreateBookingButton';
import { WeatherWidget } from '../../components/weather/WeatherWidget';
import { useHomeScreen } from './hooks/useHomeScreen';

export const HomeScreen = ({ navigation }: any) => {
  const {
    bookings,
    filter,
    searchQuery,
    refreshing,
    attendanceChecked,
    handleFilterChange,
    handleSearch,
    handleRefresh,
    handleBookingPress,
    handleJoinBooking,
    handleAttendanceCheck,
    handleCreateBooking,
  } = useHomeScreen();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HomeHeader />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <WeatherWidget />
        <SearchBar value={searchQuery} onChangeText={handleSearch} />
        <MembershipBanner onPress={() => navigation.navigate('MembershipIntro')} />
        <AttendanceBanner checked={attendanceChecked} onCheck={handleAttendanceCheck} />
        <FilterChips activeFilter={filter} onFilterChange={handleFilterChange} />
        <BookingList
          bookings={bookings}
          onBookingPress={handleBookingPress}
          onJoinPress={handleJoinBooking}
        />
      </ScrollView>
      
      <CreateBookingButton onPress={handleCreateBooking} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
