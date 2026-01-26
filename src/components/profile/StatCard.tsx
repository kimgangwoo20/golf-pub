// StatCard.tsx - 통계 카드
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = '#007AFF',
  onPress,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={[styles.container, { borderColor: color }]} onPress={onPress}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: 100,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
  },
});
