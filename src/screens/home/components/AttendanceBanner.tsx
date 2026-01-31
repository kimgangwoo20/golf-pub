import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  checked: boolean;
  onCheck: () => void;
}

export const AttendanceBanner: React.FC<Props> = ({ checked, onCheck }) => (
  <View style={[styles.banner, checked && styles.bannerChecked]}>
    <View>
      <Text style={styles.title}>
        {checked ? '✅ 출석 완료!' : '📅 오늘의 출석체크'}
      </Text>
      <Text style={styles.subtitle}>
        {checked ? '100P 적립 완료' : '출석하고 100P 받기'}
      </Text>
    </View>
    {!checked && (
      <TouchableOpacity style={styles.button} onPress={onCheck}>
        <Text style={styles.buttonText}>출석</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  banner: { marginHorizontal: 16, marginBottom: 16, padding: 16, backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderColor: '#10b981' },
  bannerChecked: { borderColor: '#cbd5e1', opacity: 0.7 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b' },
  button: { backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
