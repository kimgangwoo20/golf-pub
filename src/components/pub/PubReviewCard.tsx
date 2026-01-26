// PubReviewCard.tsx - 펍 리뷰 카드 컴포넌트
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface PubReviewCardProps {
  /** 작성자 이름 */
  userName: string;
  /** 작성자 아바타 */
  userAvatar: string;
  /** 평점 (1-5) */
  rating: number;
  /** 작성일 */
  date: string;
  /** 리뷰 내용 */
  content: string;
  /** 리뷰 이미지들 */
  images?: string[];
}

export const PubReviewCard: React.FC<PubReviewCardProps> = ({
  userName,
  userAvatar,
  rating,
  date,
  content,
  images = [],
}) => {
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(rating)}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.content}>{content}</Text>
      {images.length > 0 && (
        <View style={styles.images}>
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 14,
  },
  date: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 8,
  },
  content: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  images: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});
