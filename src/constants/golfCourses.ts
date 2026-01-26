// 🏌️ golfCourses.ts
// 전국 주요 골프장 GPS 좌표 데이터

export interface GolfCourseData {
  lat: number;
  lon: number;
  region: string;
  address?: string;
}

export const GOLF_COURSES: Record<string, GolfCourseData> = {
  // ========================================
  // 🏙️ 서울/인천/경기
  // ========================================
  '스카이72 골프클럽': {
    lat: 37.4467,
    lon: 126.4500,
    region: '인천 중구',
    address: '인천광역시 중구 운서동 2851',
  },
  '남서울 컨트리클럽': {
    lat: 37.3894,
    lon: 127.1219,
    region: '경기 성남',
    address: '경기도 성남시 분당구 판교로 550',
  },
  '레이크우드 컨트리클럽': {
    lat: 37.3325,
    lon: 127.2031,
    region: '경기 양평',
    address: '경기도 양평군 강하면 전수리',
  },
  '용인 컨트리클럽': {
    lat: 37.2420,
    lon: 127.1777,
    region: '경기 용인',
    address: '경기도 용인시 처인구 남사면',
  },
  '레이크사이드 컨트리클럽': {
    lat: 37.3564,
    lon: 126.9456,
    region: '경기 과천',
    address: '경기도 과천시 주암동',
  },
  '안양 베네스트': {
    lat: 37.3914,
    lon: 126.9269,
    region: '경기 안양',
    address: '경기도 안양시 만안구 석수동',
  },
  '골든비치 골프링크스': {
    lat: 37.3025,
    lon: 126.5319,
    region: '인천 옹진',
    address: '인천광역시 옹진군 영흥면',
  },
  '안성 베네스트': {
    lat: 37.0078,
    lon: 127.2797,
    region: '경기 안성',
    address: '경기도 안성시 죽산면',
  },

  // ========================================
  // 🏔️ 강원
  // ========================================
  '알펜시아 골프클럽': {
    lat: 37.6556,
    lon: 128.6703,
    region: '강원 평창',
    address: '강원도 평창군 대관령면 솔봉로 325',
  },
  '오크밸리 컨트리클럽': {
    lat: 37.4033,
    lon: 127.8178,
    region: '강원 원주',
    address: '강원도 원주시 지정면 오크밸리2길 58',
  },
  '엘리시안 강촌 컨트리클럽': {
    lat: 37.7500,
    lon: 128.3500,
    region: '강원 춘천',
    address: '강원도 춘천시 남산면 북한강변길',
  },
  '비발디파크 오션': {
    lat: 37.6483,
    lon: 127.6856,
    region: '강원 홍천',
    address: '강원도 홍천군 서면 한치골길 262',
  },
  '하이원 컨트리클럽': {
    lat: 37.2069,
    lon: 128.8594,
    region: '강원 정선',
    address: '강원도 정선군 고한읍 하이원길 424',
  },

  // ========================================
  // 🌊 제주
  // ========================================
  '나인브릿지': {
    lat: 33.3988,
    lon: 126.3194,
    region: '제주 서귀포',
    address: '제주특별자치도 서귀포시 안덕면 산록남로 1131',
  },
  '핀크스 골프클럽': {
    lat: 33.4356,
    lon: 126.9256,
    region: '제주 제주시',
    address: '제주특별자치도 제주시 구좌읍 해맞이해안로 2546',
  },
  '클럽나인 브릿지': {
    lat: 33.4800,
    lon: 126.9200,
    region: '제주 제주시',
    address: '제주특별자치도 제주시 애월읍',
  },
  '제주 레이크힐스': {
    lat: 33.3486,
    lon: 126.2597,
    region: '제주 서귀포',
    address: '제주특별자치도 서귀포시 안덕면',
  },
  '오라 컨트리클럽': {
    lat: 33.4872,
    lon: 126.4806,
    region: '제주 제주시',
    address: '제주특별자치도 제주시 오라이동',
  },

  // ========================================
  // 🌄 경상북도
  // ========================================
  '안동 컨트리클럽': {
    lat: 36.5684,
    lon: 128.7294,
    region: '경북 안동',
    address: '경상북도 안동시 풍천면',
  },
  '포항 컨트리클럽': {
    lat: 36.0190,
    lon: 129.3435,
    region: '경북 포항',
    address: '경상북도 포항시 북구 기계면',
  },
  '경주 신라 컨트리클럽': {
    lat: 35.8561,
    lon: 129.2244,
    region: '경북 경주',
    address: '경상북도 경주시 천북면',
  },
  '구미 컨트리클럽': {
    lat: 36.1192,
    lon: 128.3447,
    region: '경북 구미',
    address: '경상북도 구미시 산동면',
  },

  // ========================================
  // 🏖️ 경상남도
  // ========================================
  '남촌 컨트리클럽': {
    lat: 35.5383,
    lon: 129.3114,
    region: '경남 김해',
    address: '경상남도 김해시 생림면',
  },
  '통도 컨트리클럽': {
    lat: 35.4856,
    lon: 129.0606,
    region: '경남 양산',
    address: '경상남도 양산시 하북면',
  },
  '창원 컨트리클럽': {
    lat: 35.2278,
    lon: 128.6819,
    region: '경남 창원',
    address: '경상남도 창원시 의창구 동읍',
  },
  '거제 씨사이드 골프클럽': {
    lat: 34.8806,
    lon: 128.6219,
    region: '경남 거제',
    address: '경상남도 거제시 일운면',
  },

  // ========================================
  // 🌾 전라북도 (전북자치도)
  // ========================================
  '무주 리조트 골프클럽': {
    lat: 35.9064,
    lon: 127.7356,
    region: '전북 무주',
    address: '전북특별자치도 무주군 설천면 무설로 1482',
  },
  '전주 컨트리클럽': {
    lat: 35.8242,
    lon: 127.1489,
    region: '전북 전주',
    address: '전북특별자치도 전주시 완산구 효자동',
  },
  '익산 컨트리클럽': {
    lat: 35.9483,
    lon: 126.9575,
    region: '전북 익산',
    address: '전북특별자치도 익산시 왕궁면',
  },

  // ========================================
  // 🌳 전라남도
  // ========================================
  '여수 엑스포 골프클럽': {
    lat: 34.7397,
    lon: 127.7453,
    region: '전남 여수',
    address: '전라남도 여수시 소라면',
  },
  '무안 컨트리클럽': {
    lat: 34.9906,
    lon: 126.4819,
    region: '전남 무안',
    address: '전라남도 무안군 삼향읍',
  },
  '담양 리조트': {
    lat: 35.3208,
    lon: 126.9883,
    region: '전남 담양',
    address: '전라남도 담양군 금성면',
  },

  // ========================================
  // 🏛️ 충청남도
  // ========================================
  '솔모로 컨트리클럽': {
    lat: 36.7744,
    lon: 126.9283,
    region: '충남 당진',
    address: '충청남도 당진시 합덕읍',
  },
  '대천 컨트리클럽': {
    lat: 36.3553,
    lon: 126.6114,
    region: '충남 보령',
    address: '충청남도 보령시 천북면',
  },
  '천안 컨트리클럽': {
    lat: 36.8150,
    lon: 127.1539,
    region: '충남 천안',
    address: '충청남도 천안시 동남구 북면',
  },
  '아산 컨트리클럽': {
    lat: 36.7897,
    lon: 126.9856,
    region: '충남 아산',
    address: '충청남도 아산시 둔포면',
  },

  // ========================================
  // 🗻 충청북도
  // ========================================
  '청주 컨트리클럽': {
    lat: 36.6373,
    lon: 127.4897,
    region: '충북 청주',
    address: '충청북도 청주시 흥덕구 강내면',
  },
  '충주 컨트리클럽': {
    lat: 36.9708,
    lon: 127.9258,
    region: '충북 충주',
    address: '충청북도 충주시 앙성면',
  },
  '제천 컨트리클럽': {
    lat: 37.1322,
    lon: 128.1911,
    region: '충북 제천',
    address: '충청북도 제천시 봉양읍',
  },

  // ========================================
  // 🌆 부산/대구/광주
  // ========================================
  '부산 컨트리클럽': {
    lat: 35.2431,
    lon: 129.0819,
    region: '부산 기장',
    address: '부산광역시 기장군 정관읍',
  },
  '대구 컨트리클럽': {
    lat: 35.9022,
    lon: 128.6081,
    region: '대구 북구',
    address: '대구광역시 북구 동호동',
  },
  '광주 컨트리클럽': {
    lat: 35.1795,
    lon: 126.8526,
    region: '광주 광산',
    address: '광주광역시 광산구 본량동',
  },
};

