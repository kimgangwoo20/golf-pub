import { create } from 'zustand';
import { firestore as firebaseFirestore } from '@/services/firebase/firebaseConfig';
import { FeedPost, FeedStory, Post, Comment } from '@/types/feed-types';

// 상대 시간 포맷팅
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
};

interface FeedState {
  posts: FeedPost[];
  myPosts: FeedPost[];
  stories: FeedStory[];
  loading: boolean;
  error: string | null;

  loadPosts: () => Promise<void>;
  loadMyPosts: (userId: string) => Promise<void>;
  getPostById: (postId: string) => Promise<Post | null>;
  getPostComments: (postId: string) => Promise<Comment[]>;
  loadStories: () => Promise<void>;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  myPosts: [],
  stories: [],
  loading: false,
  error: null,

  loadPosts: async () => {
    try {
      set({ loading: true, error: null });

      const snapshot = await firebaseFirestore
        .collection('posts')
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        return {
          id: doc.id,
          userId: data.author?.id || data.userId || '',
          userName: data.author?.name || data.userName || '',
          userImage: data.author?.image || data.userImage || '',
          time: formatRelativeTime(createdAt),
          content: data.content || '',
          image: data.images?.[0] || data.image || undefined,
          images: data.images || (data.image ? [data.image] : []),
          likes: data.likes || 0,
          comments: data.comments || 0,
          location: data.location || undefined,
          tags: data.hashtags?.map((tag: string) => `#${tag}`) || data.tags || [],
        } as FeedPost;
      });

      set({ posts, loading: false });
    } catch (error: any) {
      console.error('피드 로드 실패:', error);
      set({
        error: error.message || '피드를 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  loadMyPosts: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      // 복합 인덱스 없이 조회 후 클라이언트 정렬
      const snapshot = await firebaseFirestore
        .collection('posts')
        .where('author.id', '==', userId)
        .limit(50)
        .get();

      const myPosts = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        return {
          id: doc.id,
          userId: data.author?.id || data.userId || '',
          userName: data.author?.name || data.userName || '',
          userImage: data.author?.image || data.userImage || '',
          time: formatRelativeTime(createdAt),
          content: data.content || '',
          image: data.images?.[0] || data.image || undefined,
          images: data.images || (data.image ? [data.image] : []),
          likes: data.likes || 0,
          comments: data.comments || 0,
          location: data.location || undefined,
          tags: data.hashtags?.map((tag: string) => `#${tag}`) || data.tags || [],
          // 추가 필드 (MyPostsScreen에서 사용)
          status: data.status || 'published',
          title: data.title || '',
          golfCourse: data.golfCourse || '',
          date: data.date || '',
          price: data.price || 0,
          currentPlayers: data.currentPlayers || 0,
          maxPlayers: data.maxPlayers || 0,
          createdAt: createdAt.toISOString(),
        } as FeedPost & Record<string, any>;
      });

      // 클라이언트 사이드 정렬 (최신순)
      myPosts.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );

      set({ myPosts: myPosts as FeedPost[], loading: false });
    } catch (error: any) {
      console.error('내 게시글 로드 실패:', error);
      set({
        error: error.message || '내 게시글을 불러올 수 없습니다',
        loading: false,
      });
    }
  },

  getPostById: async (postId: string): Promise<Post | null> => {
    try {
      const doc = await firebaseFirestore.collection('posts').doc(postId).get();
      if (!doc.exists) return null;
      const data = doc.data()!;
      const createdAt = data.createdAt?.toDate?.() || new Date();
      return {
        id: doc.id,
        author: data.author || { id: '', name: '', image: '' },
        images: data.images || [],
        content: data.content || '',
        hashtags: data.hashtags || [],
        location: data.location,
        likes: data.likes || 0,
        comments: data.comments || 0,
        isLiked: false,
        createdAt: formatRelativeTime(createdAt),
        visibility: data.visibility || 'public',
        status: data.status || 'published',
      } as Post;
    } catch (error: any) {
      console.error('게시글 상세 로드 실패:', error);
      return null;
    }
  },

  getPostComments: async (postId: string): Promise<Comment[]> => {
    try {
      const snapshot = await firebaseFirestore
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .orderBy('createdAt', 'asc')
        .limit(50)
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          postId,
          author: data.author || { id: '', name: '', image: '' },
          content: data.content || '',
          likes: data.likes || 0,
          isLiked: false,
          replies: data.replies || [],
          createdAt: formatRelativeTime(data.createdAt?.toDate?.() || new Date()),
        } as Comment;
      });
    } catch (error: any) {
      console.error('댓글 로드 실패:', error);
      return [];
    }
  },

  loadStories: async () => {
    try {
      // 최근 24시간 이미지 게시글을 스토리로 변환
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const snapshot = await firebaseFirestore
        .collection('posts')
        .where('status', '==', 'published')
        .where('createdAt', '>=', oneDayAgo)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const stories = snapshot.docs
        .filter((doc) => {
          const data = doc.data();
          return (data.images && data.images.length > 0) || data.image;
        })
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.author?.id || data.userId || '',
            userName: data.author?.name || data.userName || '',
            userImage: data.author?.image || data.userImage || '',
            image: data.images?.[0] || data.image || '',
          } as FeedStory;
        });

      set({ stories });
    } catch (error: any) {
      // 스토리 로드 실패는 치명적이지 않으므로 에러 상태를 설정하지 않음
      console.error('스토리 로드 실패:', error);
    }
  },
}));
