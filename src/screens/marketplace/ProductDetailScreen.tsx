// ProductDetailScreen.tsx - 상품 상세 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CONDITION_LABELS, STATUS_LABELS } from '../../types/marketplace-types';

const { width } = Dimensions.get('window');

// Mock 상품 상세 데이터
const mockProduct = {
  id: 1,
  title: '타이틀리스트 TS3 드라이버',
  description: `거의 안 쓴 드라이버입니다. 상태 아주 좋아요!

구입한 지 6개월 정도 됐고, 실제로 필드에서는 5번 정도만 사용했습니다.
흠집 하나 없고 새 제품 같아요.

- 로프트: 9.5도
- 샤프트: Diamana DF 60 S
- 정품 헤드커버 포함

직거래 환영하며, 택배도 가능합니다.
궁금한 점 있으시면 채팅 주세요!`,
  price: 350000,
  category: 'driver',
  condition: 'like-new',
  status: 'available',
  images: [
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
    'https://images.unsplash.com/photo-1592919505780-303950717480?w=800',
  ],
  location: '서울 강남구',
  sellerName: '김골프',
  sellerImage: 'https://i.pravatar.cc/150?img=12',
  sellerRating: 4.8,
  sellerReviewCount: 23,
  viewCount: 145,
  likeCount: 18,
  isLiked: false,
  createdAt: '2025.01.20',
  updatedAt: '2025.01.20',
};

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(mockProduct.isLiked);

  const handleLike = () => {
    setIsLiked(!isLiked);
    console.log('찜하기 토글');
  };

  const handleChat = () => {
    navigation.navigate('ChatRoom', {
      chatId: `product_${mockProduct.id}`,
      chatTitle: mockProduct.sellerName,
      userImage: mockProduct.sellerImage,
    });
  };

  const handleSellerPress = () => {
    navigation.navigate('FriendProfile', {
      friendId: mockProduct.id,
      friendName: mockProduct.sellerName,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.headerIcon}>🔗</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.headerIcon}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 이미지 갤러리 */}
          <View style={styles.imageGallery}>
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
              {mockProduct.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.galleryImage}
                />
              ))}
            </ScrollView>

            {/* 이미지 인디케이터 */}
            <View style={styles.imageIndicator}>
              <Text style={styles.indicatorText}>
                {currentImageIndex + 1} / {mockProduct.images.length}
              </Text>
            </View>
          </View>

          {/* 판매자 정보 */}
          <TouchableOpacity style={styles.sellerSection} onPress={handleSellerPress}>
            <Image source={{ uri: mockProduct.sellerImage }} style={styles.sellerImage} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{mockProduct.sellerName}</Text>
              <View style={styles.sellerRating}>
                <Text style={styles.ratingText}>⭐ {mockProduct.sellerRating}</Text>
                <Text style={styles.reviewCount}>후기 {mockProduct.sellerReviewCount}개</Text>
              </View>
            </View>
            <Text style={styles.sellerArrow}>›</Text>
          </TouchableOpacity>

          {/* 상품 정보 */}
          <View style={styles.productSection}>
            <Text style={styles.productTitle}>{mockProduct.title}</Text>

            <View style={styles.productMeta}>
              <Text style={styles.metaItem}>카테고리 • 드라이버</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaItem}>{mockProduct.createdAt}</Text>
            </View>

            <Text style={styles.productPrice}>{mockProduct.price.toLocaleString()}원</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoTag}>
                <Text style={styles.infoTagText}>
                  {CONDITION_LABELS[mockProduct.condition]}
                </Text>
              </View>
              <View style={styles.infoTag}>
                <Text style={styles.infoTagText}>📍 {mockProduct.location}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsText}>관심 {mockProduct.likeCount}</Text>
              <Text style={styles.statsDot}>•</Text>
              <Text style={styles.statsText}>조회 {mockProduct.viewCount}</Text>
            </View>
          </View>

          {/* 상품 설명 */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>상품 설명</Text>
            <Text style={styles.descriptionText}>{mockProduct.description}</Text>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Text style={styles.likeButtonIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>채팅하기</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  headerIcon: {
    fontSize: 20,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: width,
    backgroundColor: '#E5E5E5',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  sellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F5F5',
  },
  sellerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 13,
    color: '#999',
  },
  sellerArrow: {
    fontSize: 20,
    color: '#999',
  },
  productSection: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F5F5',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 26,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 13,
    color: '#999',
  },
  metaDot: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 6,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  infoTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  infoTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    color: '#999',
  },
  statsDot: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 8,
  },
  descriptionSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButtonIcon: {
    fontSize: 24,
  },
  chatButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});