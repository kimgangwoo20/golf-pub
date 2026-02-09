// feed-types.ts - Feed 시스템 타입 정의

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    image: string;
    handicap?: number;
  };
  images: string[];
  content: string;
  hashtags: string[];
  location?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string | Date;
  visibility: 'public' | 'friends';
  status: 'published' | 'deleted';
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
  createdAt: string | Date;
}

export interface Reply {
  id: string;
  commentId: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  content: string;
  createdAt: string | Date;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  image: string;
  createdAt: string | Date;
  expiresAt: string | Date;
  isViewed: boolean;
}

// 피드 화면에서 사용하는 간소화된 피드 아이템 타입
export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  time: string;
  content: string;
  image?: string;
  images?: string[];
  likes: number;
  comments: number;
  location?: string;
  tags: string[];
}

// 피드 화면에서 사용하는 스토리 타입
export interface FeedStory {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  image: string;
}
