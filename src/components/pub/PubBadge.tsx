// PubBadge.tsx - 펍 배지 컴포넌트
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface PubBadgeProps {
  /** 배지 타입 */
  type: 'partner' | 'popular' | 'new' | 'discount';
  /** 커스텀 스타일 */
  style?: ViewStyle;
}

export const PubBadge: React.FC<PubBadgeProps> = ({ type, style }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'partner':
        return { text: '제휴', backgroundColor: '#FF6B00', color: '#fff' };
      case 'popular':
        return { text: '인기', backgroundColor: '#FF3B30', color: '#fff' };
      case 'new':
        return { text: 'NEW', backgroundColor: '#10b981', color: '#fff' };
      case 'discount':
        return { text: '할인', backgroundColor: '#FFD700', color: '#1a1a1a' };
      default:
        return { text: '', backgroundColor: '#ccc', color: '#fff' };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }, style]}>
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
