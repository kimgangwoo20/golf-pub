import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from '@/services/firebase/firebaseConfig';

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
    // loadReviews는 컴포넌트 내 함수이지만 courseId, filter, sort 변경 시에만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, filter, sort]);

  const buildConstraints = (): any[] => {
    const constraints: any[] = [where('courseId', '==', courseId)];

    // 별점 필터
    if (filter !== 'all') {
      const ratingValue = parseInt(filter, 10);
      if (!isNaN(ratingValue)) {
        constraints.push(where('rating', '==', ratingValue));
      }
    }

    // 정렬
    if (sort === 'latest') {
      constraints.push(orderBy('createdAt', 'desc'));
    } else if (sort === 'rating') {
      constraints.push(orderBy('rating', 'desc'));
    } else if (sort === 'likes') {
      constraints.push(orderBy('likes', 'desc'));
    }

    return constraints;
  };

  const loadReviews = async () => {
    if (!courseId) return;
    setLoading(true);
    lastDocRef.current = null;
    try {
      const constraints = buildConstraints();
      const q = query(
        collection(firestore, 'golf_course_reviews'),
        ...constraints,
        limit(PAGE_SIZE),
      );

      const snapshot = await getDocs(q);

      const reviewList = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
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
      const constraints = buildConstraints();
      const q = query(
        collection(firestore, 'golf_course_reviews'),
        ...constraints,
        startAfter(lastDocRef.current),
        limit(PAGE_SIZE),
      );

      const snapshot = await getDocs(q);

      const moreReviews = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
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
