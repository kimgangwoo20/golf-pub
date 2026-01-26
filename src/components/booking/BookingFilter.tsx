// src/components/booking/BookingFilter.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { BookingFilter as BookingFilterType, BookingSortType, SkillLevel } from '../../types/booking-types';
import { colors } from '../../styles/theme';

interface Props {
  activeFilter: BookingFilterType;
  onFilterChange: (filter: BookingFilterType) => void;
  sortType: BookingSortType;
  onSortChange: (sort: BookingSortType) => void;
}

export const BookingFilter: React.FC<Props> = ({
  activeFilter,
  onFilterChange,
  sortType,
  onSortChange,
}) => {
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  /**
   * 날짜 필터 칩
   */
  const dateFilters = [
    { key: 'all', label: '전체' },
    { key: 'today', label: '오늘' },
    { key: 'thisWeek', label: '이번 주' },
    { key: 'thisMonth', label: '이번 달' },
  ];

  /**
   * 실력 레벨 필터
   */
  const levelFilters: { key: SkillLevel; label: string }[] = [
    { key: 'beginner', label: '초보' },
    { key: 'intermediate', label: '중급' },
    { key: 'advanced', label: '고급' },
    { key: 'any', label: '누구나' },
  ];

  /**
   * 정렬 옵션
   */
  const sortOptions: { key: BookingSortType; label: string }[] = [
    { key: 'latest', label: '최신순' },
    { key: 'popular', label: '인기순' },
    { key: 'priceLow', label: '가격 낮은순' },
    { key: 'priceHigh', label: '가격 높은순' },
    { key: 'dateClose', label: '날짜 가까운순' },
  ];

  /**
   * 날짜 필터 변경
   */
  const handleDateFilter = (date: typeof dateFilters[0]['key']) => {
    if (date === 'all') {
      onFilterChange({ ...activeFilter, date: undefined });
    } else {
      onFilterChange({ ...activeFilter, date: date as any });
    }
  };

  /**
   * 실력 레벨 필터 변경
   */
  const handleLevelFilter = (level: SkillLevel) => {
    const currentLevels = activeFilter.level || [];
    let newLevels: SkillLevel[];

    if (currentLevels.includes(level)) {
      // 이미 선택된 레벨이면 제거
      newLevels = currentLevels.filter(l => l !== level);
    } else {
      // 선택되지 않은 레벨이면 추가
      newLevels = [...currentLevels, level];
    }

    onFilterChange({ ...activeFilter, level: newLevels.length > 0 ? newLevels : undefined });
  };

  /**
   * 술집 연계 필터 토글
   */
  const handlePubFilter = () => {
    if (activeFilter.hasPub === undefined) {
      onFilterChange({ ...activeFilter, hasPub: true });
    } else if (activeFilter.hasPub === true) {
      onFilterChange({ ...activeFilter, hasPub: false });
    } else {
      onFilterChange({ ...activeFilter, hasPub: undefined });
    }
  };

  /**
   * 정렬 변경
   */
  const handleSortChange = (sort: BookingSortType) => {
    onSortChange(sort);
    setShowSortModal(false);
  };

  /**
   * 필터 초기화
   */
  const resetFilters = () => {
    onFilterChange({});
    setShowFilterModal(false);
  };

  return (
    <View style={styles.container}>
      {/* 날짜 필터 칩 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {dateFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.chip,
              (filter.key === 'all' ? !activeFilter.date : activeFilter.date === filter.key) &&
                styles.chipActive,
            ]}
            onPress={() => handleDateFilter(filter.key)}
          >
            <Text
              style={[
                styles.chipText,
                (filter.key === 'all' ? !activeFilter.date : activeFilter.date === filter.key) &&
                  styles.chipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* 정렬 버튼 */}
        <TouchableOpacity
          style={[styles.chip, styles.sortButton]}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.chipText}>
            ↕️ {sortOptions.find(s => s.key === sortType)?.label}
          </Text>
        </TouchableOpacity>

        {/* 상세 필터 버튼 */}
        <TouchableOpacity
          style={[styles.chip, styles.filterButton]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.chipText}>⚙️ 필터</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 정렬 모달 */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>정렬 방식</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  sortType === option.key && styles.modalOptionActive,
                ]}
                onPress={() => handleSortChange(option.key)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    sortType === option.key && styles.modalOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortType === option.key && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 상세 필터 모달 */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.modalContent, styles.filterModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>상세 필터</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetButton}>초기화</Text>
              </TouchableOpacity>
            </View>

            {/* 실력 레벨 필터 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>실력 레벨</Text>
              <View style={styles.filterChips}>
                {levelFilters.map((level) => (
                  <TouchableOpacity
                    key={level.key}
                    style={[
                      styles.filterChip,
                      activeFilter.level?.includes(level.key) && styles.filterChipActive,
                    ]}
                    onPress={() => handleLevelFilter(level.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilter.level?.includes(level.key) && styles.filterChipTextActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 술집 연계 필터 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>술집 연계</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilter.hasPub === true && styles.filterChipActive,
                  ]}
                  onPress={handlePubFilter}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter.hasPub === true && styles.filterChipTextActive,
                    ]}
                  >
                    🍺 술집 연계만
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 적용 버튼 */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: 'white',
  },
  sortButton: {
    backgroundColor: colors.bgTertiary,
    borderColor: colors.bgTertiary,
  },
  filterButton: {
    backgroundColor: colors.bgTertiary,
    borderColor: colors.bgTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resetButton: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionActive: {
    backgroundColor: colors.primary + '10',
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkMark: {
    fontSize: 18,
    color: colors.primary,
  },
  filterModalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: 'white',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});