// 💎 membershipAPI.ts
// 멤버십 관리 API - Firebase Firestore 연동

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * 멤버십 타입
 */
export type MembershipTier = 'FREE' | 'PRO' | 'PREMIUM';

/**
 * 멤버십 정보
 */
export interface Membership {
  userId: string;
  tier: MembershipTier;
  startDate: string;
  expiryDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

/**
 * Firestore 컬렉션
 */
const MEMBERSHIPS_COLLECTION = 'memberships';
const USERS_COLLECTION = 'users';

/**
 * 멤버십 API
 */
export const membershipAPI = {
  /**
   * 내 멤버십 조회
   * 
   * @returns 멤버십 정보
   */
  getMyMembership: async (): Promise<Membership> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const membershipDoc = await firestore()
        .collection(MEMBERSHIPS_COLLECTION)
        .doc(currentUser.uid)
        .get();

      if (!membershipDoc.exists) {
        // 멤버십이 없으면 FREE 생성
        const freeMembership: Membership = {
          userId: currentUser.uid,
          tier: 'FREE',
          startDate: new Date().toISOString(),
          autoRenew: false,
        };

        await firestore()
          .collection(MEMBERSHIPS_COLLECTION)
          .doc(currentUser.uid)
          .set({
            ...freeMembership,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        return freeMembership;
      }

      const data = membershipDoc.data();
      const membership: Membership = {
        userId: currentUser.uid,
        tier: data?.tier || 'FREE',
        startDate: data?.startDate?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        expiryDate: data?.expiryDate?.toDate?.()?.toISOString?.(),
        autoRenew: data?.autoRenew || false,
        paymentMethod: data?.paymentMethod,
      };

      console.log('✅ 멤버십 조회 성공:', membership.tier);
      return membership;
    } catch (error: any) {
      console.error('❌ 멤버십 조회 실패:', error);
      throw new Error(error.message || '멤버십 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 멤버십 업그레이드
   * 
   * @param tier 업그레이드할 등급
   * @param paymentMethod 결제 수단
   */
  upgradeMembership: async (
    tier: 'PRO' | 'PREMIUM',
    paymentMethod: string
  ): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1개월 후

      await firestore()
        .collection(MEMBERSHIPS_COLLECTION)
        .doc(currentUser.uid)
        .set(
          {
            tier,
            startDate: firestore.FieldValue.serverTimestamp(),
            expiryDate: firestore.Timestamp.fromDate(expiryDate),
            autoRenew: true,
            paymentMethod,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      // 사용자 정보에도 업데이트
      await firestore()
        .collection(USERS_COLLECTION)
        .doc(currentUser.uid)
        .update({
          membership: tier,
        });

      console.log('✅ 멤버십 업그레이드 성공:', tier);
    } catch (error: any) {
      console.error('❌ 멤버십 업그레이드 실패:', error);
      throw new Error(error.message || '멤버십 업그레이드에 실패했습니다.');
    }
  },

  /**
   * 멤버십 취소
   */
  cancelMembership: async (): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      await firestore()
        .collection(MEMBERSHIPS_COLLECTION)
        .doc(currentUser.uid)
        .update({
          autoRenew: false,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ 멤버십 취소 성공');
    } catch (error: any) {
      console.error('❌ 멤버십 취소 실패:', error);
      throw new Error(error.message || '멤버십 취소에 실패했습니다.');
    }
  },

  /**
   * 멤버십 혜택 조회
   * 
   * @param tier 멤버십 등급
   * @returns 혜택 목록
   */
  getMembershipBenefits: (tier: MembershipTier): string[] => {
    const benefits = {
      FREE: [
        '기본 부킹 참여',
        '중고거래 이용',
        '친구 추가 (최대 50명)',
      ],
      PRO: [
        '모든 FREE 혜택',
        '부킹 우선 신청',
        '친구 추가 무제한',
        '프로필 뱃지',
        '포인트 2배 적립',
        '광고 제거',
      ],
      PREMIUM: [
        '모든 PRO 혜택',
        '프리미엄 부킹 생성',
        '프리미엄 매칭 서비스',
        '코치 추천 서비스',
        '골프장 할인 쿠폰',
        '월 1회 무료 골프장 이용권',
      ],
    };

    return benefits[tier];
  },
};