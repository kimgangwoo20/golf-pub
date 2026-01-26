// GolfCourseSearchScreen.tsx - 골프장 검색 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GolfCourse, SortType, FACILITIES } from '../../types/golfcourse-types';

const { width } = Dimensions.get('window');

// Mock 골프장 데이터 (10개)
const mockCourses: GolfCourse[] = [
  {
    id: 1,
    name: '남서울CC',
    address: '서울 강남구 일원동 123',
    phone: '02-1234-5678',
    website: 'https://namseoulgolf.com',
    location: { latitude: 37.4897, longitude: 127.0814 },
    distance: 5.2,
    images: ['https://picsum.photos/800/600?random=30'],
    rating: 4.5,
    reviewCount: 234,
    facilities: [FACILITIES[0], FACILITIES[2], FACILITIES[1]],
    holes: 18,
    greenFee: { weekday: 120000, weekend: 180000 },
    operatingHours: '06:00 - 18:00',
    description: '도심 속 명문 골프장',
    isFavorite: false,
  },
  {
    id: 2,
    name: '레이크우드CC',
    address: '경기 성남시 분당구 판교동 456',
    phone: '031-2345-6789',
    location: { latitude: 37.3943, longitude: 127.1110 },
    distance: 8.7,
    images: ['https://picsum.photos/800/600?random=31'],
    rating: 4.8,
    reviewCount: 456,
    facilities: [FACILITIES[0], FACILITIES[1], FACILITIES[2], FACILITIES[3], FACILITIES[4]],
    holes: 27,
    greenFee: { weekday: 150000, weekend: 220000 },
    operatingHours: '05:30 - 19:00',
    description: '자연과 함께하는 프리미엄 골프장',
    isFavorite: true,
  },
  {
    id: 3,
    name: '안양CC',
    address: '경기 안양시 만안구 석수동 789',
    phone: '031-3456-7890',
    location: { latitude: 37.3867, longitude: 126.9516 },
    distance: 12.3,
    images: ['https://picsum.photos/800/600?random=32'],
    rating: 4.2,
    reviewCount: 178,
    facilities: [FACILITIES[0], FACILITIES[2], FACILITIES[4]],
    holes: 18,
    greenFee: { weekday: 100000, weekend: 150000 },
    operatingHours: '06:00 - 18:00',
    description: '합리적인 가격의 퍼블릭 골프장',
    isFavorite: false,
  },
  {
    id: 4,
    name: '용인CC',
    address: '경기 용인시 처인구 포곡읍 111',
    phone: '031-4567-8901',
    location: { latitude: 37.2636, longitude: 127.1839 },
    distance: 18.5,
    images: ['https://picsum.photos/800/600?random=33'],
    rating: 4.6,
    reviewCount: 312,
    facilities: [FACILITIES[0], FACILITIES[1], FACILITIES[4], FACILITIES[5]],
    holes: 18,
    greenFee: { weekday: 130000, weekend: 190000 },
    operatingHours: '05:30 - 18:30',
    description: '넓은 페어웨이가 특징',
    isFavorite: false,
  },
  {
    id: 5,
    name: '천안CC',
    address: '충남 천안시 동남구 목천읍 222',
    phone: '041-5678-9012',
    location: { latitude: 36.8151, longitude: 127.1140 },
    distance: 85.3,
    images: ['https://picsum.photos/800/600?random=34'],
    rating: 4.3,
    reviewCount: 145,
    facilities: [FACILITIES[0], FACILITIES[2], FACILITIES[6]],
    holes: 18,
    greenFee: { weekday: 90000, weekend: 130000 },
    operatingHours: '06:00 - 18:00',
    description: '조용하고 여유로운 분위기',
    isFavorite: false,
  },
];

