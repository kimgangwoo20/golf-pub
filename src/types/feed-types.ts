// feed-types.ts - Feed 시스템 타입 정의

export interface Post {
  id: number;
  author: {
    id: number | string; // Firebase UID(string) 또는 기존 Mock ID(number) 호환
    name: string;
    image: string;
    handicap: number;
  };
  images: string[];
  content: string;
  hashtags: string[];
  location?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  visibility: 'public' | 'friends';
  status: 'published' | 'deleted';
}

export interface Comment {
  id: number;
  postId: number;
  author: {
    id: number | string; // Firebase UID(string) 또는 기존 Mock ID(number) 호환
    name: string;
    image: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
  createdAt: string;
}

export interface Reply {
  id: number;
  commentId: number;
  author: {
    id: number | string; // Firebase UID(string) 또는 기존 Mock ID(number) 호환
    name: string;
    image: string;
  };
  content: string;
  createdAt: string;
}

export interface Story {
  id: number;
  userId: number;
  userName: string;
  userImage: string;
  image: string;
  createdAt: string;
  expiresAt: string;
  isViewed: boolean;
}