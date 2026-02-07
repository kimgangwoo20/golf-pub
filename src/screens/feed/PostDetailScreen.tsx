// PostDetailScreen.tsx - 게시물 상세 화면

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Post, Comment } from '@/types/feed-types';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeedStore } from '@/store/useFeedStore';

const { width } = Dimensions.get('window');

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();

  // 현재 사용자 ID
  const currentUserId = user?.uid || '';

  // @ts-ignore
  const postId = route.params?.postId as string;
  const { getPostById, getPostComments } = useFeedStore();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 게시글/댓글 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [postData, commentsData] = await Promise.all([
          getPostById(postId),
          getPostComments(postId),
        ]);
        if (postData) setPost(postData);
        if (commentsData) setComments(commentsData);
      } catch (error) {
        console.error('게시글 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    if (postId) loadData();
  }, [postId]);

  // 로딩 또는 게시글 없음
  if (loading || !post) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>게시물</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = () => {
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
    });
  };

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
        };
      }
      return comment;
    }));
  };

  const handleSendComment = () => {
    if (commentText.trim().length === 0) {
      return;
    }

    if (replyingTo) {
      // 대댓글 추가
      const newReply = {
        id: String(Date.now()),
        commentId: replyingTo,
        author: {
          id: currentUserId,
          name: user?.displayName || '사용자',
          image: user?.photoURL || 'https://i.pravatar.cc/150?img=1',
        },
        content: commentText,
        createdAt: '방금',
      };

      setComments(comments.map(comment => {
        if (comment.id === replyingTo) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        }
        return comment;
      }));
      setCommentText('');
      setReplyingTo(null);
    } else {
      // 댓글 추가
      const newComment: Comment = {
        id: String(Date.now()),
        postId: post.id,
        author: {
          id: currentUserId,
          name: user?.displayName || '사용자',
          image: user?.photoURL || 'https://i.pravatar.cc/150?img=1',
        },
        content: commentText,
        likes: 0,
        isLiked: false,
        replies: [],
        createdAt: '방금',
      };

      setComments([...comments, newComment]);
      setPost({ ...post, comments: post.comments + 1 });
      setCommentText('');
    }
  };

  const handleEditComment = (commentId: string) => {
    Alert.alert('댓글 수정', '댓글 수정 기능은 개발 예정입니다.');
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      '댓글 삭제',
      '댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setComments(comments.filter(c => c.id !== commentId));
            setPost({ ...post, comments: post.comments - 1 });
          },
        },
      ]
    );
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const handleEditPost = () => {
    Alert.alert('게시물 수정', '게시물 수정 기능은 개발 예정입니다.');
  };

  const handleDeletePost = () => {
    Alert.alert(
      '게시물 삭제',
      '게시물을 삭제하시겠습니까?\n삭제된 게시물은 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('완료', '게시물이 삭제되었습니다.', [
              { text: '확인', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  const handlePostMenu = () => {
    const isMyPost = post.author.id === currentUserId;

    const options = isMyPost
      ? ['수정', '삭제', '취소']
      : ['신고', '차단', '취소'];

    Alert.alert('게시물', '', [
      ...(isMyPost
        ? [
            { text: '수정', onPress: handleEditPost },
            { text: '삭제', onPress: handleDeletePost, style: 'destructive' as const },
          ]
        : [
            { text: '신고', onPress: () => Alert.alert('신고', '신고 기능은 개발 예정입니다.') },
            { text: '차단', onPress: () => Alert.alert('차단', '차단 기능은 개발 예정입니다.') },
          ]),
      { text: '취소', style: 'cancel' as const },
    ]);
  };

  const handleCommentMenu = (comment: Comment) => {
    const isMyComment = comment.author.id === currentUserId;

    Alert.alert('댓글', '', [
      ...(isMyComment
        ? [
            { text: '수정', onPress: () => handleEditComment(comment.id) },
            { text: '삭제', onPress: () => handleDeleteComment(comment.id), style: 'destructive' as const },
          ]
        : [
            { text: '답글', onPress: () => handleReply(comment.id) },
            { text: '신고', onPress: () => Alert.alert('신고', '신고 기능은 개발 예정입니다.') },
          ]),
      { text: '취소', style: 'cancel' as const },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>게시물</Text>
          <TouchableOpacity onPress={handlePostMenu}>
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 게시물 */}
          <View style={styles.postSection}>
            {/* 작성자 */}
            <View style={styles.authorSection}>
              <Image source={{ uri: post.author.image }} style={styles.authorImage} />
              <View style={styles.authorInfo}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  <View style={styles.handicapBadge}>
                    <Text style={styles.handicapText}>⛳ {post.author.handicap}</Text>
                  </View>
                </View>
                <Text style={styles.postTime}>{String(post.createdAt)}</Text>
              </View>
            </View>

            {/* 내용 */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* 이미지 갤러리 */}
            {post.images.length > 0 && (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageGallery}
              >
                {post.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            {/* 위치 */}
            {post.location && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>📍 {post.location}</Text>
              </View>
            )}

            {/* 좋아요/댓글 수 */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>좋아요 {post.likes}개</Text>
              <Text style={styles.statsDot}>•</Text>
              <Text style={styles.statsText}>댓글 {post.comments}개</Text>
            </View>

            {/* 액션 버튼 */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Text style={styles.actionIcon}>{post.isLiked ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionText}>좋아요</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>댓글</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📤</Text>
                <Text style={styles.actionText}>공유</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 댓글 목록 */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>댓글 {comments.length}개</Text>

            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.author.image }} style={styles.commentAuthorImage} />

                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthorName}>{comment.author.name}</Text>
                    <Text style={styles.commentTime}>{String(comment.createdAt)}</Text>
                  </View>

                  <Text style={styles.commentText}>{comment.content}</Text>

                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.commentActionButton}
                      onPress={() => handleCommentLike(comment.id)}
                    >
                      <Text style={styles.commentActionText}>
                        {comment.isLiked ? '❤️' : '🤍'} {comment.likes}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.commentActionButton}
                      onPress={() => handleReply(comment.id)}
                    >
                      <Text style={styles.commentActionText}>답글</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 대댓글 */}
                  {comment.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                      {comment.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyItem}>
                          <Image source={{ uri: reply.author.image }} style={styles.replyAuthorImage} />
                          <View style={styles.replyContent}>
                            <Text style={styles.replyAuthorName}>{reply.author.name}</Text>
                            <Text style={styles.replyText}>{reply.content}</Text>
                            <Text style={styles.replyTime}>{String(reply.createdAt)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.commentMenuButton}
                  onPress={() => handleCommentMenu(comment)}
                >
                  <Text style={styles.commentMenuIcon}>⋯</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 댓글 입력 */}
        <View style={styles.commentInputContainer}>
          {replyingTo && (
            <View style={styles.replyingIndicator}>
              <Text style={styles.replyingText}>답글 작성 중</Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Text style={styles.replyingCancel}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder={replyingTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, commentText.trim().length === 0 && styles.sendButtonDisabled]}
              onPress={handleSendComment}
              disabled={commentText.trim().length === 0}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  moreIcon: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  postSection: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    marginBottom: 8,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  authorImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  handicapBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  handicapText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  postTime: {
    fontSize: 13,
    color: '#999',
  },
  postContent: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  imageGallery: {
    marginBottom: 16,
  },
  galleryImage: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#E5E5E5',
  },
  locationContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  statsDot: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAuthorImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentActionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  commentMenuButton: {
    padding: 4,
  },
  commentMenuIcon: {
    fontSize: 18,
    color: '#999',
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#F0F0F0',
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAuthorImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5E5',
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  replyText: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 4,
  },
  replyTime: {
    fontSize: 11,
    color: '#999',
  },
  bottomSpacing: {
    height: 100,
  },
  commentInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  replyingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
  replyingText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  replyingCancel: {
    fontSize: 18,
    color: '#999',
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  sendIcon: {
    fontSize: 16,
    color: '#fff',
  },
});