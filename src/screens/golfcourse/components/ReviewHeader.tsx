import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  courseName: string;
  onBack: () => void;
}

export const ReviewHeader: React.FC<Props> = ({ courseName, onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>
    <Text style={styles.title} numberOfLines={1}>{courseName} 리뷰</Text>
    <View style={styles.placeholder} />
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  backButton: { padding: 8 },
  backIcon: { fontSize: 24 },
  title: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  placeholder: { width: 40 },
});
