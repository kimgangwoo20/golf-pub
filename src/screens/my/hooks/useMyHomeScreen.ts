import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { useFriendStore } from '@/store/useFriendStore';
import { firestore as firebaseFirestore } from '@/services/firebase/firebaseConfig';

export const useMyHomeScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [friends, setFriends] = useState<any[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<any[]>([]);

  useEffect(() => {
    loadFriends();
    loadGuestbook();
  }, []);

  const loadFriends = async () => {
    if (!user?.uid) return;
    try {
      await useFriendStore.getState().loadFriends(user.uid);
      const friendList = useFriendStore.getState().friends;
      setFriends(friendList);
    } catch (error: any) {
      console.error('친구 목록 로드 실패:', error);
    }
  };

  const loadGuestbook = async () => {
    if (!user?.uid) return;
    try {
      const snapshot = await firebaseFirestore
        .collection('users')
        .doc(user.uid)
        .collection('guestbook')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const entries = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.authorName || '익명',
          authorId: data.authorId || '',
          authorImage: data.authorImage || '',
          content: data.content || '',
          time: data.createdAt?.toDate?.()?.toLocaleDateString?.('ko-KR') || '',
        };
      });
      setGuestbookEntries(entries);
    } catch (error: any) {
      console.error('방명록 로드 실패:', error);
    }
  };

  const handleMenuPress = (menu: string) => {
    const menuRoutes: Record<string, string> = {
      settings: 'Settings',
      notifications: 'Notifications',
      profile: 'Profile',
      editProfile: 'EditProfile',
      myBookings: 'MyBookings',
      myPosts: 'MyPosts',
      friends: 'Friends',
      pointHistory: 'PointHistory',
      coupons: 'Coupons',
      support: 'Support',
    };

    const route = menuRoutes[menu];
    if (route) {
      navigation.navigate(route as any);
    }
  };

  const handleFriendPress = () => {
    navigation.navigate('Friends' as any);
  };

  const handleAddGuestbook = async (message: string) => {
    if (!user?.uid || !message.trim()) return;
    try {
      await firebaseFirestore
        .collection('users')
        .doc(user.uid)
        .collection('guestbook')
        .add({
          authorId: user.uid,
          authorName: user.displayName || '익명',
          authorImage: user.photoURL || '',
          content: message.trim(),
          createdAt: new Date(),
        });

      // 방명록 새로고침
      await loadGuestbook();
    } catch (error: any) {
      console.error('방명록 추가 실패:', error);
    }
  };

  return {
    user,
    friends,
    guestbookEntries,
    handleMenuPress,
    handleFriendPress,
    handleAddGuestbook,
  };
};
