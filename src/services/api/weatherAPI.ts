// 🌤️ weatherAPI.ts
// Open-Meteo API 연동 날씨 서비스
// https://open-meteo.com/en/docs

import axios from 'axios';
import { Weather, WeatherForecast } from '@/types';

// ========================================
// 🔑 Open-Meteo API 설정
// ========================================
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// ========================================
// 📊 WMO 날씨 코드 → 텍스트 변환
// ========================================
function getWeatherText(code: number): string {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return '맑음';
  if (code === 1) return '대체로 맑음';
  if (code === 2) return '구름조금';
  if (code === 3) return '흐림';
  if (code >= 45 && code <= 48) return '안개';
  if (code >= 51 && code <= 55) return '이슬비';
  if (code >= 56 && code <= 57) return '진눈깨비';
  if (code >= 61 && code <= 65) return '비';
  if (code >= 66 && code <= 67) return '진눈깨비';
  if (code >= 71 && code <= 77) return '눈';
  if (code >= 80 && code <= 82) return '소나기';
  if (code >= 85 && code <= 86) return '눈보라';
  if (code >= 95 && code <= 99) return '뇌우';
  return '맑음';
}

// ========================================
// 🌧️ 강수 여부 확인
// ========================================
function isPrecipitation(code: number): boolean {
  // 비, 눈, 소나기 등 강수가 있는 코드
  return code >= 51;
}

// ========================================
// ⛳ 골프 플레이 적합도 점수 계산
// ========================================
function calculateGolfScore(
  temp: number,
  humidity: number,
  windSpeed: number,
  weatherCode: number
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

  // 4️⃣ 날씨 상태 점수
  if (isPrecipitation(weatherCode)) {
    score -= 50; // 비/눈 오면 대폭 감점
  } else if (weatherCode === 3) {
    score -= 10; // 흐림
  } else if (weatherCode === 2) {
    score -= 5; // 구름조금
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
// 🎯 메인 API: 현재 날씨 조회
// ========================================
export async function fetchWeather(
  lat: number = 37.5665, // 기본값: 서울시청
  lon: number = 126.978
): Promise<Weather> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'weather_code',
          'wind_speed_10m',
          'precipitation',
        ].join(','),
        timezone: 'Asia/Seoul',
      },
      timeout: 10000,
    });

    const current = response.data?.current;

    if (!current) {
      throw new Error('날씨 데이터를 가져올 수 없습니다');
    }

    const temp = current.temperature_2m ?? 20;
    const humidity = current.relative_humidity_2m ?? 50;
    const windSpeed = current.wind_speed_10m ?? 2;
    const weatherCode = current.weather_code ?? 0;
    const precipitation = current.precipitation ?? 0;

    // 골프 점수 계산
    const golfScore = calculateGolfScore(temp, humidity, windSpeed, weatherCode);

    // 하늘 상태 텍스트
    const skyText = getWeatherText(weatherCode);

    return {
      temp: `${temp.toFixed(1)}°C`,
      sky: skyText,
      wind: `${windSpeed.toFixed(1)}m/s`,
      humidity: `${humidity.toFixed(0)}%`,
      precipitation: precipitation === 0 ? '0mm' : `${precipitation.toFixed(1)}mm`,
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
  lon: number = 126.978
): Promise<WeatherForecast[]> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_probability_max',
          'wind_speed_10m_max',
        ].join(','),
        timezone: 'Asia/Seoul',
        forecast_days: 10,
      },
      timeout: 10000,
    });

    const daily = response.data?.daily;

    if (!daily || !daily.time) {
      throw new Error('예보 데이터를 가져올 수 없습니다');
    }

    const forecast: WeatherForecast[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      const tempMax = daily.temperature_2m_max?.[i] ?? 25;
      const tempMin = daily.temperature_2m_min?.[i] ?? 15;
      const weatherCode = daily.weather_code?.[i] ?? 0;
      const precipProb = daily.precipitation_probability_max?.[i] ?? 0;
      const windSpeed = daily.wind_speed_10m_max?.[i] ?? 2;

      // 일별 골프 점수 계산 (평균 온도, 예상 습도 사용)
      const avgTemp = (tempMax + tempMin) / 2;
      const { score } = calculateGolfScore(avgTemp, 50, windSpeed, weatherCode);

      forecast.push({
        date: daily.time[i],
        tempMax: `${tempMax.toFixed(0)}°C`,
        tempMin: `${tempMin.toFixed(0)}°C`,
        sky: getWeatherText(weatherCode),
        precipitation: `${precipProb}%`,
        golfScore: score,
      });
    }

    return forecast;
  } catch (error) {
    console.error('10일 예보 에러:', error);

    // 빈 배열 대신 기본 예보 반환
    const forecast: WeatherForecast[] = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        tempMax: '25°C',
        tempMin: '15°C',
        sky: '맑음',
        precipitation: '10%',
        golfScore: 75,
      });
    }
    return forecast;
  }
}

// ========================================
// 🕐 시간별 예보 조회 (추가 기능)
// ========================================
export async function fetchHourlyForecast(
  lat: number = 37.5665,
  lon: number = 126.978,
  hours: number = 24
): Promise<
  Array<{
    time: string;
    temp: string;
    sky: string;
    precipitation: string;
    golfScore: number;
  }>
> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'weather_code',
          'wind_speed_10m',
          'precipitation_probability',
        ].join(','),
        timezone: 'Asia/Seoul',
        forecast_hours: hours,
      },
      timeout: 10000,
    });

    const hourly = response.data?.hourly;

    if (!hourly || !hourly.time) {
      return [];
    }

    const forecast = [];
    const limit = Math.min(hours, hourly.time.length);

    for (let i = 0; i < limit; i++) {
      const temp = hourly.temperature_2m?.[i] ?? 20;
      const humidity = hourly.relative_humidity_2m?.[i] ?? 50;
      const weatherCode = hourly.weather_code?.[i] ?? 0;
      const windSpeed = hourly.wind_speed_10m?.[i] ?? 2;
      const precipProb = hourly.precipitation_probability?.[i] ?? 0;

      const { score } = calculateGolfScore(temp, humidity, windSpeed, weatherCode);

      forecast.push({
        time: hourly.time[i],
        temp: `${temp.toFixed(1)}°C`,
        sky: getWeatherText(weatherCode),
        precipitation: `${precipProb}%`,
        golfScore: score,
      });
    }

    return forecast;
  } catch (error) {
    console.error('시간별 예보 에러:', error);
    return [];
  }
}
