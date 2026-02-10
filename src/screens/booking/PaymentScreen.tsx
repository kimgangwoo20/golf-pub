// PaymentScreen.tsx - 결제 화면 (Toss Widget SDK 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  PaymentWidgetProvider,
  PaymentMethodWidget,
  AgreementWidget,
  usePaymentWidget,
} from '@tosspayments/widget-sdk-react-native';
import type { AgreementStatus } from '@tosspayments/widget-sdk-react-native';
import { colors } from '@/styles/theme';
import { getBookingDetail } from '@/services/firebase/firebaseBooking';
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { tossPayments, TOSS_CLIENT_KEY } from '@/services/payment/tossPayments';
import {
  firestore,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from '@/services/firebase/firebaseConfig';

// Widget SDK 사용 가능 여부
const USE_WIDGET = !!TOSS_CLIENT_KEY;

type PaymentMethod = 'card' | 'account' | 'kakao' | 'naver';

// --- Widget 모드 결제 내용 ---
const PaymentWidgetContent: React.FC<{
  booking: any;
  bookingId: string;
  totalAmount: number;
}> = ({ booking, bookingId, totalAmount }) => {
  const navigation = useNavigation<any>();
  const paymentWidget = usePaymentWidget();
  const [paymentMethodReady, setPaymentMethodReady] = useState(false);
  const [agreementReady, setAgreementReady] = useState(false);
  const [agreementStatus, setAgreementStatus] = useState<AgreementStatus | null>(null);
  const [processing, setProcessing] = useState(false);

  const isReady = paymentMethodReady && agreementReady;
  const canPay = isReady && agreementStatus?.agreedRequiredTerms;

  const handlePayment = async () => {
    if (!canPay || processing) return;

    try {
      setProcessing(true);
      const user = useAuthStore.getState().user;
      if (!user || !bookingId) {
        Alert.alert('오류', '로그인 정보를 확인해주세요.');
        return;
      }

      const orderId = tossPayments.generateOrderId('BOOKING');

      // Widget SDK 결제 요청
      const result = await paymentWidget.requestPayment({
        orderId,
        orderName: booking.title || '골프 모임 참가비',
        customerEmail: user.email || undefined,
        customerName: user.displayName || '참가자',
      });

      if (result?.success) {
        // 결제 확인 (Cloud Functions 경유)
        const confirmResult = await tossPayments.confirmPayment(
          result.success.paymentKey,
          result.success.orderId,
          result.success.amount,
          bookingId,
        );

        if (!confirmResult.success) {
          Alert.alert('결제 확인 실패', confirmResult.message);
          return;
        }

        // 부킹 참가 처리
        await useBookingStore
          .getState()
          .joinBooking(bookingId, user.uid, user.displayName || '참가자');

        // 결제 정보 Firestore 저장
        await addDoc(collection(firestore, 'payments'), {
          paymentKey: result.success.paymentKey,
          orderId: result.success.orderId,
          bookingId,
          userId: user.uid,
          amount: result.success.amount,
          method: 'card',
          status: 'DONE',
          approvedAt: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });

        Alert.alert('결제 완료!', '참가 신청이 완료되었습니다.\n호스트의 승인을 기다려주세요.', [
          { text: '확인', onPress: () => navigation.navigate('BookingList' as any) },
        ]);
      } else if (result?.fail) {
        Alert.alert('결제 실패', result.fail.message);
      }
    } catch (error: any) {
      Alert.alert('결제 실패', error.message || '결제 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 예약 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예약 정보</Text>
          <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>{booking.title}</Text>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>골프장</Text>
              <Text style={styles.bookingValue}>{booking.golfCourse}</Text>
            </View>
            {booking.location ? (
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingLabel}>지역</Text>
                <Text style={styles.bookingValue}>{booking.location}</Text>
              </View>
            ) : null}
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>날짜</Text>
              <Text style={styles.bookingValue}>{booking.date}</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>시간</Text>
              <Text style={styles.bookingValue}>{booking.time}</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>호스트</Text>
              <Text style={styles.bookingValue}>{booking.hostName}</Text>
            </View>
          </View>
        </View>

        {/* 결제 금액 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 금액</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>라운딩 비용</Text>
              <Text style={styles.priceValue}>{totalAmount.toLocaleString()}원</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>플랫폼 수수료 (5%)</Text>
              <Text style={styles.priceFee}>포함</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>총 결제 금액</Text>
              <Text style={styles.totalValue}>{totalAmount.toLocaleString()}원</Text>
            </View>
          </View>
        </View>

        {/* 에스크로 안내 */}
        <View style={styles.section}>
          <View style={styles.escrowCard}>
            <Text style={styles.escrowTitle}>🔒 안전한 에스크로 결제</Text>
            <Text style={styles.escrowDesc}>
              결제하신 금액은 에스크로로 안전하게 보관됩니다.{'\n'}
              라운딩 완료 후 호스트에게 전달되며,{'\n'}
              취소 시 전액 환불됩니다.
            </Text>
          </View>
        </View>

        {/* 결제 수단 위젯 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <PaymentMethodWidget
            selector="payment-method"
            onLoadEnd={() => setPaymentMethodReady(true)}
          />
        </View>

        {/* 약관 동의 위젯 */}
        <View style={styles.section}>
          <AgreementWidget
            selector="agreement"
            onChange={(status) => setAgreementStatus(status)}
            onLoadEnd={() => setAgreementReady(true)}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 결제 버튼 */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>총 결제 금액</Text>
          <Text style={styles.bottomPrice}>{totalAmount.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity
          style={[styles.paymentButton, !canPay && styles.paymentButtonDisabled]}
          onPress={handlePayment}
          disabled={!canPay || processing}
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.paymentButtonText}>{totalAmount.toLocaleString()}원 결제하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

// --- Fallback 모드 (시뮬레이션) 결제 내용 ---
const FallbackPaymentContent: React.FC<{
  booking: any;
  bookingId: string;
  totalAmount: number;
}> = ({ booking, bookingId, totalAmount }) => {
  const navigation = useNavigation<any>();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [agreed, setAgreed] = useState(false);

  const paymentMethods = [
    { key: 'card' as PaymentMethod, label: '신용/체크카드', icon: '💳' },
    { key: 'account' as PaymentMethod, label: '계좌이체', icon: '🏦' },
    { key: 'kakao' as PaymentMethod, label: '카카오페이', icon: '💛' },
    { key: 'naver' as PaymentMethod, label: '네이버페이', icon: '💚' },
  ];

  const handlePayment = () => {
    if (!agreed) {
      Alert.alert('약관 동의 필요', '결제 진행을 위해 약관에 동의해주세요.');
      return;
    }

    Alert.alert(
      '결제 확인',
      `${totalAmount.toLocaleString()}원을 결제하시겠습니까?\n\n에스크로로 안전하게 보관되며,\n라운딩 완료 후 호스트에게 전달됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제',
          onPress: async () => {
            try {
              const user = useAuthStore.getState().user;
              if (!user || !bookingId) {
                Alert.alert('오류', '로그인 정보를 확인해주세요.');
                return;
              }

              const orderId = tossPayments.generateOrderId('BOOKING');
              const paymentResult = await tossPayments.requestPayment({
                orderId,
                orderName: booking.title || '골프 모임 참가비',
                amount: totalAmount,
                method: selectedMethod,
                customerName: user.displayName || '참가자',
                customerEmail: user.email || undefined,
              });

              if (!paymentResult.success) {
                Alert.alert('결제 실패', paymentResult.message);
                return;
              }

              await useBookingStore
                .getState()
                .joinBooking(bookingId, user.uid, user.displayName || '참가자');

              await addDoc(collection(firestore, 'payments'), {
                paymentKey: paymentResult.paymentKey,
                orderId: paymentResult.orderId,
                bookingId,
                userId: user.uid,
                amount: paymentResult.amount,
                method: paymentResult.method,
                status: 'DONE',
                approvedAt: paymentResult.approvedAt,
                createdAt: serverTimestamp(),
              });

              Alert.alert(
                '결제 완료!',
                '참가 신청이 완료되었습니다.\n호스트의 승인을 기다려주세요.',
                [{ text: '확인', onPress: () => navigation.navigate('BookingList' as any) }],
              );
            } catch (error: any) {
              Alert.alert('참가 실패', error.message || '부킹 참가에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 예약 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예약 정보</Text>
          <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>{booking.title}</Text>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>골프장</Text>
              <Text style={styles.bookingValue}>{booking.golfCourse}</Text>
            </View>
            {booking.location ? (
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingLabel}>지역</Text>
                <Text style={styles.bookingValue}>{booking.location}</Text>
              </View>
            ) : null}
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>날짜</Text>
              <Text style={styles.bookingValue}>{booking.date}</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>시간</Text>
              <Text style={styles.bookingValue}>{booking.time}</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>호스트</Text>
              <Text style={styles.bookingValue}>{booking.hostName}</Text>
            </View>
          </View>
        </View>

        {/* 결제 금액 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 금액</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>라운딩 비용</Text>
              <Text style={styles.priceValue}>{totalAmount.toLocaleString()}원</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>플랫폼 수수료 (5%)</Text>
              <Text style={styles.priceFee}>포함</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>총 결제 금액</Text>
              <Text style={styles.totalValue}>{totalAmount.toLocaleString()}원</Text>
            </View>
          </View>
        </View>

        {/* 에스크로 안내 */}
        <View style={styles.section}>
          <View style={styles.escrowCard}>
            <Text style={styles.escrowTitle}>🔒 안전한 에스크로 결제</Text>
            <Text style={styles.escrowDesc}>
              결제하신 금액은 에스크로로 안전하게 보관됩니다.{'\n'}
              라운딩 완료 후 호스트에게 전달되며,{'\n'}
              취소 시 전액 환불됩니다.
            </Text>
          </View>
        </View>

        {/* 결제 수단 (Fallback) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <View style={styles.methodGrid}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.methodCard,
                  selectedMethod === method.key && styles.methodCardActive,
                ]}
                onPress={() => setSelectedMethod(method.key)}
              >
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <Text
                  style={[
                    styles.methodLabel,
                    selectedMethod === method.key && styles.methodLabelActive,
                  ]}
                >
                  {method.label}
                </Text>
                {selectedMethod === method.key && (
                  <View style={styles.checkMark}>
                    <Text style={styles.checkMarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 약관 동의 (Fallback) */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.agreementRow} onPress={() => setAgreed(!agreed)}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkboxIcon}>✓</Text>}
            </View>
            <Text style={styles.agreementText}>결제 진행 및 환불 규정에 동의합니다.</Text>
          </TouchableOpacity>
          <Text style={styles.agreementDetail}>
            • 라운딩 2일 전까지: 전액 환불{'\n'}• 라운딩 1일 전까지: 50% 환불{'\n'}• 라운딩 당일:
            환불 불가
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 결제 버튼 */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>총 결제 금액</Text>
          <Text style={styles.bottomPrice}>{totalAmount.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity
          style={[styles.paymentButton, !agreed && styles.paymentButtonDisabled]}
          onPress={handlePayment}
          disabled={!agreed}
        >
          <Text style={styles.paymentButtonText}>{totalAmount.toLocaleString()}원 결제하기</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

// --- 메인 화면 ---
export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route.params?.bookingId as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const customerKey = user?.uid || 'anonymous';

  const loadBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const bookingData = await getBookingDetail(bookingId);

      if (bookingData) {
        let hostName = '호스트';
        if (bookingData.hostId) {
          try {
            const hostDocSnap = await getDoc(doc(firestore, 'users', bookingData.hostId));
            const hostData = hostDocSnap.data();
            hostName = hostData?.name || hostData?.displayName || '호스트';
          } catch {
            // 호스트 정보 조회 실패 시 기본값 사용
          }
        }

        setBooking({
          id: bookingData.id,
          title: bookingData.title || '',
          golfCourse: bookingData.course || '',
          location: '',
          date: bookingData.date || '',
          time: bookingData.time || '',
          price: bookingData.price?.original || 0,
          hostName,
        });
      }
    } catch (error) {
      console.error('부킹 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const totalAmount = booking?.price || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>결제</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>결제 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>결제</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>부킹 정보를 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Widget SDK 사용 가능 시 Provider로 래핑
  if (USE_WIDGET) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>결제</Text>
          <View style={{ width: 24 }} />
        </View>
        <PaymentWidgetProvider clientKey={TOSS_CLIENT_KEY} customerKey={customerKey}>
          <PaymentWidgetContent booking={booking} bookingId={bookingId} totalAmount={totalAmount} />
        </PaymentWidgetProvider>
      </SafeAreaView>
    );
  }

  // Fallback (시뮬레이션 모드)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제</Text>
        <View style={{ width: 24 }} />
      </View>
      <FallbackPaymentContent booking={booking} bookingId={bookingId} totalAmount={totalAmount} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  bookingCard: {
    padding: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookingLabel: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  bookingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceBreakdown: {
    padding: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceFee: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  escrowCard: {
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  escrowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  escrowDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  methodCard: {
    width: '50%',
    padding: 6,
  },
  methodCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  methodLabelActive: {
    color: colors.primary,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  agreementDetail: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18,
    marginLeft: 36,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomLabel: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
