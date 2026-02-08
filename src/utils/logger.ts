/**
 * Logger Utility
 * 개발 환경에서만 로그를 출력하고, 프로덕션에서는 에러 모니터링 서비스로 전송합니다.
 */

const isDevelopment = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
    // [향후] Sentry 연동 시 프로덕션 경고 전송 (v2.0 릴리즈 시 @sentry/react-native 설치 후 활성화)
    // if (!isDevelopment) {
    //   Sentry.captureMessage(args[0], 'warning');
    // }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    }
    // [향후] Sentry 연동 시 프로덕션 에러 전송 (v2.0 릴리즈 시 @sentry/react-native 설치 후 활성화)
    // if (!isDevelopment) {
    //   Sentry.captureException(args[0]);
    // }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
};

export default logger;
