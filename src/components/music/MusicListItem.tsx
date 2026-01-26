// MusicListItem.tsx - 음악 리스트 아이템 (간단 버전)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MusicListItemProps {
  title: string;
  artist: string;
  duration?: string;
  isPlaying?: boolean;
  onPress?: () => void;
  onGift?: () => void;
}

export const MusicListItem: React.FC<MusicListItemProps> = ({
  title,
  artist,
  duration,
  isPlaying = false,
  onPress,
  onGift,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.containerPlaying]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <Text style={styles.icon}>
          {isPlaying ? '🔊' : '🎵'}
        </Text>
        <View style={styles.info}>
          <Text
            style={[styles.title, isPlaying && styles.titlePlaying]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {duration && <Text style={styles.duration}>{duration}</Text>}
        {onGift && (
          <TouchableOpacity
            style={styles.giftButton}
            onPress={(e) => {
              e.stopPropagation();
              onGift();
            }}
          >
            <Text style={styles.giftIcon}>🎁</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  containerPlaying: {
    backgroundColor: '#eff6ff',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  titlePlaying: {
    color: '#007AFF',
  },
  artist: {
    fontSize: 12,
    color: '#6b7280',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  duration: {
    fontSize: 12,
    color: '#9ca3af',
    minWidth: 40,
    textAlign: 'right',
  },
  giftButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 16,
  },
  giftIcon: {
    fontSize: 16,
  },
});