export const GolfCourseSearchScreen: React.FC = () => {
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [displayedCourses, setDisplayedCourses] = useState<GolfCourse[]>(mockCourses);
  const [sortBy, setSortBy] = useState<SortType>('distance');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('새로고침 완료', '최신 골프장 정보를 불러왔습니다.');
    }, 1000);
  };

  const applyFiltersAndSort = (search: string, facilities: string[], sort: SortType) => {
    let filtered = [...mockCourses];

    // 검색어 필터
    if (search.trim().length > 0) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 시설 필터
    if (facilities.length > 0) {
      filtered = filtered.filter(course =>
        facilities.every(facilityId =>
          course.facilities.some(f => f.id === facilityId)
        )
      );
    }

    // 정렬
    switch (sort) {
      case 'distance':
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.greenFee.weekday - b.greenFee.weekday);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.greenFee.weekday - a.greenFee.weekday);
        break;
    }

    setDisplayedCourses(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    applyFiltersAndSort(text, selectedFacilities, sortBy);
  };

  const handleClearSearch = () => {
    setSearchText('');
    applyFiltersAndSort('', selectedFacilities, sortBy);
  };

  const handleSort = (type: SortType) => {
    setSortBy(type);
    applyFiltersAndSort(searchText, selectedFacilities, type);
  };

  const handleToggleFacility = (facilityId: string) => {
    let newFacilities: string[];
    if (selectedFacilities.includes(facilityId)) {
      newFacilities = selectedFacilities.filter(id => id !== facilityId);
    } else {
      newFacilities = [...selectedFacilities, facilityId];
    }
    setSelectedFacilities(newFacilities);
    applyFiltersAndSort(searchText, newFacilities, sortBy);
  };

  const handleToggleFavorite = (courseId: number) => {
    // mockCourses 업데이트
    const courseIndex = mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      mockCourses[courseIndex].isFavorite = !mockCourses[courseIndex].isFavorite;
    }

    // 표시된 목록 업데이트
    setDisplayedCourses(displayedCourses.map(course => {
      if (course.id === courseId) {
        return { ...course, isFavorite: !course.isFavorite };
      }
      return course;
    }));
  };

  const handleCoursePress = (course: GolfCourse) => {
    navigation.navigate('GolfCourseDetail' as never, { course } as never);
  };

  const handleMapView = () => {
    Alert.alert(
      '지도 보기',
      '지도 기능은 카카오맵/네이버맵 SDK 연동 후 사용 가능합니다.\n\n예정 기능:\n• 현재 위치 표시\n• 골프장 마커\n• 클러스터링\n• 거리 계산'
    );
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedFacilities([]);
    setSortBy('distance');
    setDisplayedCourses(mockCourses);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>골프장 찾기</Text>
          <TouchableOpacity onPress={handleMapView}>
            <Text style={styles.mapIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>

        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="골프장 이름, 지역 검색"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 정렬 버튼 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortSection}
          contentContainerStyle={styles.sortContent}
        >
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
            onPress={() => handleSort('distance')}
          >
            <Text style={[styles.sortText, sortBy === 'distance' && styles.sortTextActive]}>
              📍 거리순
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
            onPress={() => handleSort('rating')}
          >
            <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>
              ⭐ 평점순
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price_low' && styles.sortButtonActive]}
            onPress={() => handleSort('price_low')}
          >
            <Text style={[styles.sortText, sortBy === 'price_low' && styles.sortTextActive]}>
              💰 낮은 가격
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price_high' && styles.sortButtonActive]}
            onPress={() => handleSort('price_high')}
          >
            <Text style={[styles.sortText, sortBy === 'price_high' && styles.sortTextActive]}>
              💎 높은 가격
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 시설 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.facilitySection}
          contentContainerStyle={styles.facilityContent}
        >
          {FACILITIES.map(facility => (
            <TouchableOpacity
              key={facility.id}
              style={[
                styles.facilityChip,
                selectedFacilities.includes(facility.id) && styles.facilityChipActive,
              ]}
              onPress={() => handleToggleFacility(facility.id)}
            >
              <Text style={styles.facilityChipIcon}>{facility.icon}</Text>
              <Text
                style={[
                  styles.facilityChipText,
                  selectedFacilities.includes(facility.id) && styles.facilityChipTextActive,
                ]}
              >
                {facility.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 결과 개수 */}
        <View style={styles.resultCountContainer}>
          <Text style={styles.resultCountText}>
            총 {displayedCourses.length}개의 골프장
          </Text>
        </View>

        {/* 골프장 목록 */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.coursesList}>
            {displayedCourses.length > 0 ? (
              displayedCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => handleCoursePress(course)}
                >
                  {/* 이미지 */}
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: course.images[0] }} style={styles.courseImage} />
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(course.id);
                      }}
                    >
                      <Text style={styles.favoriteIcon}>
                        {course.isFavorite ? '❤️' : '🤍'}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceBadgeText}>{course.distance}km</Text>
                    </View>
                  </View>

                  {/* 정보 */}
                  <View style={styles.courseInfo}>
                    <View style={styles.courseHeader}>
                      <Text style={styles.courseName} numberOfLines={1}>
                        {course.name}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingIcon}>⭐</Text>
                        <Text style={styles.ratingText}>{course.rating.toFixed(1)}</Text>
                        <Text style={styles.reviewCount}>({course.reviewCount})</Text>
                      </View>
                    </View>

                    <Text style={styles.courseAddress} numberOfLines={1}>
                      {course.address}
                    </Text>

                    <View style={styles.courseDetails}>
                      <Text style={styles.detailText}>⛳ {course.holes}홀</Text>
                      <Text style={styles.detailDot}>•</Text>
                      <Text style={styles.detailText}>
                        💰 {(course.greenFee.weekday / 10000).toFixed(0)}만원~
                      </Text>
                      <Text style={styles.detailDot}>•</Text>
                      <Text style={styles.detailText}>{course.operatingHours}</Text>
                    </View>

                    {/* 시설 */}
                    {course.facilities.length > 0 && (
                      <View style={styles.facilitiesRow}>
                        {course.facilities.slice(0, 4).map((facility, index) => (
                          <View key={index} style={styles.facilityBadge}>
                            <Text style={styles.facilityBadgeText}>
                              {facility.icon} {facility.name}
                            </Text>
                          </View>
                        ))}
                        {course.facilities.length > 4 && (
                          <View style={styles.facilityBadge}>
                            <Text style={styles.facilityBadgeText}>
                              +{course.facilities.length - 4}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
                <Text style={styles.emptyDescription}>
                  다른 검색어나 필터를 시도해보세요
                </Text>
                <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
                  <Text style={styles.resetButtonText}>필터 초기화</Text>
                </TouchableOpacity>
              </View>
            )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  mapIcon: {
    fontSize: 26,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  clearIcon: {
    fontSize: 18,
    color: '#999',
    paddingHorizontal: 4,
  },
  sortSection: {
    backgroundColor: '#fff',
    maxHeight: 44,
  },
  sortContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    marginRight: 6,
    height: 28,
  },
  sortButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sortTextActive: {
    color: '#2E7D32',
  },
  facilitySection: {
    backgroundColor: '#fff',
    maxHeight: 44,
  },
  facilityContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 28,
  },
  facilityChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  facilityChipIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  facilityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  facilityChipTextActive: {
    color: '#2E7D32',
  },
  resultCountContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  resultCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  coursesList: {
    padding: 8,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E5E5',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  courseInfo: {
    padding: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  courseAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  courseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  detailDot: {
    fontSize: 12,
    color: '#E5E5E5',
    marginHorizontal: 6,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facilityBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  facilityBadgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 40,
    marginHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  bottomSpacing: {
    height: 80,
  },
});