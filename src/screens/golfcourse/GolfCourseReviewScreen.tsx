import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReviewHeader } from './components/ReviewHeader';
import { ReviewStats } from './components/ReviewStats';
import { ReviewFilters } from './components/ReviewFilters';
import { ReviewList } from './components/ReviewList';
import { WriteReviewButton } from './components/WriteReviewButton';
import { useReviewScreen } from './hooks/useReviewScreen';

interface Props {
  route: { params: { courseId: string; courseName: string } };
  navigation: any;
}

export const GolfCourseReviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { courseId, courseName } = route.params;
  const {
    reviews,
    stats,
    filter,
    sort,
    loading,
    refreshing,
    handleFilterChange,
    handleSortChange,
    handleRefresh,
    handleLoadMore,
    handleWriteReview,
  } = useReviewScreen(courseId);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ReviewHeader courseName={courseName} onBack={() => navigation.goBack()} />
      <ReviewStats stats={stats} />
      <ReviewFilters 
        activeFilter={filter}
        activeSort={sort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      <ReviewList
        reviews={reviews}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
      />
      <WriteReviewButton onPress={handleWriteReview} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
