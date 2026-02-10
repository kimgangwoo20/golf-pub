// ApplicantProfileScreen.tsx - 신청자 프로필 (Firestore 연동)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  getApplicantProfile,
  approveBookingRequest,
  rejectBookingRequest,
} from '@/services/firebase/firebaseBooking';
import { DEFAULT_AVATAR } from '@/constants/images';

export const ApplicantProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { requestId, bookingId, userId } = route.params || {};

  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const profile = await getApplicantProfile(userId);
      setApplicant(profile);
    } catch (error) {
      console.error('신청자 프로필 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleReject = () => {
    if (!requestId) return;
    Alert.alert('거절', '신청을 거절하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await rejectBookingRequest(requestId, bookingId, userId);
            if (result.success) {
              Alert.alert('완료', '신청이 거절되었습니다');
              navigation.goBack();
            } else {
              Alert.alert('오류', result.message);
            }
          } catch (error) {
            console.error('신청 거절 실패:', error);
            Alert.alert('오류', '신청 거절에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleApprove = () => {
    if (!requestId || !bookingId || !userId) return;
    Alert.alert('승인', '신청을 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: async () => {
          try {
            const result = await approveBookingRequest(requestId, bookingId, userId);
            if (result.success) {
              Alert.alert('완료', '신청이 승인되었습니다');
              navigation.goBack();
            } else {
              Alert.alert('오류', result.message);
            }
          } catch (error) {
            console.error('신청 승인 실패:', error);
            Alert.alert('오류', '신청 승인에 실패했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>신청자 프로필</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!applicant) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>신청자 프로필</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyText}>프로필을 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>신청자 프로필</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* 프로필 헤더 */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: applicant.avatar || DEFAULT_AVATAR }}
            style={styles.avatar}
            onError={() => {}}
          />
          <Text style={styles.name}>{applicant.name}</Text>
          <Text style={styles.level}>
            ⭐ {applicant.rating} • {applicant.level}
          </Text>
        </View>

        {/* 골프 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>골프 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>평균 스코어</Text>
            <Text style={styles.value}>{applicant.avgScore ? `${applicant.avgScore}타` : '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>경력</Text>
            <Text style={styles.value}>{applicant.experience || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>라운딩 횟수</Text>
            <Text style={styles.value}>{applicant.rounds ? `${applicant.rounds}회` : '-'}</Text>
          </View>
        </View>

        {/* 자기소개 */}
        {applicant.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개</Text>
            <Text style={styles.bio}>{applicant.bio}</Text>
          </View>
        ) : null}

        {/* 액션 버튼 */}
        {requestId && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
              <Text style={styles.rejectText}>거절</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
              <Text style={styles.approveText}>승인</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#f8f9fa',
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
  profileSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E5E5',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  level: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
