// BookingRequestsScreen.tsx - 부킹 신청 목록
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { colors } from '@/styles/theme';
import {
  getBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
} from '@/services/firebase/firebaseBooking';

interface BookingRequest {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  level: string;
  rating: number;
  message: string;
  status: string;
  joinedAt: any;
}

export const BookingRequestsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const route = useRoute();
  const { bookingId } = route.params as { bookingId: string };

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const data = await getBookingRequests(bookingId);
      setRequests(data);
    } catch (error: any) {
      console.error('신청 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [loadRequests]);

  const handleApprove = (request: BookingRequest) => {
    Alert.alert('승인', '신청을 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: async () => {
          const result = await approveBookingRequest(request.id, bookingId, request.userId);
          if (result.success) {
            setRequests((prev) => prev.filter((r) => r.id !== request.id));
            Alert.alert('완료', '신청이 승인되었습니다');
          } else {
            Alert.alert('오류', result.message);
          }
        },
      },
    ]);
  };

  const handleReject = (request: BookingRequest) => {
    Alert.alert('거절', '신청을 거절하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          const result = await rejectBookingRequest(request.id, bookingId, request.userId);
          if (result.success) {
            setRequests((prev) => prev.filter((r) => r.id !== request.id));
            Alert.alert('완료', '신청이 거절되었습니다');
          } else {
            Alert.alert('오류', result.message);
          }
        },
      },
    ]);
  };

  const renderRequest = ({ item }: { item: BookingRequest }) => (
    <View style={styles.requestCard}>
      <TouchableOpacity
        onPress={() => navigation?.navigate('ApplicantProfile', { applicant: item })}
        style={styles.requestInfo}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.level}>
            ⭐ {item.rating} {item.level ? `• ${item.level}` : ''}
          </Text>
          {item.message ? (
            <Text style={styles.message} numberOfLines={1}>
              {item.message}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item)}>
          <Text style={styles.rejectText}>거절</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item)}>
          <Text style={styles.approveText}>승인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>신청이 없습니다</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  level: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: {
    color: colors.danger,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});
