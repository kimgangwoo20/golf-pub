// MyReviewsScreen.tsx - 내 후기 화면

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Mock 후기 데이터
const mockReviews = [
  {
    id: 1,
    bookingId: 1,
    bookingTitle: '주말 라운딩 같이 치실 분!',
    golfCourse: '세라지오CC',
    rating: 5,
    comment: '호스트님도 친절하시고 골프장도 좋았어요! 다음에 또 함께 치고 싶습니다.',
    date: '2025.01.20',
    images: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400'],
  },
  {
    id: 2,
    bookingId: 2,
    bookingTitle: '평일 오후 라운딩',
    golfCourse: '남서울CC',
    rating: 4,
    comment: '날씨도 좋고 라운딩 즐겁게 했습니다. 추천합니다!',
    date: '2025.01.15',
    images: [],
  },
  {
    id: 3,
    bookingId: 3,
    bookingTitle: '초보 환영 라운딩',
    golfCourse: '대관령CC',
    rating: 5,
    comment: '초보자인데 다들 잘 가르쳐주셔서 재밌게 배웠어요. 감사합니다!',
    date: '2025.01.10',
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400'],
  },
];

export const MyReviewsScreen: React.FC = () => {
  const navigation = useNavigation();

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 후기</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 후기 통계 */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockReviews.length}</Text>
              <Text style={styles.statLabel}>작성한 후기</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>평균 평점</Text>
            </View>
          </View>

          {/* 후기 목록 */}
          <View style={styles.reviewList}>
            {mockReviews.map((review, index) => (
              <View key={review.id}>
                <View style={styles.reviewCard}>
                  {/* 모임 정보 */}
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewHeaderLeft}>
                      <Text style={styles.bookingTitle}>{review.bookingTitle}</Text>
                      <Text style={styles.golfCourse}>⛳ {review.golfCourse}</Text>
                    </View>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>

                  {/* 평점 */}
                  <Text style={styles.stars}>{renderStars(review.rating)}</Text>

                  {/* 후기 내용 */}
                  <Text style={styles.comment}>{review.comment}</Text>

                  {/* 이미지 */}
                  {review.images.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.imageScroll}
                    >
                      {review.images.map((img, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: img }}
                          style={styles.reviewImage}
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
                {index < mockReviews.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  reviewList: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewCard: {
    padding: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  golfCourse: {
    fontSize: 13,
    color: '#666',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  stars: {
    fontSize: 16,
    marginBottom: 12,
  },
  comment: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1A1A1A',
  },
  imageScroll: {
    marginTop: 12,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#E5E5E5',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});