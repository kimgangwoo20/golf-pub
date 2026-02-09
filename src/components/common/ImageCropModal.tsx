// 이미지 선택 확인 모달
// - 시스템 크롭 UI 대신 앱 자체 미리보기 제공
// - 원형 프레임 미리보기 + 확인/취소
// - 네이티브 모듈 미사용 (TurboModule 호환성 이슈 방지)

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontWeight } from '@/styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_SIZE = SCREEN_WIDTH - 64;

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string | null;
  circular?: boolean;
  onConfirm: (uri: string) => void;
  onCancel: () => void;
}

/**
 * 이미지 선택 확인 모달
 * - 시스템 크롭 UI 없이 앱 내부에서 미리보기
 * - 원형 프레임으로 프로필 사진 미리보기
 * - 네이티브 크롭 모듈 미사용 (New Architecture 호환)
 */
export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  visible,
  imageUri,
  circular = true,
  onConfirm,
  onCancel,
}) => {
  if (!imageUri) return null;

  const handleConfirm = () => {
    onConfirm(imageUri);
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.headerCancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>사진 확인</Text>
          <View style={styles.headerBtn} />
        </View>

        {/* 이미지 미리보기 */}
        <View style={styles.previewArea}>
          <View style={[styles.imageFrame, circular && { borderRadius: PREVIEW_SIZE / 2 }]}>
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
            style={styles.bottomConfirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomConfirmText}>선택 완료</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },

  // 상단 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 50,
  },
  headerCancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: 17,
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
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  hintText: {
    marginTop: 20,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },

  // 하단 버튼
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  bottomCancelBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
  },
  bottomCancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },
  bottomConfirmBtn: {
    flex: 1.5,
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  bottomConfirmText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
});
