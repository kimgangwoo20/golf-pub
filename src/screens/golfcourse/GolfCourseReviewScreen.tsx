// GolfCourseReviewScreen.tsx - 골프장 리뷰 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GolfCourse, GolfCourseReview } from '../../types/golfcourse-types';
import { useAuthStore } from '../../store/useAuthStore';

const { width } = Dimensions.get('window');

// Mock 리뷰 데이터
const mockReviews: GolfCourseReview[] = [
  {
    id: 1,
    courseId: 1,
    author: {
      id: 2,
      name: '김철수',
      image: 'https://i.pravatar.cc/150?img=12',
      handicap: 18,
    },
    rating: 5,
    courseRating: 5,
    facilityRating: 4,
    serviceRating: 5,
    content: '코스 관리가 정말 잘 되어있어요. 페어웨이가 넓고 그린 컨디션이 최고입니다. 다시 오고 싶습니다!',
    images: ['https://picsum.photos/400/300?random=50', 'https://picsum.photos/400/300?random=51'],
    likes: 12,
    isLiked: false,
    createdAt: '2025.01.20',
  },
  {
    id: 2,
    courseId: 1,
    author: {
      id: 3,
      name: '이영희',
      image: 'https://i.pravatar.cc/150?img=45',
      handicap: 22,
    },
    rating: 4,
    courseRating: 4,
    facilityRating: 4,
    serviceRating: 4,
    content: '시설도 좋고 직원분들도 친절하세요. 그린피가 조금 비싸긴 하지만 전반적으로 만족합니다.',
    images: [],
    likes: 8,
    isLiked: true,
    createdAt: '2025.01.18',
  },
  {
    id: 3,
    courseId: 1,
    author: {
      id: 4,
      name: '박민수',
      image: 'https://i.pravatar.cc/150?img=33',
      handicap: 15,
    },
    rating: 3,
    courseRating: 3,
    facilityRating: 3,
    serviceRating: 4,
    content: '평범한 골프장이에요. 특별히 나쁜 건 없지만 그렇다고 엄청 좋지도 않아요.',
    images: ['https://picsum.photos/400/300?random=52'],
    likes: 3,
    isLiked: false,
    createdAt: '2025.01.15',
  },
];

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1';
type SortType = 'recent' | 'rating_high' | 'rating_low' | 'likes';

