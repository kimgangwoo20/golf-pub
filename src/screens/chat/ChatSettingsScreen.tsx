// ChatSettingsScreen.tsx - 채팅 설정
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ChatSettingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  const handleClearAll = () => {
    Alert.alert(
      '채팅 전체 삭제',
      '모든 채팅 내역을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => Alert.alert('삭제 완료', '모든 채팅이 삭제되었습니다.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>채팅 설정</Text>
      <View style={{ width: 36 }} />
    </View>
    <ScrollView style={styles.container}>
      {/* 알림 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림 설정</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>알림 받기</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>알림 소리</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>진동</Text>
          <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>메시지 미리보기</Text>
          <Switch value={previewEnabled} onValueChange={setPreviewEnabled} />
        </View>
      </View>

      {/* 채팅 관리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>채팅 관리</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>차단 목록</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>숨김 채팅</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleClearAll}>
          <Text style={[styles.menuText, styles.dangerText]}>채팅 전체 삭제</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 기타 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기타</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>채팅 백업</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>도움말</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#10b981',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#10b981',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  dangerText: {
    color: '#FF3B30',
  },
});
