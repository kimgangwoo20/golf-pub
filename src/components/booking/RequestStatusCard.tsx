// RequestStatusCard.tsx - 부킹 신청 상태 카드
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RequestStatusCardProps {
  bookingTitle: string;
  courseName: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  onViewDetails?: () => void;
  onCancel?: () => void;
}

export const RequestStatusCard: React.FC<RequestStatusCardProps> = ({
  bookingTitle,
  courseName,
  date,
  time,
  status,
  requestedAt,
  onViewDetails,
  onCancel,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: '✅',
          text: '승인됨',
          color: '#10b981',
          bg: '#d1fae5',
          description: '참가가 확정되었습니다',
        };
      case 'rejected':
        return {
          icon: '❌',
          text: '거절됨',
          color: '#ef4444',
          bg: '#fee2e2',
          description: '참가가 거절되었습니다',
        };
      default:
        return {
          icon: '⏳',
          text: '대기중',
          color: '#f59e0b',
          bg: '#fef3c7',
          description: '주최자 승인 대기 중입니다',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={[styles.statusHeader, { backgroundColor: statusConfig.bg }]}>
        <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.bookingTitle}>{bookingTitle}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>⛳</Text>
          <Text style={styles.detailText}>{courseName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{date} {time}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🕐</Text>
          <Text style={styles.detailText}>신청일: {requestedAt}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.detailButton} onPress={onViewDetails}>
          <Text style={styles.detailButtonText}>상세 보기</Text>
        </TouchableOpacity>

        {status === 'pending' && onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>신청 취소</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  body: {
    padding: 16,
  },
  bookingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
