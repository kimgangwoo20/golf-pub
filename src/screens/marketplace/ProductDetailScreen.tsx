// ProductDetailScreen.tsx - 상품 상세 화면

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CONDITION_LABELS } from '@/types/marketplace-types';
import { marketplaceAPI } from '@/services/api/marketplaceAPI';
import { colors } from '@/styles/theme';
import type { Product } from '@/types/marketplace-types';

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { productId } = route.params as { productId: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setError(null);
      const data = await marketplaceAPI.getProductById(productId);
      if (data) {
        setProduct(data);
        setIsLiked(data.isLiked);
      } else {
        setError('상품을 찾을 수 없습니다');
      }
    } catch (err: any) {
      setError(err.message || '상품을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
    // 조회수 증가 (에러 무시)
    marketplaceAPI.increaseViewCount(productId);
  }, [loadProduct, productId]);

  const handleLike = async () => {
    if (!product) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    try {
      if (newLiked) {
        await marketplaceAPI.likeProduct(product.id);
      } else {
        await marketplaceAPI.unlikeProduct(product.id);
      }
    } catch {
      // 실패 시 원래 상태로 롤백
      setIsLiked(!newLiked);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `[골프 Pub] ${product.title}\n${product.price.toLocaleString()}원\n${product.description.slice(0, 50)}...`,
      });
    } catch (err) {
      console.error('공유 실패:', err);
    }
  };

  const handleReport = () => {
    setMoreMenuVisible(false);
    Alert.alert(
      '신고하기',
      '이 상품을 신고하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '허위 매물',
          onPress: () => Alert.alert('신고 완료', '신고가 접수되었습니다. 검토 후 처리됩니다.'),
        },
        {
          text: '사기 의심',
          onPress: () => Alert.alert('신고 완료', '신고가 접수되었습니다. 검토 후 처리됩니다.'),
        },
      ],
    );
  };

  const handleHide = () => {
    setMoreMenuVisible(false);
    Alert.alert('숨기기', '이 상품이 목록에서 숨겨집니다.', [
      { text: '취소', style: 'cancel' },
      { text: '숨기기', onPress: () => navigation.goBack() },
    ]);
  };

  const handleBlockSeller = () => {
    if (!product) return;
    setMoreMenuVisible(false);
    Alert.alert(
      '판매자 차단',
      `${product.sellerName}님을 차단하시겠습니까?\n차단하면 이 판매자의 상품이 더 이상 표시되지 않습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: () => {
            Alert.alert('차단 완료', `${product.sellerName}님이 차단되었습니다.`);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleChat = () => {
    if (!product) return;
    navigation.navigate('Chat' as any, {
      screen: 'ChatRoom',
      params: {
        chatId: `product_${product.id}`,
        chatName: product.sellerName,
      },
    } as any);
  };

  const handleSellerPress = () => {
    if (!product) return;
    navigation.navigate('MyHome' as any, {
      screen: 'FriendProfile',
      params: {
        friendId: product.sellerId,
        friendName: product.sellerName,
      },
    } as any);
  };

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // 에러/없음 상태
  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || '상품을 찾을 수 없습니다'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Text style={styles.headerIcon}>🔗</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setMoreMenuVisible(true)}>
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
              {product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                  />
                ))
              ) : (
                <View style={[styles.galleryImage, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 48 }}>📷</Text>
                  <Text style={{ color: colors.textTertiary, marginTop: 8 }}>이미지 없음</Text>
                </View>
              )}
            </ScrollView>

            {/* 이미지 인디케이터 */}
            {product.images.length > 0 && (
              <View style={styles.imageIndicator}>
                <Text style={styles.indicatorText}>
                  {currentImageIndex + 1} / {product.images.length}
                </Text>
              </View>
            )}
          </View>

          {/* 판매자 정보 */}
          <TouchableOpacity style={styles.sellerSection} onPress={handleSellerPress}>
            {product.sellerImage ? (
              <Image source={{ uri: product.sellerImage }} style={styles.sellerImage} />
            ) : (
              <View style={[styles.sellerImage, { backgroundColor: '#E5E5E5', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 20, color: colors.textTertiary }}>{product.sellerName?.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.sellerName}</Text>
              <View style={styles.sellerRating}>
                <Text style={styles.ratingText}>⭐ {product.sellerRating}</Text>
              </View>
            </View>
            <Text style={styles.sellerArrow}>›</Text>
          </TouchableOpacity>

          {/* 상품 정보 */}
          <View style={styles.productSection}>
            <Text style={styles.productTitle}>{product.title}</Text>

            <View style={styles.productMeta}>
              <Text style={styles.metaItem}>카테고리 • {product.category}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaItem}>{typeof product.createdAt === 'string' ? product.createdAt : ''}</Text>
            </View>

            <Text style={styles.productPrice}>{product.price.toLocaleString()}원</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoTag}>
                <Text style={styles.infoTagText}>
                  {CONDITION_LABELS[product.condition as keyof typeof CONDITION_LABELS]}
                </Text>
              </View>
              {product.location && (
                <View style={styles.infoTag}>
                  <Text style={styles.infoTagText}>📍 {product.location}</Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsText}>관심 {product.likeCount}</Text>
              <Text style={styles.statsDot}>•</Text>
              <Text style={styles.statsText}>조회 {product.viewCount}</Text>
            </View>
          </View>

          {/* 상품 설명 */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>상품 설명</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
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

        {/* 더보기 메뉴 모달 */}
        <Modal
          visible={moreMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMoreMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMoreMenuVisible(false)}
          >
            <View style={styles.moreMenuContainer}>
              <TouchableOpacity style={styles.moreMenuItem} onPress={handleReport}>
                <Text style={styles.moreMenuIcon}>🚨</Text>
                <Text style={styles.moreMenuText}>신고하기</Text>
              </TouchableOpacity>
              <View style={styles.moreMenuDivider} />
              <TouchableOpacity style={styles.moreMenuItem} onPress={handleHide}>
                <Text style={styles.moreMenuIcon}>🙈</Text>
                <Text style={styles.moreMenuText}>이 상품 숨기기</Text>
              </TouchableOpacity>
              <View style={styles.moreMenuDivider} />
              <TouchableOpacity style={styles.moreMenuItem} onPress={handleBlockSeller}>
                <Text style={styles.moreMenuIcon}>🚫</Text>
                <Text style={[styles.moreMenuText, styles.dangerText]}>판매자 차단</Text>
              </TouchableOpacity>
              <View style={styles.moreMenuDivider} />
              <TouchableOpacity
                style={styles.moreMenuCancel}
                onPress={() => setMoreMenuVisible(false)}
              >
                <Text style={styles.moreMenuCancelText}>취소</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  moreMenuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  moreMenuIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
  },
  moreMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  moreMenuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 24,
  },
  dangerText: {
    color: '#FF3B30',
  },
  moreMenuCancel: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  moreMenuCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
