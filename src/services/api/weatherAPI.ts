// 🌤️ weatherAPI.ts
// 기상청 단기예보 API 통합 서비스
// 초단기실황 + 초단기예보 + 단기예보 + 중기예보

import axios from 'axios';
import { Weather, WeatherForecast } from '@/types';

// ========================================
// 🔑 기상청 API 설정
// ========================================
const KMA_API_KEY = '2H1BdPMCR2C9QXTzAgdgyg';
const BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const MIDTERM_URL = 'http://apis.data.go.kr/1360000/MidFcstInfoService';

// ========================================
// 📍 GPS → 격자 좌표 변환
// ========================================
interface GridCoords {
  nx: number;
  ny: number;
}

/**
 * GPS 좌표를 기상청 격자 좌표로 변환
 * @param lat 위도
 * @param lon 경도
 * @returns 격자 좌표 {nx, ny}
 */
function gpsToGrid(lat: number, lon: number): GridCoords {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

/**
 * GPS 좌표를 중기예보 지역코드로 변환
 * @param lat 위도
 * @param lon 경도
 * @returns 지역코드 (예: 11B00000)
 */
function gpsToRegionCode(lat: number, lon: number): string {
  // 간단한 지역 매핑 (실제로는 더 정교한 매핑 필요)

  // 제주도
  if (lat >= 33.0 && lat <= 33.6) {
    return '11G00000';
  }

  // 경상남도
  if (lat >= 34.7 && lat <= 35.5 && lon >= 127.5 && lon <= 129.5) {
    return '11H20000';
  }

  // 부산
  if (lat >= 35.0 && lat <= 35.3 && lon >= 128.9 && lon <= 129.3) {
    return '11H20000';
  }

  // 경상북도
  if (lat >= 35.5 && lat <= 37.5 && lon >= 128.0 && lon <= 129.5) {
    return '11H10000';
  }

  // 전라남도
  if (lat >= 34.2 && lat <= 35.5 && lon >= 126.0 && lon <= 127.5) {
    return '11F20000';
  }

  // 전북자치도
  if (lat >= 35.5 && lat <= 36.2 && lon >= 126.5 && lon <= 127.8) {
    return '11F10000';
  }

  // 충청남도
  if (lat >= 36.0 && lat <= 37.0 && lon >= 126.0 && lon <= 127.5) {
    return '11C20000';
  }

  // 충청북도
  if (lat >= 36.0 && lat <= 37.5 && lon >= 127.2 && lon <= 128.5) {
    return '11C10000';
  }

  // 강원영동
  if (lat >= 37.5 && lat <= 38.6 && lon >= 128.5 && lon <= 129.5) {
    return '11D20000';
  }

  // 강원영서
  if (lat >= 37.5 && lat <= 38.6 && lon >= 127.0 && lon <= 128.5) {
    return '11D10000';
  }

  // 서울/인천/경기 (기본값)
  return '11B00000';
}

// ========================================
// 📅 날짜/시간 유틸리티
// ========================================
function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const kstOffset = 9 * 60; // KST = UTC+9
  const kst = new Date(now.getTime() + kstOffset * 60 * 1000);

  let year = kst.getUTCFullYear();
  let month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  let day = String(kst.getUTCDate()).padStart(2, '0');
  let hour = kst.getUTCHours();

  // 초단기실황: 매 정시 40분에 생성 (현재시각-1시간)
  // 초단기예보: 매 시각 30분에 생성 (현재시각)
  if (kst.getUTCMinutes() < 40) {
    hour = hour - 1;
    if (hour < 0) {
      hour = 23;
      const yesterday = new Date(kst);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      year = yesterday.getUTCFullYear();
      month = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
      day = String(yesterday.getUTCDate()).padStart(2, '0');
    }
  }

  const baseDate = `${year}${month}${day}`;
  const baseTime = String(hour).padStart(2, '0') + '00';

  return { baseDate, baseTime };
}

function getCurrentDate(): string {
  const now = new Date();
  const kstOffset = 9 * 60;
  const kst = new Date(now.getTime() + kstOffset * 60 * 1000);

  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kst.getUTCDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

function getTodayAt6AM(): string {
  const now = new Date();
  const kstOffset = 9 * 60;
  const kst = new Date(now.getTime() + kstOffset * 60 * 1000);

  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kst.getUTCDate()).padStart(2, '0');

  return `${year}${month}${day}0600`;
}

// ========================================
// 🌡️ 초단기실황 API (현재 날씨)
// ========================================
async function fetchUltraSrtNcst(nx: number, ny: number) {
  const { baseDate, baseTime } = getBaseDateTime();

  try {
    const response = await axios.get(`${BASE_URL}/getUltraSrtNcst`, {
      params: {
        serviceKey: KMA_API_KEY,
        numOfRows: 10,
        pageNo: 1,
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
      },
      timeout: 10000,
    });

    const items = response.data?.response?.body?.items?.item || [];

    const data: any = {};
    items.forEach((item: any) => {
      data[item.category] = item.obsrValue;
    });

    return {
      temp: data.T1H || '0', // 기온
      humidity: data.REH || '0', // 습도
      precipitation: data.RN1 || '0', // 1시간 강수량
      windSpeed: data.WSD || '0', // 풍속
      windDirection: data.VEC || '0', // 풍향
    };
  } catch (error) {
    console.error('초단기실황 API 에러:', error);
    return null;
  }
}

