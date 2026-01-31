import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  query: string;
  onSearch: (text: string) => void;
  onFilterPress: () => void;
}

export const SearchHeader: React.FC<Props> = ({ query, onSearch, onFilterPress }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      placeholder="골프장 이름, 지역 검색..."
      value={query}
      onChangeText={onSearch}
    />
    <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
      <Text style={styles.filterIcon}>⚙️</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', marginBottom: 8 },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginRight: 8 },
  filterButton: { width: 48, height: 48, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 20 },
});
