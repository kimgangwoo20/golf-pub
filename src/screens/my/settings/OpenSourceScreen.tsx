// OpenSourceScreen.tsx - 오픈소스 라이선스
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface License {
  id: string;
  name: string;
  version: string;
  license: string;
}

const LICENSES: License[] = [
  { id: '1', name: 'React Native', version: '0.81.5', license: 'MIT' },
  { id: '2', name: 'Expo', version: '~54.0.0', license: 'MIT' },
  { id: '3', name: 'React Navigation', version: '7.x', license: 'MIT' },
  { id: '4', name: '@react-native-firebase/app', version: '^21.x', license: 'Apache-2.0' },
  { id: '5', name: '@react-native-firebase/auth', version: '^21.x', license: 'Apache-2.0' },
  { id: '6', name: '@react-native-firebase/firestore', version: '^21.x', license: 'Apache-2.0' },
  { id: '7', name: 'zustand', version: '^5.x', license: 'MIT' },
  { id: '8', name: 'expo-camera', version: '~16.x', license: 'MIT' },
  { id: '9', name: 'expo-image-picker', version: '~16.x', license: 'MIT' },
  { id: '10', name: 'expo-location', version: '~18.x', license: 'MIT' },
  { id: '11', name: '@react-native-seoul/kakao-login', version: '^6.x', license: 'MIT' },
  { id: '12', name: 'react-native-safe-area-context', version: '5.x', license: 'MIT' },
  { id: '13', name: 'react-native-screens', version: '~4.x', license: 'MIT' },
  { id: '14', name: '@react-native-async-storage/async-storage', version: '2.x', license: 'MIT' },
  { id: '15', name: 'expo-splash-screen', version: '~0.29.x', license: 'MIT' },
];

export const OpenSourceScreen: React.FC = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: License }) => (
    <View style={styles.licenseItem}>
      <View style={styles.licenseLeft}>
        <Text style={styles.licenseName}>{item.name}</Text>
        <Text style={styles.licenseVersion}>{item.version}</Text>
      </View>
      <View style={styles.licenseBadge}>
        <Text style={styles.licenseBadgeText}>{item.license}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>오픈소스 라이선스</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            골프 Pub은 아래의 오픈소스 소프트웨어를 사용하고 있습니다.
          </Text>
        </View>

        <FlatList
          data={LICENSES}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E5E5',
  },
  backButton: { padding: 4 },
  backIcon: { fontSize: 32, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  infoBox: {
    backgroundColor: '#fff', padding: 16, margin: 16, borderRadius: 12,
  },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  licenseItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 12,
  },
  licenseLeft: { flex: 1 },
  licenseName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  licenseVersion: { fontSize: 13, color: '#999' },
  licenseBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  licenseBadgeText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  separator: { height: 8 },
});
