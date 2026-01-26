import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MusicPlayerWidget: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>MusicPlayerWidget Screen</Text>
      <Text style={styles.subtitle}>구현 예정</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
