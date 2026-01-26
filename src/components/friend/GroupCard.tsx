// GroupCard.tsx - 그룹 카드 컴포넌트
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface GroupCardProps {
  /** 그룹 이름 */
  name: string;
  /** 그룹 썸네일 */
  thumbnail: string;
  /** 멤버 수 */
  memberCount: number;
  /** 최근 활동 */
  lastActivity?: string;
  /** 클릭 핸들러 */
  onPress?: () => void;
  /** 액션 버튼 표시 */
  showAction?: boolean;
  /** 액션 버튼 텍스트 */
  actionText?: string;
  /** 액션 버튼 핸들러 */
  onActionPress?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  name,
  thumbnail,
  memberCount,
  lastActivity,
  onPress,
  showAction = false,
  actionText = '입장',
  onActionPress,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={styles.container} onPress={onPress}>
      <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.meta}>
          <Text style={styles.memberCount}>멤버 {memberCount}명</Text>
          {lastActivity && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.lastActivity}>{lastActivity}</Text>
            </>
          )}
        </View>
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
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  dot: {
    fontSize: 13,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  lastActivity: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#007AFF',
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
