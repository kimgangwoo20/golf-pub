// FriendRequestsScreen.tsx - 친구 요청 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FriendRequest } from '../../types/friends-types';

// Mock 받은 요청 데이터
const mockReceivedRequests: FriendRequest[] = [
  {
    id: 1,
    userId: 101,
    userName: '박지성',
    userImage: 'https://i.pravatar.cc/150?img=11',
    userHandicap: 17,
    userLocation: '서울 마포구',
    mutualFriends: 7,
    message: '같이 라운딩 하고 싶어요!',
    createdAt: '2025.01.23',
    type: 'received',
  },
  {
    id: 2,
    userId: 102,
    userName: '손흥민',
    userImage: 'https://i.pravatar.cc/150?img=13',
    userHandicap: 14,
    userLocation: '경기 용인시',
    mutualFriends: 12,
    createdAt: '2025.01.22',
    type: 'received',
  },
  {
    id: 3,
    userId: 103,
    userName: '김연아',
    userImage: 'https://i.pravatar.cc/150?img=24',
    userHandicap: 19,
    userLocation: '서울 강남구',
    mutualFriends: 5,
    message: '친구 추가 부탁드립니다~',
    createdAt: '2025.01.21',
    type: 'received',
  },
];

// Mock 보낸 요청 데이터
const mockSentRequests: FriendRequest[] = [
  {
    id: 4,
    userId: 104,
    userName: '이강인',
    userImage: 'https://i.pravatar.cc/150?img=52',
    userHandicap: 16,
    userLocation: '서울 송파구',
    mutualFriends: 4,
    createdAt: '2025.01.20',
    type: 'sent',
  },
  {
    id: 5,
    userId: 105,
    userName: '황희찬',
    userImage: 'https://i.pravatar.cc/150?img=33',
    userHandicap: 18,
    userLocation: '경기 성남시',
    mutualFriends: 9,
    createdAt: '2025.01.18',
    type: 'sent',
  },
];

type TabType = 'received' | 'sent';

export const FriendRequestsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('received');

  const handleAccept = (requestId: number, userName: string) => {
    Alert.alert(
      '친구 요청 승인',
      `${userName}님의 친구 요청을 승인하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          onPress: () => {
            console.log('승인:', requestId);
            Alert.alert('완료', '친구가 되었습니다!');
          },
        },
      ]
    );
  };

  const handleReject = (requestId: number, userName: string) => {
    Alert.alert(
      '친구 요청 거절',
      `${userName}님의 친구 요청을 거절하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: () => {
            console.log('거절:', requestId);
            Alert.alert('완료', '요청을 거절했습니다.');
          },
        },
      ]
    );
  };

  const handleCancel = (requestId: number, userName: string) => {
    Alert.alert(
      '요청 취소',
      `${userName}님에게 보낸 친구 요청을 취소하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '취소하기',
          style: 'destructive',
          onPress: () => {
            console.log('요청 취소:', requestId);
            Alert.alert('완료', '요청을 취소했습니다.');
          },
        },
      ]
    );
  };

  const displayRequests = activeTab === 'received' ? mockReceivedRequests : mockSentRequests;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>친구 요청</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => setActiveTab('received')}
          >
            <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
              받은 요청 ({mockReceivedRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              보낸 요청 ({mockSentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 요청 목록 */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.requestsList}>
            {displayRequests.length > 0 ? (
              displayRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <Image source={{ uri: request.userImage }} style={styles.userImage} />

                  <View style={styles.requestInfo}>
                    <Text style={styles.userName}>{request.userName}</Text>
                    <Text style={styles.userHandicap}>⛳ {request.userHandicap}</Text>
                    <Text style={styles.userLocation}>📍 {request.userLocation}</Text>

                    {request.mutualFriends > 0 && (
                      <Text style={styles.mutualText}>
                        공통 친구 {request.mutualFriends}명
                      </Text>
                    )}

                    {request.message && (
                      <View style={styles.messageBox}>
                        <Text style={styles.messageText}>{request.message}</Text>
                      </View>
                    )}

                    <Text style={styles.dateText}>{request.createdAt}</Text>
                  </View>

                  {/* 버튼 */}
                  {activeTab === 'received' ? (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(request.id, request.userName)}
                      >
                        <Text style={styles.acceptButtonText}>승인</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleReject(request.id, request.userName)}
                      >
                        <Text style={styles.rejectButtonText}>거절</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancel(request.id, request.userName)}
                    >
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {activeTab === 'received' ? '👥' : '📤'}
                </Text>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'received'
                    ? '받은 친구 요청이 없습니다'
                    : '보낸 친구 요청이 없습니다'}
                </Text>
              </View>
            )}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#2E7D32',
  },
  scrollView: {
    flex: 1,
  },
  requestsList: {
    padding: 16,
  },
  requestCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
    marginRight: 16,
  },
  requestInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userHandicap: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  mutualText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  messageBox: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    gap: 6,
    minWidth: 80,
  },
  acceptButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  rejectButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
});