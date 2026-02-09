// PubCard.tsx - 펍 카드 컴포넌트
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface PubCardProps {
  /** 펍 이름 */
  name: string;
  /** 펍 이미지 */
  image: string;
  /** 평점 */
  rating: number;
  /** 리뷰 수 */
  reviewCount: number;
  /** 거리 */
  distance?: string;
  /** 태그 */
  tags?: string[];
  /** 제휴 여부 */
  isPartner?: boolean;
  /** 클릭 핸들러 */
  onPress?: () => void;
}

export const PubCard: React.FC<PubCardProps> = ({
  name,
  image,
  rating,
  reviewCount,
  distance,
  tags = [],
  isPartner = false,
  onPress,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {!imageError && image ? (
        <Image source={{ uri: image }} style={styles.image} onError={() => setImageError(true)} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderIcon}>🍺</Text>
        </View>
      )}
      {isPartner && (
        <View style={styles.partnerBadge}>
          <Text style={styles.partnerText}>제휴</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.rating}>
          <Text style={styles.ratingText}>⭐ {rating}</Text>
          <Text style={styles.reviewCount}>({reviewCount})</Text>
          {distance && <Text style={styles.distance}>• {distance}</Text>}
        </View>
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
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
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#6b7280',
  },
});
