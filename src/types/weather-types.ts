// 🌤️ Weather Types
// weatherAPI.ts와 WeatherWidget.tsx 연동용 타입 정의

export interface Weather {
  temp: string;              // 온도 (예: "23.5°C")
  sky: string;               // 하늘 상태 (예: "맑음", "구름많음", "흐림", "비")
  wind: string;              // 풍속 (예: "3.2m/s")
  humidity: string;          // 습도 (예: "65%")
  precipitation: string;     // 강수량 (예: "0mm", "5.2mm")
  golfScore: {
    score: number;           // 골프 적합도 점수 (0~100)
    recommendation: string;  // 추천 메시지
  };
}

export interface WeatherForecast {
  date: string;              // 날짜 (YYYY-MM-DD)
  tempMax: string;           // 최고기온 (예: "25°C")
  tempMin: string;           // 최저기온 (예: "15°C")
  sky: string;               // 하늘상태
  precipitation: string;     // 강수확률 (예: "30%")
  golfScore: number;         // 골프 적합도 점수
}

// 기상청 API 응답 타입
export interface KMAApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        item: KMADataItem[];
      };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

export interface KMADataItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
  nx: number;
  ny: number;
  obsrValue?: string;
}

// GPS 좌표 타입
export interface GPSCoords {
  lat: number;
  lon: number;
}

// 격자 좌표 타입
export interface GridCoords {
  nx: number;
  ny: number;
}

// 골프장 정보 타입
export interface GolfCourse {
  id: string;
  name: string;
  location: GPSCoords;
  region: string;
  address: string;
}