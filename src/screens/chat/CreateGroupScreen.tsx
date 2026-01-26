// CreateGroupScreen.tsx - 그룹 채팅 생성 (카카오톡 스타일)
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateGroupScreen({ navigation }: any) {
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [friends] = useState([
    { id: '1', name: '김철수', avatar: 'https://i.pravatar.cc/150?img=12', level: '중급' },
    { id: '2', name: '이영희', avatar: 'https://i.pravatar.cc/150?img=25', level: '초급' },
    { id: '3', name: '박민수', avatar: 'https://i.pravatar.cc/150?img=33', level: '고급' },
    { id: '4', name: '정수진', avatar: 'https://i.pravatar.cc/150?img=44', level: '중급' },
  ]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    if (selected.length === 0) {
      Alert.alert('알림', '최소 1명 이상 선택해주세요');
      return;
    }
    if (!groupName.trim()) {
      Alert.alert('알림', '그룹 이름을 입력해주세요');
      return;
    }
    Alert.alert('그룹 생성', '그룹 채팅이 생성되었습니다!', [{ text: '확인', onPress: () => navigation.goBack() }]);
  };

  const filteredFriends = friends.filter(f => f.name.includes(search));

  const renderFriend = ({ item }: any) => {
    const isSelected = selected.includes(item.id);
    return (
      <TouchableOpacity style={styles.friendItem} onPress={() => toggleSelect(item.id)}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendLevel}>{item.level}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>그룹 채팅</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={[styles.headerButton, styles.headerButtonPrimary]}>완료</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.groupNameSection}>
        <TextInput style={styles.groupNameInput} placeholder="그룹 이름 입력" value={groupName} onChangeText={setGroupName} maxLength={30} />
        <Text style={styles.charCount}>{groupName.length}/30</Text>
      </View>

      <View style={styles.selectedSection}>
        <Text style={styles.selectedCount}>선택됨: {selected.length}명</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="이름 검색" value={search} onChangeText={setSearch} />
      </View>

      <FlatList data={filteredFriends} renderItem={renderFriend} keyExtractor={item => item.id} contentContainerStyle={styles.list} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerButton: { fontSize: 16, color: '#666' },
  headerButtonPrimary: { color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  groupNameSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  groupNameInput: { fontSize: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 },
  charCount: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'right' },
  selectedSection: { padding: 16, backgroundColor: '#f8f9fa' },
  selectedCount: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchIcon: { fontSize: 20, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  list: { padding: 16 },
  friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  friendLevel: { fontSize: 14, color: '#666' },
});
