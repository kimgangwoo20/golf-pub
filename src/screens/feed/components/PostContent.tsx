import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  post: any;
  onLike: () => void;
  onBack: () => void;
}

export const PostContent: React.FC<Props> = ({ post, onLike, onBack }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>

    <View style={styles.header}>
      <Image
        source={{ uri: post?.author?.avatar || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.authorName}>{post?.author?.name || '작성자'}</Text>
        <Text style={styles.date}>{post?.createdAt || '방금 전'}</Text>
      </View>
    </View>

    <Text style={styles.content}>{post?.content || ''}</Text>

    {post?.images?.map((img: string, idx: number) => (
      <Image key={idx} source={{ uri: img }} style={styles.image} />
    ))}

    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionButton} onPress={onLike}>
        <Text style={styles.actionIcon}>❤️</Text>
        <Text style={styles.actionText}>{post?.likeCount || 0}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionIcon}>💬</Text>
        <Text style={styles.actionText}>{post?.commentCount || 0}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionIcon}>🔗</Text>
        <Text style={styles.actionText}>공유</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  backButton: { padding: 8, marginBottom: 12 },
  backIcon: { fontSize: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  authorName: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: '#94a3b8' },
  content: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  image: { width: '100%', height: 300, borderRadius: 12, marginBottom: 12 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionIcon: { fontSize: 20, marginRight: 6 },
  actionText: { fontSize: 14, color: '#64748b' },
});
