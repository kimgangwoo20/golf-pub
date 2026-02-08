// MarketplaceCard.tsx - 마켓플레이스 카드 (카테고리별)
import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MarketplaceCardProps {
  title: string;
  icon: string;
  count: number;
  onPress?: () => void;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  title,
  icon,
  count,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.count}>{count}개</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 100,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    color: '#6b7280',
  },
});
