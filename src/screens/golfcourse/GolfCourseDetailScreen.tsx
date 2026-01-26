// GolfCourseDetailScreen.tsx - 골프장 상세 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GolfCourse } from '../../types/golfcourse-types';

const { width } = Dimensions.get('window');

// Mock 리뷰 데이터
const mockReviews = [
  {
    id: 1,
    author: { name: '김철수', image: 'https://i.pravatar.cc/150?img=12' },
    rating: 5,
    content: '코스 관리가 정말 잘 되어있어요. 다시 오고 싶습니다!',
    createdAt: '2025.01.20',
  },
  {
    id: 2,
    author: { name: '이영희', image: 'https://i.pravatar.cc/150?img=45' },
    rating: 4,
    content: '시설도 좋고 직원분들도 친절하세요. 그린피가 조금 비싸긴 하지만 만족합니다.',
    createdAt: '2025.01.18',
  },
];

export const GolfCourseDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // @ts-ignore
  const courseParam = route.params?.course as GolfCourse;

  const [course, setCourse] = useState<GolfCourse>(courseParam);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleToggleFavorite = () => {
    setCourse({ ...course, isFavorite: !course.isFavorite });
  };

  const handleCall = () => {
    Alert.alert(
      '전화 걸기',
      `${course.name}으로 전화를 걸까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전화',
          onPress: () => Linking.openURL(`tel:${course.phone}`),
        },
      ]
    );
  };

  const handleWebsite = () => {
    if (course.website) {
      Linking.openURL(course.website);
    } else {
      Alert.alert('알림', '홈페이지 정보가 없습니다.');
    }
  };

  const handleNavigation = () => {
    Alert.alert(
      '길찾기',
      '어떤 앱으로 길찾기를 하시겠습니까?',
      [
        {
          text: '카카오내비',
          onPress: () => Alert.alert('알림', '카카오내비 연동은 개발 예정입니다.'),
        },
        {
          text: '네이버지도',
          onPress: () => Alert.alert('알림', '네이버지도 연동은 개발 예정입니다.'),
        },
        {
          text: '구글맵',
          onPress: () => Alert.alert('알림', '구글맵 연동은 개발 예정입니다.'),
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const handleBooking = () => {
    navigation.navigate('Bookings' as never, {
      screen: 'CreateBooking',
      params: {
        courseId: course.id,
        courseName: course.name,
      },
    } as never);
  };

  const handleViewAllReviews = () => {
    navigation.navigate('GolfCourseReview' as never, { course } as never);
  };

  const handleWriteReview = () => {
    navigation.navigate('GolfCourseReview' as never, { course, writeReview: true } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>골프장 정보</Text>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Text style={styles.favoriteIcon}>{course.isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 이미지 갤러리 */}
          <View style={styles.imageSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {course.images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.courseImage} />
              ))}
            </ScrollView>
            <View style={styles.imageIndicator}>
              <Text style={styles.imageIndexText}>
                {currentImageIndex + 1} / {course.images.length}
              </Text>
            </View>
          </View>

          {/* 기본 정보 */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={styles.courseName}>{course.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>{course.rating.toFixed(1)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addressRow} onPress={handleNavigation}>
              <Text style={styles.addressIcon}>📍</Text>
              <Text style={styles.addressText}>{course.address}</Text>
              <Text style={styles.distanceText}>{course.distance}km</Text>
            </TouchableOpacity>

            {/* 빠른 액션 */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Text style={styles.actionIcon}>📞</Text>
                <Text style={styles.actionText}>전화</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleNavigation}>
                <Text style={styles.actionIcon}>🧭</Text>
                <Text style={styles.actionText}>길찾기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
                <Text style={styles.actionIcon}>🌐</Text>
                <Text style={styles.actionText}>홈페이지</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 요금 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>그린피</Text>
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>주중 (평일)</Text>
                <Text style={styles.priceValue}>
                  {course.greenFee.weekday.toLocaleString()}원
                </Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>주말 (토·일·공휴일)</Text>
                <Text style={styles.priceValue}>
                  {course.greenFee.weekend.toLocaleString()}원
                </Text>
              </View>
            </View>
            <Text style={styles.priceNote}>
              * 그린피는 1인 기준이며, 카트비/캐디피는 별도입니다
            </Text>
          </View>

          {/* 코스 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>코스 정보</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>홀 수</Text>
                <Text style={styles.infoValue}>{course.holes}홀</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>운영 시간</Text>
                <Text style={styles.infoValue}>{course.operatingHours}</Text>
              </View>
            </View>
          </View>

          {/* 시설 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시설</Text>
            <View style={styles.facilitiesGrid}>
              {course.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityItem}>
                  <Text style={styles.facilityItemIcon}>{facility.icon}</Text>
                  <Text style={styles.facilityItemText}>{facility.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 날씨 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘의 날씨</Text>
            <View style={styles.weatherCard}>
              <View style={styles.weatherMain}>
                <Text style={styles.weatherTemp}>18°C</Text>
                <Text style={styles.weatherCondition}>☀️ 맑음</Text>
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetail}>
                  <Text style={styles.weatherDetailLabel}>풍속</Text>
                  <Text style={styles.weatherDetailValue}>3.5m/s</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Text style={styles.weatherDetailLabel}>습도</Text>
                  <Text style={styles.weatherDetailValue}>45%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Text style={styles.weatherDetailLabel}>체감온도</Text>
                  <Text style={styles.weatherDetailValue}>16°C</Text>
                </View>
              </View>
            </View>
            <Text style={styles.weatherNote}>
              * Open-Meteo API 연동 예정 (실시간 날씨)
            </Text>
          </View>

          {/* 소개 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소개</Text>
            <Text style={styles.descriptionText}>{course.description}</Text>
          </View>

          {/* 리뷰 미리보기 */}
          <View style={styles.section}>
            <View style={styles.reviewHeaderRow}>
              <Text style={styles.sectionTitle}>리뷰 ({course.reviewCount})</Text>
              <TouchableOpacity onPress={handleViewAllReviews}>
                <Text style={styles.viewAllText}>전체보기 ›</Text>
              </TouchableOpacity>
            </View>

            {mockReviews.slice(0, 2).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.author.image }} style={styles.reviewAuthorImage} />
                  <View style={styles.reviewAuthorInfo}>
                    <Text style={styles.reviewAuthorName}>{review.author.name}</Text>
                    <View style={styles.reviewRating}>
                      <Text style={styles.reviewRatingText}>⭐ {review.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewDate}> • {review.createdAt}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewContent} numberOfLines={2}>
                  {review.content}
                </Text>
              </View>
            ))}

            <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
              <Text style={styles.writeReviewText}>✏️ 리뷰 작성하기</Text>
            </TouchableOpacity>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 예약하기 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.bookingButton} onPress={handleBooking}>
            <Text style={styles.bookingButtonText}>예약하기</Text>
          </TouchableOpacity>
        </View>
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
  favoriteIcon: {
    fontSize: 26,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    marginBottom: 8,
  },
  courseImage: {
    width: width,
    height: width * 0.6,
    backgroundColor: '#E5E5E5',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  priceContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  priceNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  facilityItemIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  facilityItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  weatherCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  weatherMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2E7D32',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherDetail: {
    alignItems: 'center',
  },
  weatherDetailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  weatherNote: {
    fontSize: 12,
    color: '#999',
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 13,
    color: '#666',
  },
  reviewDate: {
    fontSize: 13,
    color: '#999',
  },
  reviewContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  writeReviewButton: {
    marginTop: 16,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  writeReviewText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  bookingButton: {
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});