// 이미지 크롭 모달 (핀치줌 + 드래그)
// - gesture-handler + reanimated로 구현
// - 네이티브 크롭 모듈 미사용 (TurboModule 호환성 이슈 방지)
// - 원형 프레임 오버레이 + 크롭 메타데이터 반환

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fontWeight } from '@/styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH - 64;

// 크롭 데이터 (원본 이미지에 대한 변환 메타데이터)
export interface CropData {
  scale: number;
  translateX: number;
  translateY: number;
}

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string | null;
  circular?: boolean;
  onConfirm: (uri: string, cropData?: CropData) => void;
  onCancel: () => void;
}

/**
 * 이미지 크롭 모달
 * - 핀치줌 + 드래그로 이미지 위치/크기 조절
 * - 원형 프레임으로 프로필 사진 미리보기
 * - 크롭 메타데이터(scale, translateX, translateY) 반환
 */
export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  visible,
  imageUri,
  circular = true,
  onConfirm,
  onCancel,
}) => {
  // 제스처 상태 (reanimated shared values)
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // 제스처 초기화
  const resetGestures = useCallback(() => {
    'worklet';
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  // 이미지 애니메이션 스타일 (hooks는 항상 같은 순서로 호출해야 함)
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!imageUri) return null;

  // 핀치 제스처 (확대/축소)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  // 팬 제스처 (드래그 이동)
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      const maxOffset = (scale.value - 1) * CROP_SIZE * 0.5 + 50;
      if (Math.abs(translateX.value) > maxOffset) {
        translateX.value = withSpring(translateX.value > 0 ? maxOffset : -maxOffset);
      }
      if (Math.abs(translateY.value) > maxOffset) {
        translateY.value = withSpring(translateY.value > 0 ? maxOffset : -maxOffset);
      }
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // 더블탭 제스처 (2배 확대/원래 크기 토글)
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (savedScale.value > 1.5) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  // 핀치 + 팬 동시 인식
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const handleConfirm = () => {
    const cropData: CropData = {
      scale: savedScale.value,
      translateX: savedTranslateX.value,
      translateY: savedTranslateY.value,
    };
    onConfirm(imageUri, cropData);
    // 초기화
    resetGestures();
  };

  const handleCancel = () => {
    onCancel();
    resetGestures();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleCancel} activeOpacity={0.7}>
              <Text style={styles.headerCancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>사진 조정</Text>
            <View style={styles.headerBtn} />
          </View>

          {/* 크롭 영역 */}
          <View style={styles.cropArea}>
            {/* 이미지 (핀치줌 + 드래그) */}
            <GestureDetector gesture={composedGesture}>
              <Animated.Image
                source={{ uri: imageUri }}
                style={[styles.cropImage, animatedImageStyle]}
                resizeMode="cover"
                onError={() => {}}
              />
            </GestureDetector>

            {/* 원형 프레임 마스크 오버레이 */}
            <View style={styles.maskOverlay} pointerEvents="none">
              {/* 상단 마스크 */}
              <View style={styles.maskTop} />
              {/* 중간 행: 좌 마스크 + 투명 원형 + 우 마스크 */}
              <View style={styles.maskMiddleRow}>
                <View style={styles.maskSide} />
                <View style={[styles.cropFrame, circular && { borderRadius: CROP_SIZE / 2 }]} />
                <View style={styles.maskSide} />
              </View>
              {/* 하단 마스크 */}
              <View style={styles.maskBottom} />
            </View>
          </View>

          {/* 힌트 텍스트 */}
          <Text style={styles.hintText}>핀치 확대/축소, 드래그하여 위치 조정</Text>

          {/* 하단 버튼 */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.bottomCancelBtn}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
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
      </GestureHandlerRootView>
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

  // 크롭 영역
  cropArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cropImage: {
    width: CROP_SIZE + 100,
    height: CROP_SIZE + 100,
  },

  // 마스크 오버레이 (반투명 검은색)
  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskMiddleRow: {
    flexDirection: 'row',
    height: CROP_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cropFrame: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
  },
  maskBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  hintText: {
    textAlign: 'center',
    marginVertical: 16,
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
