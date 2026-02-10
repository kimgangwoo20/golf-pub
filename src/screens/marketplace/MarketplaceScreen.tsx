// MarketplaceScreen.tsx - 중고거래 상품 목록 화면

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ProductCategory, CATEGORIES } from '@/types/marketplace-types';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { colors } from '@/styles/theme';
import { useMembershipGate } from '@/hooks/useMembershipGate';
import { PremiumGuard } from '@/components/common/PremiumGuard';

export const MarketplaceScreen: React.FC = () => {
  const { checkAccess } = useMembershipGate();
  const navigation = useNavigation<any>();
  const { items, loading, error, loadItems } = useMarketplaceStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  // 좋아요는 로컬 상태로 관리 (추후 Firestore 연동)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  // 화면 포커스 시 데이터 로드
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, []),
  );

  // 멤버십 게이팅: 비구독 남성 차단
  if (!checkAccess('trade')) {
    return <PremiumGuard feature="중고거래" />;
  }

  // 카테고리 필터링
  const filteredProducts = items.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    if (searchText && !product.title.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail' as any, { productId } as any);
  };

  const handleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
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
          <TouchableOpacity onPress={() => navigation.navigate('MyProducts' as any)}>
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
            <Text
              style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}
            >
              전체
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {loading && items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyDescription}>상품을 불러오는 중...</Text>
            </View>
          ) : error && items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>😢</Text>
              <Text style={styles.emptyTitle}>불러오기 실패</Text>
              <Text style={styles.emptyDescription}>{error}</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>등록된 상품이 없습니다</Text>
              <Text style={styles.emptyDescription}>첫 번째 상품을 등록해보세요!</Text>
            </View>
          ) : null}
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
                    <Image
                      source={{ uri: product.images[0] }}
                      style={styles.productImage}
                      onError={() => {}}
                    />

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
                      <Text style={styles.likeIcon}>
                        {likedProducts.has(product.id) ? '❤️' : '🤍'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 정보 */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.productPrice}>{product.price.toLocaleString()}원</Text>
                    <Text style={styles.productLocation}>{product.location}</Text>
                    <View style={styles.productMeta}>
                      <Text style={styles.metaText}>
                        관심 {product.likeCount + (likedProducts.has(product.id) ? 1 : 0)}
                      </Text>
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
          onPress={() => navigation.navigate('CreateProduct' as any)}
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
