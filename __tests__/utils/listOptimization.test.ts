// listOptimization 유틸리티 테스트

describe('listOptimization', () => {
  const {
    flatListOptimizedProps,
    chatListOptimizedProps,
    createGetItemLayout,
    defaultKeyExtractor,
  } = require('../../src/utils/listOptimization');

  describe('flatListOptimizedProps', () => {
    it('최적화 속성을 반환한다', () => {
      const props = flatListOptimizedProps;
      expect(props).toHaveProperty('removeClippedSubviews');
      expect(props).toHaveProperty('maxToRenderPerBatch');
      expect(props).toHaveProperty('windowSize');
      expect(props.removeClippedSubviews).toBe(true);
    });

    it('적절한 배치 크기를 가진다', () => {
      expect(flatListOptimizedProps.maxToRenderPerBatch).toBeGreaterThanOrEqual(5);
      expect(flatListOptimizedProps.maxToRenderPerBatch).toBeLessThanOrEqual(20);
    });
  });

  describe('chatListOptimizedProps', () => {
    it('채팅 최적화 속성을 반환한다', () => {
      const props = chatListOptimizedProps;
      expect(props).toHaveProperty('removeClippedSubviews');
      expect(props).toHaveProperty('maxToRenderPerBatch');
    });
  });

  describe('createGetItemLayout', () => {
    it('아이템 레이아웃 함수를 생성한다', () => {
      const getItemLayout = createGetItemLayout(80);
      const layout = getItemLayout(null, 3);

      expect(layout).toHaveProperty('length', 80);
      expect(layout).toHaveProperty('offset', 240); // 3 * 80
      expect(layout).toHaveProperty('index', 3);
    });

    it('첫 번째 아이템의 offset은 0이다', () => {
      const getItemLayout = createGetItemLayout(100);
      const layout = getItemLayout(null, 0);
      expect(layout.offset).toBe(0);
      expect(layout.index).toBe(0);
    });
  });

  describe('defaultKeyExtractor', () => {
    it('id 필드를 키로 사용한다', () => {
      const item = { id: 'abc-123', name: 'Test' };
      const key = defaultKeyExtractor(item, 0);
      expect(key).toBe('abc-123');
    });

    it('id를 키로 반환한다', () => {
      const item = { id: 'xyz-789' };
      const key = defaultKeyExtractor(item);
      expect(key).toBe('xyz-789');
    });
  });
});
