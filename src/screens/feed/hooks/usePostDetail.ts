import { useState, useEffect } from 'react';
import { useFeedStore } from '@/store/useFeedStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  increment,
} from '@/services/firebase/firebaseConfig';
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
      const postRef = doc(firestore, 'posts', postId);
      const likeRef = doc(firestore, 'posts', postId, 'likes', user.uid);
      const likeDoc = await getDoc(likeRef);

      if (likeDoc.exists) {
        // 좋아요 취소
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1),
        });
        setPost((prev) => (prev ? { ...prev, likes: prev.likes - 1, isLiked: false } : null));
      } else {
        // 좋아요 추가
        await setDoc(likeRef, { userId: user.uid, createdAt: new Date() });
        await updateDoc(postRef, {
          likes: increment(1),
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
      await addDoc(collection(firestore, 'posts', postId, 'comments'), {
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
      await updateDoc(doc(firestore, 'posts', postId), {
        comments: increment(1),
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
      const commentRef = doc(firestore, 'posts', postId, 'comments', commentId);

      const likeRef = doc(firestore, 'posts', postId, 'comments', commentId, 'likes', user.uid);
      const likeDocSnap = await getDoc(likeRef);

      if (likeDocSnap.exists) {
        await deleteDoc(likeRef);
        await updateDoc(commentRef, {
          likes: increment(-1),
        });
      } else {
        await setDoc(likeRef, { userId: user.uid, createdAt: new Date() });
        await updateDoc(commentRef, {
          likes: increment(1),
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
