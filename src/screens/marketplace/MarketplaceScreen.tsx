// MarketplaceScreen.tsx - 중고거래 상품 목록 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ProductCategory, CATEGORIES, Product } from '../../types/marketplace-types';

// Mock 상품 데이터
const mockProducts: Product[] = [
  {
    id: '1',
    title: '타이틀리스트 TS3 드라이버',
    description: '거의 안 쓴 드라이버입니다. 상태 아주 좋아요!',
    price: 350000,
    category: 'driver',
    condition: 'like-new',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400'],
    location: '서울 강남구',
    sellerName: '김골프',
    sellerImage: 'https://i.pravatar.cc/150?img=12',
    sellerRating: 4.8,
    viewCount: 45,
    likeCount: 8,
    isLiked: false,
    createdAt: '2025.01.20',
    updatedAt: '2025.01.20',
  },
  {
    id: '2',
    title: '캘러웨이 아이언 세트 (5-9번)',
    description: '중고이지만 관리 잘 했습니다.',
    price: 450000,
    category: 'iron',
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400'],
    location: '경기 성남시',
    sellerName: '이철수',
    sellerImage: 'https://i.pravatar.cc/150?img=33',
    sellerRating: 4.5,
    viewCount: 120,
    likeCount: 15,
    isLiked: true,
    createdAt: '2025.01.18',
    updatedAt: '2025.01.18',
  },
  {
    id: '3',
    title: '오디세이 퍼터',
    description: '새제품 급입니다. 한 번도 필드에서 안 써봤어요.',
    price: 180000,
    category: 'putter',
    condition: 'new',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=400'],
    location: '서울 송파구',
    sellerName: '박민수',
    sellerImage: 'https://i.pravatar.cc/150?img=15',
    sellerRating: 4.9,
    viewCount: 89,
    likeCount: 12,
    isLiked: false,
    createdAt: '2025.01.17',
    updatedAt: '2025.01.17',
  },
  {
    id: '4',
    title: '타이틀리스트 볼보이 웨지 52도',
    description: '사용감 좀 있지만 성능은 문제없습니다.',
    price: 80000,
    category: 'wedge',
    condition: 'fair',
    status: 'reserved',
    images: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400'],
    location: '인천 남동구',
    sellerName: '최웨지',
    sellerImage: 'https://i.pravatar.cc/150?img=44',
    sellerRating: 4.3,
    viewCount: 56,
    likeCount: 5,
    isLiked: false,
    createdAt: '2025.01.15',
    updatedAt: '2025.01.22',
  },
  {
    id: '5',
    title: '나이키 골프 의류 세트',
    description: '사이즈 L입니다. 깨끗합니다.',
    price: 120000,
    category: 'apparel',
    condition: 'like-new',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400'],
    location: '서울 마포구',
    sellerName: '정패션',
    sellerImage: 'https://i.pravatar.cc/150?img=22',
    sellerRating: 4.7,
    viewCount: 34,
    likeCount: 7,
    isLiked: true,
    createdAt: '2025.01.14',
    updatedAt: '2025.01.14',
  },
  {
    id: '6',
    title: '골프 거리측정기',
    description: '부시넬 브랜드 정품입니다.',
    price: 250000,
    category: 'accessory',
    condition: 'good',
    status: 'sold',
    images: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=400'],
    location: '경기 고양시',
    sellerName: '강측정',
    sellerImage: 'https://i.pravatar.cc/150?img=8',
    sellerRating: 4.6,
    viewCount: 98,
    likeCount: 18,
    isLiked: false,
    createdAt: '2025.01.12',
    updatedAt: '2025.01.21',
  },
];

export const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState(mockProducts);

  // 카테고리 필터링
  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    if (searchText && !product.title.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: 실제 API 호출
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail' as never, { productId } as never);
  };

  const handleLike = (productId: string) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 } : p
    ));
  };

  const getStatusBadge = (status: string) => {
    if (status === 'reserved') {
      return { text: '예약중', bgColor: '#FF9800' };
    } else if (status === 'sold') {
      return { text: '판매완료', bgColor: '#999' };
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>중고거래</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyProducts' as never)}>
            <Text style={styles.myProductsButton}>내 판매</Text>
          </TouchableOpacity>
        </View>

        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="골프 용품을 검색하세요"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 카테고리 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
              전체
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 상품 그리드 */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => {
              const statusBadge = getStatusBadge(product.status);

              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product.id)}
                >
                  {/* 이미지 */}
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: product.images[0] }} style={styles.productImage} />

                    {/* 상태 배지 */}
                    {statusBadge && (
                      <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                        <Text style={styles.statusText}>{statusBadge.text}</Text>
                      </View>
                    )}

                    {/* 찜하기 */}
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => handleLike(product.id)}
                    >
                      <Text style={styles.likeIcon}>{product.isLiked ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 정보 */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.productPrice}>
                      {product.price.toLocaleString()}원
                    </Text>
                    <Text style={styles.productLocation}>{product.location}</Text>
                    <View style={styles.productMeta}>
                      <Text style={styles.metaText}>관심 {product.likeCount}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>조회 {product.viewCount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 등록 버튼 */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateProduct' as never)}
        >
          <Text style={styles.createButtonText}>+ 상품 등록</Text>
        </TouchableOpacity>
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
  myProductsButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
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
  },
  categoryScroll: {
    backgroundColor: '#fff',
    maxHeight: 44,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    marginRight: 6,
    height: 28,
  },
  categoryChipActive: {
    backgroundColor: '#E8F5E9',
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#10b981',
  },
  scrollView: {
    flex: 1,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E5E5',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  likeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: {
    fontSize: 18,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#999',
  },
  metaDot: {
    fontSize: 11,
    color: '#999',
    marginHorizontal: 4,
  },
  createButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  bottomSpacing: {
    height: 80,
  },
});