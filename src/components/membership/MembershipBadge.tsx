import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MembershipType } from '../../../types/membership';

interface MembershipBadgeProps {
  type: MembershipType;
  size?: 'small' | 'medium' | 'large';
}

export default function MembershipBadge({ type, size = 'medium' }: MembershipBadgeProps) {
  const getBadgeConfig = () => {
    switch (type) {
      case MembershipType.VIP:
        return { emoji: '💎', text: 'VIP', color: '#9b59b6' };
      case MembershipType.PREMIUM:
        return { emoji: '👑', text: '프리미엄', color: '#3498db' };
      case MembershipType.FREE:
      default:
        return { emoji: '⭐', text: '무료', color: '#95a5a6' };
    }
  };

  const config = getBadgeConfig();
  const sizeStyles = styles[size];

  return (
    <View style={[styles.badge, { backgroundColor: config.color }, sizeStyles.container]}>
      <Text style={[styles.emoji, sizeStyles.emoji]}>{config.emoji}</Text>
      <Text style={[styles.text, sizeStyles.text]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emoji: {
    marginRight: 4,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
  small: {
    container: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    emoji: {
      fontSize: 12,
    },
    text: {
      fontSize: 11,
    },
  },
  medium: {
    container: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    emoji: {
      fontSize: 16,
    },
    text: {
      fontSize: 14,
    },
  },
  large: {
    container: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    emoji: {
      fontSize: 20,
    },
    text: {
      fontSize: 16,
    },
  },
});
