// BestPubsScreen.tsx - 인기 펍 목록 (Firestore 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pubAPI, Pub } from '@/services/api/pubAPI';

export const BestPubsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPubs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pubAPI.getPopularPubs(20);
      setPubs(result);
    } catch (error) {
      console.error('인기 펍 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPubs();
  }, [loadPubs]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await pubAPI.getPopularPubs(20);
      setPubs(result);
    } catch (error) {
      console.error('인기 펍 새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredPubs = pubs.filter((pub) =>
    pub.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderPub = ({ item }: { item: Pub }) => (
    <TouchableOpacity
      style={styles.pubCard}
      onPress={() => navigation.navigate('PubDetail', { pubId: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://i.pravatar.cc/300' }}
        style={styles.pubImage}
      />
      {item.features?.includes('제휴') && (
        <View style={styles.partnerBadge}>
          <Text style={styles.partnerText}>제휴</Text>
        </View>
      )}
      <View style={styles.pubInfo}>
        <Text style={styles.pubName}>{item.name}</Text>
        <View style={styles.rating}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          {item.location ? <Text style={styles.distance}>• {item.location}</Text> : null}
        </View>
        {item.features && item.features.length > 0 && (
          <View style={styles.tags}>
            {item.features.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && pubs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>인기 펍</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://maps.google.com/?q=' + encodeURIComponent('골프 펍'))
            }
          >
            <Text style={styles.mapButtonText}>🗺️ 지도</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>인기 펍을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>인기 펍</Text>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://maps.google.com/?q=' + encodeURIComponent('골프 펍'))
          }
        >
          <Text style={styles.mapButtonText}>🗺️ 지도</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="펍 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* 필터 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>거리순</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>평점순</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>리뷰순</Text>
        </TouchableOpacity>
      </View>

      {/* 펍 목록 */}
      <FlatList
        data={filteredPubs}
        renderItem={renderPub}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍺</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? '검색 결과가 없습니다' : '등록된 펍이 없습니다'}
            </Text>
          </View>
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  mapButtonText: {
    fontSize: 16,
    color: '#10b981',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  pubCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pubImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  partnerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  partnerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  pubInfo: {
    padding: 16,
  },
  pubName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
