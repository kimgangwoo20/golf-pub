// ParticipantAvatar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingMember } from '@/types/booking-types';
import { colors } from '@/styles/theme';

interface Props { members: BookingMember[]; maxPlayers: number; size?: number; }

export const ParticipantAvatar: React.FC<Props> = ({ members, maxPlayers, size = 32 }) => {
  const maxDisplayCount = 4;
  const displayMembers = members.slice(0, maxDisplayCount);
  const remainingCount = maxPlayers - members.length;
  const hasMore = members.length > maxDisplayCount;

  return (
    <View style={styles.container}>
      {displayMembers.map((member, index) => (
        <View key={member.uid} style={[styles.avatarContainer, { width: size, height: size, marginLeft: index > 0 ? -size * 0.3 : 0, zIndex: displayMembers.length - index }]}>
          <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.bgTertiary, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: size * 0.4, fontWeight: '700', color: colors.textSecondary }}>{member.name.charAt(0)}</Text>
          </View>
        </View>
      ))}
      {hasMore && (
        <View style={[styles.moreContainer, { width: size, height: size, borderRadius: size / 2, marginLeft: -size * 0.3 }]}>
          <Text style={[styles.moreText, { fontSize: size * 0.35 }]}>+{members.length - maxDisplayCount}</Text>
        </View>
      )}
      {remainingCount > 0 && Array.from({ length: Math.min(remainingCount, 2) }).map((_, index) => (
        <View key={`empty-${index}`} style={[styles.emptySlot, { width: size, height: size, borderRadius: size / 2, marginLeft: -size * 0.3 }]}>
          <Text style={[styles.emptySlotText, { fontSize: size * 0.5 }]}>?</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { borderWidth: 2, borderColor: 'white', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  moreContainer: { backgroundColor: colors.primary, borderWidth: 2, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  moreText: { color: 'white', fontWeight: '700' },
  emptySlot: { backgroundColor: colors.bgTertiary, borderWidth: 2, borderColor: 'white', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  emptySlotText: { color: colors.textTertiary, fontWeight: '700' },
});