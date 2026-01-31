import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  stats: { avgRating: number; totalReviews: number };
}

export const ReviewStats: React.FC<Props> = ({ stats }) => (
  <View style={styles.container}>
    <Text style={styles.rating}>{stats.avgRating.toFixed(1)}</Text>
    <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
    <Text style={styles.count}>{stats.totalReviews}개의 리뷰</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', alignItems: 'center', marginBottom: 8 },
  rating: { fontSize: 48, fontWeight: 'bold', color: '#10b981' },
  stars: { fontSize: 24, marginVertical: 8 },
  count: { fontSize: 14, color: '#64748b' },
});
