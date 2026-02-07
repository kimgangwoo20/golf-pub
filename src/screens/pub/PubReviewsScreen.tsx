// PubReviewsScreen.tsx - 펍 리뷰 목록 (Firestore 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { pubAPI, PubReview } from '@/services/api/pubAPI';

export const PubReviewsScreen: React.FC = () => {
  const route = useRoute<any>();
  const pubId = route.params?.pubId as string;

  const [reviews, setReviews] = useState<PubReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!pubId) return;
    try {
      setLoading(true);
      const result = await pubAPI.getPubReviews(pubId);
      setReviews(result);
    } catch (error) {
      console.error('펍 리뷰 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [pubId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleRefresh = useCallback(async () => {
    if (!pubId) return;
    setRefreshing(true);
    try {
      const result = await pubAPI.getPubReviews(pubId);
      setReviews(result);
    } catch (error) {
      console.error('펍 리뷰 새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, [pubId]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR');
  };

  const renderReview = ({ item }: { item: PubReview }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: item.userImage || 'https://i.pravatar.cc/150' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(item.rating)}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.content}>{item.comment}</Text>
      {item.images && item.images.length > 0 && (
        <View style={styles.images}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </View>
      )}
    </View>
  );

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>리뷰를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 평점 요약 */}
      <View style={styles.summary}>
        <Text style={styles.averageRating}>{averageRating}</Text>
        <Text style={styles.stars}>{renderStars(Math.round(Number(averageRating)))}</Text>
        <Text style={styles.reviewCountText}>{reviews.length}개의 리뷰</Text>
      </View>

      {/* 리뷰 작성 버튼 */}
      <TouchableOpacity
        style={styles.writeButton}
        onPress={() => Alert.alert('리뷰 작성', '리뷰 작성 기능은 준비 중입니다.')}
      >
        <Text style={styles.writeButtonText}>✍️ 리뷰 작성하기</Text>
      </TouchableOpacity>

      {/* 리뷰 목록 */}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stars: {
    fontSize: 20,
    marginBottom: 8,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#666',
  },
  writeButton: {
    backgroundColor: '#10b981',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  images: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
