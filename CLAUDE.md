# Golf Pub App - 프로젝트 가이드

## 프로젝트 개요
골프 모임 예약, 소셜 피드, 채팅, 중고마켓을 제공하는 모바일 앱.

## 기술 스택
- **프레임워크**: React Native 0.81.5 + Expo 54.0.0 (New Architecture)
- **언어**: TypeScript 5.9.2
- **네비게이션**: React Navigation 7.x (Bottom Tab + Native Stack)
- **상태관리**: Zustand 5.0.2
- **백엔드**: Firebase (Firestore, Realtime DB, Auth, Storage, FCM)
- **소셜 로그인**: 카카오 (@react-native-seoul/kakao-login)
- **결제**: Toss Payments (연동 예정)
- **날씨**: Open-Meteo API

## 폴더 구조
```
src/
├── components/       # 재사용 컴포넌트 (도메인별 하위 폴더)
│   ├── common/       # Button, Card, Avatar, Badge, Modal, EmptyState, LoadingSpinner
│   ├── booking/      # BookingCard, BookingFilter, ApplicantCard 등
│   ├── chat/         # ChatListItem, MessageBubble, MessageInput
│   ├── marketplace/  # ProductCard, CategorySelector
│   ├── membership/   # PlanCard, BenefitItem, ComparisonTable
│   ├── profile/      # ProfileCard, StatCard, FriendCard
│   ├── pub/          # PubCard, PubBadge, PubReviewCard
│   ├── music/        # MusicPlayer, SongCard, PlaylistCard
│   └── weather/      # WeatherWidget
├── constants/        # 앱 상수 (categories, golfCourses, membershipPlans, mockData)
├── hooks/            # 커스텀 훅 (useRequireAuth)
├── navigation/       # AuthNavigator.tsx
├── screens/          # 화면 (도메인별 하위 폴더, 89개)
│   ├── auth/         # Login, Register, ForgotPassword
│   ├── home/         # HomeScreen + 로컬 hooks
│   ├── booking/      # BookingList, BookingDetail, CreateBooking 등
│   ├── chat/         # ChatList, ChatRoom, CreateChat
│   ├── feed/         # Feed, CreatePost, PostDetail
│   ├── friend/       # Friends, AddFriend, FriendRequests
│   ├── golfcourse/   # GolfCourseSearch, Detail, Review
│   ├── marketplace/  # Marketplace, ProductDetail, CreateProduct
│   ├── membership/   # Intro, Plan, Payment, Benefits
│   ├── my/           # MyHome, HostedMeetups, JoinedMeetups
│   ├── notification/ # NotificationList
│   ├── profile/      # Profile, EditProfile, Settings, MyBookings
│   └── pub/          # BestPubs, PubDetail, PubReviews
├── services/         # API & 비즈니스 로직
│   ├── api/          # REST API (authAPI, bookingAPI, profileAPI, marketplaceAPI 등)
│   ├── firebase/     # Firebase (firebaseConfig, firebaseAuth, firebaseBooking, firebaseChat 등)
│   ├── kakao/        # 카카오 로그인/맵/메시지
│   ├── payment/      # tossPayments
│   └── music/        # spotifyService
├── store/            # Zustand 스토어 7개
│   ├── useAuthStore.ts
│   ├── useBookingStore.ts
│   ├── useChatStore.ts
│   ├── useFriendStore.ts
│   ├── useMarketplaceStore.ts
│   ├── useNotificationStore.ts
│   └── useProfileStore.ts
├── styles/           # theme.ts (colors, spacing, borderRadius, fontSize, fontWeight, shadows)
├── types/            # 타입 정의 (booking-types, feed-types, profile-types 등)
└── utils/            # 유틸리티 (logger, dateUtils, formatters, validators, imageUtils)
```

## 코딩 컨벤션

### 경로
- **항상** `@/` 경로 별칭 사용: `import { colors } from '@/styles/theme'`
- 상대 경로(`../../../`) 사용 금지

