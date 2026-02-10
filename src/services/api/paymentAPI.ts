// 결제 내역 조회 API

import {
  firestore,
  auth,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit as limitFn,
} from '@/services/firebase/firebaseConfig';

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
  getPaymentHistory: async (limitCount: number = 20): Promise<PaymentRecord[]> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('로그인이 필요합니다.');

    const q = query(
      collection(firestore, PAYMENTS_COLLECTION),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limitFn(limitCount),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as PaymentRecord[];
  },

  /**
   * 결제 상세 조회
   */
  getPaymentDetail: async (paymentId: string): Promise<PaymentRecord | null> => {
    const docSnap = await getDoc(doc(firestore, PAYMENTS_COLLECTION, paymentId));
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as PaymentRecord;
  },
};
