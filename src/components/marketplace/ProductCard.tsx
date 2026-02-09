// ProductCard.tsx - 중고 상품 카드
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ProductCardProps {
  title: string;
  price: number;
  image: string;
  condition: string;
  location: string;
  timeAgo: string;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  image,
  condition,
  location,
  timeAgo,
  onPress,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {!imageError && image ? (
        <Image source={{ uri: image }} style={styles.image} onError={() => setImageError(true)} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderIcon}>📷</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.price}>{price.toLocaleString()}원</Text>
        <View style={styles.footer}>
          <Text style={styles.condition}>{condition}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.location}>{location}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
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
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 40,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  condition: {
    fontSize: 12,
    color: '#6b7280',
  },
  dot: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 4,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
