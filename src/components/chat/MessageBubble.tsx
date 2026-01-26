// MessageBubble.tsx - 메시지 말풍선
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  timestamp: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  isMine,
  timestamp,
}) => {
  return (
    <View style={[styles.container, isMine && styles.myContainer]}>
      <View style={[styles.bubble, isMine && styles.myBubble]}>
        <Text style={[styles.text, isMine && styles.myText]}>{text}</Text>
      </View>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myContainer: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  myBubble: {
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  myText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginHorizontal: 8,
  },
});
