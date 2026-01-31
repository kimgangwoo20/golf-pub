import { useState, useEffect } from 'react';

export const useReviewScreen = (courseId: string) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [courseId, filter, sort]);

  const loadReviews = async () => {
    setLoading(true);
    // TODO: Firestore에서 리뷰 로드
    setLoading(false);
  };

  const handleFilterChange = (newFilter: string) => setFilter(newFilter);
  const handleSortChange = (newSort: string) => setSort(newSort);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    // TODO: 페이지네이션
  };

  const handleWriteReview = () => {
    // TODO: 리뷰 작성 화면으로 이동
  };

  return {
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
  };
};
