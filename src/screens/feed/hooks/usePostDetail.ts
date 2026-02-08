import { useState, useEffect } from 'react';
import { useFeedStore } from '@/store/useFeedStore';
import { useAuthStore } from '@/store/useAuthStore';
import { firestore as firebaseFirestore } from '@/services/firebase/firebaseConfig';
import firestoreModule from '@react-native-firebase/firestore';
import { Post, Comment } from '@/types/feed-types';

export const usePostDetail = (postId: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const result = await useFeedStore.getState().getPostById(postId);
      setPost(result);
    } catch (error: any) {
      console.error('게시글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!postId) return;
    try {
      const result = await useFeedStore.getState().getPostComments(postId);
      setComments(result);
    } catch (error: any) {
      console.error('댓글 로드 실패:', error);
    }
  };

  const handleLike = async () => {
    if (!postId || !post) return;
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const postRef = firebaseFirestore.collection('posts').doc(postId);
      const likeRef = postRef.collection('likes').doc(user.uid);
      const likeDoc = await likeRef.get();

      if (likeDoc.exists) {
        // 좋아요 취소
        await likeRef.delete();
        await postRef.update({
          likes: firestoreModule.FieldValue.increment(-1),
        });
        setPost((prev) => (prev ? { ...prev, likes: prev.likes - 1, isLiked: false } : null));
      } else {
        // 좋아요 추가
        await likeRef.set({ userId: user.uid, createdAt: new Date() });
        await postRef.update({
          likes: firestoreModule.FieldValue.increment(1),
        });
        setPost((prev) => (prev ? { ...prev, likes: prev.likes + 1, isLiked: true } : null));
      }
    } catch (error: any) {
      console.error('좋아요 토글 실패:', error);
    }
  };

  const handleComment = async (text: string) => {
    if (!postId || !text.trim()) return;
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await firebaseFirestore
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .add({
          author: {
            id: user.uid,
            name: user.displayName || '익명',
            image: user.photoURL || '',
          },
          content: text.trim(),
          likes: 0,
          replies: [],
          createdAt: new Date(),
        });

      // 게시글 댓글 수 증가
      await firebaseFirestore
        .collection('posts')
        .doc(postId)
        .update({
          comments: firestoreModule.FieldValue.increment(1),
        });

      // 댓글 목록 새로고침
      await loadComments();
      setPost((prev) => (prev ? { ...prev, comments: prev.comments + 1 } : null));
    } catch (error: any) {
      console.error('댓글 추가 실패:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!postId || !commentId) return;
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const commentRef = firebaseFirestore
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .doc(commentId);

      const likeRef = commentRef.collection('likes').doc(user.uid);
      const likeDoc = await likeRef.get();

      if (likeDoc.exists) {
        await likeRef.delete();
        await commentRef.update({
          likes: firestoreModule.FieldValue.increment(-1),
        });
      } else {
        await likeRef.set({ userId: user.uid, createdAt: new Date() });
        await commentRef.update({
          likes: firestoreModule.FieldValue.increment(1),
        });
      }

      // 댓글 목록 새로고침
      await loadComments();
    } catch (error: any) {
      console.error('댓글 좋아요 실패:', error);
    }
  };

  return {
    post,
    comments,
    loading,
    handleLike,
    handleComment,
    handleCommentLike,
  };
};
