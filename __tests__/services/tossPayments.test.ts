// tossPayments 서비스 테스트
import '../../__tests__/setup';

// tossPayments 모듈 import
const { tossPayments: tossPaymentsService } = require('../../src/services/payment/tossPayments');

describe('tossPaymentsService', () => {
  describe('generateOrderId', () => {
    it('주문번호를 생성한다', () => {
      const orderId = tossPaymentsService.generateOrderId();
      expect(orderId).toBeTruthy();
      expect(typeof orderId).toBe('string');
      expect(orderId.startsWith('GP_')).toBe(true);
    });

    it('고유한 주문번호를 생성한다', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        ids.add(tossPaymentsService.generateOrderId());
      }
      expect(ids.size).toBe(10);
    });
  });

  describe('calculateRefundAmount', () => {
    it('2일 이상 전이면 100% 환불', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = tossPaymentsService.calculateRefundAmount(100000, dateStr);
      expect(result.refundAmount).toBe(100000);
      expect(result.refundRate).toBe(100);
    });

    it('1일 전이면 50% 환불', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const result = tossPaymentsService.calculateRefundAmount(100000, dateStr);
      expect(result.refundAmount).toBe(50000);
      expect(result.refundRate).toBe(50);
    });

    it('당일이면 0% 환불', () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const result = tossPaymentsService.calculateRefundAmount(100000, dateStr);
      expect(result.refundAmount).toBe(0);
      expect(result.refundRate).toBe(0);
    });
  });

  describe('calculatePlatformFee', () => {
    it('플랫폼 수수료 5%를 계산한다', () => {
      const fee = tossPaymentsService.calculatePlatformFee(100000);
      expect(fee).toBe(5000);
    });

    it('0원이면 수수료도 0원', () => {
      const fee = tossPaymentsService.calculatePlatformFee(0);
      expect(fee).toBe(0);
    });

    it('소수점을 버린다', () => {
      const fee = tossPaymentsService.calculatePlatformFee(33333);
      expect(fee).toBe(Math.floor(33333 * 0.05));
    });
  });
});
