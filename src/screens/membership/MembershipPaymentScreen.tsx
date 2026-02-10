// MembershipPaymentScreen.tsx - 멤버십 결제 화면 (Toss Widget SDK 연동)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { useAuthStore } from '@/store/useAuthStore';
import { tossPayments, TOSS_CLIENT_KEY } from '@/services/payment/tossPayments';
import { subscriptionService } from '@/services/payment/subscriptionService';
import type { MembershipPlan, BillingCycle } from '@/services/payment/subscriptionService';

const USE_WIDGET = !!TOSS_CLIENT_KEY;

// --- Widget 모드 결제 내용 ---
const WidgetPaymentContent: React.FC<{
  plan: string;
  billingCycle: string;
  price: number;
}> = ({ plan, billingCycle, price }) => {
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
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const orderId = tossPayments.generateOrderId('MEMBERSHIP');

      const result = await paymentWidget.requestPayment({
        orderId,
        orderName: `Golf Pub ${plan} 멤버십 (${billingCycle === 'MONTHLY' ? '월간' : '연간'})`,
        customerEmail: user.email || undefined,
        customerName: user.displayName || '회원',
      });

      if (result?.success) {
        // 결제 확인 (Cloud Functions)
        const confirmResult = await tossPayments.confirmPayment(
          result.success.paymentKey,
          result.success.orderId,
          result.success.amount,
        );

        if (!confirmResult.success) {
          Alert.alert('결제 확인 실패', confirmResult.message);
          return;
        }

        // 멤버십 구독 시작
        const subResult = await subscriptionService.subscribe(
          user.uid,
          plan as MembershipPlan,
          billingCycle as BillingCycle,
          price,
        );

        if (!subResult.success) {
          Alert.alert('오류', subResult.message);
          return;
        }

        // 결제 성공 후 프로필 즉시 갱신 (게이트 해제)
        await useAuthStore.getState().refreshProfile(user.uid);

        navigation.navigate('MembershipSuccess' as any);
      } else if (result?.fail) {
        Alert.alert('결제 실패', result.fail.message);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '멤버십 결제에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>멤버십 플랜</Text>
              <Text style={styles.value}>{plan}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>결제 주기</Text>
              <Text style={styles.value}>{billingCycle === 'MONTHLY' ? '월간' : '연간'}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>결제 금액</Text>
              <Text style={styles.totalValue}>{price?.toLocaleString()}원</Text>
            </View>
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canPay && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={!canPay || processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>결제하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

// --- Fallback 모드 결제 내용 ---
const FallbackPaymentContent: React.FC<{
  plan: string;
  billingCycle: string;
  price: number;
}> = ({ plan, billingCycle, price }) => {
  const navigation = useNavigation<any>();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = () => {
    Alert.alert('결제 진행', '결제를 진행하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          try {
            const user = useAuthStore.getState().user;
            if (!user) {
              Alert.alert('오류', '로그인이 필요합니다.');
              return;
            }

            const orderId = tossPayments.generateOrderId('MEMBERSHIP');
            const paymentResult = await tossPayments.requestPayment({
              orderId,
              orderName: `Golf Pub ${plan} 멤버십 (${billingCycle === 'MONTHLY' ? '월간' : '연간'})`,
              amount: price,
              method: paymentMethod as any,
              customerName: user.displayName || '회원',
            });

            if (!paymentResult.success) {
              Alert.alert('결제 실패', paymentResult.message);
              return;
            }

            const result = await subscriptionService.subscribe(
              user.uid,
              plan as MembershipPlan,
              billingCycle as BillingCycle,
              price,
            );

            if (!result.success) {
              Alert.alert('오류', result.message);
              return;
            }

            // 결제 성공 후 프로필 즉시 갱신 (게이트 해제)
            await useAuthStore.getState().refreshProfile(user.uid);

            navigation.navigate('MembershipSuccess' as any);
          } catch (error: any) {
            Alert.alert('오류', error.message || '멤버십 결제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>멤버십 플랜</Text>
              <Text style={styles.value}>{plan}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>결제 주기</Text>
              <Text style={styles.value}>{billingCycle === 'MONTHLY' ? '월간' : '연간'}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>결제 금액</Text>
              <Text style={styles.totalValue}>{price?.toLocaleString()}원</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'card' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={styles.methodText}>💳 신용/체크카드</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'account' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('account')}
          >
            <Text style={styles.methodText}>🏦 계좌이체</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handlePayment}>
          <Text style={styles.buttonText}>결제하기</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

// --- 메인 화면 ---
export const MembershipPaymentScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as any;
  const { plan, billingCycle, price } = params || {};

  const user = useAuthStore((s) => s.user);
  const customerKey = user?.uid || 'anonymous';

  if (USE_WIDGET) {
    return (
      <View style={styles.container}>
        <PaymentWidgetProvider clientKey={TOSS_CLIENT_KEY} customerKey={customerKey}>
          <WidgetPaymentContent plan={plan} billingCycle={billingCycle} price={price} />
        </PaymentWidgetProvider>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FallbackPaymentContent plan={plan} billingCycle={billingCycle} price={price} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalRow: { borderBottomWidth: 0, marginTop: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  methodCardActive: { borderColor: '#10b981', backgroundColor: '#F0F8FF' },
  methodText: { fontSize: 16, fontWeight: '600' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  button: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
