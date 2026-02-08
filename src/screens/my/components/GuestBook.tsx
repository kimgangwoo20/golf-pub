import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  entries: any[];
  onAdd: (message: string) => void;
}

export const GuestBook: React.FC<Props> = ({ entries, onAdd }) => {
  const [message, setMessage] = React.useState('');

  const handleSubmit = () => {
    if (message.trim()) {
      onAdd(message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>방명록 📝</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="방명록을 남겨주세요..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>등록</Text>
        </TouchableOpacity>
      </View>
      {entries.slice(0, 3).map((entry, idx) => (
        <View key={idx} style={styles.entry}>
          <Text style={styles.entryAuthor}>{entry.author}</Text>
          <Text style={styles.entryMessage}>{entry.message}</Text>
          <Text style={styles.entryDate}>{entry.date}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontWeight: '600' },
  entry: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  entryAuthor: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  entryMessage: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  entryDate: { fontSize: 12, color: '#94a3b8' },
});
