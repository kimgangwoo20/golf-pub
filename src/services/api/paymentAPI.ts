// 결제 내역 조회 API

import { firestore } from '@/services/firebase/firebaseConfig';
import auth from '@react-native-firebase/auth';

// 결제 내역 인터페이스
export interface PaymentRecord {
  id: string;
  userId: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  status: 'SUCCESS' | 'CANCELED' | 'PARTIAL_CANCELED' | 'FAILED';
  method?: string;
  bookingId?: string;
  bookingTitle?: string;
  cancelReason?: string;
  cancelAmount?: number;
  approvedAt?: any;
  canceledAt?: any;
  createdAt: any;
}

const PAYMENTS_COLLECTION = 'payments';

export const paymentAPI = {
  /**
   * 결제 내역 조회
   */
  getPaymentHistory: async (limit: number = 20): Promise<PaymentRecord[]> => {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error('로그인이 필요합니다.');

    const snapshot = await firestore
      .collection(PAYMENTS_COLLECTION)
      .where('userId', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PaymentRecord[];
  },

  /**
   * 결제 상세 조회
   */
  getPaymentDetail: async (paymentId: string): Promise<PaymentRecord | null> => {
    const doc = await firestore.collection(PAYMENTS_COLLECTION).doc(paymentId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as PaymentRecord;
  },
};
