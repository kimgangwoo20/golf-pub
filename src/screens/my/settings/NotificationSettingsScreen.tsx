// NotificationSettingsScreen.tsx - 알림 설정 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  // 알림 설정 상태
  const [pushEnabled, setPushEnabled] = useState(true);
  const [bookingNotif, setBookingNotif] = useState(true);
  const [chatNotif, setChatNotif] = useState(true);
  const [reviewNotif, setReviewNotif] = useState(true);
  const [marketplaceNotif, setMarketplaceNotif] = useState(false);
  const [eventNotif, setEventNotif] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>알림 설정</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 전체 푸시 알림 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>푸시 알림</Text>
            </View>
            <View style={styles.settingCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>전체 푸시 알림</Text>
                  <Text style={styles.settingDescription}>
                    모든 알림을 받습니다
                  </Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: '#E5E5E5', true: '#A5D6A7' }}
                  thumbColor={pushEnabled ? '#2E7D32' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* 알림 종류 */}
          {pushEnabled && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>알림 종류</Text>
              </View>
              <View style={styles.settingCard}>
                {/* 부킹 알림 */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.labelRow}>
                      <Text style={styles.settingIcon}>⛳</Text>
                      <Text style={styles.settingLabel}>모임 알림</Text>
                    </View>
                    <Text style={styles.settingDescription}>
                      모임 신청, 승인, 취소 등
                    </Text>
                  </View>
                  <Switch
                    value={bookingNotif}
                    onValueChange={setBookingNotif}
                    trackColor={{ false: '#E5E5E5', true: '#A5D6A7' }}
                    thumbColor={bookingNotif ? '#2E7D32' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                {/* 채팅 알림 */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.labelRow}>
                      <Text style={styles.settingIcon}>💬</Text>
                      <Text style={styles.settingLabel}>채팅 알림</Text>
                    </View>
                    <Text style={styles.settingDescription}>
                      새로운 메시지 도착 시
                    </Text>
                  </View>
                  <Switch
                    value={chatNotif}
                    onValueChange={setChatNotif}
                    trackColor={{ false: '#E5E5E5', true: '#A5D6A7' }}
                    thumbColor={chatNotif ? '#2E7D32' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                {/* 후기 알림 */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.labelRow}>
                      <Text style={styles.settingIcon}>⭐</Text>
                      <Text style={styles.settingLabel}>후기 알림</Text>
                    </View>
                    <Text style={styles.settingDescription}>
                      새로운 후기 작성 시
                    </Text>
                  </View>
                  <Switch
                    value={reviewNotif}
                    onValueChange={setReviewNotif}
                    trackColor={{ false: '#E5E5E5', true: '#A5D6A7' }}
                    thumbColor={reviewNotif ? '#2E7D32' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                {/* 중고거래 알림 */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.labelRow}>
                      <Text style={styles.settingIcon}>🛒</Text>
                      <Text style={styles.settingLabel}>중고거래 알림</Text>
                    </View>
                    <Text style={styles.settingDescription}>
                      관심 상품 가격 변동 등
                    </Text>
                  </View>
                  <Switch
                    value={marketplaceNotif}
                    onValueChange={setMarketplaceNotif}
                    trackColor={{ false: '#E5E5E5', true: '#A5D6A7' }}
                    thumbColor={marketplaceNotif ? '#2E7D32' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                {/* 이벤트 알림 */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.labelRow}>
                      <Text style={styles.settingIcon}>🎉</Text>
                      <Text style={styles.settingLabel}>이벤트 알림</Text>
                    </View>
                    <Text style={styles.settingDescription}>
                      이벤트, 혜택 정보
                    </Text>
                  </View>
                  <Switch
                    value={eventNotif}
                    onValueChange={setEventNotif}
                    trackColor={{ false: '#E5E5E5', true: '#A5D6A7' }}
                    thumbColor={eventNotif ? '#2E7D32' : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>
          )}

          {/* 안내 */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              💡 알림 설정은 즉시 적용됩니다.
            </Text>
            <Text style={styles.infoText}>
              ⚙️ 기기 설정에서 알림 권한을 확인해주세요.
            </Text>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  settingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#2E7D32',
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});