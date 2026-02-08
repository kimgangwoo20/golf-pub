// FlatList 성능 최적화 유틸리티

import { Platform } from 'react-native';

/**
 * FlatList 공통 최적화 props
 * 모든 FlatList에 스프레드해서 사용
 *
 * 사용 예시:
 * <FlatList {...flatListOptimizedProps} data={data} renderItem={...} />
 */
export const flatListOptimizedProps = {
  // 화면 밖 렌더링 최소화
  windowSize: 5,
  // 초기 렌더링 항목 수
  initialNumToRender: 10,
  // 화면 밖 유지 항목 수
  maxToRenderPerBatch: 10,
  // 렌더링 배치 간 간격 (ms)
  updateCellsBatchingPeriod: 50,
  // 스크롤 이벤트 간격
  scrollEventThrottle: 16,
  // Android: 오버스크롤 제거
  ...(Platform.OS === 'android' ? { overScrollMode: 'never' as const } : {}),
  // 스크롤 인디케이터 숨김
  showsVerticalScrollIndicator: false,
  // viewability 콜백 대기시간 제거
  removeClippedSubviews: Platform.OS === 'android',
};

/**
 * 채팅 메시지 FlatList 최적화 props
 * inverted FlatList에 적합
 */
export const chatListOptimizedProps = {
  ...flatListOptimizedProps,
  windowSize: 7,
  initialNumToRender: 20,
  maxToRenderPerBatch: 15,
};

/**
 * getItemLayout 생성기 (고정 높이 아이템용)
 * FlatList의 스크롤 성능을 크게 개선
 *
 * 사용 예시:
 * <FlatList getItemLayout={createGetItemLayout(72)} />
 */
export const createGetItemLayout = (itemHeight: number, separatorHeight: number = 0) => {
  return (_data: any, index: number) => ({
    length: itemHeight,
    offset: (itemHeight + separatorHeight) * index,
    index,
  });
};

/**
 * keyExtractor 기본값 (id 기반)
 */
export const defaultKeyExtractor = (item: { id: string }) => item.id;
