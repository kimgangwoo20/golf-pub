// WriteReviewScreen.tsx - 골프장 리뷰 작성 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { firestore as firebaseFirestore } from '@/services/firebase/firebaseConfig';
import { firebaseStorage } from '@/services/firebase/firebaseStorage';
import { colors, spacing } from '@/styles/theme';
import * as ImagePicker from 'expo-image-picker';

export const WriteReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();

  // @ts-expect-error route params 타입 미정의
  const courseId = route.params?.courseId as string;

  const [rating, setRating] = useState(5);
  const [courseRating, setCourseRating] = useState(5);
  const [facilityRating, setFacilityRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 별점 렌더링
  const renderStars = (value: number, onChange: (v: number) => void) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, star <= value && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingValue}>{value}.0</Text>
      </View>
    );
  };

  // 이미지 추가
  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert('알림', '이미지는 최대 5장까지 추가할 수 있습니다.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '앨범 접근을 위해 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  // 이미지 삭제
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 리뷰 제출
  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }
    if (content.trim().length < 10) {
      Alert.alert('알림', '리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    Alert.alert('리뷰 등록', '리뷰를 등록하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '등록',
        onPress: async () => {
          try {
            setSubmitting(true);

            // 이미지 업로드
            let imageUrls: string[] = [];
            if (images.length > 0) {
              const uploadResults = await firebaseStorage.uploadMultipleImages(
                images,
                `reviews/${courseId}/${Date.now()}`,
              );
              imageUrls = uploadResults.filter((r) => r.url).map((r) => r.url);
            }

            // Firestore에 리뷰 저장
            await firebaseFirestore.collection('golf_course_reviews').add({
              courseId,
              author: {
                id: user?.uid || '',
                name: user?.displayName || '익명',
                image: user?.photoURL || '',
                handicap: 18,
              },
              rating,
              courseRating,
              facilityRating,
              serviceRating,
              content: content.trim(),
              images: imageUrls,
              likes: 0,
              createdAt: new Date(),
            });

            Alert.alert('완료', '리뷰가 등록되었습니다.', [
              { text: '확인', onPress: () => navigation.goBack() },
            ]);
          } catch (error: any) {
            Alert.alert('오류', error.message || '리뷰 등록에 실패했습니다.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리뷰 작성</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 별점 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>평점</Text>

            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>종합 평점</Text>
              {renderStars(rating, setRating)}
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>코스 상태</Text>
              {renderStars(courseRating, setCourseRating)}
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>시설</Text>
              {renderStars(facilityRating, setFacilityRating)}
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>서비스</Text>
              {renderStars(serviceRating, setServiceRating)}
            </View>
          </View>

          {/* 리뷰 내용 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              리뷰 내용 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.contentInput}
              placeholder="골프장 이용 경험을 자세히 작성해주세요 (최소 10자)"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length}/500</Text>
          </View>

          {/* 이미지 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>사진 (선택)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Text style={styles.addImageIcon}>📷</Text>
                <Text style={styles.addImageText}>{images.length}/5</Text>
              </TouchableOpacity>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 등록 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>리뷰 등록</Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  required: {
    color: colors.danger,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  ratingLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    width: 80,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 28,
    color: '#D1D5DB',
  },
  starActive: {
    color: '#F59E0B',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    height: 150,
  },
  charCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  addImageIcon: {
    fontSize: 28,
    marginBottom: 2,
  },
  addImageText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  imageContainer: {
    marginLeft: spacing.md,
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
