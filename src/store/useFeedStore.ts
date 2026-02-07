import { create } from 'zustand';
import { firestore as firebaseFirestore } from '@/services/firebase/firebaseConfig';
import { FeedPost, FeedStory } from '@/types/feed-types';

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
  stories: FeedStory[];
  loading: boolean;
  error: string | null;

  loadPosts: () => Promise<void>;
  loadStories: () => Promise<void>;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
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

      const posts = snapshot.docs.map(doc => {
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
        .filter(doc => {
          const data = doc.data();
          return (data.images && data.images.length > 0) || data.image;
        })
        .map(doc => {
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
