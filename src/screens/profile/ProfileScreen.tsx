import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

export const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const user = {
    name: '홍길동',
    email: 'hong@golf.com',
    membership: 'PREMIUM',
    points: 15000,
    level: '골린이',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Text>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.membershipBadge}>
          <Text style={styles.membershipText}>👑 프리미엄 회원</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.points.toLocaleString()}</Text>
          <Text style={styles.statLabel}>포인트</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>부킹 참가</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>4.8★</Text>
          <Text style={styles.statLabel}>평점</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation?.navigate('EditProfile')}>
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={styles.menuText}>프로필 수정</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation?.navigate('MyBookings')}>
          <Text style={styles.menuIcon}>⛳</Text>
          <Text style={styles.menuText}>내 부킹 목록</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation?.navigate('MembershipManage')}>
          <Text style={styles.menuIcon}>👑</Text>
          <Text style={styles.menuText}>멤버십 관리</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation?.navigate('Settings')}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>설정</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#fff', marginBottom: 12 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 40 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007AFF', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },
  membershipBadge: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  membershipText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666' },
  divider: { width: 1, backgroundColor: '#e0e0e0' },
  menuContainer: { backgroundColor: '#fff', marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { fontSize: 24, marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, color: '#1a1a1a' },
  menuArrow: { fontSize: 24, color: '#ccc' },
  logoutButton: { backgroundColor: '#fff', padding: 20, alignItems: 'center', marginBottom: 40 },
  logoutText: { fontSize: 16, color: '#FF3B30', fontWeight: '600' },
});
