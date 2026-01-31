import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  friends: any[];
  onPress: () => void;
}

export const FriendSection: React.FC<Props> = ({ friends, onPress }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>친구 ({friends.length})</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.more}>전체보기 →</Text>
      </TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {friends.slice(0, 5).map((friend, idx) => (
        <View key={idx} style={styles.friendCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{friend.name?.[0] || '?'}</Text>
          </View>
          <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  more: { fontSize: 14, color: '#10b981' },
  friendCard: { alignItems: 'center', marginRight: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  avatarText: { fontSize: 24, color: '#0ea5e9' },
  friendName: { fontSize: 12, color: '#64748b', maxWidth: 60 },
});
