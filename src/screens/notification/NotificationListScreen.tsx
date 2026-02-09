// NotificationListScreen.tsx - 알림 목록 화면

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight } from '@/styles/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { firebaseMessaging } from '@/services/firebase/firebaseMessaging';

// 알림 타입별 아이콘 매핑
const NOTIFICATION_ICONS: Record<string, string> = {
  booking_new: '⛳',
  booking_join: '🙋',
  booking_approved: '✅',
  booking_rejected: '❌',
  booking_reminder: '⏰',
  booking_cancelled: '🚫',
  chat_message: '💬',
  friend_request: '👋',
  friend_accepted: '🤝',
  marketplace_inquiry: '🛒',
  marketplace_sold: '💰',
  review_new: '⭐',
  point_earned: '🎯',
  coupon_issued: '🎟️',
  membership_upgrade: '👑',
  system_notice: '📢',
};

// 시간 포맷팅
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
  onPress: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  body,
  read,
  createdAt,
  onPress,
}) => {
  const icon = NOTIFICATION_ICONS[type] || '🔔';

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !read && styles.unreadItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.notificationTitle, !read && styles.unreadText]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {body}
        </Text>
        <Text style={styles.timeText}>{formatTimeAgo(createdAt)}</Text>
      </View>
      {!read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

export const NotificationListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    notifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (user?.uid) {
      subscribeToNotifications(user.uid);
    }
    return () => {
      unsubscribeFromNotifications();
    };
  }, [user?.uid]);

  const handleNotificationPress = useCallback(
    (notification: { id: string; type: string; read: boolean; data?: Record<string, any> }) => {
      // 읽음 처리
      if (!notification.read && user?.uid) {
        markAsRead(notification.id, user.uid);
      }
      // 딥링킹 네비게이션
      firebaseMessaging.handleNotificationNavigation({
        type: notification.type,
        ...(notification.data || {}),
      });
    },
    [user?.uid],
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (user?.uid) {
      markAllAsRead(user.uid);
    }
  }, [user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.uid) {
      // 재구독으로 새로고침
      unsubscribeFromNotifications();
      subscribeToNotifications(user.uid);
    }
    setRefreshing(false);
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item }: { item: (typeof notifications)[0] }) => (
    <NotificationItem {...item} onPress={() => handleNotificationPress(item)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>알림이 없습니다</Text>
      <Text style={styles.emptySubtitle}>새로운 알림이 도착하면 여기에 표시됩니다.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'<'} 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>알림</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={styles.readAllButton}>모두 읽기</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* 알림 목록 */}
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={notifications.length === 0 ? styles.emptyList : undefined}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold as any,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
  },
  readAllButton: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold as any,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  unreadItem: {
    backgroundColor: '#f0fdf4',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium as any,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: fontWeight.bold as any,
  },
  notificationBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
