// Avatar.tsx - 사용자 아바타 컴포넌트
import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fontWeight } from '@/styles/theme';

interface AvatarProps {
  /** 아바타 이미지 URL */
  uri?: string;
  /** 이미지 없을 때 표시할 텍스트 (이니셜 등) */
  name?: string;
  /** 아바타 크기 */
  size?: 'small' | 'medium' | 'large' | number;
  /** 배지 표시 (온라인 상태 등) */
  badge?: 'online' | 'offline' | 'busy';
  /** 커스텀 스타일 */
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'medium', badge, style }) => {
  const [imageError, setImageError] = useState(false);

  // 크기 계산
  const avatarSize =
    typeof size === 'number' ? size : size === 'small' ? 32 : size === 'large' ? 64 : 48;

  // 이니셜 추출
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // 배지 색상
  const getBadgeColor = () => {
    switch (badge) {
      case 'online':
        return colors.success;
      case 'busy':
        return colors.warning;
      case 'offline':
        return colors.textSecondary;
      default:
        return 'transparent';
    }
  };

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      {uri && !imageError ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: avatarSize / 2 }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: avatarSize / 2.5 }]}>{getInitials(name)}</Text>
        </View>
      )}
      {badge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: getBadgeColor(), width: avatarSize / 4, height: avatarSize / 4 },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.bgPrimary,
  },
});
