// CreatePostScreen.tsx - 게시물 작성 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/useAuthStore';
import { firestore as firebaseFirestore, FirestoreTimestamp } from '@/services/firebase/firebaseConfig';
import { firebaseStorage } from '@/services/firebase/firebaseStorage';

const { width: _width } = Dimensions.get('window');
const MAX_IMAGES = 10;
const MAX_TEXT_LENGTH = 500;

export const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();
  const routeParams = (route.params as any) || {};
  const postType: string = routeParams.type || 'photo';

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const handleAddImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('알림', `최대 ${MAX_IMAGES}장까지 첨부 가능합니다.`);
      return;
    }

    // 앨범 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '앨범 접근을 위해 권한이 필요합니다.');
      return;
    }

    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages].slice(0, MAX_IMAGES));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddLocation = () => {
    Alert.alert('위치 추가', '골프장을 검색하세요', [
      {
        text: 'Mock 위치 추가',
        onPress: () => setLocation('남서울CC'),
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const handleAddHashtag = () => {
    (Alert.prompt as any)(
      '해시태그 추가',
      '해시태그를 입력하세요 (# 제외)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: (text: string) => {
            if (text && text.trim()) {
              const tag = text.trim().replace('#', '');
              if (!hashtags.includes(tag)) {
                setHashtags([...hashtags, tag]);
              }
            }
          },
        },
      ],
      'plain-text',
    );
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleSaveDraft = () => {
    Alert.alert('임시저장', '게시물이 임시저장되었습니다.');
  };

  const handlePublish = () => {
    // 유효성 검증
    if (content.trim().length === 0) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    if (content.length > MAX_TEXT_LENGTH) {
      Alert.alert('알림', `내용은 ${MAX_TEXT_LENGTH}자까지 입력 가능합니다.`);
      return;
    }

    if (!user) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    Alert.alert('게시물 등록', '게시물을 등록하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '등록',
        onPress: async () => {
          try {
            setPublishing(true);

            // 이미지 업로드
            let uploadedImageUrls: string[] = [];
            if (images.length > 0) {
              const tempPostId = `post_${Date.now()}`;
              const results = await firebaseStorage.uploadMultipleImages(
                images,
                `posts/${tempPostId}`,
              );
              uploadedImageUrls = results.map((r) => r.url);
            }

            // Firestore에 게시물 저장
            await firebaseFirestore.collection('posts').add({
              author: {
                id: user.uid,
                name: user.displayName || '사용자',
                image: user.photoURL || '',
              },
              type: postType,
              content: content.trim(),
              images: uploadedImageUrls,
              hashtags,
              location: location || null,
              visibility,
              likes: 0,
              comments: 0,
              status: 'published',
              createdAt: FirestoreTimestamp.now(),
            });

            setPublishing(false);
            Alert.alert('완료', '게시물이 등록되었습니다.', [
              { text: '확인', onPress: () => navigation.goBack() },
            ]);
          } catch (error: any) {
            setPublishing(false);
            Alert.alert('오류', error.message || '게시물 등록에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    if (content.trim().length > 0 || images.length > 0) {
      Alert.alert('작성 취소', '작성 중인 내용이 사라집니다.\n임시저장하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '임시저장', onPress: handleSaveDraft },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>게시물 작성</Text>
          <TouchableOpacity onPress={handleSaveDraft}>
            <Text style={styles.draftText}>임시저장</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 텍스트 입력 */}
          <View style={styles.textSection}>
            <TextInput
              style={styles.textInput}
              placeholder="골프 이야기를 공유해보세요..."
              placeholderTextColor="#999"
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={MAX_TEXT_LENGTH}
            />
            <Text style={styles.charCount}>
              {content.length} / {MAX_TEXT_LENGTH}
            </Text>
          </View>

          {/* 이미지 미리보기 */}
          {images.length > 0 && (
            <View style={styles.imagesPreview}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imagePreviewItem}>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.imageCountText}>
                {images.length} / {MAX_IMAGES}
              </Text>
            </View>
          )}

          {/* 위치 표시 */}
          {location && (
            <View style={styles.locationPreview}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationName}>{location}</Text>
              <TouchableOpacity onPress={() => setLocation('')}>
                <Text style={styles.removeLocationText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 해시태그 표시 */}
          {hashtags.length > 0 && (
            <View style={styles.hashtagsPreview}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {hashtags.map((tag, index) => (
                  <View key={index} style={styles.hashtagItem}>
                    <Text style={styles.hashtagText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveHashtag(tag)}>
                      <Text style={styles.removeHashtagText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 옵션 */}
          <View style={styles.optionsSection}>
            <TouchableOpacity style={styles.optionButton} onPress={handleAddImage}>
              <Text style={styles.optionIcon}>🖼️</Text>
              <Text style={styles.optionText}>사진/동영상</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleAddLocation}>
              <Text style={styles.optionIcon}>📍</Text>
              <Text style={styles.optionText}>위치</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleAddHashtag}>
              <Text style={styles.optionIcon}>#️⃣</Text>
              <Text style={styles.optionText}>해시태그</Text>
            </TouchableOpacity>
          </View>

          {/* 공개 범위 */}
          <View style={styles.visibilitySection}>
            <Text style={styles.sectionTitle}>공개 범위</Text>
            <View style={styles.visibilityButtons}>
              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  visibility === 'public' && styles.visibilityButtonActive,
                ]}
                onPress={() => setVisibility('public')}
              >
                <Text
                  style={[
                    styles.visibilityButtonText,
                    visibility === 'public' && styles.visibilityButtonTextActive,
                  ]}
                >
                  🌍 전체 공개
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  visibility === 'friends' && styles.visibilityButtonActive,
                ]}
                onPress={() => setVisibility('friends')}
              >
                <Text
                  style={[
                    styles.visibilityButtonText,
                    visibility === 'friends' && styles.visibilityButtonTextActive,
                  ]}
                >
                  👥 친구만
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 게시 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.publishButton,
              (content.trim().length === 0 || publishing) && styles.publishButtonDisabled,
            ]}
            onPress={handlePublish}
            disabled={content.trim().length === 0 || publishing}
          >
            {publishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishButtonText}>게시</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  draftText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  textSection: {
    padding: 20,
  },
  textInput: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  imagesPreview: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  imagePreviewItem: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  imageCountText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationName: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  removeLocationText: {
    fontSize: 18,
    color: '#999',
  },
  hashtagsPreview: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  hashtagText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  removeHashtagText: {
    fontSize: 14,
    color: '#10b981',
  },
  optionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  visibilitySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  visibilityButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#10b981',
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  visibilityButtonTextActive: {
    color: '#10b981',
  },
  bottomSpacing: {
    height: 40,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  publishButton: {
    height: 56,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
