// ProfileCard.tsx - 프로필 카드
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface ProfileCardProps {
  name: string;
  avatar: string;
  level: string;
  bio?: string;
  rating?: number;
  onPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  avatar,
  level,
  bio,
  rating,
  onPress,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={styles.container} onPress={onPress}>
      {!avatarError && avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} onError={() => setAvatarError(true)} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{name?.[0] || '?'}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.stats}>
          <Text style={styles.level}>{level}</Text>
          {rating && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.rating}>⭐ {rating}</Text>
            </>
          )}
        </View>
        {bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {bio}
          </Text>
        )}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6b7280',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  level: {
    fontSize: 14,
    color: '#6b7280',
  },
  dot: {
    fontSize: 14,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
  },
  bio: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
});
