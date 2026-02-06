// CreateProductScreen.tsx - 상품 등록 화면

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES, CONDITION_LABELS, ProductCategory, ProductCondition } from '../../types/marketplace-types';
import * as ImagePicker from 'expo-image-picker';

export const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleAddImage = () => {
    if (images.length >= 10) {
      Alert.alert('알림', '이미지는 최대 10장까지 추가할 수 있습니다.');
      return;
    }

    Alert.alert(
      '이미지 추가',
      '이미지를 가져올 방법을 선택하세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '카메라',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('권한 필요', '카메라 사용을 위해 권한이 필요합니다.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setImages(prev => [...prev, result.assets[0].uri]);
            }
          },
        },
        {
          text: '앨범',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('권한 필요', '앨범 접근을 위해 권한이 필요합니다.');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setImages(prev => [...prev, result.assets[0].uri]);
            }
          },
        },
      ]
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }
    if (!price.trim()) {
      Alert.alert('알림', '가격을 입력해주세요.');
      return;
    }
    if (!condition) {
      Alert.alert('알림', '상태를 선택해주세요.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('알림', '상세 설명을 입력해주세요.');
      return;
    }

    Alert.alert(
      '상품 등록',
      '상품을 등록하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '등록',
          onPress: () => {
            console.log('상품 등록:', { title, category, price, condition, location, description });
            Alert.alert('완료', '상품이 등록되었습니다.', [
              { text: '확인', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>상품 등록</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 이미지 추가 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              상품 이미지 <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Text style={styles.addImageIcon}>📷</Text>
                <Text style={styles.addImageText}>{images.length}/10</Text>
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

          {/* 제목 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              제목 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="상품 제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          {/* 카테고리 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              카테고리 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextActive,
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 가격 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              가격 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="0"
                value={price}
                onChangeText={(text) => setPrice(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />
              <Text style={styles.priceUnit}>원</Text>
            </View>
          </View>

          {/* 상태 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              상품 상태 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.conditionGrid}>
              {(Object.keys(CONDITION_LABELS) as ProductCondition[]).map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.conditionButton,
                    condition === cond && styles.conditionButtonActive,
                  ]}
                  onPress={() => setCondition(cond)}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    condition === cond && styles.conditionButtonTextActive,
                  ]}>
                    {CONDITION_LABELS[cond]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 거래 지역 */}
          <View style={styles.section}>
            <Text style={styles.label}>거래 지역</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 서울 강남구"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* 상세 설명 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              상세 설명 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="상품에 대해 자세히 설명해주세요"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 등록 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>등록하기</Text>
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
    fontSize: 24,
    color: '#1A1A1A',
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
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  required: {
    color: '#FF3B30',
  },
  imageScroll: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  addImageIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 13,
    color: '#666',
  },
  imageContainer: {
    marginLeft: 12,
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    width: '23%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  categoryButtonActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#2E7D32',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingRight: 16,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  priceUnit: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  conditionButtonActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  conditionButtonTextActive: {
    color: '#2E7D32',
  },
  descriptionInput: {
    height: 150,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});