// 🌤️ Weather Types
// weatherAPI.ts와 WeatherWidget.tsx 연동용 타입 정의

export interface Weather {
  temp: string; // 온도 (예: "23.5°C")
  sky: string; // 하늘 상태 (예: "맑음", "구름많음", "흐림", "비")
  wind: string; // 풍속 (예: "3.2m/s")
  humidity: string; // 습도 (예: "65%")
  precipitation: string; // 강수량 (예: "0mm", "5.2mm")
  golfScore: {
    score: number; // 골프 적합도 점수 (0~100)
    recommendation: string; // 추천 메시지
  };
}

export interface WeatherForecast {
  date: string; // 날짜 (YYYY-MM-DD)
  tempMax: string; // 최고기온 (예: "25°C")
  tempMin: string; // 최저기온 (예: "15°C")
  sky: string; // 하늘상태
  precipitation: string; // 강수확률 (예: "30%")
  golfScore: number; // 골프 적합도 점수
}

// GPS 좌표 타입
export interface GPSCoords {
  lat: number;
  lon: number;
}

// 골프장 정보 타입
export interface GolfCourse {
  id: string;
  name: string;
  location: GPSCoords;
  region: string;
  address: string;
}

// Open-Meteo API 응답 타입
export interface OpenMeteoCurrentResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
  };
}

export interface OpenMeteoDailyResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
}

export interface OpenMeteoHourlyResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    precipitation_probability: number[];
  };
}

// WMO 날씨 코드 참조
// https://open-meteo.com/en/docs
// 0: Clear sky (맑음)
// 1, 2, 3: Mainly clear, partly cloudy, overcast (대체로 맑음, 구름조금, 흐림)
// 45, 48: Fog (안개)
// 51, 53, 55: Drizzle (이슬비)
// 56, 57: Freezing Drizzle (진눈깨비)
// 61, 63, 65: Rain (비)
// 66, 67: Freezing Rain (진눈깨비)
// 71, 73, 75, 77: Snow (눈)
// 80, 81, 82: Rain showers (소나기)
// 85, 86: Snow showers (눈보라)
// 95, 96, 99: Thunderstorm (뇌우)
