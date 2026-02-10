// ChatListScreen.tsx - 채팅 목록 (Firebase 실시간 연동)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight } from '@/styles/theme';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { DEFAULT_AVATAR } from '@/constants/images';
import { useMembershipGate } from '@/hooks/useMembershipGate';
import { PremiumGuard } from '@/components/common/PremiumGuard';

export const ChatListScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { checkAccess } = useMembershipGate();
  const { chatRooms, loadChatRooms } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  // 채팅방 목록 로드
  useEffect(() => {
    if (user?.uid) {
      loadChatRooms(user.uid);
    }
  }, [user?.uid, loadChatRooms]);

  const filteredChats = chatRooms.filter((chat) =>
    chat.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const renderChatItem = ({ item }: { item: any }) => {
    // 현재 사용자가 아닌 참여자 찾기 (1:1 채팅의 경우)
    const otherParticipant = item.participants.find((p: any) => p.uid !== user?.uid);
    const chatName =
      item.type === 'direct'
        ? otherParticipant?.name || '알 수 없음'
        : `그룹 채팅 (${item.participants.length})`;

    const unreadCount = item.unreadCount?.[user?.uid || ''] || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          navigation?.navigate('ChatScreen', {
            roomId: item.id,
            chatName: chatName,
          });
        }}
      >
        <Image
          source={{ uri: otherParticipant?.avatar || DEFAULT_AVATAR }}
          style={styles.avatar}
          onError={() => {}}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{chatName}</Text>
            <Text style={styles.timestamp}>
              {item.lastMessage?.createdAt
                ? new Date(item.lastMessage.createdAt).toLocaleString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </Text>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.message || '메시지가 없습니다'}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 멤버십 게이팅: 비구독 남성 차단
  if (!checkAccess('chat')) {
    return <PremiumGuard feature="채팅" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>채팅</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation?.navigate('CreateChat')}
            >
              <Text style={styles.headerButtonText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation?.navigate('ChatSettings')}
            >
              <Text style={styles.headerButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 검색 */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="채팅 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* 채팅 목록 */}
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>채팅이 없습니다</Text>
              <Text style={styles.emptySubtext}>새 채팅을 시작해보세요!</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: fontSize.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTertiary,
    margin: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  listContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadText: {
    color: colors.bgPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 84,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});
