// MessageInput.tsx - 메시지 입력창
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onPressPlus?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChangeText,
  onSend,
  onPressPlus,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.plusButton} onPress={onPressPlus}>
        <Text style={styles.plusText}>+</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="메시지를 입력하세요"
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.sendButton, !value.trim() && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!value.trim()}
      >
        <Text style={styles.sendText}>전송</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  plusText: {
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
  sendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
