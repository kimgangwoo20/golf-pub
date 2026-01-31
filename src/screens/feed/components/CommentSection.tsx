import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface Comment {
  id: string;
  author: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

interface Props {
  comments: Comment[];
  loading: boolean;
  onCommentLike: (id: string) => void;
}

export const CommentSection: React.FC<Props> = ({ comments, loading, onCommentLike }) => (
  <View style={styles.container}>
    <Text style={styles.title}>댓글 {comments.length}개</Text>
    
    {loading ? (
      <ActivityIndicator size="small" color="#10b981" style={styles.loader} />
    ) : (
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{item.author}</Text>
              <Text style={styles.commentDate}>{item.createdAt}</Text>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={() => onCommentLike(item.id)}
            >
              <Text style={styles.likeIcon}>❤️</Text>
              <Text style={styles.likeCount}>{item.likeCount}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  loader: { paddingVertical: 20 },
  comment: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  commentAuthor: { fontSize: 14, fontWeight: '600' },
  commentDate: { fontSize: 12, color: '#94a3b8' },
  commentContent: { fontSize: 14, color: '#334155', marginBottom: 8 },
  likeButton: { flexDirection: 'row', alignItems: 'center' },
  likeIcon: { fontSize: 14, marginRight: 4 },
  likeCount: { fontSize: 12, color: '#64748b' },
});
