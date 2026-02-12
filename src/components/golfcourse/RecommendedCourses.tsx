// ⛳ RecommendedCourses.tsx
// 홈 화면 골프장 추천 섹션

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '@/styles/theme';
import { getRecommendedCourses, RecommendedCourse } from '@/services/api/recommendationAPI';
import { useAuthStore } from '@/store/useAuthStore';
import { trackRecommendationClicked } from '@/services/firebase/firebaseAnalytics';

// 날씨 점수에 따른 색상
function getScoreColor(score: number): string {
  if (score >= 80) return colors.primary;
  if (score >= 60) return colors.tertiary;
  if (score >= 40) return colors.secondary;
  return colors.danger;
}

// 날씨 점수 뱃지 아이콘
function getScoreIcon(score: number): string {
  if (score >= 80) return '☀️';
  if (score >= 60) return '⛅';
  if (score >= 40) return '☁️';
  return '🌧️';
}

export const RecommendedCourses: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuthStore() as any;
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        // 유저 즐겨찾기 골프장 목록 추출
        const favorites: string[] = [];
        if (userProfile?.favoriteCourses) {
          for (const c of userProfile.favoriteCourses) {
            if (typeof c === 'string') {
              favorites.push(c);
            } else if (c?.name) {
              favorites.push(c.name);
            }
          }
        }
        if (userProfile?.favoriteGolfCourse) {
          favorites.push(userProfile.favoriteGolfCourse);
        }

        // 기본 위치: 서울 (추후 GPS 연동 가능)
        const recommended = await getRecommendedCourses(37.5665, 126.978, favorites, 5);
        setCourses(recommended);
      } catch (error) {
        console.error('추천 골프장 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [userProfile]);

  const handleCoursePress = (course: RecommendedCourse) => {
    trackRecommendationClicked(course.name, course.totalScore);
    navigation.navigate('GolfCourse', {
      screen: 'GolfCourseDetail',
      params: { courseName: course.name, courseRegion: course.region },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>추천 골프장</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GolfCourse')}>
          <Text style={styles.moreText}>더보기 →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {courses.map((course) => (
          <TouchableOpacity
            key={course.name}
            style={styles.card}
            onPress={() => handleCoursePress(course)}
            activeOpacity={0.7}
          >
            {/* 날씨 점수 뱃지 */}
            <View
              style={[styles.scoreBadge, { backgroundColor: getScoreColor(course.weatherScore) }]}
            >
              <Text style={styles.scoreIcon}>{getScoreIcon(course.weatherScore)}</Text>
              <Text style={styles.scoreText}>{course.weatherScore}</Text>
            </View>

            {/* 골프장 정보 */}
            <Text style={styles.courseName} numberOfLines={1}>
              {course.name}
            </Text>
            <Text style={styles.courseRegion} numberOfLines={1}>
              {course.region}
            </Text>

            {/* 거리 + 날씨 */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>거리</Text>
                <Text style={styles.infoValue}>
                  {course.distance >= 100
                    ? `${Math.round(course.distance)}km`
                    : `${course.distance}km`}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>날씨</Text>
                <Text style={[styles.infoValue, { color: getScoreColor(course.weatherScore) }]}>
                  {course.weatherSummary}
                </Text>
              </View>
            </View>

            {/* 추천 이유 */}
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonText} numberOfLines={1}>
                {course.reason}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  moreText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: 180,
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 4,
    marginBottom: spacing.sm,
  },
  scoreIcon: {
    fontSize: 12,
  },
  scoreText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  courseName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  courseRegion: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  reasonContainer: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  reasonText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
