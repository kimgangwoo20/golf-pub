// MusicPlayer.tsx - 음악 플레이어
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface MusicPlayerProps {
  title: string;
  artist: string;
  albumArt?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  title,
  artist,
  albumArt,
  isPlaying = false,
  onPlayPause,
  onNext,
  onPrevious,
}) => {
  return (
    <View style={styles.container}>
      {albumArt && <Image source={{ uri: albumArt }} style={styles.albumArt} onError={() => {}} />}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={onPrevious}>
          <Text style={styles.controlIcon}>⏮️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onNext}>
          <Text style={styles.controlIcon}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  albumArt: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  info: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#6b7280',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 24,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 28,
  },
});
