// KakaoMapView.tsx - 카카오 지도 WebView 임베디드 컴포넌트
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

interface Marker {
  lat: number;
  lng: number;
  title: string;
}

interface KakaoMapViewProps {
  latitude: number;
  longitude: number;
  markers?: Marker[];
  height?: number;
  zoomLevel?: number;
  onMarkerPress?: (index: number) => void;
}

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY || '';

export const KakaoMapView: React.FC<KakaoMapViewProps> = ({
  latitude,
  longitude,
  markers = [],
  height = 200,
  zoomLevel = 3,
  onMarkerPress,
}) => {
  const html = useMemo(() => {
    const markersJs =
      markers.length > 0
        ? markers
            .map(
              (m, i) => `
          (function() {
            var marker = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(${m.lat}, ${m.lng}),
              map: map
            });
            var infowindow = new kakao.maps.InfoWindow({
              content: '<div style="padding:4px 8px;font-size:12px;white-space:nowrap;">${m.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}</div>'
            });
            infowindow.open(map, marker);
            kakao.maps.event.addListener(marker, 'click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', index: ${i} }));
            });
          })();`,
            )
            .join('\n')
        : `
          var marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(${latitude}, ${longitude}),
            map: map
          });`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false"></script>
  <script>
    kakao.maps.load(function() {
      var container = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(${latitude}, ${longitude}),
        level: ${zoomLevel}
      };
      var map = new kakao.maps.Map(container, options);
      ${markersJs}
    });
  </script>
</body>
</html>`;
  }, [latitude, longitude, markers, zoomLevel]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data.index);
      }
    } catch {
      // 파싱 실패 무시
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  webview: {
    flex: 1,
  },
});
