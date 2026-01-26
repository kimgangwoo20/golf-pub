// ProductFilter.tsx - 상품 필터 (가격대, 상태, 지역)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

interface FilterOptions {
  priceRange?: string;
  condition?: string;
  region?: string;
  sortBy?: string;
}

interface ProductFilterProps {
  visible: boolean;
  currentFilters?: FilterOptions;
  onClose: () => void;
  onApply?: (filters: FilterOptions) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  visible,
  currentFilters = {},
  onClose,
  onApply,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  // 기획서: 가격대별 필터, 상품 상태 필터, 지역별 필터
  const priceRanges = [
    { id: 'all', label: '전체' },
    { id: 'under100', label: '10만원 이하' },
    { id: '100to300', label: '10만원 ~ 30만원' },
    { id: '300to500', label: '30만원 ~ 50만원' },
    { id: 'over500', label: '50만원 이상' },
  ];

  const conditions = [
    { id: 'all', label: '전체' },
    { id: 'new', label: '새것' },
    { id: 'almost_new', label: '거의 새것' },
    { id: 'used', label: '사용감 있음' },
  ];

  const regions = [
    { id: 'all', label: '전체' },
    { id: 'seoul', label: '서울' },
    { id: 'gyeonggi', label: '경기' },
    { id: 'incheon', label: '인천' },
    { id: 'busan', label: '부산' },
    { id: 'daegu', label: '대구' },
    { id: 'gwangju', label: '광주' },
    { id: 'daejeon', label: '대전' },
    { id: 'ulsan', label: '울산' },
  ];

  const sortOptions = [
    { id: 'latest', label: '최신순' },
    { id: 'price_low', label: '낮은 가격순' },
    { id: 'price_high', label: '높은 가격순' },
  ];

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>필터</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* 가격대 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>가격대</Text>
              <View style={styles.optionGrid}>
                {priceRanges.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      filters.priceRange === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, priceRange: option.id })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.priceRange === option.id && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 상품 상태 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>상품 상태</Text>
              <View style={styles.optionGrid}>
                {conditions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      filters.condition === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, condition: option.id })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.condition === option.id && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 지역 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>지역</Text>
              <View style={styles.optionGrid}>
                {regions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      filters.region === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFilters({ ...filters, region: option.id })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.region === option.id && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 정렬 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>정렬</Text>
              <View style={styles.optionGrid}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      filters.sortBy === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: option.id })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.sortBy === option.id && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeText: {
    fontSize: 24,
    color: '#6b7280',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
