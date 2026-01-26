// Badge.tsx - 배지 컴포넌트
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  /** 배지에 표시할 내용 (숫자 또는 텍스트) */
  content?: string | number;
  /** 배지 타입 */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  /** 배지 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 점만 표시 (내용 없음) */
  dot?: boolean;
  /** 최대 숫자 표시 (숫자가 이보다 크면 '99+' 형태로 표시) */
  max?: number;
  /** 커스텀 스타일 */
  style?: ViewStyle;
  /** 텍스트 커스텀 스타일 */
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  content,
  variant = 'default',
  size = 'medium',
  dot = false,
  max = 99,
  style,
  textStyle,
}) => {
  // 배경색 결정
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '#007AFF';
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'danger':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  // 크기에 따른 패딩
  const getSize = () => {
    if (dot) {
      return size === 'small' ? 6 : size === 'large' ? 10 : 8;
    }
    return size === 'small'
      ? { paddingHorizontal: 4, paddingVertical: 2, minWidth: 16 }
      : size === 'large'
      ? { paddingHorizontal: 10, paddingVertical: 4, minWidth: 28 }
      : { paddingHorizontal: 6, paddingVertical: 2, minWidth: 20 };
  };

  // 텍스트 크기
  const getFontSize = () => {
    return size === 'small' ? 10 : size === 'large' ? 14 : 11;
  };

  // 표시할 내용 포맷팅
  const getDisplayContent = () => {
    if (typeof content === 'number' && content > max) {
      return `${max}+`;
    }
    return content?.toString() || '';
  };

  if (dot) {
    const dotSize = getSize() as number;
    return (
      <View
        style={[
          styles.dot,
          {
            backgroundColor: getBackgroundColor(),
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
        getSize() as ViewStyle,
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: getFontSize() }, textStyle]}>
        {getDisplayContent()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dot: {
    borderWidth: 2,
    borderColor: '#fff',
  },
});
