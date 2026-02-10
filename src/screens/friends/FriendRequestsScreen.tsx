// FriendRequestsScreen.tsx - 친구 요청 화면 (Firestore 연동)

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from '@/services/firebase/firebaseFriends';
import { FriendRequest } from '@/services/firebase/firebaseFriends';
import { firestore, doc, getDoc } from '@/services/firebase/firebaseConfig';
import { DEFAULT_AVATAR } from '@/constants/images';

type TabType = 'received' | 'sent';

// FriendRequest에 사용자 정보를 포함한 확장 타입
interface RequestWithUserInfo extends FriendRequest {
  userName: string;
  userImage: string;
  userHandicap: number;
  userLocation: string;
}

export const FriendRequestsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [receivedRequests, setReceivedRequests] = useState<RequestWithUserInfo[]>([]);
  const [sentRequests, setSentRequests] = useState<RequestWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 요청 목록에 사용자 정보 추가
  const enrichRequests = async (
    requests: FriendRequest[],
    type: 'received' | 'sent',
  ): Promise<RequestWithUserInfo[]> => {
    const enriched: RequestWithUserInfo[] = [];

    for (const req of requests) {
      const targetUserId = type === 'received' ? req.fromUserId : req.toUserId;
      try {
        const userDocSnap = await getDoc(doc(firestore, 'users', targetUserId));

        const userData = userDocSnap.data();
        enriched.push({
          ...req,
          userName: userData?.name || userData?.displayName || '사용자',
          userImage: userData?.avatar || userData?.photoURL || '',
          userHandicap: userData?.handicap || 0,
          userLocation: userData?.location || '미등록',
        });
      } catch {
        enriched.push({
          ...req,
          userName: '사용자',
          userImage: '',
          userHandicap: 0,
          userLocation: '미등록',
        });
      }
    }

    return enriched;
  };

  const loadRequests = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        getPendingRequests(user.uid),
        getSentRequests(user.uid),
      ]);
      const [enrichedReceived, enrichedSent] = await Promise.all([
        enrichRequests(received, 'received'),
        enrichRequests(sent, 'sent'),
      ]);
      setReceivedRequests(enrichedReceived);
      setSentRequests(enrichedSent);
    } catch (error) {
      console.error('친구 요청 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [loadRequests]);

  const handleAccept = (requestId: string, userName: string, fromUserId: string) => {
    if (!user?.uid) return;
    Alert.alert('친구 요청 승인', `${userName}님의 친구 요청을 승인하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: async () => {
          try {
            const result = await acceptFriendRequest(requestId, fromUserId, user.uid);
            if (result.success) {
              setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
              Alert.alert('완료', `${userName}님과 친구가 되었습니다!`);
            } else {
              Alert.alert('오류', result.message);
            }
          } catch (error) {
            console.error('친구 수락 실패:', error);
            Alert.alert('오류', '친구 요청 승인에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleReject = (requestId: string, userName: string) => {
    Alert.alert('친구 요청 거절', `${userName}님의 친구 요청을 거절하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await rejectFriendRequest(requestId);
            if (result.success) {
              setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
              Alert.alert('완료', '요청을 거절했습니다.');
            } else {
              Alert.alert('오류', result.message);
            }
          } catch (error) {
            console.error('친구 거절 실패:', error);
            Alert.alert('오류', '요청 거절에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleCancel = (requestId: string, userName: string) => {
    Alert.alert('요청 취소', `${userName}님에게 보낸 친구 요청을 취소하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '취소하기',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await cancelFriendRequest(requestId);
            if (result.success) {
              setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
              Alert.alert('완료', '요청을 취소했습니다.');
            } else {
              Alert.alert('오류', result.message);
            }
          } catch (error) {
            console.error('친구 요청 취소 실패:', error);
            Alert.alert('오류', '요청 취소에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const displayRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading && receivedRequests.length === 0 && sentRequests.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>친구 요청</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>요청 목록을 불러오는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
              받은 요청 ({receivedRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              보낸 요청 ({sentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 요청 목록 */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
        >
          <View style={styles.requestsList}>
            {displayRequests.length > 0 ? (
              displayRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <Image
                    source={{ uri: request.userImage || DEFAULT_AVATAR }}
                    style={styles.userImage}
                    onError={() => {}}
                  />

                  <View style={styles.requestInfo}>
                    <Text style={styles.userName}>{request.userName}</Text>
                    <Text style={styles.userHandicap}>⛳ {request.userHandicap}</Text>
                    <Text style={styles.userLocation}>📍 {request.userLocation}</Text>

                    <Text style={styles.dateText}>{formatDate(request.createdAt)}</Text>
                  </View>

                  {/* 버튼 */}
                  {activeTab === 'received' ? (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() =>
                          handleAccept(request.id, request.userName, request.fromUserId)
                        }
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
                <Text style={styles.emptyText}>{activeTab === 'received' ? '👥' : '📤'}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#10b981',
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
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    gap: 6,
    minWidth: 80,
  },
  acceptButton: {
    backgroundColor: '#10b981',
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
