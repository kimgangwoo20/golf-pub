// 배경 미디어 편집 모달
// - 이미지/영상 추가, 삭제
// - Modal 내부에서 Alert.alert 대신 커스텀 ActionSheet + Alert 오버레이 사용
// - 이미지 미리보기 (풀스크린 뷰어)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  BackHandler,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { profileAPI } from '@/services/api/profileAPI';
import { colors, fontWeight } from '@/styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMB_SIZE = (SCREEN_WIDTH - 80) / 3;
const MAX_MEDIA_COUNT = 5;
// 바텀시트 최대 높이 (화면의 85%)
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.85;
// FlatList 최대 높이 (시트 내부에서 스크롤 가능하도록)
const LIST_MAX_HEIGHT = SCREEN_HEIGHT * 0.45;

interface BackgroundMediaItem {
  url: string;
  type: 'image' | 'video';
  order: number;
}

interface BackgroundMediaEditorProps {
  visible: boolean;
  media: BackgroundMediaItem[];
  onClose: () => void;
  onUpdate: () => void;
}

interface AlertButton {
  text: string;
  style?: 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
}

/**
 * 배경 미디어 편집기
 * - 커스텀 ActionSheet (Modal 안에서 Alert.alert 사용 불가하므로)
 * - 커스텀 Alert 다이얼로그 (삭제 확인, 에러, 권한 안내)
 * - 풀스크린 미리보기
 * - 최대 5개 제한
 */
