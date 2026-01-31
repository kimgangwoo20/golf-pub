import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostContent } from './components/PostContent';
import { CommentSection } from './components/CommentSection';
import { CommentInput } from './components/CommentInput';
import { usePostDetail } from './hooks/usePostDetail';

interface Props {
  route: { params: { postId: string } };
  navigation: any;
}

export const PostDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { postId } = route.params;
  const {
    post,
    comments,
    loading,
    handleLike,
    handleComment,
    handleCommentLike,
  } = usePostDetail(postId);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <PostContent 
          post={post}
          onLike={handleLike}
          onBack={() => navigation.goBack()}
        />
        <CommentSection
          comments={comments}
          loading={loading}
          onCommentLike={handleCommentLike}
        />
      </ScrollView>
      <CommentInput onSubmit={handleComment} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