### 네이밍
- 화면: PascalCase + `Screen` 접미사 → `BookingDetailScreen.tsx`
- 컴포넌트: PascalCase → `BookingCard.tsx`
- 스토어: `use` + PascalCase → `useAuthStore.ts`
- 서비스: camelCase → `firebaseBooking.ts`, `bookingAPI.ts`
- 타입: PascalCase 인터페이스 → `BookingCardProps`

### 화면 컴포넌트 패턴
```tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles/theme';
import { useAuthStore } from '@/store/useAuthStore';

export const ExampleScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* 내용 */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
});
```

### Zustand 스토어 패턴
```tsx
import { create } from 'zustand';

interface ExampleState {
  data: Type[];
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
}

export const useExampleStore = create<ExampleState>((set) => ({
  data: [],
  loading: false,
  error: null,
  loadData: async () => {
    try {
      set({ loading: true, error: null });
      // API 호출
      set({ data: result, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### Firebase 서비스 패턴
```tsx
export const createItem = async (data: Partial<Item>): Promise<{
  success: boolean;
  id?: string;
  message: string;
}> => {
  try {
    const docRef = await firestore().collection('items').add({
      ...data,
      createdAt: FirestoreTimestamp.now(),
    });
    return { success: true, id: docRef.id, message: '생성 성공' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
```

## 디자인 시스템 (src/styles/theme.ts)
- **Primary**: `#10b981` (에메랄드 그린)
- **Secondary**: `#f59e0b` (앰버)
- **Tertiary**: `#3b82f6` (블루)
- **Spacing**: xs(4), sm(8), md(12), lg(16), xl(20), xxl(24), xxxl(32)
- **BorderRadius**: sm(8), md(12), lg(20), xl(28), full(9999)
- **FontSize**: xs(11), sm(13), md(15), lg(17), xl(20), xxl(24), xxxl(32)
- **Shadows**: sm, md, lg, xl (iOS shadow + Android elevation)

## 주요 명령어
```bash
npm start            # Expo 개발 서버
npm run android      # Android 빌드 & 실행
npm run ios          # iOS 빌드 & 실행
npm run lint         # ESLint 검사
npm run typecheck    # TypeScript 타입 검사
npm run lint:fix     # ESLint 자동 수정
```

## Firestore 컬렉션
- `users/{userId}` - 사용자 프로필
- `bookings/{bookingId}` - 골프 모임 예약
- `booking_participants/{id}` - 예약 참가 신청
- `marketplace/{itemId}` - 중고 상품
- `posts/{postId}` - 소셜 피드 게시글
- `pubs/{pubId}` - 펍/레스토랑
- `golfCourses/{courseId}` - 골프장
- `chats/{chatId}` - 채팅방
- `notifications/{userId}/notifications/{id}` - 알림

## Realtime Database (채팅)
- `chatRooms/{roomId}` - 채팅방 메타데이터
- `messages/{roomId}/{messageId}` - 실시간 메시지
- `presence/{userId}` - 온라인 상태
- `typing/{roomId}/{userId}` - 타이핑 표시

## 보안 규칙
- 모든 작업에 인증 필수
- 역할 기반 접근 제어 (GENERAL, COACH, ADMIN)
- 사용자 데이터는 소유자만 수정 가능
- role, points 등 민감 필드는 서버 측 제한

## 주의사항
- `console.log` 사용 금지 → `logger` 유틸리티 사용 또는 `console.warn`/`console.error`만 허용
- ESLint 규칙: `no-console: warn` (error, warn만 허용)
- 한국어 주석 사용
- 민감 정보(토큰, 비밀번호) 로그 출력 금지
- Mock 데이터는 `src/constants/mockData.ts`에 집중 관리
- 이미지 업로드는 Firebase Storage (`src/services/firebase/firebaseStorage.ts`) 사용

## 현재 개발 상태
- 전체 진행률: 약 58%
- 완료: 인증, 네비게이션, 채팅, 친구, 출석, 기본 UI (89화면)
- 진행중: Mock→실제 API 전환, 결제 연동, 푸시 알림
- 상세 현황: `DEVELOPMENT_LOG.md` 참고
