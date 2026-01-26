// CategorySelector.tsx - 중고 거래 카테고리 선택
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategorySelectorProps {
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  // 기획서: 드라이버, 아이언, 퍼터, 웨지, 우드, 골프화, 골프백, 의류, 액세서리, 기타
  const categories: Category[] = [
    { id: 'all', name: '전체', icon: '📦' },
    { id: 'driver', name: '드라이버', icon: '🏌️' },
    { id: 'iron', name: '아이언', icon: '⛳' },
    { id: 'putter', name: '퍼터', icon: '🎯' },
    { id: 'wedge', name: '웨지', icon: '🔧' },
    { id: 'wood', name: '우드', icon: '🌲' },
    { id: 'shoes', name: '골프화', icon: '👟' },
    { id: 'bag', name: '골프백', icon: '🎒' },
    { id: 'clothes', name: '의류', icon: '👕' },
    { id: 'accessory', name: '액세서리', icon: '⌚' },
    { id: 'etc', name: '기타', icon: '📌' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
              onPress={() => onSelectCategory?.(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryNameSelected: {
    color: '#fff',
  },
});
