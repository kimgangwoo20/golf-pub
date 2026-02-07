import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { colors } from '@/styles/theme';

export const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const { profile, loading: profileLoading, loadProfile } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadProfile(user.uid);
    }
  }, [user?.uid, loadProfile]);

  const handleRefresh = useCallback(async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    await loadProfile(user.uid);
    setRefreshing(false);
  }, [user?.uid, loadProfile]);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('완료', '로그아웃 되었습니다.');
            } catch (error) {
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleEditAvatar = () => {
    Alert.alert('프로필 사진', '프로필 사진 변경은 프로필 수정에서 가능합니다.', [
      { text: '취소', style: 'cancel' },
      { text: '프로필 수정', onPress: () => navigation?.navigate('EditProfile') },
    ]);
  };

  const totalRounds = profile?.totalRounds || (profile?.stats?.gamesPlayed) || 0;
  const rating = profile?.rating || 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {(profile?.photoURL || user?.photoURL) ? (
              <Image source={{ uri: profile?.photoURL || user?.photoURL || '' }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditAvatar}>
            <Text>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profile?.displayName || user?.displayName || '사용자'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={styles.membershipBadge}>
          <Text style={styles.membershipText}>👑 프리미엄 회원</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{(profile?.pointBalance || (user as any)?.pointBalance || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>포인트</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalRounds}</Text>
          <Text style={styles.statLabel}>부킹 참가</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rating > 0 ? `${rating.toFixed(1)}★` : '-'}</Text>
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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#fff', marginBottom: 12 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { fontSize: 40 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },
  membershipBadge: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  membershipText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
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
