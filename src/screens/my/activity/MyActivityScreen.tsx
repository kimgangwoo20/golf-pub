// MyActivityScreen.tsx - 내 활동 통합 화면

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight } from '@/styles/theme';

const ACTIVITY_MENUS = [
  {
    id: 'joined-meetups',
    icon: '⛳',
    label: '참가한 모임',
    screen: 'JoinedMeetups',
    desc: '내가 참가한 골프 모임',
  },
  {
    id: 'hosted-meetups',
    icon: '👨‍💼',
    label: '주최한 모임',
    screen: 'HostedMeetups',
    desc: '내가 만든 골프 모임',
  },
  { id: 'my-posts', icon: '📝', label: '내 게시글', screen: 'MyPosts', desc: '내가 작성한 모집글' },
  { id: 'my-reviews', icon: '⭐', label: '내 후기', screen: 'MyReviews', desc: '내가 남긴 리뷰' },
];

export const MyActivityScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 활동</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 메뉴 리스트 */}
        <View style={styles.menuList}>
          {ACTIVITY_MENUS.map((menu) => (
            <TouchableOpacity
              key={menu.id}
              style={styles.menuCard}
              onPress={() => navigation.navigate(menu.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{menu.icon}</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{menu.label}</Text>
                <Text style={styles.menuDesc}>{menu.desc}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  menuList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    padding: spacing.xl,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  menuDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
});
