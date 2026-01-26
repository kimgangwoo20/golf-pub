// SongCard.tsx - 곡 카드
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface SongCardProps {
  title: string;
  artist: string;
  albumArt?: string;
  duration?: string;
  isPlaying?: boolean;
  onPress?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  title,
  artist,
  albumArt,
  duration,
  isPlaying = false,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {albumArt ? (
        <Image source={{ uri: albumArt }} style={styles.albumArt} />
      ) : (
        <View style={styles.albumArtPlaceholder}>
          <Text style={styles.placeholderIcon}>🎵</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      </View>
      {duration && <Text style={styles.duration}>{duration}</Text>}
      {isPlaying && <Text style={styles.playingIcon}>▶️</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  albumArtPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeholderIcon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  artist: {
    fontSize: 13,
    color: '#6b7280',
  },
  duration: {
    fontSize: 13,
    color: '#9ca3af',
    marginRight: 8,
  },
  playingIcon: {
    fontSize: 16,
  },
});
