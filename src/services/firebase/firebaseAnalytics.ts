// 📊 firebaseAnalytics.ts
// Firebase Analytics 이벤트 추적 서비스

import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from '@react-native-firebase/analytics';

const analytics = getAnalytics();

// ========================================
// 🔑 사용자 속성 설정
// ========================================

/** 로그인 시 사용자 ID 설정 */
export const setAnalyticsUserId = (userId: string) => {
  setUserId(analytics, userId);
};

/** 사용자 속성 설정 (멤버십, 성별 등) */
export const setAnalyticsUserProperties = (properties: {
  membership?: string;
  gender?: string;
  level?: string;
}) => {
  setUserProperties(analytics, properties);
};

// ========================================
// 📱 화면 조회 이벤트
// ========================================

/** 화면 진입 추적 */
export const trackScreenView = (screenName: string, screenClass?: string) => {
  logEvent(analytics, 'screen_view', {
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
};

// ========================================
// 🔐 인증 이벤트
// ========================================

export const trackLogin = (method: 'email' | 'kakao' | 'anonymous') => {
  logEvent(analytics, 'login', { method });
};

export const trackSignUp = (method: 'email' | 'kakao') => {
  logEvent(analytics, 'sign_up', { method });
};

export const trackLogout = () => {
  logEvent(analytics, 'logout', {});
};

// ========================================
// ⛳ 부킹 이벤트
// ========================================

export const trackBookingCreated = (bookingId: string, courseName: string, price: number) => {
  logEvent(analytics, 'booking_created', {
    booking_id: bookingId,
    course_name: courseName,
    value: price,
    currency: 'KRW',
  });
};

export const trackBookingJoined = (bookingId: string, courseName: string) => {
  logEvent(analytics, 'booking_joined', {
    booking_id: bookingId,
    course_name: courseName,
  });
};

export const trackBookingCancelled = (bookingId: string) => {
  logEvent(analytics, 'booking_cancelled', { booking_id: bookingId });
};

// ========================================
// 📝 피드 이벤트
// ========================================

export const trackPostCreated = (postId: string, type: string) => {
  logEvent(analytics, 'post_created', { post_id: postId, post_type: type });
};

export const trackPostLiked = (postId: string) => {
  logEvent(analytics, 'post_liked', { post_id: postId });
};

export const trackCommentAdded = (postId: string) => {
  logEvent(analytics, 'comment_added', { post_id: postId });
};

// ========================================
// 🛒 중고마켓 이벤트
// ========================================

export const trackProductCreated = (productId: string, category: string, price: number) => {
  logEvent(analytics, 'product_listed', {
    product_id: productId,
    category,
    value: price,
    currency: 'KRW',
  });
};

export const trackProductViewed = (productId: string, productName: string) => {
  logEvent(analytics, 'product_viewed', {
    product_id: productId,
    product_name: productName,
  });
};

export const trackProductLiked = (productId: string) => {
  logEvent(analytics, 'product_liked', { product_id: productId });
};

// ========================================
// 💬 채팅 이벤트
// ========================================

export const trackChatStarted = (chatRoomId: string) => {
  logEvent(analytics, 'chat_started', { chat_room_id: chatRoomId });
};

export const trackMessageSent = (chatRoomId: string, messageType: 'text' | 'image') => {
  logEvent(analytics, 'message_sent', {
    chat_room_id: chatRoomId,
    message_type: messageType,
  });
};

// ========================================
// 👥 소셜 이벤트
// ========================================

export const trackFriendAdded = () => {
  logEvent(analytics, 'friend_added', {});
};

export const trackProfileViewed = (targetUserId: string) => {
  logEvent(analytics, 'profile_viewed', { target_user_id: targetUserId });
};

// ========================================
// 💰 결제/멤버십 이벤트
// ========================================

export const trackPurchase = (params: {
  transactionId: string;
  value: number;
  itemName: string;
}) => {
  logEvent(analytics, 'purchase', {
    transaction_id: params.transactionId,
    value: params.value,
    currency: 'KRW',
    items: [{ item_name: params.itemName }],
  });
};

export const trackMembershipUpgrade = (plan: string) => {
  logEvent(analytics, 'membership_upgrade', { plan });
};

// ========================================
// 🎯 기타 이벤트
// ========================================

export const trackAttendanceCheck = (consecutiveDays: number) => {
  logEvent(analytics, 'attendance_check', { consecutive_days: consecutiveDays });
};

export const trackSearch = (searchTerm: string, category: string) => {
  logEvent(analytics, 'content_search', {
    search_term: searchTerm,
    category,
  });
};

export const trackShare = (contentType: string, contentId: string) => {
  logEvent(analytics, 'content_share', {
    content_type: contentType,
    content_id: contentId,
  });
};

export const trackRecommendationClicked = (courseName: string, score: number) => {
  logEvent(analytics, 'recommendation_clicked', {
    course_name: courseName,
    score,
  });
};
