// FriendCard.tsx - 친구 카드 컴포넌트
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface FriendCardProps {
  /** 친구 이름 */
  name: string;
  /** 아바타 이미지 URL */
  avatar: string;
  /** 골프 레벨 */
  level?: string;
  /** 온라인 상태 */
  status?: 'online' | 'offline' | 'busy';
  /** 클릭 핸들러 */
  onPress?: () => void;
  /** 액션 버튼 표시 */
  showAction?: boolean;
  /** 액션 버튼 텍스트 */
  actionText?: string;
  /** 액션 버튼 핸들러 */
  onActionPress?: () => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  name,
  avatar,
  level,
  status,
  onPress,
  showAction = false,
  actionText = '채팅',
  onActionPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'busy':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  const [avatarError, setAvatarError] = useState(false);

  return (
    <Component style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {!avatarError && avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} onError={() => setAvatarError(true)} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{name?.[0] || '?'}</Text>
          </View>
        )}
        {status && <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {level && <Text style={styles.level}>{level}</Text>}
      </View>
      {showAction && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  level: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