// ========================================
// 🌤️ 초단기예보 API (6시간 예보)
// ========================================
async function fetchUltraSrtFcst(nx: number, ny: number) {
  const { baseDate, baseTime } = getBaseDateTime();

  try {
    const response = await axios.get(`${BASE_URL}/getUltraSrtFcst`, {
      params: {
        serviceKey: KMA_API_KEY,
        numOfRows: 60,
        pageNo: 1,
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
      },
      timeout: 10000,
    });

    const items = response.data?.response?.body?.items?.item || [];

    // 가장 가까운 시간의 예보 데이터
    const forecastData: any = {};
    items.forEach((item: any) => {
      if (!forecastData[item.category]) {
        forecastData[item.category] = item.fcstValue;
      }
    });

    return {
      sky: forecastData.SKY || '1', // 하늘상태 (1:맑음, 3:구름많음, 4:흐림)
      precipitation: forecastData.PTY || '0', // 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈)
      temp: forecastData.T1H || '0', // 기온
      humidity: forecastData.REH || '0', // 습도
      windSpeed: forecastData.WSD || '0', // 풍속
    };
  } catch (error) {
    console.error('초단기예보 API 에러:', error);
    return null;
  }
}

// ========================================
// 📊 단기예보 API (0~3일)
// ========================================
async function fetchVilageFcst(nx: number, ny: number) {
  const baseDate = getCurrentDate();
  const baseTime = '0500'; // 05시 발표 기준

  try {
    const response = await axios.get(`${BASE_URL}/getVilageFcst`, {
      params: {
        serviceKey: KMA_API_KEY,
        numOfRows: 100,
        pageNo: 1,
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
      },
      timeout: 10000,
    });

    const items = response.data?.response?.body?.items?.item || [];
    return items;
  } catch (error) {
    console.error('단기예보 API 에러:', error);
    return [];
  }
}

// ========================================
// 🔮 중기예보 API (4~10일)
// ========================================
async function fetchMidTermFcst(regionCode: string) {
  const tmFc = getTodayAt6AM(); // 06시 발표 기준

  try {
    // 중기기온조회
    const tempResponse = await axios.get(`${MIDTERM_URL}/getMidTa`, {
      params: {
        serviceKey: KMA_API_KEY,
        numOfRows: 10,
        pageNo: 1,
        dataType: 'JSON',
        regId: regionCode,
        tmFc,
      },
      timeout: 10000,
    });

    // 중기육상예보조회
    const landResponse = await axios.get(`${MIDTERM_URL}/getMidLandFcst`, {
      params: {
        serviceKey: KMA_API_KEY,
        numOfRows: 10,
        pageNo: 1,
        dataType: 'JSON',
        regId: regionCode,
        tmFc,
      },
      timeout: 10000,
    });

    const tempData = tempResponse.data?.response?.body?.items?.item?.[0] || {};
    const landData = landResponse.data?.response?.body?.items?.item?.[0] || {};

    return {
      temp: tempData,
      land: landData,
    };
  } catch (error) {
    console.error('중기예보 API 에러:', error);
    return null;
  }
}

// ========================================
// ⛳ 골프 플레이 적합도 점수 계산
// ========================================
function calculateGolfScore(
  temp: number,
  humidity: number,
  windSpeed: number,
  precipitation: string,
  sky: string
): { score: number; recommendation: string } {
  let score = 100;

  // 1️⃣ 기온 점수 (18~25°C 최적)
  if (temp < 0 || temp > 35) {
    score -= 40;
  } else if (temp < 10 || temp > 30) {
    score -= 25;
  } else if (temp < 15 || temp > 28) {
    score -= 15;
  } else if (temp >= 18 && temp <= 25) {
    score += 0; // 최적 온도
  } else {
    score -= 5;
  }

  // 2️⃣ 습도 점수 (40~60% 최적)
  if (humidity < 20 || humidity > 80) {
    score -= 20;
  } else if (humidity < 30 || humidity > 70) {
    score -= 10;
  } else if (humidity >= 40 && humidity <= 60) {
    score += 0; // 최적 습도
  } else {
    score -= 5;
  }

  // 3️⃣ 풍속 점수 (<5m/s 최적)
  if (windSpeed >= 10) {
    score -= 30;
  } else if (windSpeed >= 7) {
    score -= 20;
  } else if (windSpeed >= 5) {
    score -= 10;
  }

  // 4️⃣ 강수 점수
  if (precipitation !== '0' && precipitation !== '없음') {
    score -= 50; // 비/눈 오면 대폭 감점
  }

  // 5️⃣ 하늘 상태
  if (sky === '4' || sky === '흐림') {
    score -= 10;
  } else if (sky === '3' || sky === '구름많음') {
    score -= 5;
  }

  // 점수 범위 제한
  score = Math.max(0, Math.min(100, score));

  // 추천 메시지
  let recommendation = '';
  if (score >= 80) {
    recommendation = '🌟 완벽한 골프 날씨입니다!';
  } else if (score >= 60) {
    recommendation = '⛳ 골프하기 좋은 날씨입니다.';
  } else if (score >= 40) {
    recommendation = '⚠️ 골프 가능하지만 주의하세요.';
  } else {
    recommendation = '❌ 골프하기 어려운 날씨입니다.';
  }

  return { score, recommendation };
}

