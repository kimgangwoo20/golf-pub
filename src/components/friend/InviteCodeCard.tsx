// InviteCodeCard.tsx - 초대 코드 카드 컴포넌트
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Clipboard } from 'react-native';

interface InviteCodeCardProps {
  /** 초대 코드 */
  code: string;
  /** 초대 링크 */
  link?: string;
  /** 카드 타입 */
  type?: 'code' | 'link';
}

export const InviteCodeCard: React.FC<InviteCodeCardProps> = ({
  code,
  link,
  type = 'code',
}) => {
  const handleCopy = () => {
    const textToCopy = type === 'link' && link ? link : code;
    Clipboard.setString(textToCopy);
    Alert.alert('복사 완료', `${type === 'link' ? '링크' : '코드'}가 복사되었습니다`);
  };

  const displayText = type === 'link' && link ? link : code;
  const label = type === 'link' ? '초대 링크' : '초대 코드';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.code} numberOfLines={1}>
          {displayText}
        </Text>
      </View>
      <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
        <Text style={styles.copyButtonText}>복사</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  code: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
