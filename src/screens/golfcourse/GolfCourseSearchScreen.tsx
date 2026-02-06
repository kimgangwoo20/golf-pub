import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchHeader } from './components/SearchHeader';
import { FilterSheet } from './components/FilterSheet';
import { CourseList } from './components/CourseList';
import { useCourseSearch } from './hooks/useCourseSearch';

export const GolfCourseSearchScreen = ({ navigation }: any) => {
  const {
    courses,
    searchQuery,
    filters,
    loading,
    showFilters,
    handleSearch,
    handleFilterToggle,
    handleFilterApply,
    handleCoursePress,
  } = useCourseSearch();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <SearchHeader
        query={searchQuery}
        onSearch={handleSearch}
        onFilterPress={handleFilterToggle}
      />
      <CourseList
        courses={courses}
        loading={loading}
        onCoursePress={handleCoursePress}
      />
      <FilterSheet
        visible={showFilters}
        filters={filters}
        onClose={handleFilterToggle}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
