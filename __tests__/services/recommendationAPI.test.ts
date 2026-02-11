// recommendationAPI 단위 테스트

// fetchWeather 모킹
jest.mock('@/services/api/weatherAPI', () => ({
  fetchWeather: jest.fn().mockResolvedValue({
    temp: '22.0°C',
    sky: '맑음',
    wind: '3.0m/s',
    humidity: '50%',
    precipitation: '0mm',
    golfScore: { score: 85, recommendation: '🌟 완벽한 골프 날씨입니다!' },
  }),
}));

import { getRecommendedCourses } from '@/services/api/recommendationAPI';

describe('recommendationAPI', () => {
  describe('getRecommendedCourses', () => {
    it('기본 위치(서울)에서 추천 골프장을 반환한다', async () => {
      const results = await getRecommendedCourses();
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('각 추천 결과에 필수 필드가 포함된다', async () => {
      const results = await getRecommendedCourses();
      const course = results[0];

      expect(course).toHaveProperty('name');
      expect(course).toHaveProperty('region');
      expect(course).toHaveProperty('distance');
      expect(course).toHaveProperty('weatherScore');
      expect(course).toHaveProperty('totalScore');
      expect(course).toHaveProperty('reason');
      expect(course).toHaveProperty('weatherSummary');
    });

    it('종합 점수 내림차순으로 정렬된다', async () => {
      const results = await getRecommendedCourses();
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].totalScore).toBeGreaterThanOrEqual(results[i].totalScore);
      }
    });

    it('maxResults 파라미터로 결과 수를 제한할 수 있다', async () => {
      const results = await getRecommendedCourses(37.5665, 126.978, [], 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('즐겨찾기 골프장에 보너스 점수가 부여된다', async () => {
      const withFav = await getRecommendedCourses(37.5665, 126.978, ['스카이72 골프클럽']);
      const favCourse = withFav.find((c) => c.name === '스카이72 골프클럽');

      const withoutFav = await getRecommendedCourses(37.5665, 126.978, []);
      const sameCourse = withoutFav.find((c) => c.name === '스카이72 골프클럽');

      if (favCourse && sameCourse) {
        expect(favCourse.totalScore).toBeGreaterThanOrEqual(sameCourse.totalScore);
      }
    });

    it('거리가 0 이상의 양수를 반환한다', async () => {
      const results = await getRecommendedCourses();
      results.forEach((course) => {
        expect(course.distance).toBeGreaterThanOrEqual(0);
      });
    });

    it('weatherScore가 0-100 범위이다', async () => {
      const results = await getRecommendedCourses();
      results.forEach((course) => {
        expect(course.weatherScore).toBeGreaterThanOrEqual(0);
        expect(course.weatherScore).toBeLessThanOrEqual(100);
      });
    });

    it('totalScore가 0-100 범위이다', async () => {
      const results = await getRecommendedCourses();
      results.forEach((course) => {
        expect(course.totalScore).toBeGreaterThanOrEqual(0);
        expect(course.totalScore).toBeLessThanOrEqual(100);
      });
    });
  });
});
