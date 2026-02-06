import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  onPress: () => void;
}

export const MembershipBanner: React.FC<Props> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={['#10b981', '#6366f1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <Text style={styles.title}>💎 프리미엄 멤버십</Text>
      <Text style={styles.subtitle}>무제한 매칭 + 특별 혜택</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  banner: { marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#e9d5ff' },
});
