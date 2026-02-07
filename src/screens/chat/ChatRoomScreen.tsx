// ChatRoomScreen.tsx - 1:1 채팅방 (Firestore 연동)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  Modal,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore, ChatMessage } from '@/store/useChatStore';
import * as ImagePicker from 'expo-image-picker';

export const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const chatId = route.params?.chatId as string;
  const chatName = route.params?.chatName || route.params?.chatTitle || '채팅';

  const { user } = useAuthStore();
  const { currentRoomMessages, sendMessage, sendImage, markAsRead, listenToMessages } = useChatStore();
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState('');
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // 키보드 높이 애니메이션
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // 실시간 메시지 리스너
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = listenToMessages(chatId, () => {
      // 메시지가 업데이트되면 스크롤
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // 읽음 처리
    if (user?.uid) {
      markAsRead(chatId, user.uid);
    }

    return () => {
      unsubscribe();
    };
  }, [chatId, user?.uid]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height - insets.bottom,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [insets.bottom]);

  // 카메라로 사진 찍기
  const handleTakePhoto = async () => {
    setAttachmentModalVisible(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 사용을 위해 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleSendImage(result.assets[0].uri);
    }
  };

  // 앨범에서 사진 선택
  const handlePickImage = async () => {
    setAttachmentModalVisible(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '앨범 접근을 위해 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleSendImage(result.assets[0].uri);
    }
  };

  // 이미지 메시지 전송
  const handleSendImage = async (imageUri: string) => {
    if (!user?.uid || !chatId) return;
    try {
      await sendImage(
        chatId,
        user.uid,
        user.displayName || '사용자',
        imageUri,
        user.photoURL || undefined
      );
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('이미지 전송 실패:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user?.uid || !chatId) return;

    const text = inputText.trim();
    setInputText('');

    try {
      await sendMessage(
        chatId,
        user.uid,
        user.displayName || '사용자',
        text,
        user.photoURL || undefined
      );
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const formatMessageTime = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === user?.uid;

    return (
      <View style={[styles.messageContainer, isMine && styles.myMessageContainer]}>
        {!isMine && (
          <Image
            source={{ uri: item.senderAvatar || 'https://i.pravatar.cc/150' }}
            style={styles.senderAvatar}
          />
        )}
        {item.type === 'image' && item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
        ) : (
          <View style={[styles.messageBubble, isMine && styles.myMessageBubble]}>
            <Text style={[styles.messageText, isMine && styles.myMessageText]}>
              {item.message}
            </Text>
          </View>
        )}
        <Text style={styles.timestamp}>{formatMessageTime(item.createdAt)}</Text>
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
          <Text style={styles.headerTitle} numberOfLines={1}>{chatName}</Text>
        </View>

        {/* 메시지 목록 */}
        <FlatList
          ref={flatListRef}
          data={currentRoomMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          style={styles.messageList}
        />

        {/* 입력창 - 키보드 위에 표시 */}
        <Animated.View style={[styles.inputWrapper, { paddingBottom: keyboardHeight }]}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => setAttachmentModalVisible(true)}
            >
              <Text style={styles.plusButtonText}>+</Text>
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="메세지를 입력하세요"
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendButtonText}>전송</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      {/* 첨부 모달 */}
      <Modal
        visible={attachmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAttachmentModalVisible(false)}
        >
          <View style={styles.attachmentModal}>
            <View style={styles.attachmentOptions}>
              <TouchableOpacity style={styles.attachmentOption} onPress={handleTakePhoto}>
                <View style={[styles.attachmentIcon, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.attachmentIconText}>📷</Text>
                </View>
                <Text style={styles.attachmentLabel}>카메라</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.attachmentOption} onPress={handlePickImage}>
                <View style={[styles.attachmentIcon, { backgroundColor: '#2196F3' }]}>
                  <Text style={styles.attachmentIconText}>🖼️</Text>
                </View>
                <Text style={styles.attachmentLabel}>앨범</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAttachmentModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  messageList: {
    flex: 1,
  },
  messagesList: {
    padding: 12,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    flexDirection: 'row-reverse',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 6,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  myMessageBubble: {
    backgroundColor: '#10b981',
  },
  messageText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 19,
  },
  myMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginHorizontal: 6,
  },
  inputWrapper: {
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  plusButtonText: {
    fontSize: 20,
    color: '#666',
    lineHeight: 22,
  },
  input: {
    flex: 1,
    minHeight: 32,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    fontSize: 15,
    marginRight: 6,
    color: '#1a1a1a',
  },
  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#10b981',
    borderRadius: 18,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 24,
  },
  attachmentOption: {
    alignItems: 'center',
  },
  attachmentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  attachmentIconText: {
    fontSize: 28,
  },
  attachmentLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});
