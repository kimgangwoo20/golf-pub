import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  activeFilter: string;
  activeSort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: '5star', label: '⭐ 5점' },
  { id: '4star', label: '⭐ 4점' },
  { id: 'photo', label: '📷 사진' },
];

const SORTS = [
  { id: 'latest', label: '최신순' },
  { id: 'helpful', label: '도움순' },
  { id: 'rating', label: '별점순' },
];

export const ReviewFilters: React.FC<Props> = ({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
}) => (
  <View style={styles.container}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.id}
          style={[styles.chip, activeFilter === f.id && styles.chipActive]}
          onPress={() => onFilterChange(f.id)}
        >
          <Text style={[styles.chipText, activeFilter === f.id && styles.chipTextActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
      {SORTS.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.sortChip, activeSort === s.id && styles.sortChipActive]}
          onPress={() => onSortChange(s.id)}
        >
          <Text style={[styles.sortText, activeSort === s.id && styles.sortTextActive]}>
            {s.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', paddingVertical: 12, marginBottom: 8 },
  filterScroll: { marginBottom: 8 },
  sortScroll: {},
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginLeft: 8,
  },
  chipActive: { backgroundColor: '#10b981' },
  chipText: { fontSize: 14, color: '#64748b' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginLeft: 8,
  },
  sortChipActive: { backgroundColor: '#e0f2fe' },
  sortText: { fontSize: 13, color: '#94a3b8' },
  sortTextActive: { color: '#0ea5e9', fontWeight: '600' },
});
