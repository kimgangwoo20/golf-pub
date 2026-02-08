// ApplicantCard.tsx - 부킹 신청자 카드
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ApplicantCardProps {
  name: string;
  avatar: string;
  level: string;
  rating?: number;
  message?: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  onApprove?: () => void;
  onReject?: () => void;
  onViewProfile?: () => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  name,
  avatar,
  level,
  rating,
  message,
  appliedAt,
  status,
  onApprove,
  onReject,
  onViewProfile,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return { text: '승인됨', color: '#10b981', bg: '#d1fae5' };
      case 'rejected':
        return { text: '거절됨', color: '#ef4444', bg: '#fee2e2' };
      default:
        return { text: '대기중', color: '#f59e0b', bg: '#fef3c7' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onViewProfile}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
          <View style={styles.stats}>
            <Text style={styles.level}>{level}</Text>
            {rating && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.rating}>⭐ {rating}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>신청 메시지</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.appliedAt}>{appliedAt}</Text>

        {status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
              <Text style={styles.rejectButtonText}>거절</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={onApprove}
            >
              <Text style={styles.approveButtonText}>승인</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  level: {
    fontSize: 14,
    color: '#6b7280',
  },
  dot: {
    fontSize: 14,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
  },
  messageContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedAt: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
