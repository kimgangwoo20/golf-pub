import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileCard } from './components/ProfileCard';
import { FriendSection } from './components/FriendSection';
import { MenuGrid } from './components/MenuGrid';
import { GuestBook } from './components/GuestBook';
import { MusicPlayer } from './components/MusicPlayer';
import { useMyHomeScreen } from './hooks/useMyHomeScreen';

export const MyHomeScreen = ({ navigation }: any) => {
  const {
    user,
    friends,
    guestbookEntries,
    handleMenuPress,
    handleFriendPress,
    handleAddGuestbook,
  } = useMyHomeScreen();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileCard user={user} onEdit={() => navigation.navigate('EditProfile')} />
        <FriendSection friends={friends} onPress={handleFriendPress} />
        <MenuGrid onMenuPress={handleMenuPress} />
        <GuestBook entries={guestbookEntries} onAdd={handleAddGuestbook} />
        <MusicPlayer />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
