// BestPubsScreen.tsx - 인기 펍 목록
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';

interface Pub {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  tags: string[];
  isPartner: boolean;
}

const MOCK_PUBS: Pub[] = [
  {
    id: '1',
    name: '골프 펍 강남점',
    image: 'https://i.pravatar.cc/300?img=1',
    rating: 4.8,
    reviewCount: 156,
    distance: '1.2km',
    tags: ['주차가능', '단체석'],
    isPartner: true,
  },
  {
    id: '2',
    name: '19홀 스포츠바',
    image: 'https://i.pravatar.cc/300?img=2',
    rating: 4.5,
    reviewCount: 89,
    distance: '2.5km',
    tags: ['스크린골프', '맥주'],
    isPartner: true,
  },
  {
    id: '3',
    name: '그린 클럽하우스',
    image: 'https://i.pravatar.cc/300?img=3',
    rating: 4.9,
    reviewCount: 234,
    distance: '3.1km',
    tags: ['고급', '조용함'],
    isPartner: false,
  },
];

export const BestPubsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [pubs] = useState<Pub[]>(MOCK_PUBS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPubs = pubs.filter(pub =>
    pub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPub = ({ item }: { item: Pub }) => (
    <TouchableOpacity
      style={styles.pubCard}
      onPress={() => navigation?.navigate('PubDetail', { pubId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.pubImage} />
      {item.isPartner && (
        <View style={styles.partnerBadge}>
          <Text style={styles.partnerText}>제휴</Text>
        </View>
      )}
      <View style={styles.pubInfo}>
        <Text style={styles.pubName}>{item.name}</Text>
        <View style={styles.rating}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          <Text style={styles.distance}>• {item.distance}</Text>
        </View>
        <View style={styles.tags}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>인기 펍</Text>
        <TouchableOpacity onPress={() => Alert.alert('지도', '지도 기능은 준비 중입니다.')}>
          <Text style={styles.mapButton}>🗺️ 지도</Text>
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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  mapButton: {
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
    fontWeight: 'bold',
  },
  pubInfo: {
    padding: 16,
  },
  pubName: {
    fontSize: 18,
    fontWeight: 'bold',
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
});
