// KakaoMessageService 테스트

import { KakaoMessageService } from '@/services/kakao/kakaoMessage';
import { Share } from 'react-native';

describe('KakaoMessageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Share.share as jest.Mock).mockResolvedValue({ action: Share.sharedAction });
  });

  describe('shareBooking', () => {
    it('부킹 정보를 포함한 메시지 공유', async () => {
      await KakaoMessageService.shareBooking({
        id: 'booking-1',
        title: '주말 라운딩',
        golfCourse: '용인 CC',
        date: '2024-01-20',
        time: '08:00',
        currentMembers: 2,
        maxMembers: 4,
        price: 150000,
      });

      expect(Share.share).toHaveBeenCalledTimes(1);
      const args = (Share.share as jest.Mock).mock.calls[0][0];
      expect(args.message).toContain('주말 라운딩');
      expect(args.message).toContain('용인 CC');
      expect(args.message).toContain('2/4명');
    });
  });

  describe('shareProduct', () => {
    it('상품 정보를 포함한 메시지 공유', async () => {
      await KakaoMessageService.shareProduct({
        id: 'product-1',
        title: '타이틀리스트 드라이버',
        price: 200000,
        condition: '좋음',
      });

      expect(Share.share).toHaveBeenCalledTimes(1);
      const args = (Share.share as jest.Mock).mock.calls[0][0];
      expect(args.message).toContain('타이틀리스트 드라이버');
      expect(args.message).toContain('200,000원');
    });

    it('할인 가격 표시', async () => {
      await KakaoMessageService.shareProduct({
        id: 'product-2',
        title: '퍼터',
        price: 80000,
        originalPrice: 100000,
        condition: '새제품',
      });

      const args = (Share.share as jest.Mock).mock.calls[0][0];
      expect(args.message).toContain('20%');
    });
  });

  describe('inviteFriend', () => {
    it('초대 메시지 공유', async () => {
      await KakaoMessageService.inviteFriend('홍길동');

      expect(Share.share).toHaveBeenCalledTimes(1);
      const args = (Share.share as jest.Mock).mock.calls[0][0];
      expect(args.message).toContain('홍길동');
      expect(args.message).toContain('Golf Pub');
    });

    it('이름 없이 초대', async () => {
      await KakaoMessageService.inviteFriend();

      const args = (Share.share as jest.Mock).mock.calls[0][0];
      expect(args.message).toContain('골프 모임을 쉽게');
    });
  });

  describe('shareLink', () => {
    it('URL과 제목 포함 공유', async () => {
      await KakaoMessageService.shareLink('https://example.com', '테스트');

      const args = (Share.share as jest.Mock).mock.calls[0][0];
      expect(args.message).toContain('테스트');
      expect(args.message).toContain('https://example.com');
    });
  });
});