export const GolfCourseReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();

  // 현재 사용자 ID (로그인된 사용자)
  const currentUserId = user?.uid || '';

  // @ts-ignore
  const courseParam = route.params?.course as GolfCourse;
  // @ts-ignore
  const writeReviewParam = route.params?.writeReview as boolean;

  const [reviews, setReviews] = useState<GolfCourseReview[]>(mockReviews);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [showWriteModal, setShowWriteModal] = useState(writeReviewParam || false);

  // 리뷰 작성 상태
  const [rating, setRating] = useState(5);
  const [courseRating, setCourseRating] = useState(5);
  const [facilityRating, setFacilityRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  // 평점 분포 계산
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  const handleLike = (reviewId: number) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          isLiked: !review.isLiked,
          likes: review.isLiked ? review.likes - 1 : review.likes + 1,
        };
      }
      return review;
    }));
  };

  const handleFilter = (type: FilterType) => {
    setFilter(type);
    // 필터 로직은 렌더링에서 처리
  };

  const handleSort = (type: SortType) => {
    setSortBy(type);
    let sorted = [...reviews];

    switch (type) {
      case 'recent':
        // 최신순은 이미 정렬됨
        break;
      case 'rating_high':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'likes':
        sorted.sort((a, b) => b.likes - a.likes);
        break;
    }

    setReviews(sorted);
  };

  const handleWriteReview = () => {
    if (reviewText.trim().length === 0) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    const newReview: GolfCourseReview = {
      id: Date.now(),
      courseId: courseParam.id,
      author: {
        id: currentUserId,
        name: user?.displayName || '사용자',
        image: user?.photoURL || 'https://i.pravatar.cc/150?img=1',
        handicap: 18, // TODO: 사용자 프로필에서 핸디캡 가져오기
      },
      rating,
      courseRating,
      facilityRating,
      serviceRating,
      content: reviewText,
      images: reviewImages,
      likes: 0,
      isLiked: false,
      createdAt: '방금',
    };

    setReviews([newReview, ...reviews]);
    setShowWriteModal(false);
    setReviewText('');
    setReviewImages([]);
    setRating(5);
    setCourseRating(5);
    setFacilityRating(5);
    setServiceRating(5);

    Alert.alert('완료', '리뷰가 등록되었습니다.');
  };

  const handleAddImage = () => {
    Alert.alert('이미지 추가', '이미지 업로드 기능은 개발 예정입니다.', [
      {
        text: 'Mock 이미지 추가',
        onPress: () => {
          const newImage = `https://picsum.photos/400/300?random=${Date.now()}`;
          setReviewImages([...reviewImages, newImage]);
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const handleReviewMenu = (review: GolfCourseReview) => {
    const isMyReview = review.author.id === currentUserId;

    Alert.alert('리뷰', '', [
      ...(isMyReview
        ? [
            {
              text: '수정',
              onPress: () => Alert.alert('알림', '리뷰 수정 기능은 개발 예정입니다.'),
            },
            {
              text: '삭제',
              style: 'destructive',
              onPress: () => {
                setReviews(reviews.filter(r => r.id !== review.id));
                Alert.alert('완료', '리뷰가 삭제되었습니다.');
              },
            },
          ]
        : [
            {
              text: '신고',
              onPress: () => Alert.alert('알림', '신고 기능은 개발 예정입니다.'),
            },
          ]),
      { text: '취소', style: 'cancel' },
    ]);
  };

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리뷰 ({reviews.length})</Text>
          <TouchableOpacity onPress={() => setShowWriteModal(true)}>
            <Text style={styles.writeIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 평점 요약 */}
          <View style={styles.summarySection}>
            <View style={styles.averageRatingBox}>
              <Text style={styles.averageRatingNumber}>{averageRating}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Text key={star} style={styles.starIcon}>
                    {star <= parseFloat(averageRating) ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
              <Text style={styles.totalReviews}>{reviews.length}개의 리뷰</Text>
            </View>

            {/* 평점 분포 */}
            <View style={styles.distributionBox}>
              {[5, 4, 3, 2, 1].map(star => (
                <View key={star} style={styles.distributionRow}>
                  <Text style={styles.distributionStar}>{star}점</Text>
                  <View style={styles.distributionBar}>
                    <View
                      style={[
                        styles.distributionFill,
                        {
                          width: `${(ratingDistribution[star as keyof typeof ratingDistribution] / reviews.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.distributionCount}>
                    {ratingDistribution[star as keyof typeof ratingDistribution]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 필터 */}
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => handleFilter('all')}
              >
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                  전체
                </Text>
              </TouchableOpacity>
              {[5, 4, 3, 2, 1].map(star => (
                <TouchableOpacity
                  key={star}
                  style={[styles.filterButton, filter === star.toString() && styles.filterButtonActive]}
                  onPress={() => handleFilter(star.toString() as FilterType)}
                >
                  <Text style={[styles.filterText, filter === star.toString() && styles.filterTextActive]}>
                    {star}점
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 정렬 */}
          <View style={styles.sortSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortContent}>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
                onPress={() => handleSort('recent')}
              >
                <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>
                  최신순
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'rating_high' && styles.sortButtonActive]}
                onPress={() => handleSort('rating_high')}
              >
                <Text style={[styles.sortText, sortBy === 'rating_high' && styles.sortTextActive]}>
                  높은 평점
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'likes' && styles.sortButtonActive]}
                onPress={() => handleSort('likes')}
              >
                <Text style={[styles.sortText, sortBy === 'likes' && styles.sortTextActive]}>
                  인기순
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 리뷰 목록 */}
          <View style={styles.reviewsList}>
            {filteredReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.author.image }} style={styles.reviewAuthorImage} />
                  <View style={styles.reviewAuthorInfo}>
                    <View style={styles.reviewAuthorRow}>
                      <Text style={styles.reviewAuthorName}>{review.author.name}</Text>
                      <View style={styles.handicapBadge}>
                        <Text style={styles.handicapText}>⛳ {review.author.handicap}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{review.createdAt}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleReviewMenu(review)}>
                    <Text style={styles.menuIcon}>⋯</Text>
                  </TouchableOpacity>
                </View>

                {/* 평점 */}
                <View style={styles.ratingRow}>
                  <Text style={styles.mainRating}>⭐ {review.rating.toFixed(1)}</Text>
                  <View style={styles.detailRatings}>
                    <Text style={styles.detailRating}>코스 {review.courseRating}</Text>
                    <Text style={styles.detailRating}>시설 {review.facilityRating}</Text>
                    <Text style={styles.detailRating}>서비스 {review.serviceRating}</Text>
                  </View>
                </View>

                {/* 내용 */}
                <Text style={styles.reviewContent}>{review.content}</Text>

                {/* 이미지 */}
                {review.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
                    {review.images.map((image, index) => (
                      <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
                    ))}
                  </ScrollView>
                )}

                {/* 액션 */}
                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => handleLike(review.id)}
                  >
                    <Text style={styles.likeIcon}>{review.isLiked ? '❤️' : '🤍'}</Text>
                    <Text style={styles.likeText}>{review.likes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 리뷰 작성 모달 */}
        <Modal visible={showWriteModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
            <View style={styles.modalContainer}>
              {/* 모달 헤더 */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowWriteModal(false)}>
                  <Text style={styles.modalCloseText}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>리뷰 작성</Text>
                <TouchableOpacity onPress={handleWriteReview}>
                  <Text style={styles.modalSubmitText}>완료</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {/* 전체 평점 */}
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingSectionTitle}>전체 평점</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Text style={styles.ratingStarIcon}>
                          {star <= rating ? '⭐' : '☆'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 세부 평점 */}
                <View style={styles.detailRatingSection}>
                  <View style={styles.detailRatingRow}>
                    <Text style={styles.detailRatingLabel}>코스</Text>
                    <View style={styles.detailRatingStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setCourseRating(star)}>
                          <Text style={styles.detailRatingStarIcon}>
                            {star <= courseRating ? '⭐' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.detailRatingRow}>
                    <Text style={styles.detailRatingLabel}>시설</Text>
                    <View style={styles.detailRatingStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setFacilityRating(star)}>
                          <Text style={styles.detailRatingStarIcon}>
                            {star <= facilityRating ? '⭐' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.detailRatingRow}>
                    <Text style={styles.detailRatingLabel}>서비스</Text>
                    <View style={styles.detailRatingStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setServiceRating(star)}>
                          <Text style={styles.detailRatingStarIcon}>
                            {star <= serviceRating ? '⭐' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* 리뷰 내용 */}
                <View style={styles.textSection}>
                  <Text style={styles.textSectionTitle}>리뷰 내용</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="골프장에 대한 솔직한 리뷰를 작성해주세요."
                    placeholderTextColor="#999"
                    multiline
                    value={reviewText}
                    onChangeText={setReviewText}
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{reviewText.length} / 500</Text>
                </View>

                {/* 이미지 추가 */}
                <View style={styles.imageSection}>
                  <Text style={styles.imageSectionTitle}>사진 ({reviewImages.length}/5)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {reviewImages.map((image, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri: image }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                        >
                          <Text style={styles.removeImageText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {reviewImages.length < 5 && (
                      <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                        <Text style={styles.addImageIcon}>📷</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
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
  writeIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  averageRatingBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  averageRatingNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  distributionBox: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionStar: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 30,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#FFC107',
  },
  distributionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 30,
    textAlign: 'right',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#2E7D32',
  },
  sortSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    marginBottom: 8,
  },
  sortContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  sortTextActive: {
    color: '#2E7D32',
  },
  reviewsList: {
    padding: 12,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAuthorImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  handicapBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  handicapText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  reviewDate: {
    fontSize: 13,
    color: '#999',
  },
  menuIcon: {
    fontSize: 24,
    color: '#999',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mainRating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detailRatings: {
    flexDirection: 'row',
    gap: 8,
  },
  detailRating: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewContent: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewImages: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    marginRight: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIcon: {
    fontSize: 18,
  },
  likeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  modalScrollView: {
    flex: 1,
  },
  ratingSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
    alignItems: 'center',
  },
  ratingSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingStarIcon: {
    fontSize: 40,
  },
  detailRatingSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
    gap: 16,
  },
  detailRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailRatingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  detailRatingStars: {
    flexDirection: 'row',
    gap: 6,
  },
  detailRatingStarIcon: {
    fontSize: 24,
  },
  textSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  textSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  charCount: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  imageSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  addImageIcon: {
    fontSize: 32,
  },
});