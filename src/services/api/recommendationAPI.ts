// ⛳ recommendationAPI.ts
// 골프장 추천 시스템 - 날씨/거리/선호도 기반 추천

import { GOLF_COURSES, GolfCourseData } from '@/constants/golfCourses';
import { fetchWeather } from '@/services/api/weatherAPI';

// 추천 골프장 결과 타입
export interface RecommendedCourse {
  name: string;
  region: string;
  address?: string;
  lat: number;
  lon: number;
  distance: number; // km
  weatherScore: number; // 0-100
  totalScore: number; // 종합 점수
  reason: string; // 추천 이유
  weatherSummary: string; // 날씨 요약
}

// Haversine 공식으로 두 좌표 간 거리 계산 (km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 거리 점수 계산 (가까울수록 높은 점수)
function calculateDistanceScore(distanceKm: number): number {
  if (distanceKm <= 20) return 100;
  if (distanceKm <= 40) return 85;
  if (distanceKm <= 60) return 70;
  if (distanceKm <= 100) return 55;
  if (distanceKm <= 150) return 40;
  if (distanceKm <= 200) return 25;
  return 10;
}

// 추천 이유 생성
function generateReason(
  weatherScore: number,
  distanceKm: number,
  isFavorite: boolean,
): string {
  const reasons: string[] = [];

  if (isFavorite) {
    reasons.push('자주 가는 골프장');
  }

  if (weatherScore >= 80) {
    reasons.push('날씨 최적');
  } else if (weatherScore >= 60) {
    reasons.push('날씨 좋음');
  }

  if (distanceKm <= 30) {
    reasons.push('가까운 거리');
  } else if (distanceKm <= 60) {
    reasons.push('적당한 거리');
  }

  return reasons.length > 0 ? reasons.join(' · ') : '추천 골프장';
}

// 날씨 요약 텍스트 생성
function getWeatherLabel(score: number): string {
  if (score >= 80) return '골프 최적';
  if (score >= 60) return '골프 적합';
  if (score >= 40) return '보통';
  return '비추천';
}

// 메인 추천 함수: 사용자 위치 기반 골프장 추천
export async function getRecommendedCourses(
  userLat: number = 37.5665, // 기본값: 서울
  userLon: number = 126.978,
  favoriteCourseNames: string[] = [],
  maxResults: number = 5,
): Promise<RecommendedCourse[]> {
  const courseEntries = Object.entries(GOLF_COURSES);
  const scoredCourses: RecommendedCourse[] = [];

  // 1. 각 골프장의 거리 계산 + 가까운 순 정렬 후 상위 15개만 날씨 조회
  const coursesWithDistance = courseEntries.map(([name, data]: [string, GolfCourseData]) => ({
    name,
    data,
    distance: calculateDistance(userLat, userLon, data.lat, data.lon),
  }));

  // 즐겨찾기 골프장은 항상 포함
  const favorites = coursesWithDistance.filter((c) =>
    favoriteCourseNames.some((f) => c.name.includes(f) || f.includes(c.name)),
  );
  const nonFavorites = coursesWithDistance
    .filter((c) => !favoriteCourseNames.some((f) => c.name.includes(f) || f.includes(c.name)))
    .sort((a, b) => a.distance - b.distance);

  // 즐겨찾기 + 가까운 순으로 상위 15개 선택 (API 호출 최소화)
  const candidateSet = new Set<string>();
  const candidates: typeof coursesWithDistance = [];

  for (const fav of favorites) {
    if (!candidateSet.has(fav.name)) {
      candidateSet.add(fav.name);
      candidates.push(fav);
    }
  }
  for (const c of nonFavorites) {
    if (candidates.length >= 15) break;
    if (!candidateSet.has(c.name)) {
      candidateSet.add(c.name);
      candidates.push(c);
    }
  }

  // 2. 후보 골프장들의 날씨 병렬 조회
  const weatherResults = await Promise.allSettled(
    candidates.map((c) => fetchWeather(c.data.lat, c.data.lon)),
  );

  // 3. 종합 점수 계산
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const weatherResult = weatherResults[i];

    let weatherScore = 70; // 기본값
    if (weatherResult.status === 'fulfilled') {
      weatherScore = weatherResult.value.golfScore.score;
    }

    const distanceScore = calculateDistanceScore(candidate.distance);
    const isFavorite = favoriteCourseNames.some(
      (f) => candidate.name.includes(f) || f.includes(candidate.name),
    );
    const favoriteBonus = isFavorite ? 15 : 0;

    // 종합 점수: 날씨 40% + 거리 40% + 즐겨찾기 보너스 20%
    const totalScore = Math.round(
      weatherScore * 0.4 + distanceScore * 0.4 + favoriteBonus + (isFavorite ? 0 : 5),
    );

    scoredCourses.push({
      name: candidate.name,
      region: candidate.data.region,
      address: candidate.data.address,
      lat: candidate.data.lat,
      lon: candidate.data.lon,
      distance: Math.round(candidate.distance * 10) / 10,
      weatherScore,
      totalScore: Math.min(100, totalScore),
      reason: generateReason(weatherScore, candidate.distance, isFavorite),
      weatherSummary: getWeatherLabel(weatherScore),
    });
  }

  // 4. 종합 점수 내림차순 정렬 후 상위 N개 반환
  return scoredCourses
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, maxResults);
}
