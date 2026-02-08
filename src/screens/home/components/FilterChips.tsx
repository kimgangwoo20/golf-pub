import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'today', label: '오늘' },
  { id: 'week', label: '이번주' },
  { id: 'beginner', label: '초보자' },
];

export const FilterChips: React.FC<Props> = ({ activeFilter, onFilterChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
    {FILTERS.map((f) => (
      <TouchableOpacity
        key={f.id}
        style={[styles.chip, activeFilter === f.id && styles.chipActive]}
        onPress={() => onFilterChange(f.id)}
      >
        <Text style={[styles.text, activeFilter === f.id && styles.textActive]}>{f.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#10b981' },
  text: { fontSize: 14, color: '#64748b' },
  textActive: { color: '#fff', fontWeight: '600' },
});
