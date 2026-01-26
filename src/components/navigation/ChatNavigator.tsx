// ChatNavigator.tsx - 채팅 스택
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../../screens/chat/ChatListScreen';
import ChatRoomScreen from '../../screens/chat/ChatRoomScreen';
import CreateChatScreen from '../../screens/chat/CreateChatScreen';
import ChatSettingsScreen from '../../screens/chat/ChatSettingsScreen';
import CreateGroupScreen from '../../screens/chat/CreateGroupScreen';
import GroupChatRoomScreen from '../../screens/chat/GroupChatRoomScreen';
import GroupInfoScreen from '../../screens/chat/GroupInfoScreen';

const Stack = createNativeStackNavigator();

export const ChatNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerBackTitleVisible: false, headerTintColor: '#007AFF' }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: '채팅', headerShown: false }} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ title: '' }} />
      <Stack.Screen name="CreateChat" component={CreateChatScreen} options={{ title: '새 채팅' }} />
      <Stack.Screen name="ChatSettings" component={ChatSettingsScreen} options={{ title: '채팅 설정' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: '그룹 만들기' }} />
      <Stack.Screen name="GroupChatRoom" component={GroupChatRoomScreen} options={{ title: '그룹 채팅' }} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} options={{ title: '그룹 정보' }} />
    </Stack.Navigator>
  );
}
