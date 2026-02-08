// tossPayments.ts - Toss Payments 결제 서비스
// 현재: 시뮬레이션 모드 (SDK 미연동)
// 향후: @tosspayments/widget-sdk-react-native 연동

/**
 * 결제 수단 타입
 */
export type PaymentMethodType = 'card' | 'account' | 'kakao' | 'naver';

/**
 * 결제 요청 데이터
 */
export interface PaymentRequest {
  orderId: string; // 주문 고유 ID
  orderName: string; // 주문명 (예: "주말 골프 모임 참가비")
  amount: number; // 결제 금액
  method: PaymentMethodType; // 결제 수단
  customerName: string; // 결제자 이름
  customerEmail?: string; // 결제자 이메일
}

/**
 * 결제 결과 데이터
 */
export interface PaymentResult {
  success: boolean;
  paymentKey?: string; // Toss 결제 키
  orderId: string;
  amount: number;
  method: PaymentMethodType;
  approvedAt?: string; // 승인 시각
  message: string;
}

/**
 * 환불 요청 데이터
 */
export interface RefundRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number; // 부분 환불 시
}

/**
 * 환불 결과 데이터
 */
export interface RefundResult {
  success: boolean;
  cancelAmount: number;
  canceledAt?: string;
  message: string;
}

/**
 * 결제 상태
 */
export type PaymentStatus =
  | 'READY' // 결제 준비
  | 'IN_PROGRESS' // 결제 진행중
  | 'DONE' // 결제 완료
  | 'CANCELED' // 결제 취소
  | 'PARTIAL_CANCELED' // 부분 취소
  | 'FAILED'; // 결제 실패

/**
 * Toss Payments 서비스
 *
 * 현재 시뮬레이션 모드로 동작합니다.
 * 실제 연동 시 @tosspayments/widget-sdk-react-native 패키지 설치 후
 * requestPayment()를 SDK 호출로 교체하면 됩니다.
 */
class TossPaymentService {
  private readonly clientKey = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY || '';
  private readonly isSimulation = !process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY;

  /**
   * 고유 주문 ID 생성
   */
  generateOrderId(prefix: string = 'GP'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * 결제 요청
   *
   * @param request 결제 요청 데이터
   * @returns 결제 결과
   */
  async requestPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (this.isSimulation) {
      return this.simulatePayment(request);
    }

    // TODO: 실제 Toss Payments SDK 연동
    // const tossPayments = await loadTossPayments(this.clientKey);
    // const result = await tossPayments.requestPayment({
    //   amount: request.amount,
    //   orderId: request.orderId,
    //   orderName: request.orderName,
    //   method: request.method,
    // });
    return this.simulatePayment(request);
  }

  /**
   * 결제 확인 (서버사이드에서 처리해야 하지만, 시뮬레이션에서는 클라이언트 처리)
   *
   * @param paymentKey 결제 키
   * @param orderId 주문 ID
   * @param amount 금액
   */
  async confirmPayment(
    paymentKey: string,
    orderId: string,
    _amount: number,
  ): Promise<PaymentResult> {
    if (this.isSimulation) {
      return {
        success: true,
        paymentKey,
        orderId,
        amount: _amount,
        method: 'card',
        approvedAt: new Date().toISOString(),
        message: '결제가 승인되었습니다.',
      };
    }

    // TODO: 실제 구현 시 Firebase Functions 또는 백엔드 서버에서 처리
    // const response = await fetch('/api/payments/confirm', {
    //   method: 'POST',
    //   body: JSON.stringify({ paymentKey, orderId, amount }),
    // });
    return {
      success: true,
      paymentKey,
      orderId,
      amount: _amount,
      method: 'card',
      approvedAt: new Date().toISOString(),
      message: '결제가 승인되었습니다.',
    };
  }

  /**
   * 결제 취소 (환불)
   *
   * @param request 환불 요청 데이터
   */
  async cancelPayment(request: RefundRequest): Promise<RefundResult> {
    if (this.isSimulation) {
      return this.simulateRefund(request);
    }

    // TODO: 실제 구현 시 Firebase Functions 또는 백엔드 서버에서 처리
    return this.simulateRefund(request);
  }

  /**
   * 환불 규정에 따른 환불 금액 계산
   *
   * @param originalAmount 원래 결제 금액
   * @param roundingDate 라운딩 날짜
   * @returns 환불 금액과 환불 비율
   */
  calculateRefundAmount(
    originalAmount: number,
    roundingDate: string,
  ): { refundAmount: number; refundRate: number; policy: string } {
    const now = new Date();
    const rounding = new Date(roundingDate);
    const diffMs = rounding.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 2) {
      return {
        refundAmount: originalAmount,
        refundRate: 100,
        policy: '라운딩 2일 전: 전액 환불',
      };
    } else if (diffDays >= 1) {
      return {
        refundAmount: Math.floor(originalAmount * 0.5),
        refundRate: 50,
        policy: '라운딩 1일 전: 50% 환불',
      };
    } else {
      return {
        refundAmount: 0,
        refundRate: 0,
        policy: '라운딩 당일: 환불 불가',
      };
    }
  }

  /**
   * 플랫폼 수수료 계산 (5%)
   */
  calculatePlatformFee(amount: number): number {
    return Math.floor(amount * 0.05);
  }

  // ========== 시뮬레이션 메서드 (SDK 미연동 시) ==========

  private async simulatePayment(request: PaymentRequest): Promise<PaymentResult> {
    // 1초 딜레이로 결제 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const paymentKey = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      paymentKey,
      orderId: request.orderId,
      amount: request.amount,
      method: request.method,
      approvedAt: new Date().toISOString(),
      message: '결제가 완료되었습니다. (시뮬레이션)',
    };
  }

  private async simulateRefund(request: RefundRequest): Promise<RefundResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      cancelAmount: request.cancelAmount || 0,
      canceledAt: new Date().toISOString(),
      message: '환불이 완료되었습니다. (시뮬레이션)',
    };
  }
}

// 싱글톤 인스턴스 export
export const tossPayments = new TossPaymentService();
