// ChatRoomScreen.tsx - 1:1 채팅방
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isMine: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: '안녕하세요! 내일 라운딩 가시나요?',
    senderId: 'other',
    timestamp: '오전 10:20',
    isMine: false,
  },
  {
    id: '2',
    text: '네, 가려고요! 시간은 몇 시인가요?',
    senderId: 'me',
    timestamp: '오전 10:21',
    isMine: true,
  },
  {
    id: '3',
    text: '오전 8시 티오프입니다',
    senderId: 'other',
    timestamp: '오전 10:22',
    isMine: false,
  },
  {
    id: '4',
    text: '알겠습니다. 저도 참가할게요!',
    senderId: 'me',
    timestamp: '오전 10:23',
    isMine: true,
  },
];

export const ChatRoomScreen: React.FC<{ route?: any; navigation?: any }> = ({ route, navigation }) => {
  const chatName = route?.params?.chatName || '채팅';
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation?.setOptions({ title: chatName });
  }, [navigation, chatName]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isMine: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // 스크롤을 맨 아래로
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isMine && styles.myMessageContainer]}>
      {!item.isMine && (
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
          style={styles.senderAvatar}
        />
      )}
      <View style={[styles.messageBubble, item.isMine && styles.myMessageBubble]}>
        <Text style={[styles.messageText, item.isMine && styles.myMessageText]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 입력창 */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.plusButton}>
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    flexDirection: 'row-reverse',
  },
  senderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
  },
  messageText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  plusButtonText: {
    fontSize: 24,
    color: '#666',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
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
});
