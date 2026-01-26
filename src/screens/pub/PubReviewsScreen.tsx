// PubReviewsScreen.tsx - 펍 리뷰 목록
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  content: string;
  images?: string[];
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    userName: '김골프',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    date: '2024-01-20',
    content: '라운딩 후 팀원들과 방문했어요. 분위기도 좋고 음식도 맛있었습니다!',
    images: ['https://i.pravatar.cc/200?img=50'],
  },
  {
    id: '2',
    userName: '이영희',
    userAvatar: 'https://i.pravatar.cc/150?img=25',
    rating: 4,
    date: '2024-01-18',
    content: '주차가 편리하고 직원분들이 친절합니다. 다음에도 올게요!',
  },
  {
    id: '3',
    userName: '박민수',
    userAvatar: 'https://i.pravatar.cc/150?img=33',
    rating: 5,
    date: '2024-01-15',
    content: '단체석이 넓어서 좋았어요. 골프 Pub 회원 할인도 받을 수 있어서 만족!',
  },
];

export const PubReviewsScreen: React.FC<{ route?: any; navigation?: any }> = ({ route, navigation }) => {
  const [reviews] = useState<Review[]>(MOCK_REVIEWS);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(item.rating)}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      {item.images && item.images.length > 0 && (
        <View style={styles.images}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </View>
      )}
    </View>
  );

  const averageRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <View style={styles.container}>
      {/* 평점 요약 */}
      <View style={styles.summary}>
        <Text style={styles.averageRating}>{averageRating}</Text>
        <Text style={styles.stars}>{renderStars(Math.round(Number(averageRating)))}</Text>
        <Text style={styles.reviewCount}>{reviews.length}개의 리뷰</Text>
      </View>

      {/* 리뷰 작성 버튼 */}
      <TouchableOpacity
        style={styles.writeButton}
        onPress={() => navigation?.navigate('WriteReview')}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  writeButton: {
    backgroundColor: '#007AFF',
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
});
