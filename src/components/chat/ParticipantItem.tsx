// ParticipantItem.tsx - 참가자 아이템
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface ParticipantItemProps {
  name: string;
  avatar: string;
  role?: 'admin' | 'member';
  level?: string;
  onPress?: () => void;
}

export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  name,
  avatar,
  role,
  level,
  onPress,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={styles.container} onPress={onPress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>방장</Text>
            </View>
          )}
        </View>
        {level && <Text style={styles.level}>{level}</Text>}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
  adminBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  level: {
    fontSize: 14,
    color: '#666',
  },
});
