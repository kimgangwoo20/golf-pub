// kakaoMap 서비스 테스트
import '../../__tests__/setup';

const { KakaoMapService } = require('../../src/services/kakao/kakaoMap');

describe('KakaoMapService', () => {
  describe('calculateDistance', () => {
    it('같은 위치면 거리가 0이다', () => {
      const distance = KakaoMapService.calculateDistance(37.5665, 126.978, 37.5665, 126.978);
      expect(distance).toBe(0);
    });

    it('서울시청 ↔ 강남역 약 8km', () => {
      const distance = KakaoMapService.calculateDistance(
        37.5665, 126.978,  // 서울시청
        37.4979, 127.0276, // 강남역
      );
      expect(distance).toBeGreaterThan(5);
      expect(distance).toBeLessThan(12);
    });

    it('거리는 항상 양수이다', () => {
      const distance = KakaoMapService.calculateDistance(37.5665, 126.978, 35.1796, 129.0756);
      expect(distance).toBeGreaterThan(0);
    });

    it('서울 ↔ 부산 약 320-330km', () => {
      const distance = KakaoMapService.calculateDistance(
        37.5665, 126.978,   // 서울시청
        35.1796, 129.0756,  // 부산역
      );
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(350);
    });
  });

  describe('getKakaoMapLink', () => {
    it('카카오맵 URL을 생성한다', () => {
      const place = {
        id: '1',
        place_name: '남서울CC',
        x: '127.1219',
        y: '37.3894',
        address_name: '경기도 성남시',
        road_address_name: '',
        category_name: '',
        category_group_code: '',
        category_group_name: '',
        phone: '',
        place_url: '',
        distance: '',
      };

      const link = KakaoMapService.getKakaoMapLink(place);
      expect(link).toContain('map.kakao.com');
      expect(link).toContain('37.3894');
      expect(link).toContain('127.1219');
    });
  });

  describe('getShareLink', () => {
    it('공유 URL을 반환한다', () => {
      const place = {
        id: '1',
        place_name: '테스트 골프장',
        place_url: 'https://map.kakao.com/place/12345',
        x: '127', y: '37',
        address_name: '', road_address_name: '',
        category_name: '', category_group_code: '',
        category_group_name: '', phone: '', distance: '',
      };

      const link = KakaoMapService.getShareLink(place);
      expect(link).toBe('https://map.kakao.com/place/12345');
    });
  });
});
