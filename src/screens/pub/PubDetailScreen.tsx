// PubDetailScreen.tsx - 펍 상세 정보 (Firestore 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pubAPI, Pub } from '@/services/api/pubAPI';

export const PubDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const pubId = route.params?.pubId as string;

  const [pub, setPub] = useState<Pub | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPub = useCallback(async () => {
    if (!pubId) return;
    try {
      setLoading(true);
      const result = await pubAPI.getPubById(pubId);
      setPub(result);
    } catch (error) {
      console.error('펍 상세 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [pubId]);

  useEffect(() => {
    loadPub();
  }, [loadPub]);

  const handleCall = () => {
    if (pub?.phone) {
      Linking.openURL(`tel:${pub.phone}`);
    }
  };

  const handleMap = () => {
    if (pub?.address) {
      const url = `https://maps.google.com/?q=${pub.address}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>펍 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (!pub) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>🍺</Text>
          <Text style={styles.emptyText}>펍 정보를 찾을 수 없습니다</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 이미지 */}
      <Image
        source={{ uri: pub.images?.[0] || 'https://i.pravatar.cc/400' }}
        style={styles.image}
      />
      {pub.features?.includes('제휴') && (
        <View style={styles.partnerBadge}>
          <Text style={styles.partnerText}>제휴 펍</Text>
        </View>
      )}

      {/* 기본 정보 */}
      <View style={styles.section}>
        <Text style={styles.name}>{pub.name}</Text>
        <View style={styles.rating}>
          <Text style={styles.ratingText}>⭐ {pub.rating}</Text>
          <Text style={styles.reviewCount}>({pub.reviewCount})</Text>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('PubReviews', { pubId: pub.id })}
          >
            <Text style={styles.reviewButtonText}>리뷰 보기</Text>
          </TouchableOpacity>
        </View>
        {pub.features && pub.features.length > 0 && (
          <View style={styles.tags}>
            {pub.features.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 설명 */}
      {pub.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소개</Text>
          <Text style={styles.description}>{pub.description}</Text>
        </View>
      ) : null}

      {/* 운영 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>운영 정보</Text>
        {(pub.openTime || pub.closeTime) && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>영업시간</Text>
            <Text style={styles.infoValue}>
              {pub.openTime} - {pub.closeTime}
            </Text>
          </View>
        )}
        {pub.address ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주소</Text>
            <TouchableOpacity onPress={handleMap}>
              <Text style={[styles.infoValue, styles.linkText]}>{pub.address}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {pub.phone ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>전화</Text>
            <TouchableOpacity onPress={handleCall}>
              <Text style={[styles.infoValue, styles.linkText]}>{pub.phone}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* 메뉴 */}
      {pub.menu && pub.menu.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메뉴</Text>
          {pub.menu.map((item, index) => (
            <View key={index} style={styles.menuItem}>
              <Text style={styles.menuName}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 액션 버튼 */}
      <View style={styles.actions}>
        {pub.phone ? (
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Text style={styles.callButtonText}>📞 전화하기</Text>
          </TouchableOpacity>
        ) : null}
        {pub.address ? (
          <TouchableOpacity style={styles.mapButton} onPress={handleMap}>
            <Text style={styles.mapButtonText}>🗺️ 길찾기</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  partnerBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  partnerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  reviewButton: {
    marginLeft: 'auto',
  },
  reviewButtonText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  linkText: {
    color: '#10b981',
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuName: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
