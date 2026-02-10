// 프리미엄 회원 전용 화면 가드 컴포넌트
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/styles/theme';

interface PremiumGuardProps {
  feature?: string;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({ feature }) => {
  const navigation = useNavigation<any>();

  const label = feature || '이 기능';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>👑</Text>
        <Text style={styles.title}>프리미엄 회원 전용</Text>
        <Text style={styles.description}>
          {label}은(는) 프리미엄 회원만 이용할 수 있습니다.{'\n'}
          업그레이드하고 모든 기능을 자유롭게 이용하세요!
        </Text>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('Home', { screen: 'Membership' })}
        >
          <Text style={styles.upgradeButtonText}>프리미엄 가입하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxxl,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
