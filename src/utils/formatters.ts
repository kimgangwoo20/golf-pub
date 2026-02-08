// 포맷팅 유틸리티 함수

export const formatters = {
  /**
   * 가격 포맷 (1000 → "1,000원")
   */
  formatPrice: (price: number): string => {
    return `${price.toLocaleString('ko-KR')}원`;
  },

  /**
   * 숫자 포맷 (천 단위 콤마)
   */
  formatNumber: (num: number): string => {
    return num.toLocaleString('ko-KR');
  },

  /**
   * 날짜 포맷 (Date → "2024년 1월 15일")
   */
  formatDate: (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  },

  /**
   * 날짜 시간 포맷 (Date → "2024.01.15 14:30")
   */
  formatDateTime: (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${d} ${h}:${min}`;
  },

  /**
   * 전화번호 포맷 ("01012345678" → "010-1234-5678")
   */
  formatPhoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('02')) {
      // 서울 (02-XXXX-XXXX)
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      }
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
    }
    // 기타 (010-1234-5678)
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  },

  /**
   * 상대 시간 포맷 ("방금 전", "5분 전", "3시간 전", "2일 전")
   */
  formatRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  },

  /**
   * 거리 포맷 (미터 → "1.5km" 또는 "850m")
   */
  formatDistance: (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.round(meters)}m`;
  },
};
