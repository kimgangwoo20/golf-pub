// TransactionCard.tsx - 거래 내역 카드
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface TransactionCardProps {
  productTitle: string;
  productImage: string;
  price: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  type: 'buy' | 'sell';
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  productTitle,
  productImage,
  price,
  date,
  status,
  type,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { text: '완료', color: '#10b981' };
      case 'pending':
        return { text: '진행중', color: '#f59e0b' };
      case 'cancelled':
        return { text: '취소', color: '#ef4444' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.container}>
      <Image source={{ uri: productImage }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.type}>{type === 'buy' ? '구매' : '판매'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {productTitle}
        </Text>
        <Text style={styles.price}>{price.toLocaleString()}원</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  type: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