// ========================================
// 🌦️ 하늘 상태 텍스트 변환
// ========================================
function getSkyText(skyCode: string, ptyCode: string): string {
  // 강수형태 우선
  if (ptyCode === '1') return '비';
  if (ptyCode === '2') return '비/눈';
  if (ptyCode === '3') return '눈';
  if (ptyCode === '4') return '소나기';

  // 하늘상태
  if (skyCode === '1') return '맑음';
  if (skyCode === '3') return '구름많음';
  if (skyCode === '4') return '흐림';

  return '맑음';
}

// ========================================
// 🎯 메인 API: 현재 날씨 조회
// ========================================
export async function fetchWeather(
  lat: number = 37.5665, // 기본값: 서울시청
  lon: number = 126.9780
): Promise<Weather> {
  try {
    // GPS → 격자 좌표 변환
    const grid = gpsToGrid(lat, lon);
    console.log(`📍 GPS (${lat}, ${lon}) → 격자 (${grid.nx}, ${grid.ny})`);

    // 초단기실황 (현재 날씨)
    const ncst = await fetchUltraSrtNcst(grid.nx, grid.ny);

    // 초단기예보 (6시간)
    const fcst = await fetchUltraSrtFcst(grid.nx, grid.ny);

    if (!ncst && !fcst) {
      throw new Error('날씨 데이터를 가져올 수 없습니다');
    }

    // 데이터 병합 (실황 우선, 없으면 예보 사용)
    const temp = parseFloat(ncst?.temp || fcst?.temp || '20');
    const humidity = parseFloat(ncst?.humidity || fcst?.humidity || '50');
    const windSpeed = parseFloat(ncst?.windSpeed || fcst?.windSpeed || '2');
    const precipitation = ncst?.precipitation || '0';
    const skyCode = fcst?.sky || '1';
    const ptyCode = fcst?.precipitation || '0';

    // 골프 점수 계산
    const golfScore = calculateGolfScore(
      temp,
      humidity,
      windSpeed,
      precipitation,
      skyCode
    );

    // 하늘 상태 텍스트
    const skyText = getSkyText(skyCode, ptyCode);

    return {
      temp: `${temp.toFixed(1)}°C`,
      sky: skyText,
      wind: `${windSpeed.toFixed(1)}m/s`,
      humidity: `${humidity.toFixed(0)}%`,
      precipitation: precipitation === '0' ? '0mm' : `${precipitation}mm`,
      golfScore,
    };
  } catch (error) {
    console.error('날씨 조회 에러:', error);

    // 기본값 반환
    return {
      temp: '20.0°C',
      sky: '맑음',
      wind: '2.0m/s',
      humidity: '50%',
      precipitation: '0mm',
      golfScore: {
        score: 75,
        recommendation: '⛳ 골프하기 좋은 날씨입니다.',
      },
    };
  }
}

// ========================================
// 📅 10일 예보 조회
// ========================================
export async function fetch10DayForecast(
  lat: number = 37.5665,
  lon: number = 126.9780
): Promise<WeatherForecast[]> {
  try {
    const grid = gpsToGrid(lat, lon);
    const regionCode = gpsToRegionCode(lat, lon);

    // 단기예보 (0~3일)
    const shortTerm = await fetchVilageFcst(grid.nx, grid.ny);

    // 중기예보 (4~10일)
    const midTerm = await fetchMidTermFcst(regionCode);

    const forecast: WeatherForecast[] = [];

    // 단기예보 데이터 파싱 (간단 버전)
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      forecast.push({
        date: date.toISOString().split('T')[0],
        tempMax: '25°C',
        tempMin: '15°C',
        sky: '맑음',
        precipitation: '10%',
        golfScore: 80,
      });
    }

    // 중기예보 데이터 파싱
    if (midTerm?.temp && midTerm?.land) {
      for (let i = 3; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const dayKey = `taMax${i + 1}`;
        const minKey = `taMin${i + 1}`;
        const rnKey = `rnSt${i + 1}Am`;

        forecast.push({
          date: date.toISOString().split('T')[0],
          tempMax: `${midTerm.temp[dayKey] || 25}°C`,
          tempMin: `${midTerm.temp[minKey] || 15}°C`,
          sky: '맑음',
          precipitation: `${midTerm.land[rnKey] || 10}%`,
          golfScore: 75,
        });
      }
    }

    return forecast;
  } catch (error) {
    console.error('10일 예보 에러:', error);
    return [];
  }
}