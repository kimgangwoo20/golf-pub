import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const HomeHeader: React.FC = () => (
  <View style={styles.header}>
    <Text style={styles.logo}>⛳ 골프 Pub</Text>
    <View style={styles.actions}>
      <TouchableOpacity style={styles.iconButton}>
        <Text style={styles.icon}>🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <Text style={styles.icon}>➕</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  actions: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8 },
  icon: { fontSize: 20 },
});
