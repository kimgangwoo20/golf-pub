// 🗺️ kakaoMap.ts
// 카카오맵 서비스 - 골프장 검색 및 지도 표시

import { Platform } from 'react-native';

/**
 * 카카오맵 서비스
 *
 * 기능:
 * - 골프장 키워드 검색
 * - 좌표 기반 주변 검색
 * - 거리 계산
 * - 경로 안내
 *
 * 사용 예시:
 * ```typescript
 * import { KakaoMapService } from './services/kakao/kakaoMap';
 *
 * // 골프장 검색
 * const results = await KakaoMapService.searchGolfCourses('서울');
 *
 * // 거리 계산
 * const distance = KakaoMapService.calculateDistance(lat1, lng1, lat2, lng2);
 * ```
 */

// Kakao REST API 키 (환경 변수로 설정)
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '';

/**
 * 장소 검색 결과 인터페이스
 */
export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  place_url: string;
  distance: string;
}

/**
 * 검색 응답 인터페이스
 */
export interface KakaoSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoPlace[];
}

/**
 * 좌표 인터페이스
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * 카카오맵 서비스 클래스
 */
class KakaoMapServiceClass {
  private readonly baseUrl = 'https://dapi.kakao.com/v2/local';

  /**
   * 골프장 키워드 검색
   *
   * @param query 검색어 (예: "서울", "강남", "용인")
   * @param page 페이지 번호 (1-45)
   * @param size 페이지당 결과 개수 (1-15)
   * @returns 검색 결과 배열
   */
  async searchGolfCourses(
    query: string,
    page: number = 1,
    size: number = 15,
  ): Promise<KakaoPlace[]> {
    try {
      const searchQuery = `${query} 골프장`;
      const url = `${this.baseUrl}/search/keyword.json?query=${encodeURIComponent(searchQuery)}&page=${page}&size=${size}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: KakaoSearchResponse = await response.json();

      return data.documents;
    } catch (error: any) {
      console.error('❌ 골프장 검색 실패:', error);

      if (error.message?.includes('401')) {
        throw new Error('카카오 API 키가 유효하지 않습니다. 환경 변수를 확인해주세요.');
      } else if (error.message?.includes('network')) {
        throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      }

      throw error;
    }
  }

  /**
   * 좌표 기반 주변 골프장 검색
   *
   * @param latitude 위도
   * @param longitude 경도
   * @param radius 반경 (미터, 기본 20000m = 20km)
   * @param page 페이지 번호 (1-45)
   * @param size 페이지당 결과 개수 (1-15)
   * @returns 검색 결과 배열
   */
  async searchNearbyGolfCourses(
    latitude: number,
    longitude: number,
    radius: number = 20000,
    page: number = 1,
    size: number = 15,
  ): Promise<KakaoPlace[]> {
    try {
      const url = `${this.baseUrl}/search/keyword.json?query=골프장&x=${longitude}&y=${latitude}&radius=${radius}&page=${page}&size=${size}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: KakaoSearchResponse = await response.json();

      // 거리순 정렬 (가까운 순)
      const sorted = data.documents.sort((a, b) => {
        const distA = parseFloat(a.distance) || 0;
        const distB = parseFloat(b.distance) || 0;
        return distA - distB;
      });

      return sorted;
    } catch (error: any) {
      console.error('❌ 주변 골프장 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 주소로 좌표 검색 (지오코딩)
   *
   * @param address 주소 (예: "서울특별시 강남구 테헤란로 152")
   * @returns 좌표 또는 null
   */
  async getCoordinatesFromAddress(address: string): Promise<Coordinates | null> {
    try {
      const url = `${this.baseUrl}/search/address.json?query=${encodeURIComponent(address)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.documents.length === 0) {
        return null;
      }

      const doc = data.documents[0];
      const coordinates = {
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
      };

      return coordinates;
    } catch (error) {
      console.error('❌ 주소 → 좌표 변환 실패:', error);
      return null;
    }
  }

  /**
   * 좌표로 주소 검색 (역지오코딩)
   *
   * @param latitude 위도
   * @param longitude 경도
   * @returns 주소 또는 null
   */
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/geo/coord2address.json?x=${longitude}&y=${latitude}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.documents.length === 0) {
        return null;
      }

      const doc = data.documents[0];
      const address = doc.road_address?.address_name || doc.address?.address_name || '';

      return address;
    } catch (error) {
      console.error('❌ 좌표 → 주소 변환 실패:', error);
      return null;
    }
  }

  /**
   * 두 지점 간 거리 계산 (Haversine 공식)
   *
   * @param lat1 지점1 위도
   * @param lng1 지점1 경도
   * @param lat2 지점2 위도
   * @param lng2 지점2 경도
   * @returns 거리 (킬로미터)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 지구 반지름 (km)

    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // 소수점 2자리
  }

  /**
   * 각도를 라디안으로 변환
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 거리 포맷팅 (km 또는 m)
   *
   * @param meters 거리 (미터)
   * @returns 포맷된 문자열 (예: "1.5km", "850m")
   */
  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.round(meters)}m`;
  }

  /**
   * 카카오맵 앱으로 길찾기
   *
   * @param place 목적지 장소 정보
   * @param currentLocation 현재 위치 (선택)
   */
  async openNavigation(place: KakaoPlace, _currentLocation?: Coordinates): Promise<void> {
    try {
      const { place_name, x, y } = place;

      // 카카오내비 딥링크
      const kakaoNavUrl = `kakaomap://route?ep=${y},${x}&by=CAR`;

      // 카카오맵 딥링크 (대체)
      const kakaoMapUrl = `kakaomap://look?p=${y},${x}`;

      // 웹 URL (모바일 브라우저에서 앱으로 자동 전환)
      const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place_name)},${y},${x}`;

      if (Platform.OS === 'ios') {
        // iOS: 카카오내비 → 카카오맵 → 웹
        const { Linking } = await import('react-native');

        const canOpen = await Linking.canOpenURL(kakaoNavUrl);
        if (canOpen) {
          await Linking.openURL(kakaoNavUrl);
        } else {
          const canOpenMap = await Linking.canOpenURL(kakaoMapUrl);
          if (canOpenMap) {
            await Linking.openURL(kakaoMapUrl);
          } else {
            await Linking.openURL(webUrl);
          }
        }
      } else {
        // Android: 인텐트 사용
        const { Linking } = await import('react-native');

        try {
          await Linking.openURL(kakaoNavUrl);
        } catch {
          try {
            await Linking.openURL(kakaoMapUrl);
          } catch {
            await Linking.openURL(webUrl);
          }
        }
      }
    } catch (error) {
      console.error('❌ 길찾기 실패:', error);
      throw new Error('길찾기를 실행할 수 없습니다. 카카오맵 앱을 설치해주세요.');
    }
  }

  /**
   * 카카오맵 웹 링크 생성
   *
   * @param place 장소 정보
   * @returns 카카오맵 URL
   */
  getKakaoMapLink(place: KakaoPlace): string {
    const { place_name, x, y } = place;
    return `https://map.kakao.com/link/map/${encodeURIComponent(place_name)},${y},${x}`;
  }

  /**
   * 장소 공유 링크 생성
   *
   * @param place 장소 정보
   * @returns 공유 URL
   */
  getShareLink(place: KakaoPlace): string {
    return place.place_url;
  }
}

// 싱글톤 인스턴스 export
export const KakaoMapService = new KakaoMapServiceClass();

/**
 * 환경 변수 설정 (.env 파일):
 *
 * EXPO_PUBLIC_KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
 *
 * Kakao Developers에서 발급:
 * 1. https://developers.kakao.com
 * 2. 내 애플리케이션 → 앱 키 → REST API 키 복사
 */

/**
 * 사용 예시:
 *
 * ```typescript
 * import { KakaoMapService } from './services/kakao/kakaoMap';
 *
 * // 1. 골프장 검색
 * const results = await KakaoMapService.searchGolfCourses('서울');
 * console.log(`검색 결과: ${results.length}개`);
 *
 * // 2. 주변 골프장 검색
 * const nearby = await KakaoMapService.searchNearbyGolfCourses(37.5665, 126.9780);
 *
 * // 3. 거리 계산
 * const distance = KakaoMapService.calculateDistance(
 *   37.5665, 126.9780, // 서울시청
 *   37.5133, 127.0592  // 강남역
 * );
 * console.log(`거리: ${distance}km`);
 *
 * // 4. 길찾기
 * await KakaoMapService.openNavigation(results[0]);
 *
 * // 5. 카카오맵 링크
 * const link = KakaoMapService.getKakaoMapLink(results[0]);
 * ```
 */
