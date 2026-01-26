// CreateChatScreen.tsx - 새 채팅 시작
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: string;
}

const MOCK_FRIENDS: Friend[] = [
  { id: '1', name: '김골프', avatar: 'https://i.pravatar.cc/150?img=12', level: '중급' },
  { id: '2', name: '이영희', avatar: 'https://i.pravatar.cc/150?img=25', level: '초급' },
  { id: '3', name: '박민수', avatar: 'https://i.pravatar.cc/150?img=33', level: '고급' },
  { id: '4', name: '정수진', avatar: 'https://i.pravatar.cc/150?img=44', level: '중급' },
  { id: '5', name: '최현우', avatar: 'https://i.pravatar.cc/150?img=55', level: '초급' },
];

export const CreateChatScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [friends] = useState<Friend[]>(MOCK_FRIENDS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFriend = (friend: Friend) => {
    navigation?.navigate('ChatRoom', {
      chatId: friend.id,
      chatName: friend.name,
    });
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleSelectFriend(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendLevel}>{item.level}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 검색 */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="친구 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* 친구 목록 */}
      <FlatList
        data={filteredFriends}
        renderItem={renderFriendItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <Text style={styles.listHeader}>친구 목록 ({filteredFriends.length})</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1a1a1a',
  },
  listHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  friendLevel: {
    fontSize: 13,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 78,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
