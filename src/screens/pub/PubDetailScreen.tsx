// PubDetailScreen.tsx - 펍 상세 정보
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';

const MOCK_PUB = {
  id: '1',
  name: '골프 펍 강남점',
  image: 'https://i.pravatar.cc/400?img=1',
  rating: 4.8,
  reviewCount: 156,
  distance: '1.2km',
  address: '서울시 강남구 테헤란로 123',
  phone: '02-1234-5678',
  hours: '11:00 - 23:00',
  tags: ['주차가능', '단체석', '스크린골프'],
  description: '골프 라운딩 후 편안하게 쉬어갈 수 있는 프리미엄 스포츠바입니다.',
  menu: [
    { name: '생맥주', price: '6,000원' },
    { name: '안주세트', price: '25,000원' },
    { name: '치킨', price: '18,000원' },
  ],
  isPartner: true,
  discount: '골프 Pub 회원 10% 할인',
};

export const PubDetailScreen: React.FC<{ route?: any; navigation?: any }> = ({ route, navigation }) => {
  const pub = MOCK_PUB;

  const handleCall = () => {
    Linking.openURL(`tel:${pub.phone}`);
  };

  const handleMap = () => {
    // 지도 앱 열기
    const url = `https://maps.google.com/?q=${pub.address}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 이미지 */}
      <Image source={{ uri: pub.image }} style={styles.image} />
      {pub.isPartner && (
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
            onPress={() => navigation?.navigate('PubReviews', { pubId: pub.id })}
          >
            <Text style={styles.reviewButtonText}>리뷰 보기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tags}>
          {pub.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 할인 혜택 */}
      {pub.discount && (
        <View style={styles.discountSection}>
          <Text style={styles.discountIcon}>🎁</Text>
          <Text style={styles.discountText}>{pub.discount}</Text>
        </View>
      )}

      {/* 설명 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>소개</Text>
        <Text style={styles.description}>{pub.description}</Text>
      </View>

      {/* 운영 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>운영 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>영업시간</Text>
          <Text style={styles.infoValue}>{pub.hours}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>주소</Text>
          <TouchableOpacity onPress={handleMap}>
            <Text style={[styles.infoValue, styles.linkText]}>{pub.address}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>전화</Text>
          <TouchableOpacity onPress={handleCall}>
            <Text style={[styles.infoValue, styles.linkText]}>{pub.phone}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 메뉴 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>메뉴</Text>
        {pub.menu.map((item, index) => (
          <View key={index} style={styles.menuItem}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuPrice}>{item.price}</Text>
          </View>
        ))}
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Text style={styles.callButtonText}>📞 전화하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton} onPress={handleMap}>
          <Text style={styles.mapButtonText}>🗺️ 길찾기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#007AFF',
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
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 16,
    marginTop: 12,
  },
  discountIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  discountText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
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
    color: '#007AFF',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuName: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  menuPrice: {
    fontSize: 15,
    fontWeight: '600',
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
    backgroundColor: '#007AFF',
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
