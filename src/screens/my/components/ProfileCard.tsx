import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  user: any;
  onEdit: () => void;
}

export const ProfileCard: React.FC<Props> = ({ user, onEdit }) => (
  <View style={styles.container}>
    <Image
      source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
      style={styles.avatar}
      onError={() => {}}
    />
    <Text style={styles.name}>{user?.name || '사용자'}</Text>
    <Text style={styles.level}>Level {user?.level || 1}</Text>
    <TouchableOpacity style={styles.editButton} onPress={onEdit}>
      <Text style={styles.editText}>프로필 수정</Text>
    </TouchableOpacity>
    <View style={styles.statsRow}>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{user?.points || 0}</Text>
        <Text style={styles.statLabel}>포인트</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{user?.friendCount || 0}</Text>
        <Text style={styles.statLabel}>친구</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{user?.bookingCount || 0}</Text>
        <Text style={styles.statLabel}>모임</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 20, alignItems: 'center', marginBottom: 8 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  level: { fontSize: 14, color: '#10b981', marginBottom: 12 },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  editText: { fontSize: 14, color: '#64748b' },
  statsRow: { flexDirection: 'row', marginTop: 20, gap: 40 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
});
