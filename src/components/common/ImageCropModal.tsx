// 커스텀 이미지 크롭 모달 — 네이티브 OS 크롭 UI 대체
// 큰 버튼 + 앱 테마 색상으로 가시성 향상

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { compressImage } from '@/utils/imageUtils';
import { colors, spacing, fontWeight } from '@/styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH - 40;

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string | null;
  onConfirm: (uri: string) => void;
  onCancel: () => void;
}

/**
 * 이미지 크롭 미리보기 모달
 * - 이미지 선택 후 확인/취소 버튼을 크고 눈에 잘 띄게 표시
 * - expo-image-picker의 allowsEditing으로 1차 크롭 후 이 모달로 최종 확인
 */
export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  visible,
  imageUri,
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      // 이미지 압축 (expo-image-manipulator 없으면 원본 반환)
      const compressed = await compressImage(imageUri, 800, 0.8);
      onConfirm(compressed);
    } finally {
      setLoading(false);
    }
  }, [imageUri, onConfirm]);

  if (!imageUri) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>사진 확인</Text>
          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.confirmText}>사용하기</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 이미지 미리보기 */}
        <View style={styles.previewArea}>
          <View style={styles.imageFrame}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          </View>
          <Text style={styles.hintText}>이 사진을 프로필에 사용합니다</Text>
        </View>

        {/* 하단 버튼 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomCancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.bottomCancelText}>다시 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomConfirmBtn, loading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.bottomConfirmText}>이 사진 사용</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // 상단 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: 17,
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
  // 미리보기 영역
  previewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrame: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  hintText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  // 하단 버튼
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  bottomCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
  },
  bottomCancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },
  bottomConfirmBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  bottomConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
});
