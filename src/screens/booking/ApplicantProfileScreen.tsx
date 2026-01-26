// ApplicantProfileScreen.tsx - 신청자 프로필
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';

const MOCK_APPLICANT = {
  name: '김철수',
  level: '중급',
  rating: 4.5,
  avatar: 'https://i.pravatar.cc/150?img=12',
  avgScore: 95,
  experience: '2년',
  rounds: 24,
  bio: '골프를 시작한지 2년 되었습니다. 함께 즐겁게 라운딩하고 싶습니다!',
};

export const ApplicantProfileScreen: React.FC<{ route?: any; navigation?: any }> = ({
  route,
  navigation,
}) => {
  const applicant = route?.params?.applicant || MOCK_APPLICANT;

  const handleReject = () => {
    Alert.alert('거절', '신청을 거절하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: () => {
          Alert.alert('완료', '신청이 거절되었습니다');
          navigation?.goBack();
        },
      },
    ]);
  };

  const handleApprove = () => {
    Alert.alert('승인', '신청을 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: () => {
          Alert.alert('완료', '신청이 승인되었습니다');
          navigation?.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Image source={{ uri: applicant.avatar }} style={styles.avatar} />
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
          <Text style={styles.value}>{applicant.avgScore}타</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>경력</Text>
          <Text style={styles.value}>{applicant.experience}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>라운딩 횟수</Text>
          <Text style={styles.value}>{applicant.rounds}회</Text>
        </View>
      </View>

      {/* 자기소개 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>자기소개</Text>
        <Text style={styles.bio}>{applicant.bio}</Text>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Text style={styles.rejectText}>거절</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
          <Text style={styles.approveText}>승인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    backgroundColor: '#007AFF',
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
