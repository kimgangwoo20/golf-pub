// OfferManagementScreen.tsx - 가격 제안 관리 화면 (판매자용)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/styles/theme';
import { marketplaceAPI, PriceOffer } from '@/services/api/marketplaceAPI';
import type { Product } from '@/types/marketplace-types';

interface ProductOfferGroup {
  product: Product;
  offers: PriceOffer[];
}

export const OfferManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [groups, setGroups] = useState<ProductOfferGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOffers = useCallback(async () => {
    try {
      const data = await marketplaceAPI.getMyProductOffers();
      setGroups(data);
    } catch (err: any) {
      Alert.alert('오류', err.message || '제안 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleAccept = (productId: string, offerId: string, price: number) => {
    Alert.alert(
      '제안 수락',
      `${price.toLocaleString()}원 제안을 수락하시겠습니까?\n다른 대기 중인 제안은 자동으로 거절됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '수락',
          onPress: async () => {
            try {
              await marketplaceAPI.acceptOffer(productId, offerId);
              Alert.alert('완료', '제안을 수락했습니다.');
              loadOffers();
            } catch (err: any) {
              Alert.alert('오류', err.message);
            }
          },
        },
      ],
    );
  };

  const handleReject = (productId: string, offerId: string) => {
    Alert.alert('제안 거절', '이 제안을 거절하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          try {
            await marketplaceAPI.rejectOffer(productId, offerId);
            loadOffers();
          } catch (err: any) {
            Alert.alert('오류', err.message);
          }
        },
      },
    ]);
  };

  const renderOffer = (offer: PriceOffer, productId: string) => {
    const discountPercent = Math.round(
      ((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100,
    );

    return (
      <View key={offer.id} style={styles.offerCard}>
        <View style={styles.offerInfo}>
          <Text style={styles.offerUser}>{offer.userName}</Text>
          <Text style={styles.offerPrice}>{offer.offerPrice.toLocaleString()}원</Text>
          <Text style={styles.offerDiscount}>
            원가 대비 {discountPercent > 0 ? `-${discountPercent}%` : `+${Math.abs(discountPercent)}%`}
          </Text>
        </View>
        <View style={styles.offerActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAccept(productId, offer.id, offer.offerPrice)}
          >
            <Text style={styles.acceptButtonText}>수락</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(productId, offer.id)}
          >
            <Text style={styles.rejectButtonText}>거절</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGroup = ({ item }: { item: ProductOfferGroup }) => (
    <View style={styles.groupCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.product.title}
        </Text>
        <Text style={styles.productPrice}>{item.product.price.toLocaleString()}원</Text>
      </View>
      <Text style={styles.offerCount}>
        대기 중인 제안 {item.offers.length}건
      </Text>
      {item.offers.map((offer) => renderOffer(offer, item.product.id))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가격 제안 관리</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.product.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOffers(); }} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={styles.emptyText}>대기 중인 가격 제안이 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { fontSize: 32, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  listContent: { padding: 16 },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginRight: 8 },
  productPrice: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  offerCount: { fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: 12 },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  offerInfo: { flex: 1 },
  offerUser: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  offerPrice: { fontSize: 16, fontWeight: '700', color: colors.primary },
  offerDiscount: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  offerActions: { flexDirection: 'row', gap: 8 },
  acceptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  acceptButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  rejectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  rejectButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});
