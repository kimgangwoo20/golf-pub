import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';

export const GroupChatRoomScreen: React.FC<{ route?: any; navigation?: any }> = ({ route, navigation }: any) {
  const { group } = route.params || { group: { name: '골프 모임', members: 4 } };
  const [message, setMessage] = useState('');
  const [messages] = useState([
    { id: '1', text: '오늘 날씨 좋네요!', sender: 'other', time: '오후 2:30', senderName: '김철수', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: '2', text: '내일 라운딩 시간 몇 시로 할까요?', sender: 'me', time: '오후 3:24' },
    { id: '3', text: '10시 어떠세요?', sender: 'other', time: '오후 3:25', senderName: '이영희', avatar: 'https://i.pravatar.cc/150?img=25' },
  ]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `${group.name} (${group.members})`,
      headerRight: () => (<TouchableOpacity onPress={() => navigation.navigate('GroupInfo', { group })}><Text style={{ fontSize: 20, marginRight: 16 }}>☰</Text></TouchableOpacity>),
    });
  }, [navigation, group]);

  const handleSend = () => { if (!message.trim()) return; setMessage(''); };
  const renderMessage = ({ item }: any) => {
    const isMine = item.sender === 'me';
    return (<View style={[styles.messageContainer, isMine ? styles.myMessage : styles.otherMessage]}>{!isMine && <Image source={{ uri: item.avatar }} style={styles.senderAvatar} />}<View style={{ flex: 1 }}>{!isMine && <Text style={styles.senderName}>{item.senderName}</Text>}<View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}><Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>{item.text}</Text></View><Text style={[styles.time, isMine && styles.timeRight]}>{item.time}</Text></View></View>);
  };

  return (<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}><FlatList data={messages} renderItem={renderMessage} keyExtractor={item => item.id} contentContainerStyle={styles.messagesList} inverted /><View style={styles.inputContainer}><TouchableOpacity style={styles.plusButton}><Text style={styles.plusText}>+</Text></TouchableOpacity><TextInput style={styles.input} placeholder="메시지 입력" value={message} onChangeText={setMessage} multiline /><TouchableOpacity style={styles.sendButton} onPress={handleSend}><Text style={styles.sendText}>전송</Text></TouchableOpacity></View></KeyboardAvoidingView>);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B2C7D9' }, messagesList: { padding: 16, flexDirection: 'column-reverse' }, messageContainer: { marginBottom: 16, flexDirection: 'row', maxWidth: '80%' }, myMessage: { alignSelf: 'flex-end' }, otherMessage: { alignSelf: 'flex-start' }, senderAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 }, senderName: { fontSize: 12, color: '#666', marginBottom: 4, marginLeft: 4 }, bubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 }, myBubble: { backgroundColor: '#007AFF' }, otherBubble: { backgroundColor: '#fff' }, messageText: { fontSize: 15, lineHeight: 20 }, myMessageText: { color: '#fff' }, otherMessageText: { color: '#000' }, time: { fontSize: 11, color: '#666', marginTop: 4, marginLeft: 4 }, timeRight: { textAlign: 'right', marginRight: 4 }, inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' }, plusButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginRight: 8 }, plusText: { fontSize: 20, color: '#666' }, input: { flex: 1, maxHeight: 100, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f8f9fa', borderRadius: 20, fontSize: 15 }, sendButton: { marginLeft: 8, paddingHorizontal: 16, justifyContent: 'center' }, sendText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
});
