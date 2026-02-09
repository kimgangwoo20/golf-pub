// 커스텀 이미지 크롭 모달 — 핀치 줌 + 드래그 + 원형 가이드
// Android 시스템 크롭 UI 대체, 앱 테마 색상 버튼

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  PanResponder,
  Image as RNImage,
} from 'react-native';
import { colors, fontWeight } from '@/styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CROP_AREA_SIZE = SCREEN_WIDTH - 48;
const CROP_CENTER_Y = SCREEN_HEIGHT * 0.4;

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string | null;
  circular?: boolean;
  onConfirm: (uri: string) => void;
  onCancel: () => void;
}

/**
 * 커스텀 이미지 크롭 모달
 * - 핀치 줌 + 드래그로 이미지 위치/크기 조정
 * - 원형 크롭 가이드 오버레이 (프로필 사진용)
 * - 큰 초록색 "자르기 완료" 버튼
 */
export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  visible,
  imageUri,
  circular = true,
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });

  // 애니메이션 값
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // 제스처 추적용 ref
  const baseScale = useRef(1);
  const pinchScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialPinchDistance = useRef(0);

  // 이미지 원본 크기 로드
  useEffect(() => {
    if (imageUri) {
      RNImage.getSize(
        imageUri,
        (w, h) => setImageSize({ w, h }),
        () => setImageSize({ w: SCREEN_WIDTH, h: SCREEN_WIDTH }),
      );
      // 상태 리셋
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      baseScale.current = 1;
      pinchScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
    }
  }, [imageUri, scale, translateX, translateY]);

  // 이미지가 크롭 영역을 채우도록 초기 표시 크기 계산
  const getDisplaySize = useCallback(() => {
    if (imageSize.w === 0 || imageSize.h === 0) {
      return { width: CROP_AREA_SIZE, height: CROP_AREA_SIZE };
    }
    const ratio = imageSize.w / imageSize.h;
    if (ratio >= 1) {
      // 가로가 더 넓음 → 세로를 크롭 크기에 맞춤
      return { width: CROP_AREA_SIZE * ratio, height: CROP_AREA_SIZE };
    }
    // 세로가 더 넓음 → 가로를 크롭 크기에 맞춤
    return { width: CROP_AREA_SIZE, height: CROP_AREA_SIZE / ratio };
  }, [imageSize]);

  const displaySize = getDisplaySize();

  // 두 터치 사이 거리 계산
  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          initialPinchDistance.current = getDistance(touches);
          pinchScale.current = baseScale.current;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          // 핀치 줌
          const currentDistance = getDistance(touches);
          if (initialPinchDistance.current > 0) {
            const newScale = pinchScale.current * (currentDistance / initialPinchDistance.current);
            const clampedScale = Math.min(Math.max(newScale, 0.5), 4);
            scale.setValue(clampedScale);
          }
        } else {
          // 드래그 이동
          translateX.setValue(lastTranslateX.current + gestureState.dx);
          translateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        // 현재 값 저장
        // @ts-expect-error Animated.Value 내부 _value 접근
        lastTranslateX.current = translateX._value || 0;
        // @ts-expect-error Animated.Value 내부 _value 접근
        lastTranslateY.current = translateY._value || 0;
        // @ts-expect-error Animated.Value 내부 _value 접근
        baseScale.current = scale._value || 1;
      },
    }),
  ).current;

  const handleCrop = useCallback(async () => {
    if (!imageUri || imageSize.w === 0) return;
    setLoading(true);
    try {
      // 현재 transform 값 가져오기
      // @ts-expect-error Animated.Value 내부 _value 접근
      const currentScale = scale._value || 1;
      // @ts-expect-error Animated.Value 내부 _value 접근
      const currentTX = translateX._value || 0;
      // @ts-expect-error Animated.Value 내부 _value 접근
      const currentTY = translateY._value || 0;

      // 크롭 좌표 계산 (원본 이미지 기준)
      const imgToDisplayRatio = imageSize.w / displaySize.width;
      const scaledDisplayW = displaySize.width * currentScale;
      const scaledDisplayH = displaySize.height * currentScale;

      // 크롭 영역의 이미지 내 좌표
      const cropDisplayX = (scaledDisplayW - CROP_AREA_SIZE) / 2 - currentTX;
      const cropDisplayY = (scaledDisplayH - CROP_AREA_SIZE) / 2 - currentTY;

      const originX = Math.max(0, (cropDisplayX / currentScale) * imgToDisplayRatio);
      const originY = Math.max(0, (cropDisplayY / currentScale) * imgToDisplayRatio);
      const cropW = (CROP_AREA_SIZE / currentScale) * imgToDisplayRatio;
      const cropH = (CROP_AREA_SIZE / currentScale) * imgToDisplayRatio;

      // 범위 제한
      const safeOriginX = Math.min(originX, Math.max(0, imageSize.w - cropW));
      const safeOriginY = Math.min(originY, Math.max(0, imageSize.h - cropH));
      const safeCropW = Math.min(cropW, imageSize.w - safeOriginX);
      const safeCropH = Math.min(cropH, imageSize.h - safeOriginY);

      let ImageManipulator;
      try {
        ImageManipulator = require('expo-image-manipulator');
      } catch {
        // 모듈 없으면 원본 반환
        onConfirm(imageUri);
        return;
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.round(safeOriginX),
              originY: Math.round(safeOriginY),
              width: Math.round(safeCropW),
              height: Math.round(safeCropH),
            },
          },
          { resize: { width: 800 } },
        ],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );

      onConfirm(result.uri);
    } catch {
      // 크롭 실패 시 원본 사용
      onConfirm(imageUri);
    } finally {
      setLoading(false);
    }
  }, [imageUri, imageSize, displaySize, scale, translateX, translateY, onConfirm]);

  if (!imageUri) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerCancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.headerCancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>사진 자르기</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* 크롭 영역 */}
        <View style={styles.cropContainer}>
          {/* 이미지 (줌/패닝 가능) */}
          <Animated.View
            style={[
              styles.imageWrap,
              {
                width: displaySize.width,
                height: displaySize.height,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Animated.Image
              source={{ uri: imageUri }}
              style={{ width: displaySize.width, height: displaySize.height }}
              resizeMode="cover"
            />
          </Animated.View>

          {/* 반투명 오버레이 (크롭 영역 밖) */}
          <View style={styles.overlayContainer} pointerEvents="none">
            {/* 상단 */}
            <View
              style={[
                styles.overlayBlock,
                { top: 0, left: 0, right: 0, height: CROP_CENTER_Y - CROP_AREA_SIZE / 2 },
              ]}
            />
            {/* 하단 */}
            <View
              style={[
                styles.overlayBlock,
                { bottom: 0, left: 0, right: 0, top: CROP_CENTER_Y + CROP_AREA_SIZE / 2 },
              ]}
            />
            {/* 좌측 */}
            <View
              style={[
                styles.overlayBlock,
                {
                  top: CROP_CENTER_Y - CROP_AREA_SIZE / 2,
                  left: 0,
                  width: (SCREEN_WIDTH - CROP_AREA_SIZE) / 2,
                  height: CROP_AREA_SIZE,
                },
              ]}
            />
            {/* 우측 */}
            <View
              style={[
                styles.overlayBlock,
                {
                  top: CROP_CENTER_Y - CROP_AREA_SIZE / 2,
                  right: 0,
                  width: (SCREEN_WIDTH - CROP_AREA_SIZE) / 2,
                  height: CROP_AREA_SIZE,
                },
              ]}
            />
            {/* 원형 가이드 보더 */}
            <View
              style={[
                styles.cropGuide,
                {
                  top: CROP_CENTER_Y - CROP_AREA_SIZE / 2,
                  left: (SCREEN_WIDTH - CROP_AREA_SIZE) / 2,
                  width: CROP_AREA_SIZE,
                  height: CROP_AREA_SIZE,
                  borderRadius: circular ? CROP_AREA_SIZE / 2 : 16,
                },
              ]}
            />
          </View>
        </View>

        {/* 안내 텍스트 */}
        <Text style={styles.hintText}>손가락으로 이동, 두 손가락으로 확대/축소</Text>

        {/* 하단 버튼 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomCancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.bottomCancelText}>다시 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomConfirmBtn, loading && styles.btnDisabled]}
            onPress={handleCrop}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.bottomConfirmText}>자르기 완료</Text>
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
    backgroundColor: '#111',
  },

  // 상단 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#111',
  },
  headerCancelBtn: {
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
  cropContainer: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    position: 'absolute',
  },

  // 반투명 오버레이
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBlock: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cropGuide: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },

  // 안내
  hintText: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    paddingVertical: 10,
  },

  // 하단 버튼
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 42,
    paddingTop: 12,
    backgroundColor: '#111',
  },
  bottomCancelBtn: {
    flex: 1,
    paddingVertical: 16,
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
  btnDisabled: {
    opacity: 0.6,
  },
});
