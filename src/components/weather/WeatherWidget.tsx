// 🌤️ WeatherWidget.tsx
// 골프 날씨 위젯 컴포넌트

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '@/styles/theme';
import { fetchWeather } from '@/services/api/weatherAPI';
import { Weather } from '@/types';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeather();
      setWeather(data);
    } catch (err) {
      console.error('날씨 로딩 실패:', err);
      setError('날씨 정보를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string): string => {
    if (condition.includes('맑음')) return '☀️';
    if (condition.includes('흐림')) return '☁️';
    if (condition.includes('비')) return '🌧️';
    if (condition.includes('눈')) return '❄️';
    return '🌤️';
  };

  const getGolfScoreColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.danger;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '날씨 정보 없음'}</Text>
        <TouchableOpacity onPress={loadWeather} style={styles.retryBtn}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const golfScoreColor = getGolfScoreColor(weather.golfScore.score);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.widget}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>⛳ 오늘의 골프 날씨</Text>
          <Text style={styles.weatherIcon}>{getWeatherIcon(weather.sky)}</Text>
        </View>

        {/* 날씨 정보 그리드 */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>🌡️ 기온</Text>
            <Text style={styles.value}>{weather.temp}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>💨 바람</Text>
            <Text style={styles.value}>{weather.wind}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>💧 습도</Text>
            <Text style={styles.value}>{weather.humidity}</Text>
          </View>
        </View>

        {/* 골프 조건 점수 */}
        <View style={[styles.scoreContainer, { backgroundColor: `${golfScoreColor}20` }]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreTitle, { color: golfScoreColor }]}>골프 지수</Text>
            <View style={[styles.scoreBadge, { backgroundColor: golfScoreColor }]}>
              <Text style={styles.scoreBadgeText}>{weather.golfScore.score}점</Text>
            </View>
          </View>
          <Text style={styles.recommendation}>{weather.golfScore.recommendation}</Text>
        </View>

        {/* 강수량 (있을 경우) */}
        {weather.precipitation && parseFloat(weather.precipitation) > 0 && (
          <View style={styles.precipitationWarning}>
            <Text style={styles.warningIcon}>☔</Text>
            <Text style={styles.warningText}>강수량: {weather.precipitation}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // 로딩
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },

  // 에러
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'white',
  },

  // 위젯
  widget: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  weatherIcon: {
    fontSize: 36,
  },

  // 정보 그리드
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  infoItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: 'white',
  },

  // 골프 점수
  scoreContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scoreTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  scoreBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  recommendation: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: 'white',
  },

  // 강수량 경고
  precipitationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: 'white',
    fontWeight: fontWeight.semibold,
  },
});
