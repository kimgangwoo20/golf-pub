// formatters 유틸리티 테스트

import { formatters } from '@/utils/formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('숫자를 한국 원화 형식으로 포맷', () => {
      expect(formatters.formatPrice(50000)).toBe('50,000원');
      expect(formatters.formatPrice(1000000)).toBe('1,000,000원');
    });

    it('0원 포맷', () => {
      expect(formatters.formatPrice(0)).toBe('0원');
    });
  });

  describe('formatDate', () => {
    it('Date 객체를 한국어 날짜로 포맷', () => {
      const date = new Date(2024, 0, 15); // 2024-01-15
      const result = formatters.formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });
  });

  describe('formatPhoneNumber', () => {
    it('전화번호에 하이픈 추가', () => {
      expect(formatters.formatPhoneNumber('01012345678')).toBe('010-1234-5678');
    });

    it('서울 전화번호 포맷', () => {
      expect(formatters.formatPhoneNumber('0212345678')).toBe('02-1234-5678');
    });
  });

  describe('formatNumber', () => {
    it('천 단위 콤마 추가', () => {
      expect(formatters.formatNumber(1234567)).toBe('1,234,567');
    });
  });
});
