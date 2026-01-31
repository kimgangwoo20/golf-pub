import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onMenuPress: (menu: string) => void;
}

const MENUS = [
  { id: 'points', icon: '💰', label: '포인트' },
  { id: 'coupons', icon: '🎫', label: '쿠폰' },
  { id: 'my-reviews', icon: '⭐', label: '내 리뷰' },
  { id: 'my-posts', icon: '📝', label: '내 게시글' },
  { id: 'joined-meetups', icon: '⛳', label: '참가 모임' },
  { id: 'hosted-meetups', icon: '👨‍💼', label: '주최 모임' },
  { id: 'notifications', icon: '🔔', label: '알림 설정' },
  { id: 'settings', icon: '⚙️', label: '설정' },
];

export const MenuGrid: React.FC<Props> = ({ onMenuPress }) => (
  <View style={styles.container}>
    <View style={styles.grid}>
      {MENUS.map(menu => (
        <TouchableOpacity 
          key={menu.id} 
          style={styles.menuItem}
          onPress={() => onMenuPress(menu.id)}
        >
          <Text style={styles.icon}>{menu.icon}</Text>
          <Text style={styles.label}>{menu.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  menuItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  icon: { fontSize: 32, marginBottom: 6 },
  label: { fontSize: 12, color: '#64748b', textAlign: 'center' },
});
