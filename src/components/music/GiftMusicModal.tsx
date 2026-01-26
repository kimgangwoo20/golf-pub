// GiftMusicModal.tsx - 음악 선물 모달 (Witty/미니홈피 스타일)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface GiftMusicModalProps {
  visible: boolean;
  recipientName: string;
  onClose: () => void;
  onSendGift?: (songId: string, message: string) => void;
}

export const GiftMusicModal: React.FC<GiftMusicModalProps> = ({
  visible,
  recipientName,
  onClose,
  onSendGift,
}) => {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Mock 음악 목록
  const popularSongs: Song[] = [
    { id: '1', title: 'Shape of You', artist: 'Ed Sheeran' },
    { id: '2', title: 'Perfect', artist: 'Ed Sheeran' },
    { id: '3', title: 'Dynamite', artist: 'BTS' },
    { id: '4', title: 'Butter', artist: 'BTS' },
    { id: '5', title: 'Bad Guy', artist: 'Billie Eilish' },
  ];

  const handleSend = () => {
    if (selectedSong && onSendGift) {
      onSendGift(selectedSong, message);
      setSelectedSong(null);
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>🎵 음악 선물하기</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.recipient}>{recipientName}님에게 음악 선물</Text>

          <ScrollView style={styles.songList}>
            <Text style={styles.sectionTitle}>인기 음악</Text>
            {popularSongs.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={[
                  styles.songItem,
                  selectedSong === song.id && styles.songItemSelected,
                ]}
                onPress={() => setSelectedSong(song.id)}
              >
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
                {selectedSong === song.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>메시지 (선택)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="함께 듣고 싶은 음악이에요!"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={100}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !selectedSong && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!selectedSong}
          >
            <Text style={styles.sendButtonText}>선물 보내기 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#6b7280',
  },
  recipient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  songList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  songItemSelected: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 13,
    color: '#6b7280',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
