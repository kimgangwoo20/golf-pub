import { useState, useEffect } from 'react';

export const usePostDetail = (postId: string) => {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    // TODO: Firestore에서 게시글 로드
    setLoading(false);
  };

  const loadComments = async () => {
    // TODO: Firestore에서 댓글 로드
  };

  const handleLike = async () => {
    // TODO: 좋아요 토글
  };

  const handleComment = async (text: string) => {
    // TODO: 댓글 추가
  };

  const handleCommentLike = async (commentId: string) => {
    // TODO: 댓글 좋아요
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