export const BackgroundMediaEditor: React.FC<BackgroundMediaEditorProps> = ({
  visible,
  media,
  onClose,
  onUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  // 커스텀 Alert 표시 (Modal 내부용)
  const showAlert = (title: string, message: string, buttons?: AlertButton[]) => {
    setAlertConfig({ title, message, buttons: buttons || [{ text: '확인' }] });
  };

  const dismissAlert = () => setAlertConfig(null);

  // Android 하드웨어 뒤로가기 처리
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (alertConfig) {
        setAlertConfig(null);
        return true;
      }
      if (showActionSheet) {
        setShowActionSheet(false);
        return true;
      }
      if (previewUri) {
        setPreviewUri(null);
        return true;
      }
      onClose();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [visible, previewUri, showActionSheet, alertConfig, onClose]);

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      setPreviewUri(null);
      setShowActionSheet(false);
      setAlertConfig(null);
    }
  }, [visible]);

  // 업로드 공통 로직
  const uploadMedia = async (uri: string, type: 'image' | 'video') => {
    try {
      setUploading(true);
      await profileAPI.addBackgroundMedia(uri, type);
      onUpdate();
    } catch (error: any) {
      showAlert('오류', error.message || '미디어 추가에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 카메라 촬영
  const takePhoto = async () => {
    setShowActionSheet(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert('카메라 권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.', [
          { text: '취소', style: 'cancel' },
          {
            text: '설정으로 이동',
            onPress: () => {
              dismissAlert();
              Linking.openSettings();
            },
          },
        ]);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;
      await uploadMedia(result.assets[0].uri, 'image');
    } catch (error: any) {
      showAlert('오류', error.message || '사진 촬영에 실패했습니다.');
    }
  };

  // 사진 갤러리
  const pickImage = async () => {
    setShowActionSheet(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('갤러리 권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.', [
          { text: '취소', style: 'cancel' },
          {
            text: '설정으로 이동',
            onPress: () => {
              dismissAlert();
              Linking.openSettings();
            },
          },
        ]);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;
      await uploadMedia(result.assets[0].uri, 'image');
    } catch (error: any) {
      showAlert('오류', error.message || '사진 선택에 실패했습니다.');
    }
  };

  // 동영상 갤러리
  const pickVideo = async () => {
    setShowActionSheet(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('갤러리 권한 필요', '동영상을 선택하려면 갤러리 접근 권한이 필요합니다.', [
          { text: '취소', style: 'cancel' },
          {
            text: '설정으로 이동',
            onPress: () => {
              dismissAlert();
              Linking.openSettings();
            },
          },
        ]);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;
      await uploadMedia(result.assets[0].uri, 'video');
    } catch (error: any) {
      showAlert('오류', error.message || '동영상 선택에 실패했습니다.');
    }
  };

  // 미디어 추가 — 커스텀 액션시트 표시
  const handleAddMedia = () => {
    if (uploading) return;
    if (media.length >= MAX_MEDIA_COUNT) {
      showAlert('알림', `배경 미디어는 최대 ${MAX_MEDIA_COUNT}개까지 등록할 수 있습니다.`);
      return;
    }
    setShowActionSheet(true);
  };

  // 삭제 실행 (Alert 닫은 후 비동기 처리)
  const performDelete = async (item: BackgroundMediaItem) => {
    try {
      setDeleting(item.url);
      await profileAPI.removeBackgroundMedia(item.url);
      onUpdate();
    } catch (error: any) {
      showAlert('오류', error.message || '삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  // 미디어 삭제 확인
  const handleDeleteMedia = (item: BackgroundMediaItem) => {
    showAlert('배경 미디어 삭제', '이 미디어를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          dismissAlert();
          performDelete(item);
        },
      },
    ]);
  };

  // 미디어 썸네일 렌더링
  const renderMediaItem = ({ item }: { item: BackgroundMediaItem }) => (
    <TouchableOpacity
      style={styles.thumbWrap}
      activeOpacity={0.8}
      onPress={() => setPreviewUri(item.url)}
    >
      <Image source={{ uri: item.url }} style={styles.thumb} onError={() => {}} />
      {item.type === 'video' && (
        <View style={styles.videoOverlay}>
          <Text style={styles.videoIcon}>▶</Text>
        </View>
      )}
      {deleting === item.url ? (
        <View style={styles.deleteOverlay}>
          <ActivityIndicator color="#fff" size="small" />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteMedia(item)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      )}
      <View style={styles.orderBadge}>
        <Text style={styles.orderText}>{item.order + 1}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleRequestClose = () => {
    if (alertConfig) {
      setAlertConfig(null);
    } else if (showActionSheet) {
      setShowActionSheet(false);
    } else if (previewUri) {
      setPreviewUri(null);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleRequestClose}>
      {/* 메인 편집 화면 */}
      <View style={styles.overlay}>
        <Pressable style={styles.overlayDismiss} onPress={onClose} />

        <View style={styles.container}>
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>배경 미디어 편집</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            사진/영상을 추가하여 프로필 배경을 꾸며보세요 ({media.length}/{MAX_MEDIA_COUNT})
          </Text>

          <FlatList
            data={media}
            keyExtractor={(item) => item.url}
            renderItem={renderMediaItem}
            numColumns={3}
            columnWrapperStyle={media.length > 1 ? styles.gridRow : undefined}
            contentContainerStyle={styles.gridContent}
            style={styles.mediaList}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>📷</Text>
                <Text style={styles.emptyText}>등록된 배경 미디어가 없습니다</Text>
                <Text style={styles.emptySubText}>아래 버튼을 눌러 추가해보세요</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={[
              styles.addBtn,
              (uploading || media.length >= MAX_MEDIA_COUNT) && styles.addBtnDisabled,
            ]}
            onPress={handleAddMedia}
            disabled={uploading || media.length >= MAX_MEDIA_COUNT}
            activeOpacity={0.7}
          >
            {uploading ? (
              <View style={styles.uploadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.uploadingText}>업로드 중...</Text>
              </View>
            ) : (
              <Text style={styles.addBtnText}>
                {media.length >= MAX_MEDIA_COUNT ? '최대 개수 도달' : '+ 미디어 추가'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 풀스크린 이미지 미리보기 (오버레이) */}
      {!!previewUri && (
        <View style={styles.previewContainer}>
          <Pressable style={styles.previewDismiss} onPress={() => setPreviewUri(null)} />
          <Image
            source={{ uri: previewUri }}
            style={styles.previewImage}
            resizeMode="contain"
            onError={() => {}}
          />
          <SafeAreaView edges={['top']} style={styles.previewCloseBar}>
            <TouchableOpacity
              style={styles.previewCloseBtn}
              onPress={() => setPreviewUri(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.previewCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {/* 커스텀 액션시트 (미디어 추가 선택) */}
      {showActionSheet && (
        <View style={styles.asOverlay}>
          <Pressable style={styles.asDismiss} onPress={() => setShowActionSheet(false)} />
          <SafeAreaView edges={['bottom']} style={styles.asWrap}>
            <View style={styles.asContent}>
              <Text style={styles.asTitle}>배경 미디어 추가</Text>
              <Text style={styles.asMessage}>미디어를 가져올 방법을 선택하세요</Text>
              <TouchableOpacity style={styles.asBtn} onPress={takePhoto} activeOpacity={0.6}>
                <Text style={styles.asBtnText}>📸 카메라 촬영</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.asBtn} onPress={pickImage} activeOpacity={0.6}>
                <Text style={styles.asBtnText}>🖼️ 사진 갤러리</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.asBtn, styles.asBtnLast]}
                onPress={pickVideo}
                activeOpacity={0.6}
              >
                <Text style={styles.asBtnText}>🎬 동영상 갤러리</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.asCancelBtn}
              onPress={() => setShowActionSheet(false)}
              activeOpacity={0.6}
            >
              <Text style={styles.asCancelText}>취소</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {/* 커스텀 Alert 다이얼로그 (삭제 확인, 에러, 권한 안내) */}
      {!!alertConfig && (
        <View style={styles.dlgOverlay}>
          <View style={styles.dlgCard}>
            <Text style={styles.dlgTitle}>{alertConfig.title}</Text>
            {!!alertConfig.message && <Text style={styles.dlgMessage}>{alertConfig.message}</Text>}
            <View style={styles.dlgBtnRow}>
              {alertConfig.buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dlgBtn, idx > 0 && styles.dlgBtnBorder]}
                  onPress={() => {
                    if (btn.onPress) {
                      btn.onPress();
                    } else {
                      dismissAlert();
                    }
                  }}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.dlgBtnText,
                      btn.style === 'cancel' && styles.dlgBtnTextBold,
                      btn.style === 'destructive' && styles.dlgBtnTextRed,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ── 메인 레이아웃 ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayDismiss: {
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SHEET_MAX_HEIGHT,
    paddingBottom: 56,
  },

  // 드래그 핸들
  dragHandleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: '#1A1A1A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#666',
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },

  // ── 미디어 그리드 ──
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
  },
  mediaList: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5E5',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  videoIcon: {
    fontSize: 28,
    color: '#fff',
  },
  deleteBtn: {
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
  deleteBtnText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
  deleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },

  // 빈 상태
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    fontWeight: fontWeight.medium,
  },
  emptySubText: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 4,
  },

  // 추가 버튼
  addBtn: {
    marginHorizontal: 20,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: fontWeight.medium,
  },

  // ── 풀스크린 미리보기 ──
  previewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 2,
  },
  previewCloseBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: 8,
  },
  previewCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
  previewDismiss: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  // ── 커스텀 액션시트 ──
  asOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 40,
  },
  asDismiss: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  asWrap: {
    zIndex: 2,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  asContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  asTitle: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
    color: '#8E8E93',
    textAlign: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  asMessage: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    paddingTop: 2,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  asBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  asBtnLast: {
    // 마지막 버튼 (추가 스타일 필요 시)
  },
  asBtnText: {
    fontSize: 17,
    color: '#007AFF',
  },
  asCancelBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  asCancelText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: fontWeight.bold,
  },

  // ── 커스텀 Alert 다이얼로그 ──
  dlgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  dlgCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: SCREEN_WIDTH * 0.72,
    overflow: 'hidden',
  },
  dlgTitle: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    color: '#000',
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  dlgMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingTop: 4,
    paddingBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  dlgBtnRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  dlgBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dlgBtnBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#E5E5EA',
  },
  dlgBtnText: {
    fontSize: 17,
    color: '#007AFF',
  },
  dlgBtnTextBold: {
    fontWeight: fontWeight.bold,
  },
  dlgBtnTextRed: {
    color: '#FF3B30',
  },
});
