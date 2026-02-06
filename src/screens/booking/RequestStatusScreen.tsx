// RequestStatusScreen.tsx - 신청 상태 확인
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const MOCK_REQUEST = {
  id: '1',
  course: '스카이72 골프클럽',
  date: '2024-02-01',
  time: '08:00',
  organizer: '김골프',
  status: 'pending' as 'pending' | 'approved' | 'rejected',
  appliedAt: '2024-01-25',
};

export const RequestStatusScreen: React.FC<{ route?: any; navigation?: any }> = ({
  route,
  navigation,
}) => {
  const request = route?.params?.request || MOCK_REQUEST;

  const getStatusConfig = () => {
    switch (request.status) {
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

  const statusConfig = getStatusConfig();

  return (
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
          <Text style={styles.value}>{request.appliedAt}</Text>
        </View>
      </View>

      {/* 액션 버튼 */}
      {request.status === 'approved' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() =>
              navigation?.navigate('BookingDetail', { bookingId: request.id })
            }
          >
            <Text style={styles.detailButtonText}>부킹 상세보기</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'rejected' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation?.navigate('BookingList')}
          >
            <Text style={styles.searchButtonText}>다른 부킹 찾기</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
