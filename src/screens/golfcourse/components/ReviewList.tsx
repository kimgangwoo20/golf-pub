import React from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

interface Props {
  reviews: Review[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
}

export const ReviewList: React.FC<Props> = ({
  reviews,
  loading,
  refreshing,
  onRefresh,
  onLoadMore,
}) => (
  <FlatList
    data={reviews}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.reviewCard}>
        <View style={styles.header}>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    )}
    refreshing={refreshing}
    onRefresh={onRefresh}
    onEndReached={onLoadMore}
    onEndReachedThreshold={0.5}
    ListEmptyComponent={
      loading ? (
        <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
        </View>
      )
    }
  />
);

const styles = StyleSheet.create({
  reviewCard: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  author: { fontSize: 16, fontWeight: '600' },
  rating: { fontSize: 14, color: '#f59e0b' },
  content: { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 8 },
  date: { fontSize: 12, color: '#94a3b8' },
  loader: { marginTop: 50 },
  empty: { padding: 50, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#94a3b8' },
});
