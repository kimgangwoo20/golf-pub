import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar: React.FC<Props> = ({ value, onChangeText }) => (
  <TextInput
    style={styles.input}
    placeholder="골프장, 지역 검색..."
    value={value}
    onChangeText={onChangeText}
  />
);

const styles = StyleSheet.create({
  input: { margin: 16, marginTop: 0, padding: 14, backgroundColor: '#f1f5f9', borderRadius: 12, fontSize: 15 },
});
