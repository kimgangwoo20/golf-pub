import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MEMBERSHIP_COMPARISON } from '../../constants/membershipPlans';

export const ComparisonTable: React.FC = () => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={[styles.cell, styles.headerCell, styles.firstColumn]}>
            <Text style={styles.headerText}>기능</Text>
          </View>
          <View style={[styles.cell, styles.headerCell]}>
            <Text style={styles.headerText}>무료</Text>
          </View>
          <View style={[styles.cell, styles.headerCell, styles.premiumHeader]}>
            <Text style={[styles.headerText, styles.premiumText]}>프리미엄</Text>
          </View>
          <View style={[styles.cell, styles.headerCell]}>
            <Text style={styles.headerText}>VIP</Text>
          </View>
        </View>

        {/* Data Rows */}
        {MEMBERSHIP_COMPARISON.map((row, index) => (
          <View key={index} style={styles.row}>
            <View style={[styles.cell, styles.firstColumn]}>
              <Text style={styles.featureText}>{row.feature}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.valueText}>{row.free}</Text>
            </View>
            <View style={[styles.cell, styles.premiumCell]}>
              <Text style={[styles.valueText, styles.premiumValue]}>
                {row.premium}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.valueText}>{row.vip}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cell: {
    width: 100,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    paddingVertical: 16,
  },
  firstColumn: {
    width: 120,
    alignItems: 'flex-start',
  },
  premiumHeader: {
    backgroundColor: '#E3F2FD',
  },
  premiumCell: {
    backgroundColor: '#F0F8FF',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  premiumText: {
    color: '#10b981',
  },
  featureText: {
    fontSize: 13,
    color: '#333',
  },
  valueText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  premiumValue: {
    color: '#10b981',
    fontWeight: '600',
  },
});
