// ParticipantCard.tsx - 참가자 카드
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface ParticipantCardProps {
  name: string;
  avatar: string;
  level: string;
  rating?: number;
  isOrganizer?: boolean;
  onPress?: () => void;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  name,
  avatar,
  level,
  rating,
  isOrganizer = false,
  onPress,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={styles.container} onPress={onPress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {isOrganizer && (
            <View style={styles.organizerBadge}>
              <Text style={styles.organizerText}>주최</Text>
            </View>
          )}
        </View>
        <View style={styles.stats}>
          <Text style={styles.level}>{level}</Text>
          {rating && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.rating}>⭐ {rating}</Text>
            </>
          )}
        </View>
      </View>
    </Component>
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  organizerBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  organizerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  level: {
    fontSize: 13,
    color: '#6b7280',
  },
  dot: {
    fontSize: 13,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  rating: {
    fontSize: 13,
    color: '#6b7280',
  },
});
