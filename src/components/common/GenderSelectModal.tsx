// 성별 미설정 사용자용 필수 선택 모달
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/styles/theme';

export const GenderSelectModal: React.FC = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected || !user?.uid) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, { gender: selected } as any);
    } catch {
      Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>성별을 선택해주세요</Text>
          <Text style={styles.subtitle}>서비스 이용을 위해 성별 정보가 필요합니다</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.option, selected === 'male' && styles.optionActive]}
              onPress={() => setSelected('male')}
              disabled={saving}
            >
              <Text style={styles.emoji}>👨</Text>
              <Text style={[styles.optionText, selected === 'male' && styles.optionTextActive]}>
                남성
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, selected === 'female' && styles.optionActive]}
              onPress={() => setSelected('female')}
              disabled={saving}
            >
              <Text style={styles.emoji}>👩</Text>
              <Text style={[styles.optionText, selected === 'female' && styles.optionTextActive]}>
                여성
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, !selected && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!selected || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>확인</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: '#ecfdf5',
  },
  emoji: { fontSize: 32, marginBottom: spacing.sm },
  optionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold as any,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold as any,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold as any,
  },
});
