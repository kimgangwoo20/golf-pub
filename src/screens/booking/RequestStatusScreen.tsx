// RequestStatusScreen.tsx - 신청 상태 확인 (Firestore 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRequestStatus } from '@/services/firebase/firebaseBooking';

export const RequestStatusScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requestId = route.params?.requestId as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadRequest = useCallback(async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      const result = await getRequestStatus(requestId);
      setRequest(result);
    } catch (error) {
      console.error('신청 상태 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR');
  };

  const getStatusConfig = () => {
    switch (request?.status) {
      case 'approved':
        return {
          icon: '✅',
          title: '승인됨',
          color: '#10b981',
          message: '부킹이 승인되었습니다! 즐거운 라운딩 되세요.',
        };
      case 'rejected':
        return {
          icon: '❌',
          title: '거절됨',
          color: '#ef4444',
          message: '아쉽지만 이번 부킹은 거절되었습니다. 다른 부킹을 찾아보세요.',
        };
      default:
        return {
          icon: '⏳',
          title: '대기 중',
          color: '#f59e0b',
          message: '주최자가 검토 중입니다. 잠시만 기다려주세요.',
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>신청 상태를 확인하는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>신청 정보를 찾을 수 없습니다</Text>
            <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
              <Text style={styles.goBackButtonText}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* 상태 */}
        <View style={[styles.statusSection, { backgroundColor: `${statusConfig.color}15` }]}>
          <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
          <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
            {statusConfig.title}
          </Text>
          <Text style={styles.statusMessage}>{statusConfig.message}</Text>
        </View>

        {/* 부킹 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>부킹 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>골프장</Text>
            <Text style={styles.value}>{request.course}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>날짜</Text>
            <Text style={styles.value}>{request.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>시간</Text>
            <Text style={styles.value}>{request.time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>주최자</Text>
            <Text style={styles.value}>{request.organizer}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>신청일</Text>
            <Text style={styles.value}>{formatDate(request.appliedAt)}</Text>
          </View>
        </View>

        {/* 액션 버튼 */}
        {request.status === 'approved' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: request.bookingId })}
            >
              <Text style={styles.detailButtonText}>부킹 상세보기</Text>
            </TouchableOpacity>
          </View>
        )}

        {request.status === 'rejected' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate('BookingList')}
            >
              <Text style={styles.searchButtonText}>다른 부킹 찾기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  statusSection: {
    padding: 32,
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actions: {
    padding: 16,
  },
  detailButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
