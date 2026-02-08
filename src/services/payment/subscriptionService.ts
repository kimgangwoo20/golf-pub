// subscriptionService.ts - 멤버십 구독 관리 서비스
import firestore from '@react-native-firebase/firestore';

/**
 * 멤버십 플랜 타입
 */
export type MembershipPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'VIP';

/**
 * 결제 주기
 */
export type BillingCycle = 'MONTHLY' | 'YEARLY';

/**
 * 구독 상태
 */
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';

/**
 * 구독 정보
 */
export interface Subscription {
  plan: MembershipPlan;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  price: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
}

/**
 * 멤버십 구독 관리 서비스
 */
class SubscriptionServiceClass {
  /**
   * 사용자 구독 정보 조회
   */
  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      const data = userDoc.data();

      if (!data?.membership || data.membership === 'FREE') {
        return null;
      }

      return {
        plan: data.membership as MembershipPlan,
        billingCycle: data.membershipBillingCycle || 'MONTHLY',
        status: data.membershipStatus || 'ACTIVE',
        price: data.membershipPrice || 0,
        startDate: data.membershipStartDate?.toDate?.() || new Date(),
        endDate: data.membershipEndDate?.toDate?.() || new Date(),
        autoRenew: data.membershipAutoRenew ?? true,
      };
    } catch (error: any) {
      console.error('구독 정보 조회 실패:', error);
      return null;
    }
  }

  /**
   * 멤버십 구독 시작
   */
  async subscribe(
    userId: string,
    plan: MembershipPlan,
    billingCycle: BillingCycle,
    price: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const now = new Date();
      const endDate = new Date(now);

      if (billingCycle === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          membership: plan,
          membershipBillingCycle: billingCycle,
          membershipStatus: 'ACTIVE',
          membershipPrice: price,
          membershipStartDate: firestore.FieldValue.serverTimestamp(),
          membershipEndDate: firestore.Timestamp.fromDate(endDate),
          membershipAutoRenew: true,
        });

      return { success: true, message: '멤버십이 활성화되었습니다.' };
    } catch (error: any) {
      console.error('멤버십 구독 실패:', error);
      return { success: false, message: error.message || '멤버십 구독에 실패했습니다.' };
    }
  }

  /**
   * 멤버십 해지 (기간 만료 시 자동 해지)
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await firestore().collection('users').doc(userId).update({
        membershipAutoRenew: false,
        membershipStatus: 'CANCELED',
      });

      return {
        success: true,
        message: '멤버십 자동 갱신이 해지되었습니다. 현재 기간까지 이용 가능합니다.',
      };
    } catch (error: any) {
      console.error('멤버십 해지 실패:', error);
      return { success: false, message: error.message || '멤버십 해지에 실패했습니다.' };
    }
  }

  /**
   * 멤버십 플랜 변경
   */
  async changePlan(
    userId: string,
    newPlan: MembershipPlan,
    billingCycle: BillingCycle,
    price: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await firestore().collection('users').doc(userId).update({
        membership: newPlan,
        membershipBillingCycle: billingCycle,
        membershipPrice: price,
        membershipStatus: 'ACTIVE',
        membershipAutoRenew: true,
      });

      return { success: true, message: `${newPlan} 플랜으로 변경되었습니다.` };
    } catch (error: any) {
      console.error('플랜 변경 실패:', error);
      return { success: false, message: error.message || '플랜 변경에 실패했습니다.' };
    }
  }

  /**
   * 멤버십 만료 확인
   */
  async checkExpiration(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(userId);
      if (!subscription) return true;

      const now = new Date();
      if (subscription.endDate < now && subscription.status === 'ACTIVE') {
        // 만료 처리
        await firestore().collection('users').doc(userId).update({
          membership: 'FREE',
          membershipStatus: 'EXPIRED',
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('만료 확인 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 export
export const subscriptionService = new SubscriptionServiceClass();
