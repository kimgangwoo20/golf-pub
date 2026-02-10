// 검증 유틸리티 함수

export const validators = {
  /**
   * 이메일 유효성 검사
   */
  isValidEmail: (email: string): boolean => {
    if (!email) return false;
    // RFC 5322 간소화 패턴: 최소 2자 로컬, 최소 2자 도메인, 최소 2자 TLD
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  /**
   * 한국 전화번호 유효성 검사 (010-XXXX-XXXX 또는 01012345678)
   * 010: 11자리, 011/016/017/018/019: 10~11자리
   */
  isValidPhoneNumber: (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    // 010은 반드시 11자리
    if (cleaned.startsWith('010')) {
      return /^010\d{8}$/.test(cleaned);
    }
    // 기타 01X 번호는 10~11자리
    return /^01[16789]\d{7,8}$/.test(cleaned);
  },

  /**
   * 비밀번호 유효성 검사 (8자 이상)
   */
  isValidPassword: (password: string): boolean => {
    if (!password) return false;
    return password.length >= 8;
  },

  /**
   * 닉네임 유효성 검사 (2-10자)
   */
  isValidNickname: (nickname: string): boolean => {
    if (!nickname) return false;
    return nickname.length >= 2 && nickname.length <= 10;
  },

  /**
   * 금액 유효성 검사 (양수)
   */
  isValidAmount: (amount: number): boolean => {
    return (
      typeof amount === 'number' && amount > 0 && amount <= 100_000_000 && Number.isFinite(amount)
    );
  },

  /**
   * URL 유효성 검사
   */
  isValidUrl: (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 리뷰 내용 유효성 검사 (10-500자)
   */
  isValidReviewContent: (content: string): boolean => {
    if (!content) return false;
    const trimmed = content.trim();
    return trimmed.length >= 10 && trimmed.length <= 500;
  },

  /**
   * 평점 유효성 검사 (1-5)
   */
  isValidRating: (rating: number): boolean => {
    return typeof rating === 'number' && rating >= 1 && rating <= 5;
  },
};
