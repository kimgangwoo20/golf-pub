import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export const useMyHomeScreen = () => {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState([]);
  const [guestbookEntries, setGuestbookEntries] = useState([]);

  useEffect(() => {
    loadFriends();
    loadGuestbook();
  }, []);

  const loadFriends = async () => {
    // TODO: Firestore에서 친구 목록 로드
  };

  const loadGuestbook = async () => {
    // TODO: Firestore에서 방명록 로드
  };

  const handleMenuPress = (menu: string) => {
    // TODO: 메뉴별 화면 이동
  };

  const handleFriendPress = () => {
    // TODO: 친구 목록 화면으로 이동
  };

  const handleAddGuestbook = (message: string) => {
    // TODO: 방명록 추가
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
