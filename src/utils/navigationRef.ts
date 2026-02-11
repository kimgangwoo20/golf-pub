// navigationRef.ts - 네비게이션 참조 유틸리티
// 알림 딥링킹 등에서 네비게이션을 수행하기 위한 글로벌 참조

import { createNavigationContainerRef } from '@react-navigation/native';

// 네비게이션 컨테이너 참조 (App.tsx에서 연결)
export const navigationRef = createNavigationContainerRef<any>();

/**
 * 네비게이션 수행 (네비게이션 컨테이너가 준비된 경우에만)
 *
 * @param name - 화면 이름
 * @param params - 네비게이션 파라미터
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}
