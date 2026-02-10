// MyProductsScreen.tsx - 내 판매 상품 화면

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Product, ProductStatus } from '@/types/marketplace-types';
import { marketplaceAPI } from '@/services/api/marketplaceAPI';
import { colors } from '@/styles/theme';

type TabType = 'selling' | 'sold';

export const MyProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('selling');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await marketplaceAPI.getMyProducts();
      setProducts(data);
    } catch (error: any) {
      console.error('내 상품 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  const sellingProducts = products.filter(
    (p) => p.status === 'available' || p.status === 'reserved',
  );
  const soldProducts = products.filter((p) => p.status === 'sold');

  const displayProducts = activeTab === 'selling' ? sellingProducts : soldProducts;

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail' as any, { productId } as any);
  };

  const handleEdit = (productId: string) => {
    navigation.navigate('CreateProduct' as any, { productId, editMode: true } as any);
  };

  const handleDelete = (productId: string) => {
    Alert.alert('상품 삭제', '정말 삭제하시겠습니까?\n삭제된 상품은 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await marketplaceAPI.deleteProduct(productId);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
            Alert.alert('완료', '상품이 삭제되었습니다.');
          } catch (error: any) {
            Alert.alert('오류', error.message || '상품 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleChangeStatus = (productId: string) => {
    Alert.alert('상태 변경', '상품 상태를 선택하세요', [
      { text: '취소', style: 'cancel' },
      {
        text: '판매중',
        onPress: async () => {
          try {
            await marketplaceAPI.updateProductStatus(productId, 'available' as ProductStatus);
            setProducts((prev) =>
              prev.map((p) => (p.id === productId ? { ...p, status: 'available' as const } : p)),
            );
            Alert.alert('완료', '판매중으로 변경되었습니다.');
          } catch (error: any) {
            Alert.alert('오류', error.message || '상태 변경에 실패했습니다.');
          }
        },
      },
      {
        text: '예약중',
        onPress: async () => {
          try {
            await marketplaceAPI.updateProductStatus(productId, 'reserved' as ProductStatus);
            setProducts((prev) =>
              prev.map((p) => (p.id === productId ? { ...p, status: 'reserved' as const } : p)),
            );
            Alert.alert('완료', '예약중으로 변경되었습니다.');
          } catch (error: any) {
            Alert.alert('오류', error.message || '상태 변경에 실패했습니다.');
          }
        },
      },
      {
        text: '판매완료',
        onPress: async () => {
          try {
            await marketplaceAPI.updateProductStatus(productId, 'sold' as ProductStatus);
            setProducts((prev) =>
              prev.map((p) => (p.id === productId ? { ...p, status: 'sold' as const } : p)),
            );
            Alert.alert('완료', '판매완료로 변경되었습니다.');
          } catch (error: any) {
            Alert.alert('오류', error.message || '상태 변경에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'available') {
      return { text: '판매중', color: colors.primary, bgColor: '#E8F5E9' };
    } else if (status === 'reserved') {
      return { text: '예약중', color: '#FF9800', bgColor: '#FFF3E0' };
    } else {
      return { text: '판매완료', color: colors.textTertiary, bgColor: '#F5F5F5' };
    }
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 판매 상품</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 통계 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>총 상품</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sellingProducts.length}</Text>
            <Text style={styles.statLabel}>판매중</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{soldProducts.length}</Text>
            <Text style={styles.statLabel}>거래완료</Text>
          </View>
        </View>

        {/* 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
            onPress={() => setActiveTab('selling')}
          >
            <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>
              판매중 ({sellingProducts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sold' && styles.activeTab]}
            onPress={() => setActiveTab('sold')}
          >
            <Text style={[styles.tabText, activeTab === 'sold' && styles.activeTabText]}>
              거래완료 ({soldProducts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 상품 목록 */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.productList}>
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => {
                const statusBadge = getStatusBadge(product.status);

                return (
                  <View key={product.id} style={styles.productCard}>
                    <TouchableOpacity
                      style={styles.productMain}
                      onPress={() => handleProductPress(product.id)}
                    >
                      {product.images[0] ? (
                        <Image
                          source={{ uri: product.images[0] }}
                          style={styles.productImage}
                          onError={() => {}}
                        />
                      ) : (
                        <View
                          style={[
                            styles.productImage,
                            { justifyContent: 'center', alignItems: 'center' },
                          ]}
                        >
                          <Text style={{ fontSize: 24 }}>📷</Text>
                        </View>
                      )}

                      <View style={styles.productInfo}>
                        <Text style={styles.productTitle} numberOfLines={2}>
                          {product.title}
                        </Text>
                        <Text style={styles.productPrice}>{product.price.toLocaleString()}원</Text>
                        <View style={styles.productMeta}>
                          <Text style={styles.metaText}>관심 {product.likeCount}</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.metaText}>조회 {product.viewCount}</Text>
                        </View>
                        <View
                          style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}
                        >
                          <Text style={[styles.statusText, { color: statusBadge.color }]}>
                            {statusBadge.text}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* 버튼 */}
                    {activeTab === 'selling' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleChangeStatus(product.id)}
                        >
                          <Text style={styles.actionButtonText}>상태 변경</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEdit(product.id)}
                        >
                          <Text style={styles.actionButtonText}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDelete(product.id)}
                        >
                          <Text style={styles.deleteButtonText}>삭제</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>📦</Text>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'selling'
                    ? '판매중인 상품이 없습니다'
                    : '거래완료 상품이 없습니다'}
                </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
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
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  activeTabText: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  productList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productMain: {
    flexDirection: 'row',
    padding: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  metaDot: {
    fontSize: 12,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  bottomSpacing: {
    height: 40,
  },
});