// ========================================
// 🎯 유틸리티 함수
// ========================================

/**
 * 골프장 이름으로 좌표 조회
 * @param name 골프장 이름
 * @returns GPS 좌표 또는 null
 */
export function getGolfCourseCoords(name: string): GolfCourseData | null {
  return GOLF_COURSES[name] || null;
}

/**
 * 지역별 골프장 목록
 * @param region 지역명 (예: "경기", "제주")
 * @returns 해당 지역 골프장 배열
 */
export function getGolfCoursesByRegion(region: string): Array<{ name: string; data: GolfCourseData }> {
  return Object.entries(GOLF_COURSES)
    .filter(([_, data]) => data.region.includes(region))
    .map(([name, data]) => ({ name, data }));
}

/**
 * 전체 골프장 목록 (이름만)
 */
export function getAllGolfCourseNames(): string[] {
  return Object.keys(GOLF_COURSES);
}

/**
 * 골프장 개수
 */
export const TOTAL_GOLF_COURSES = Object.keys(GOLF_COURSES).length;

// ========================================
// 📊 골프장 통계
// ========================================
export const GOLF_COURSE_STATS = {
  total: TOTAL_GOLF_COURSES,
  regions: {
    '서울/인천/경기': getGolfCoursesByRegion('경기').length + getGolfCoursesByRegion('인천').length,
    '강원': getGolfCoursesByRegion('강원').length,
    '제주': getGolfCoursesByRegion('제주').length,
    '경북': getGolfCoursesByRegion('경북').length,
    '경남': getGolfCoursesByRegion('경남').length,
    '전북': getGolfCoursesByRegion('전북').length,
    '전남': getGolfCoursesByRegion('전남').length,
    '충북': getGolfCoursesByRegion('충북').length,
    '충남': getGolfCoursesByRegion('충남').length,
    '부산/대구/광주': getGolfCoursesByRegion('부산').length + getGolfCoursesByRegion('대구').length + getGolfCoursesByRegion('광주').length,
  },
};

// 콘솔 로그
console.log(`✅ ${TOTAL_GOLF_COURSES}개 골프장 좌표 로드 완료`);
console.log('지역별 골프장:', GOLF_COURSE_STATS.regions);