import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MembershipPlan } from '../../types/membership';

interface PlanCardProps {
  plan: MembershipPlan;
  onSelect: () => void;
  isSelected?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isSelected = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        plan.isPopular && styles.popularCard,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>인기</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.badge}>{plan.badge}</Text>
        <Text style={styles.name}>{plan.name}</Text>
      </View>

      <Text style={styles.description}>{plan.description}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          월 {plan.monthlyPrice.toLocaleString()}원
        </Text>
        {plan.yearlyPrice > 0 && (
          <Text style={styles.yearlyPrice}>
            연 {plan.yearlyPrice.toLocaleString()}원 (17% 할인)
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.features}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {plan.monthlyPoints > 0 && (
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>
            매월 {plan.monthlyPoints.toLocaleString()}P 적립
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  popularCard: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    fontSize: 32,
    marginRight: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  yearlyPrice: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  features: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  pointsContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  pointsText: {
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '600',
    textAlign: 'center',
  },
});
