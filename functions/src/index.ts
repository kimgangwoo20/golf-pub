// Cloud Functions 엔트리포인트
import * as admin from "firebase-admin";

// Firebase Admin 초기화
admin.initializeApp();

// 인증
export { kakaoToken } from "./functions/auth/kakaoToken";

// 출석
export { attendanceCheckIn } from "./functions/attendance/checkIn";

// 포인트
export { pointsEarn } from "./functions/points/earn";
export { pointsDeduct } from "./functions/points/deduct";

// 결제 (TOSS_SECRET_KEY 설정 후 활성화)
// export { paymentConfirm } from "./functions/payments/confirm";
// export { paymentCancel } from "./functions/payments/cancel";

// 부킹
export { bookingApprove } from "./functions/booking/approve";
export { bookingReject } from "./functions/booking/reject";
export { bookingCancel } from "./functions/booking/cancel";
export { bookingWithdraw } from "./functions/booking/withdraw";

// 쿠폰
export { couponIssue } from "./functions/coupons/issue";
export { couponRedeem } from "./functions/coupons/redeem";

// 채팅
export { sendChatNotification } from "./functions/chat/sendChatNotification";

// 알림
export { sendNotification } from "./functions/notifications/send";
