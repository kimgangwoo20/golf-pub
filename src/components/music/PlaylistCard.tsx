// PlaylistCard.tsx - 플레이리스트 카드
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface PlaylistCardProps {
  title: string;
  songCount: number;
  coverImage?: string;
  onPress?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  title,
  songCount,
  coverImage,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {coverImage ? (
        <Image source={{ uri: coverImage }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.placeholderIcon}>🎵</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.songCount}>{songCount}곡</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: 12,
  },
  cover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  coverPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  songCount: {
    fontSize: 12,
    color: '#6b7280',
  },
});
