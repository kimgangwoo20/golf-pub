import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  firestore,
  collection,
  query,
  where,
  limit,
  getDocs,
} from '@/services/firebase/firebaseConfig';

export const useCourseSearch = () => {
  const navigation = useNavigation<any>();
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ region: 'all', price: 'all' });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    searchCourses();
    // searchCourses는 컴포넌트 내 함수이지만 searchQuery, filters 변경 시에만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters]);

  const searchCourses = async () => {
    setLoading(true);
    try {
      const constraints: any[] = [];

      // 이름 검색
      if (searchQuery.trim()) {
        constraints.push(where('name', '>=', searchQuery.trim()));
        constraints.push(where('name', '<=', searchQuery.trim() + '\uf8ff'));
      }

      // 지역 필터
      if (filters.region !== 'all') {
        constraints.push(where('region', '==', filters.region));
      }

      constraints.push(limit(30));

      const q = query(collection(firestore, 'golfCourses'), ...constraints);
      const snapshot = await getDocs(q);

      const results = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          region: data.region || '',
          address: data.address || '',
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          greenFee: data.greenFee || 0,
          image: data.image || data.images?.[0] || '',
          holes: data.holes || 18,
        };
      });

      // 클라이언트 사이드 가격 필터
      let filtered = results;
      if (filters.price !== 'all') {
        if (filters.price === 'low') {
          filtered = results.filter((c: any) => c.greenFee < 100000);
        } else if (filters.price === 'mid') {
          filtered = results.filter((c: any) => c.greenFee >= 100000 && c.greenFee < 200000);
        } else if (filters.price === 'high') {
          filtered = results.filter((c: any) => c.greenFee >= 200000);
        }
      }

      setCourses(filtered);
    } catch (error: any) {
      console.error('골프장 검색 실패:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleFilterToggle = () => setShowFilters(!showFilters);
  const handleFilterApply = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilters(false);
  };
  const handleCoursePress = (courseId: string) => {
    navigation.navigate('GolfCourseDetail', { courseId });
  };

  return {
    courses,
    searchQuery,
    filters,
    loading,
    showFilters,
    handleSearch,
    handleFilterToggle,
    handleFilterApply,
    handleCoursePress,
  };
};
