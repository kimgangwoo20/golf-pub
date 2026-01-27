// 💬 kakaoMessage.ts
// 카카오톡 메시지 서비스 - 공유 및 초대

import { shareMessage, shareFeed, sendFeed, sendLink, LinkObject, FeedObject, ContentObject, ButtonObject } from '@react-native-seoul/kakao-login';

/**
 * 카카오톡 메시지 서비스
 * 
 * 기능:
 * - 부킹 공유
 * - 상품 공유
 * - 친구 초대
 * - 커스텀 메시지
 * 
 * 사용 예시:
 * ```typescript
 * import { KakaoMessageService } from './services/kakao/kakaoMessage';
 * 
 * // 부킹 공유
 * await KakaoMessageService.shareBooking(booking);
 * 
 * // 친구 초대
 * await KakaoMessageService.inviteFriend();
 * ```
 */

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
  private readonly appUrl = 'golfpub://'; // Deep Link URL
  private readonly webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://golfpub.app';

  /**
   * 부킹 공유하기
   * 
   * @param booking 부킹 정보
   */
  async shareBooking(booking: BookingInfo): Promise<void> {
    try {
      console.log('📤 부킹 공유 시작:', booking.title);

      const content: ContentObject = {
        title: `⛳ ${booking.title}`,
        description: `${booking.golfCourse}\n📅 ${booking.date} ${booking.time}\n👥 ${booking.currentMembers}/${booking.maxMembers}명\n💰 ${this.formatPrice(booking.price)}`,
        imageUrl: booking.imageUrl || 'https://via.placeholder.com/800x400?text=Golf+Booking',
        link: {
          mobileWebUrl: `${this.webUrl}/booking/${booking.id}`,
          webUrl: `${this.webUrl}/booking/${booking.id}`,
        },
      };

      const buttons: ButtonObject[] = [
        {
          title: '자세히 보기',
          link: {
            mobileWebUrl: `${this.webUrl}/booking/${booking.id}`,
            webUrl: `${this.webUrl}/booking/${booking.id}`,
          },
        },
      ];

      const feedObject: FeedObject = {
        content,
        buttons,
      };

      await shareFeed(feedObject);
      console.log('✅ 부킹 공유 완료');
    } catch (error: any) {
      console.error('❌ 부킹 공유 실패:', error);
      
      if (error.code === 'E_CANCELLED_OPERATION') {
        console.log('ℹ️ 사용자가 공유를 취소했습니다.');
      } else {
        throw new Error('부킹 공유에 실패했습니다. 카카오톡이 설치되어 있는지 확인해주세요.');
      }
    }
  }

  /**
   * 상품 공유하기
   * 
   * @param product 상품 정보
   */
  async shareProduct(product: ProductInfo): Promise<void> {
    try {
      console.log('📤 상품 공유 시작:', product.title);

      const priceText = product.originalPrice
        ? `💰 ${this.formatPrice(product.price)} (${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% 할인)`
        : `💰 ${this.formatPrice(product.price)}`;

      const content: ContentObject = {
        title: `🏌️ ${product.title}`,
        description: `${priceText}\n📦 상태: ${product.condition}`,
        imageUrl: product.imageUrl || 'https://via.placeholder.com/800x400?text=Golf+Product',
        link: {
          mobileWebUrl: `${this.webUrl}/product/${product.id}`,
          webUrl: `${this.webUrl}/product/${product.id}`,
        },
      };

      const buttons: ButtonObject[] = [
        {
          title: '상품 보기',
          link: {
            mobileWebUrl: `${this.webUrl}/product/${product.id}`,
            webUrl: `${this.webUrl}/product/${product.id}`,
          },
        },
      ];

      const feedObject: FeedObject = {
        content,
        buttons,
      };

      await shareFeed(feedObject);
      console.log('✅ 상품 공유 완료');
    } catch (error: any) {
      console.error('❌ 상품 공유 실패:', error);
      
      if (error.code === 'E_CANCELLED_OPERATION') {
        console.log('ℹ️ 사용자가 공유를 취소했습니다.');
      } else {
        throw new Error('상품 공유에 실패했습니다.');
      }
    }
  }

  /**
   * 친구 초대하기
   * 
   * @param inviterName 초대하는 사람 이름 (선택)
   */
  async inviteFriend(inviterName?: string): Promise<void> {
    try {
      console.log('📤 친구 초대 시작');

      const inviteText = inviterName
        ? `${inviterName}님이 Golf Pub에 초대했습니다! 🎉`
        : '골프 모임을 쉽게! Golf Pub에 초대합니다 🎉';

      const content: ContentObject = {
        title: '⛳ Golf Pub',
        description: `${inviteText}\n\n✅ 골프 번개 모임\n✅ 골프 코치 매칭\n✅ 중고 골프 용품 거래\n✅ 프랜차이즈 술집 연계`,
        imageUrl: 'https://via.placeholder.com/800x400?text=Golf+Pub',
        link: {
          mobileWebUrl: this.webUrl,
          webUrl: this.webUrl,
        },
      };

      const buttons: ButtonObject[] = [
        {
          title: '앱 다운로드',
          link: {
            mobileWebUrl: this.webUrl,
            webUrl: this.webUrl,
          },
        },
      ];

      const feedObject: FeedObject = {
        content,
        buttons,
      };

      await shareFeed(feedObject);
      console.log('✅ 친구 초대 완료');
    } catch (error: any) {
      console.error('❌ 친구 초대 실패:', error);
      
      if (error.code === 'E_CANCELLED_OPERATION') {
        console.log('ℹ️ 사용자가 초대를 취소했습니다.');
      } else {
        throw new Error('친구 초대에 실패했습니다.');
      }
    }
  }

  /**
   * 골프장 정보 공유하기
   * 
   * @param golfCourseName 골프장 이름
   * @param address 주소
   * @param phone 전화번호
   * @param imageUrl 이미지 URL
   */
  async shareGolfCourse(
    golfCourseName: string,
    address: string,
    phone?: string,
    imageUrl?: string
  ): Promise<void> {
    try {
      console.log('📤 골프장 정보 공유 시작:', golfCourseName);

      const description = phone
        ? `📍 ${address}\n📞 ${phone}`
        : `📍 ${address}`;

      const content: ContentObject = {
        title: `⛳ ${golfCourseName}`,
        description,
        imageUrl: imageUrl || 'https://via.placeholder.com/800x400?text=Golf+Course',
        link: {
          mobileWebUrl: this.webUrl,
          webUrl: this.webUrl,
        },
      };

      const buttons: ButtonObject[] = [
        {
          title: '위치 보기',
          link: {
            mobileWebUrl: this.webUrl,
            webUrl: this.webUrl,
          },
        },
      ];

      const feedObject: FeedObject = {
        content,
        buttons,
      };

      await shareFeed(feedObject);
      console.log('✅ 골프장 정보 공유 완료');
    } catch (error: any) {
      console.error('❌ 골프장 정보 공유 실패:', error);
      throw new Error('골프장 정보 공유에 실패했습니다.');
    }
  }

  /**
   * 커스텀 메시지 공유
   * 
   * @param title 제목
   * @param description 설명
   * @param imageUrl 이미지 URL
   * @param buttonTitle 버튼 텍스트
   * @param link 링크 URL
   */
  async shareCustomMessage(
    title: string,
    description: string,
    imageUrl: string,
    buttonTitle: string = '자세히 보기',
    link?: string
  ): Promise<void> {
    try {
      console.log('📤 커스텀 메시지 공유 시작');

      const targetUrl = link || this.webUrl;

      const content: ContentObject = {
        title,
        description,
        imageUrl,
        link: {
          mobileWebUrl: targetUrl,
          webUrl: targetUrl,
        },
      };

      const buttons: ButtonObject[] = [
        {
          title: buttonTitle,
          link: {
            mobileWebUrl: targetUrl,
            webUrl: targetUrl,
          },
        },
      ];

      const feedObject: FeedObject = {
        content,
        buttons,
      };

      await shareFeed(feedObject);
      console.log('✅ 커스텀 메시지 공유 완료');
    } catch (error: any) {
      console.error('❌ 커스텀 메시지 공유 실패:', error);
      throw new Error('메시지 공유에 실패했습니다.');
    }
  }

  /**
   * 가격 포맷팅
   * 
   * @param price 가격
   * @returns 포맷된 문자열 (예: "50,000원")
   */
  private formatPrice(price: number): string {
    return `${price.toLocaleString('ko-KR')}원`;
  }

  /**
   * 날짜 포맷팅
   * 
   * @param dateString 날짜 문자열
   * @returns 포맷된 문자열 (예: "2024년 1월 27일")
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  }

  /**
   * 링크로 공유하기 (간단한 URL 공유)
   * 
   * @param url 공유할 URL
   * @param title 제목 (선택)
   */
  async shareLink(url: string, title?: string): Promise<void> {
    try {
      console.log('📤 링크 공유 시작:', url);

      const linkObject: LinkObject = {
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      };

      await sendLink(linkObject);
      console.log('✅ 링크 공유 완료');
    } catch (error: any) {
      console.error('❌ 링크 공유 실패:', error);
      
      if (error.code === 'E_CANCELLED_OPERATION') {
        console.log('ℹ️ 사용자가 공유를 취소했습니다.');
      } else {
        throw new Error('링크 공유에 실패했습니다.');
      }
    }
  }

  /**
   * 앱 설치 확인
   * 
   * @returns 카카오톡 설치 여부
   */
  async isKakaoTalkInstalled(): Promise<boolean> {
    try {
      const { Platform, Linking } = await import('react-native');
      
      if (Platform.OS === 'ios') {
        return await Linking.canOpenURL('kakaokompassauth://');
      } else {
        return await Linking.canOpenURL('kakao://');
      }
    } catch (error) {
      console.error('카카오톡 설치 확인 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 export
export const KakaoMessageService = new KakaoMessageServiceClass();

/**
 * 설치 필요 패키지:
 * 
 * npm install @react-native-seoul/kakao-login
 * 
 * 참고: @react-native-seoul/kakao-login에 로그인 + 공유 기능 모두 포함
 * 
 * app.json 설정:
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "@react-native-seoul/kakao-login",
 *         {
 *           "kakaoAppKey": "YOUR_KAKAO_APP_KEY",
 *           "android": {
 *             "kakaoAppKey": "YOUR_KAKAO_APP_KEY"
 *           },
 *           "ios": {
 *             "kakaoAppKey": "YOUR_KAKAO_APP_KEY"
 *           }
 *         }
 *       ]
 *     ]
 *   }
 * }
 */

/**
 * 사용 예시:
 * 
 * ```typescript
 * import { KakaoMessageService } from './services/kakao/kakaoMessage';
 * 
 * // 1. 부킹 공유
 * const booking = {
 *   id: '123',
 *   title: '주말 골프 모임',
 *   golfCourse: '레이크사이드 CC',
 *   date: '2024-01-27',
 *   time: '10:00',
 *   currentMembers: 2,
 *   maxMembers: 4,
 *   price: 50000,
 *   imageUrl: 'https://example.com/golf.jpg',
 * };
 * await KakaoMessageService.shareBooking(booking);
 * 
 * // 2. 상품 공유
 * const product = {
 *   id: '456',
 *   title: '타이틀리스트 드라이버',
 *   price: 300000,
 *   originalPrice: 500000,
 *   imageUrl: 'https://example.com/driver.jpg',
 *   condition: '거의 새것',
 * };
 * await KakaoMessageService.shareProduct(product);
 * 
 * // 3. 친구 초대
 * await KakaoMessageService.inviteFriend('홍길동');
 * 
 * // 4. 커스텀 메시지
 * await KakaoMessageService.shareCustomMessage(
 *   '⛳ Golf Pub',
 *   '골프 모임을 쉽게!',
 *   'https://example.com/image.jpg',
 *   '앱 열기'
 * );
 * ```
 */

/**
 * Kakao Developers 설정:
 * 
 * 1. https://developers.kakao.com 접속
 * 2. 내 애플리케이션 선택
 * 3. 플랫폼 설정:
 *    - Android: 패키지명, 키 해시 등록
 *    - iOS: 번들 ID 등록
 * 4. 카카오 로그인 활성화
 * 5. 동의 항목 설정 (프로필 정보, 카카오톡 메시지 전송)
 */
