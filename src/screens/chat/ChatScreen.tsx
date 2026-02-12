// ChatScreen.tsx - 1:1 채팅방 (Firebase 실시간 연동)
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useChatStore } from '@/store/useChatStore';
import { ChatMessage } from '@/types/chat-types';
import { useAuthStore } from '@/store/useAuthStore';
import { firebaseStorage } from '@/services/firebase/firebaseStorage';

interface ChatScreenProps {
  route: {
    params: {
      roomId: string;
      chatName?: string;
      roomType?: 'booking' | 'marketplace' | 'direct';
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { roomId, chatName, roomType: _roomType = 'direct' } = route.params;
  const { user } = useAuthStore();
  const {
    currentRoomMessages,
    sendMessage,
    sendImage,
    markAsRead,
    listenToMessages,
    loading: _loading,
  } = useChatStore();
  const _insets = useSafeAreaInsets();

  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // 실시간 메시지 리스너
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = listenToMessages(roomId, (_messages) => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    if (user?.uid) {
      markAsRead(roomId, user.uid);
    }

    return () => unsubscribe();
    // listenToMessages, markAsRead는 Zustand 스토어 함수로 안정적
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user]);

  // 이미지 선택 및 전송
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 보내려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]?.uri && user) {
        const imageUri = result.assets[0].uri;
        const uploadResult = await firebaseStorage.uploadChatImage(roomId, imageUri);

        await sendImage(
          roomId,
          user.uid,
          user.displayName || '익명',
          uploadResult.url,
          user.photoURL || undefined,
        );

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('오류', '이미지 전송에 실패했습니다.');
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      await sendMessage(
        roomId,
        user.uid,
        user.displayName || '익명',
        message.trim(),
        user.photoURL || undefined,
      );
      setMessage('');

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  // 메시지 렌더링
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderId === user?.uid;
    const isSystem = item.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {!isMyMessage && item.senderAvatar && (
          <Image source={{ uri: item.senderAvatar }} style={styles.avatar} onError={() => {}} />
        )}

        <View style={[styles.messageBubble, isMyMessage && styles.myBubble]}>
          {!isMyMessage && <Text style={styles.senderName}>{item.senderName}</Text>}

          {item.type === 'image' && item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
              onError={() => {}}
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.message}
            </Text>
          )}

          <Text style={styles.messageTime}>
            {item.createdAt?.toLocaleTimeString?.('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            }) || ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {chatName || '채팅'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* 메시지 목록 */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={currentRoomMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* 입력창 */}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
              <Text style={styles.imageButtonText}>📷</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <Text style={styles.sendButtonText}>전송</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#10b981',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  messageList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  myBubble: {
    backgroundColor: '#10b981',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  systemMessage: {
    alignItems: 'center',
    marginBottom: 16,
  },
  systemMessageText: {
    fontSize: 13,
    color: '#999',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  imageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#1a1a1a',
  },
  sendButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
