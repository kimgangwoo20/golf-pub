// 카카오톡 메시지 서비스 - 공유 및 초대
// @react-native-seoul/kakao-login v5.x에서 share API 제거됨
// React Native Share API로 대체 구현

import { Share, Linking, Platform } from 'react-native';

/**
 * 부킹 정보 인터페이스
 */
export interface BookingInfo {
  id: string;
  title: string;
  golfCourse: string;
  date: string;
  time: string;
  currentMembers: number;
  maxMembers: number;
  price: number;
  imageUrl?: string;
}

/**
 * 상품 정보 인터페이스
 */
export interface ProductInfo {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  condition: string;
}

/**
 * 카카오톡 메시지 서비스 클래스
 */
class KakaoMessageServiceClass {
  private readonly webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://golfpub.app';

  /**
   * 공통 공유 실행
   */
  private async shareMessage(message: string): Promise<boolean> {
    try {
      const result = await Share.share({
        message,
      });
      return result.action === Share.sharedAction;
    } catch (error: any) {
      if (error.code !== 'E_CANCELLED_OPERATION') {
        throw new Error('공유에 실패했습니다.');
      }
      return false;
    }
  }

  /**
   * 부킹 공유하기
   */
  async shareBooking(booking: BookingInfo): Promise<void> {
    const message = [
      `[Golf Pub] ${booking.title}`,
      '',
      `${booking.golfCourse}`,
      `${booking.date} ${booking.time}`,
      `${booking.currentMembers}/${booking.maxMembers}명`,
      `${this.formatPrice(booking.price)}`,
      '',
      `${this.webUrl}/booking/${booking.id}`,
    ].join('\n');

    await this.shareMessage(message);
  }

  /**
   * 상품 공유하기
   */
  async shareProduct(product: ProductInfo): Promise<void> {
    const priceText = product.originalPrice
      ? `${this.formatPrice(product.price)} (${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% 할인)`
      : this.formatPrice(product.price);

    const message = [
      `[Golf Pub] ${product.title}`,
      '',
      priceText,
      `상태: ${product.condition}`,
      '',
      `${this.webUrl}/product/${product.id}`,
    ].join('\n');

    await this.shareMessage(message);
  }

  /**
   * 친구 초대하기
   */
  async inviteFriend(inviterName?: string): Promise<void> {
    const inviteText = inviterName
      ? `${inviterName}님이 Golf Pub에 초대했습니다!`
      : '골프 모임을 쉽게! Golf Pub에 초대합니다';

    const message = [
      inviteText,
      '',
      '골프 번개 모임 / 코치 매칭 / 중고 거래',
      '',
      this.webUrl,
    ].join('\n');

    await this.shareMessage(message);
  }

  /**
   * 골프장 정보 공유하기
   */
  async shareGolfCourse(
    golfCourseName: string,
    address: string,
    phone?: string,
  ): Promise<void> {
    const parts = [
      `[Golf Pub] ${golfCourseName}`,
      '',
      address,
    ];
    if (phone) parts.push(phone);
    parts.push('', this.webUrl);

    await this.shareMessage(parts.join('\n'));
  }

  /**
   * 커스텀 메시지 공유
   */
  async shareCustomMessage(
    title: string,
    description: string,
    _imageUrl: string,
    _buttonTitle: string = '자세히 보기',
    link?: string,
  ): Promise<void> {
    const message = [
      title,
      '',
      description,
      '',
      link || this.webUrl,
    ].join('\n');

    await this.shareMessage(message);
  }

  /**
   * 링크로 공유하기
   */
  async shareLink(url: string, title?: string): Promise<void> {
    const message = title ? `${title}\n${url}` : url;
    await this.shareMessage(message);
  }

  /**
   * 카카오톡 앱 설치 확인
   */
  async isKakaoTalkInstalled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await Linking.canOpenURL('kakaokompassauth://');
      } else {
        return await Linking.canOpenURL('kakao://');
      }
    } catch {
      return false;
    }
  }

  /**
   * 가격 포맷팅
   */
  private formatPrice(price: number): string {
    return `${price.toLocaleString('ko-KR')}원`;
  }
}

// 싱글톤 인스턴스 export
export const KakaoMessageService = new KakaoMessageServiceClass();
