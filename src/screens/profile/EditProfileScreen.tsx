import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { profileAPI } from '@/services/api/profileAPI';
import { showImagePickerOptions, compressImage } from '@/utils/imageUtils';
import { validators } from '@/utils/validators';
import { ImageCropModal } from '@/components/common/ImageCropModal';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';

export const EditProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { loadProfile: refreshProfileStore } = useProfileStore();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [handicap, setHandicap] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cropImageUri, setCropImageUri] = useState<string | null>(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileAPI.getMyProfile();
      if (profile) {
        setName(profile.name || '');
        setBio(profile.bio || '');
        setPhone(profile.phone || '');
        setHandicap(profile.handicap?.toString() || '0');
        setProfileImage(profile.profileImage || null);
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChangeProfileImage = async () => {
    // 시스템 크롭 비활성화 → 앱 자체 확인 모달 사용, quality 낮춰 용량 절감
    const uri = await showImagePickerOptions({ allowsEditing: false, quality: 0.5 });
    if (uri) {
      setCropImageUri(uri);
      setCropModalVisible(true);
    }
  };

  const handleCropConfirm = async (uri: string) => {
    setCropModalVisible(false);
    setCropImageUri(null);
    setIsUploadingImage(true);
    try {
      // 업로드 전 이미지 압축 (프로필용 600px, 네이티브 모듈 없으면 원본 반환)
      const compressed = await compressImage(uri, 600, 0.7);
      const downloadURL = await profileAPI.uploadProfileImage(compressed);
      setProfileImage(downloadURL);
      // Zustand 스토어 갱신 → ProfileScreen, MyHomeScreen에 즉시 반영
      if (user?.uid) {
        await refreshProfileStore(user.uid);
      }
      Alert.alert('완료', '프로필 이미지가 변경되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCropCancel = () => {
    setCropModalVisible(false);
    setCropImageUri(null);
  };

  const handleSave = async () => {
    if (!validators.isValidNickname(name.trim())) {
      Alert.alert('알림', '이름은 2~10자로 입력해주세요.');
      return;
    }

    if (phone.trim() && !validators.isValidPhoneNumber(phone.trim())) {
      Alert.alert('알림', '올바른 전화번호 형식을 입력해주세요. (예: 010-0000-0000)');
      return;
    }

    // 핸디캡 범위 검증
    const handicapNum = parseInt(handicap, 10) || 0;
    if (handicapNum < 0 || handicapNum > 54) {
      Alert.alert('알림', '핸디캡은 0~54 사이의 값을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await profileAPI.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        handicap: handicapNum,
      });
      Alert.alert('저장 완료', '프로필이 수정되었습니다!', [
        { text: '확인', onPress: () => navigation?.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>프로필 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>프로필 수정</Text>
      </View>

      <View style={styles.form}>
        {/* 프로필 이미지 */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleChangeProfileImage}
            disabled={isUploadingImage}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>👤</Text>
              </View>
            )}
            {isUploadingImage ? (
              <View style={styles.imageOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.changeImageText}>프로필 사진 변경</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력하세요"
            maxLength={20}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>소개</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            placeholder="자기소개를 입력하세요"
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="010-0000-0000"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>핸디캡</Text>
          <TextInput
            style={styles.input}
            value={handicap}
            onChangeText={(text) => setHandicap(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="0"
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ImageCropModal
        visible={cropModalVisible}
        imageUri={cropImageUri}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  header: { padding: 24, paddingTop: 60 },
  backButton: { fontSize: 16, color: '#10b981', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  form: { paddingHorizontal: 24, paddingTop: 24 },
  imageSection: { alignItems: 'center', marginBottom: 32 },
  profileImageContainer: { width: 120, height: 120, borderRadius: 60, position: 'relative' },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: { fontSize: 48 },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editBadgeText: { fontSize: 16 },
  changeImageText: { marginTop: 12, fontSize: 14, color: '#10b981' },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveButtonDisabled: { opacity: 0.7 },
});
