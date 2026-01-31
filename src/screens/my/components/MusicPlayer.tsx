import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const MusicPlayer: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>🎵 My Music</Text>
    <View style={styles.player}>
      <Text style={styles.songTitle}>노래 선택</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>⏮️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>▶️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  player: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16 },
  songTitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 12 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  button: { padding: 8 },
  buttonText: { fontSize: 24 },
});
