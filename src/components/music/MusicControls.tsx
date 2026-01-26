// MusicControls.tsx - 간단한 플레이어 컨트롤 (미니 플레이어)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MusicControlsProps {
  title: string;
  artist: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onClose?: () => void;
}

export const MusicControls: React.FC<MusicControlsProps> = ({
  title,
  artist,
  isPlaying = false,
  onPlayPause,
  onNext,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.musicIcon}>🎵</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={onPlayPause}>
          <Text style={styles.controlIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onNext}>
          <Text style={styles.controlIcon}>⏭️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  musicIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: '#6b7280',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
  },
  controlIcon: {
    fontSize: 16,
  },
  closeIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
});
