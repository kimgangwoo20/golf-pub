// validators 유틸리티 테스트

import { validators } from '@/utils/validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('유효한 이메일 검증', () => {
      expect(validators.isValidEmail('test@example.com')).toBe(true);
      expect(validators.isValidEmail('user@domain.co.kr')).toBe(true);
    });

    it('잘못된 이메일 검증', () => {
      expect(validators.isValidEmail('')).toBe(false);
      expect(validators.isValidEmail('invalid')).toBe(false);
      expect(validators.isValidEmail('no@domain')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('유효한 한국 전화번호 검증', () => {
      expect(validators.isValidPhoneNumber('01012345678')).toBe(true);
      expect(validators.isValidPhoneNumber('010-1234-5678')).toBe(true);
    });

    it('잘못된 전화번호 검증', () => {
      expect(validators.isValidPhoneNumber('')).toBe(false);
      expect(validators.isValidPhoneNumber('1234')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('유효한 비밀번호 (8자 이상)', () => {
      expect(validators.isValidPassword('password123')).toBe(true);
      expect(validators.isValidPassword('MySecurePass1!')).toBe(true);
    });

    it('너무 짧은 비밀번호', () => {
      expect(validators.isValidPassword('short')).toBe(false);
      expect(validators.isValidPassword('')).toBe(false);
    });
  });

  describe('isValidNickname', () => {
    it('유효한 닉네임 (2-10자)', () => {
      expect(validators.isValidNickname('골퍼')).toBe(true);
      expect(validators.isValidNickname('GolfUser1')).toBe(true);
    });

    it('너무 짧거나 긴 닉네임', () => {
      expect(validators.isValidNickname('a')).toBe(false);
      expect(validators.isValidNickname('아주긴닉네임이름이라서안됩니다')).toBe(false);
    });
  });
});
