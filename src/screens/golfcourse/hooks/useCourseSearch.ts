import { useState, useEffect } from 'react';

export const useCourseSearch = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ region: 'all', price: 'all' });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    searchCourses();
  }, [searchQuery, filters]);

  const searchCourses = async () => {
    setLoading(true);
    // TODO: Firestore 또는 API에서 골프장 검색
    setLoading(false);
  };

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleFilterToggle = () => setShowFilters(!showFilters);
  const handleFilterApply = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilters(false);
  };
  const handleCoursePress = (courseId: string) => {
    // TODO: 골프장 상세 화면으로 이동
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
