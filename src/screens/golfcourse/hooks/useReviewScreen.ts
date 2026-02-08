import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const PAGE_SIZE = 10;

export const useReviewScreen = (courseId: string) => {
  const navigation = useNavigation<any>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);

  useEffect(() => {
    loadReviews();
  }, [courseId, filter, sort]);

  const loadReviews = async () => {
    if (!courseId) return;
    setLoading(true);
    lastDocRef.current = null;
    try {
      let query: any = firestore()
        .collection('golf_course_reviews')
        .where('courseId', '==', courseId);

      // 별점 필터
      if (filter !== 'all') {
        const ratingValue = parseInt(filter, 10);
        if (!isNaN(ratingValue)) {
          query = query.where('rating', '==', ratingValue);
        }
      }

      // 정렬
      if (sort === 'latest') {
        query = query.orderBy('createdAt', 'desc');
      } else if (sort === 'rating') {
        query = query.orderBy('rating', 'desc');
      } else if (sort === 'likes') {
        query = query.orderBy('likes', 'desc');
      }

      const snapshot = await query.limit(PAGE_SIZE).get();

      const reviewList = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          courseId: data.courseId,
          author: data.author || { id: '', name: '익명', image: '' },
          rating: data.rating || 0,
          content: data.content || '',
          images: data.images || [],
          likes: data.likes || 0,
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString?.('ko-KR') || '',
        };
      });

      setReviews(reviewList);
      setHasMore(snapshot.docs.length >= PAGE_SIZE);
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;

      // 통계 계산
      if (reviewList.length > 0) {
        const totalRating = reviewList.reduce((sum: number, r: any) => sum + r.rating, 0);
        setStats({
          avgRating: Math.round((totalRating / reviewList.length) * 10) / 10,
          totalReviews: reviewList.length,
        });
      }
    } catch (error: any) {
      console.error('리뷰 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => setFilter(newFilter);
  const handleSortChange = (newSort: string) => setSort(newSort);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading || !lastDocRef.current || !courseId) return;

    try {
      let query: any = firestore()
        .collection('golf_course_reviews')
        .where('courseId', '==', courseId);

      if (filter !== 'all') {
        const ratingValue = parseInt(filter, 10);
        if (!isNaN(ratingValue)) {
          query = query.where('rating', '==', ratingValue);
        }
      }

      if (sort === 'latest') {
        query = query.orderBy('createdAt', 'desc');
      } else if (sort === 'rating') {
        query = query.orderBy('rating', 'desc');
      } else if (sort === 'likes') {
        query = query.orderBy('likes', 'desc');
      }

      const snapshot = await query.startAfter(lastDocRef.current).limit(PAGE_SIZE).get();

      const moreReviews = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          courseId: data.courseId,
          author: data.author || { id: '', name: '익명', image: '' },
          rating: data.rating || 0,
          content: data.content || '',
          images: data.images || [],
          likes: data.likes || 0,
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString?.('ko-KR') || '',
        };
      });

      setReviews((prev) => [...prev, ...moreReviews]);
      setHasMore(snapshot.docs.length >= PAGE_SIZE);
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
    } catch (error: any) {
      console.error('추가 리뷰 로드 실패:', error);
    }
  };

  const handleWriteReview = () => {
    navigation.navigate('WriteReview', { courseId });
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
