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
    // TODO: 프로덕션에서 경고 모니터링 서비스로 전송
    // if (!isDevelopment) {
    //   Sentry.captureMessage(args[0], 'warning');
    // }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    }
    // TODO: 프로덕션에서 에러 모니터링 서비스로 전송
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
