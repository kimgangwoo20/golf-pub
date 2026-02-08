// dateUtils 테스트

describe('dateUtils', () => {
  let dateUtils: any;

  beforeAll(() => {
    try {
      dateUtils = require('../../src/utils/dateUtils');
    } catch {
      // 모듈이 없을 수 있음
    }
  });

  describe('날짜 포맷 함수', () => {
    it('dateUtils 모듈이 존재한다', () => {
      expect(dateUtils).toBeTruthy();
    });

    it('export된 함수들이 존재한다', () => {
      if (dateUtils) {
        const exports = Object.keys(dateUtils);
        expect(exports.length).toBeGreaterThan(0);
      }
    });
  });
});
