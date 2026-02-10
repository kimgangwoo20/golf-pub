# Golf Pub App - 개발 일정 & 진행 현황

> 이 파일은 개발 진행 상황을 추적하기 위한 문서입니다.
> 완료된 항목은 ~~취소선~~과 체크(✅)로 표시합니다.
> 커밋할 때마다 이 파일을 함께 업데이트합니다.

---

## 📋 기술 스택

| 구분     | 기술                                                |
|--------|---------------------------------------------------|
| 프레임워크  | React Native 0.81.5 + Expo 54.0.0                 |
| 언어     | TypeScript 5.9.2                                  |
| 네비게이션  | React Navigation 7.x                              |
| 상태관리   | Zustand 5.0.2                                     |
| 백엔드    | Firebase (Firestore, Realtime DB, Auth, Storage, FCM) |
| 소셜 로그인 | 카카오 로그인 (@react-native-seoul/kakao-login)         |
| 결제     | Toss Payments                                     |
| 날씨 API | Open-Meteo                                        |
| 지도 API | 카카오 지도                                            |
---

## 🏗️ 전체 개발 일정

### Phase 1: 기본 구조 & 인증 (완료)
### Phase 2: 핵심 기능 개발 (완료)
### Phase 3: 결제 & 알림 연동 (진행 중 - Cloud Functions 12개 배포 완료, Toss SDK 클라이언트 위젯 연동 예정)
### Phase 4: 테스트 & 최적화 (진행 중 - Jest 52개 테스트, CI/CD 설정 완료, Error Boundary 추가, React.lazy 11개 화면 적용)
### Phase 5: 배포 준비 (예정)

---

## ✅ 완료 내역

### 2026.02.06 완료

- [x] ~~프로젝트 초기 설정 (Expo + React Native + TypeScript)~~
- [x] ~~Firebase 프로젝트 연동 (Firestore, Auth, Storage, Realtime DB)~~
- [x] ~~Firebase 보안 규칙 설정 (역할 기반 접근 제어: GENERAL, COACH, ADMIN)~~ → 9차 배치에서 코드 맞춤 전면 개편 + 배포 완료
- [x] ~~7개 탭 네비게이션 구조 완성 (홈, 예약, 피드, 채팅, 중고마켓, 골프장, 마이홈)~~
- [x] ~~카카오 소셜 로그인 연동 (Custom Token 방식)~~
- [x] ~~이메일/비밀번호 로그인 & 회원가입~~
- [x] ~~비밀번호 찾기 화면~~
- [x] ~~사용자 프로필 관리 (Firestore 기반 CRUD)~~
- [x] ~~프로필 편집 화면~~
- [x] ~~Firebase Storage 이미지 업로드 (프로필, 채팅, 예약, 상품, 게시글, 리뷰)~~
- [x] ~~실시간 채팅 구현 (Firebase Realtime Database)~~
- [x] ~~1:1 채팅방 생성 및 메시지 송수신~~
- [x] ~~채팅 읽음 표시 & 타이핑 인디케이터~~
- [x] ~~골프 모임 예약 생성 (CreateBookingScreen)~~
- [x] ~~예약 목록 & 상세 화면~~
- [x] ~~예약 신청자 관리 화면~~
- [x] ~~친구 요청 & 친구 목록 시스템~~
- [x] ~~친구 프로필 조회~~
- [x] ~~그룹 생성 & 그룹 목록~~
- [x] ~~출석 체크 시스템 (일일 출석)~~
- [x] ~~멤버십 UI (FREE, BASIC, PRO, PREMIUM 4개 등급)~~
- [x] ~~멤버십 가입/비교/혜택/관리 화면~~
- [x] ~~소셜 피드 화면 (무한 스크롤, 스토리)~~
- [x] ~~게시글 작성 & 상세 화면~~
- [x] ~~댓글 시스템 (CommentSection, CommentInput)~~
- [x] ~~중고마켓 UI (상품 목록, 상세, 등록)~~
- [x] ~~골프장 검색 화면~~
- [x] ~~골프장 상세 & 리뷰 화면~~
- [x] ~~베스트 펍 목록 & 펍 상세 화면~~
- [x] ~~날씨 위젯 (Open-Meteo API 연동, 골프 점수 계산)~~
- [x] ~~포인트 내역 & 쿠폰 화면 (UI)~~
- [x] ~~설정 화면 (개인정보처리방침, 이용약관, 위치정보약관, 오픈소스)~~
- [x] ~~알림 목록 화면 (UI)~~
- [x] ~~마이홈 화면 (주최한 모임, 참여한 모임, 내 게시글, 내 리뷰)~~
- [x] ~~테마 기반 색상 시스템~~
- [x] ~~Zustand 상태 관리 스토어 7개 구현~~
- [x] ~~타입 정의 파일 9개 작성~~
- [x] ~~공통 컴포넌트 제작 (Avatar, Badge, Button, Card, EmptyState, LoadingSpinner, Modal)~~
- [x] ~~전체 화면 89개 구현~~
- [x] ~~재사용 컴포넌트 48개 제작~~

### 2026.02.06 버그 수정 & 코드 정리

- [x] ~~크로스탭 네비게이션 버그 수정 (6개 화면)~~
- [x] ~~채팅 UI/UX 개선~~
- [x] ~~AsyncStorage 의존성 제거 → Firestore clearPersistence로 대체~~
- [x] ~~민감 로그 58개 제거/정화 (firebaseAuth, firebaseStorage, profileAPI, useAuthStore)~~
- [x] ~~색상 통일 작업~~
- [x] ~~타입 오류 수정~~

### 2026.02.07 개발 환경 개선 & 타입 안정화

- [x] ~~CLAUDE.md 프로젝트 가이드 생성~~ (2026.02.07 완료)
- [x] ~~package.json에 lint, lint:fix, typecheck, check 스크립트 추가~~ (2026.02.07 완료)
- [x] ~~TypeScript 타입 에러 168개 전체 수정 (41개 파일)~~ (2026.02.07 완료)
- [x] ~~Booking 타입 통일 (booking-types.ts ↔ useBookingStore.ts 중복 제거)~~ (2026.02.07 완료)
- [x] ~~User 타입 보완 (id, name, phone, points, avatar 필드 추가)~~ (2026.02.07 완료)
- [x] ~~카카오 SDK 타입 수정 (존재하지 않는 export를 로컬 타입으로 대체)~~ (2026.02.07 완료)
- [x] ~~Navigation 타입 안정화 (useNavigation<any>, as any 패턴)~~ (2026.02.07 완료)
- [x] ~~홈 멤버십 배너 그라데이션 보라색 계열로 변경~~ (2026.02.07 완료)

### 2026.02.07 Mock 데이터 → Firestore 실제 API 교체

- [x] ~~BookingListScreen - Mock 예약 데이터 제거 → useBookingStore 연결~~ (2026.02.07 완료)
- [x] ~~MarketplaceScreen - Mock 상품 데이터 제거 → useMarketplaceStore 연결~~ (2026.02.07 완료)
- [x] ~~FeedScreen - Mock 스토리/게시글 제거 → useFeedStore 신규 생성 및 연결~~ (2026.02.07 완료)
- [x] ~~MarketItem → Product 타입 통일 (marketplace-types.ts 기준)~~ (2026.02.07 완료)
- [x] ~~Firestore 컬렉션명 통일 (marketplace → products)~~ (2026.02.07 완료)
- [x] ~~feed-types.ts ID 타입 number → string 변경 (Firestore doc ID 호환)~~ (2026.02.07 완료)
- [x] ~~useFeedStore.ts 신규 생성 (Zustand 스토어 7개 → 8개)~~ (2026.02.07 완료)
- [x] ~~PostDetailScreen 타입 호환성 수정~~ (2026.02.07 완료)
- [x] ~~HomeScreen - 알림 뱃지 하드코딩 "3" → useNotificationStore 실시간 연결~~ (2026.02.07 완료)
- [x] ~~HomeScreen - 멤버십 배너 하드코딩 텍스트 → MEMBERSHIP_PLANS 상수 연결~~ (2026.02.07 완료)

### 2026.02.07 예약 화면 Mock→Firestore 전환 (5차 배치)

- [x] ~~ApplicantProfileScreen - MOCK_APPLICANT 제거 → getApplicantProfile + approveBookingRequest/rejectBookingRequest 실제 API 연결~~ (2026.02.07 완료)
- [x] ~~PaymentScreen - 하드코딩 booking 객체 제거 → getBookingDetail + users 조인 연결, console.log/setTimeout 제거, bookingId number→string~~ (2026.02.07 완료)
- [x] ~~PopularBookingsScreen - MOCK_BOOKINGS 2건 + 로컬 Booking 제거 → getPopularBookings 연결, setTimeout 제거~~ (2026.02.07 완료)
- [x] ~~RecommendedBookingsScreen - MOCK_BOOKINGS 2건 + 로컬 Booking 제거 → getRecommendedBookings 연결~~ (2026.02.07 완료)
- [x] ~~RequestStatusScreen - MOCK_REQUEST 제거 → getRequestStatus 연결 (bookingParticipants + bookings + users 조인)~~ (2026.02.07 완료)
- [x] ~~firebaseBooking.ts - getPopularBookings, getRecommendedBookings, getRequestStatus, getApplicantProfile 4개 함수 추가~~ (2026.02.07 완료)
- [x] ~~5개 화면 상대 경로(../../) → @/ 경로 별칭 변경~~ (2026.02.07 완료)
- [x] ~~5개 화면 로딩/빈 상태 UI + Pull-to-refresh 추가~~ (2026.02.07 완료)

### 2026.02.07 코드 품질 정리 (8차 배치)

- [x] ~~console.log 91곳 제거 (스크린 6 + 서비스 73 + 유틸 12)~~ (2026.02.07 완료)
  - 스크린 4개: NotificationListScreen, CreateBookingScreen, CreatePostScreen, GolfCourseSearchScreen
  - 서비스 7개: bookingAPI(11), friendAPI(13), marketplaceAPI(15), membershipAPI(3), weatherAPI(2), kakaoMessage(16), kakaoMap(11)
  - 유틸 2개: devicePermissions(10), imageUtils(2)
- [x] ~~상대 경로 29곳 → @/ 별칭 변환 (16개 파일)~~ (2026.02.07 완료)
  - auth/: ForgotPasswordScreen, RegisterScreen
  - chat/: CreateChatScreen-Firebase, ChatScreen, ChatListScreen-Firebase
  - booking/: CreateBookingScreen
  - membership/: MembershipBenefitsScreen, MembershipIntroScreen, MembershipManageScreen, MembershipPlanScreen, PlanComparisonScreen, UpgradePlanScreen
  - profile/: EditProfileScreen, MyBookingsScreen
  - my/: MyHomeScreen, AccountManagementScreen
- [x] ~~TypeScript typecheck 0 에러 유지~~ (2026.02.07 완료)

### 2026.02.10 종합 코드 감사 2차 - 크래시 방지, 네비게이션 타입, 스토어/서비스 수정

- [x] ~~전체 코드베이스 Image onError 일괄 추가 (48+ 파일, 58개 원격 Image)~~ (2026.02.10 완료)
  - 원격 URI Image 컴포넌트에 `onError={() => {}}` 핸들러 누락 → 이미지 로드 실패 시 크래시 방지
  - 대상: components/ 14개 + screens/ 34개 파일 (BackgroundMediaEditor, FeedViewer, ProductDetailScreen, ChatListScreen 등)
  - Node.js 일괄 스크립트 + 수동 멀티라인 JSX 수정 + ESLint --fix Prettier 포맷 정리
- [x] ~~navigation-types.ts 생성: 7개 스택 route param 타입 정의~~ (2026.02.10 완료)
  - HomeStackParamList, BookingStackParamList, MyHomeStackParamList, MarketplaceStackParamList, GolfCourseStackParamList, ChatStackParamList, FeedStackParamList
  - PostDetailScreen, GolfCourseReviewScreen, WriteReviewScreen에서 `@ts-expect-error` 5개 제거
  - `RouteProp<>` 제네릭으로 타입 안전한 route params 접근
  - App.tsx에서 불필요한 `as any` 캐스팅 2개 제거 (GolfCourseReviewScreen, PostDetailScreen)
- [x] ~~useChatStore sendMessage/sendImage 에러 상태 초기화 추가~~ (2026.02.10 완료)
  - 이전 에러가 남아있어 다음 메시지 전송 시 에러 표시되는 버그 수정
- [x] ~~useNotificationStore subscribeToUnreadCount 필드명 통일~~ (2026.02.10 완료)
  - `where('isRead', '==', false)` → `where('read', '==', false)` (실제 Firestore 필드명과 일치)
  - 구독 에러 콜백에 `console.error` 추가 (기존 silent 무시 → 에러 로깅)
- [x] ~~firebaseMessaging cleanup() 메서드 추가~~ (2026.02.10 완료)
  - 로그아웃 시 FCM 리스너(토큰 갱신, 포그라운드 메시지, 알림 탭) 명시적 정리 가능
- [x] ~~bookingAPI.acceptApplicant Firestore 트랜잭션 래핑~~ (2026.02.10 완료)
  - 기존: read → check capacity → batch update (레이스 컨디션으로 정원 초과 가능)
  - 수정: `firestore().runTransaction()` 내에서 정원 확인 + 참가자 추가 (원자적 처리)
- [x] ~~profile/SettingsScreen.tsx 삭제 (미사용 dead code)~~ (2026.02.10 완료)
  - App.tsx는 `my/settings/SettingsScreen.tsx`만 import, profile/ 버전은 참조 없음
- [x] ~~TypeScript 0 에러, ESLint 0 에러 (560 warnings - 기존 any 타입)~~ (2026.02.10 완료)

### 2026.02.10 .env 보안 정리

- [x] ~~`.env` 파일 Git 추적 해제 (`git rm --cached .env`)~~ (2026.02.10 완료)
  - `.env`가 `.gitignore`에 포함되어 있었지만 이미 tracked 상태로 실제 API 키가 커밋에 포함되어 있었음
- [x] ~~`git filter-repo`로 전체 Git 히스토리에서 `.env` 완전 제거 + force push~~ (2026.02.10 완료)
  - 169개 커밋 히스토리에서 `.env` 파일 흔적 완전 삭제
  - `git log --all --oneline -- .env` → 0건 확인
- [x] ~~`.env.example` 실제 `.env` 키 구조와 동기화~~ (2026.02.10 완료)
  - 추가: `FIREBASE_DATABASE_URL`, `KAKAO_NATIVE_APP_KEY`/`REST_API_KEY`/`JS_KEY` (기존 단일 키 → 3종 분리)
  - 추가: Cloudflare Images 4개, 백엔드/웹 URL 2개, 날씨 API 키
  - 섹션 8개로 재정리 (Firebase, Kakao, Toss, Cloudflare, 백엔드, 날씨, 앱설정, 디버그)

### 2026.02.10 코드 감사 기반 버그 일괄 수정 (CRITICAL → LOW)

- [x] ~~3-에이전트 병렬 코드 감사 수행 (Navigation/State, API/Firebase, UI/UX)~~ (2026.02.10 완료)
- [x] **CRITICAL**: ~~bookingAPI `getMyApplications` 무제한 컬렉션 스캔 → `collectionGroup` 쿼리 + `limit(100)` 적용~~ (2026.02.10 완료)
  - 기존: 전체 bookings 컬렉션 스캔 후 N+1 subcollection 쿼리
  - 수정: `collectionGroup('applications')` + `where('userId', '==', uid)` + `limit(100)` + `parent.parent` 참조
- [x] **CRITICAL**: ~~profileAPI 배경미디어 배열 업데이트 race condition → `firestore().runTransaction()` 적용~~ (2026.02.10 완료)
  - `addBackgroundMedia`, `removeBackgroundMedia` 두 함수 모두 트랜잭션으로 원자적 업데이트
- [x] **HIGH**: ~~LoginScreen Android 키보드 동작 수정 (`undefined` → `'height'`)~~ (2026.02.10 완료)
- [x] **HIGH**: ~~BookingListScreen `useFocusEffect` 의존성 누락 수정 (`[loadBookings]`)~~ (2026.02.10 완료)
- [x] **HIGH**: ~~firebaseChat 4개 silent catch 블록에 `console.warn` 추가~~ (2026.02.10 완료)
  - `markMessageAsRead`, `markAllMessagesAsRead`, `setTypingStatus`, 채팅 알림 전송
- [x] **HIGH**: ~~firebaseBooking N+1 호스트 쿼리 → batch `where...in` 쿼리~~ (2026.02.10 완료)
  - `getPopularBookings`, `getRecommendedBookings`: 개별 `.get()` → `FieldPath.documentId()` 배치 (10개 단위)
- [x] **HIGH**: ~~firebaseMessaging FCM 리스너 누수 → `_unsubscribers` 배열 추적/정리~~ (2026.02.10 완료)
  - `initialize()` 호출 시 기존 리스너 정리 후 새로 등록
- [x] **MEDIUM**: ~~profileAPI `console.error` 15개에 error 객체 누락 수정~~ (2026.02.10 완료)
- [x] **MEDIUM**: ~~ForgotPasswordScreen, CreateBookingScreen, CreateProductScreen에 `KeyboardAvoidingView` 추가~~ (2026.02.10 완료)
- [x] **MEDIUM**: ~~8개 컴포넌트 Image `onError` 폴백 처리 추가~~ (2026.02.10 완료)
  - Avatar, BookingCard, ProfileCard, ChatListItem, FriendCard, ApplicantCard, PubCard, ProductCard
  - 이미지 로드 실패 시 이니셜/아이콘 플레이스홀더로 자동 전환
- [x] **LOW**: ~~ChatListScreen, NotificationListScreen FlatList에 `getItemLayout` 추가~~ (2026.02.10 완료)
- [x] ~~TypeScript 0 에러 유지~~ (2026.02.10 완료)

### 2026.02.10 BackgroundMediaEditor 모달 버그 수정 + 스토어 미갱신 일괄 수정

- [x] ~~BackgroundMediaEditor 바텀시트 Android에서 콘텐츠 보이지 않는 버그 수정~~ (2026.02.10 완료)
  - 원인: `container`(maxHeight:'85%')의 자식 `SafeAreaView`(flex:1)가 Android에서 높이 순환 참조 → 0px 렌더링
  - SafeAreaView 래핑 제거 → 콘텐츠가 직접 container 높이 결정
  - `maxHeight`를 퍼센트 → `Dimensions` 기반 숫자값(`SHEET_MAX_HEIGHT`)으로 변경
  - FlatList에 `maxHeight`(`LIST_MAX_HEIGHT`) 추가하여 스크롤 영역 바운딩
- [x] ~~BackgroundMediaEditor 하단 버튼 잘림 수정 (paddingBottom 34→56)~~ (2026.02.10 완료)
- [x] ~~배경 이미지 업로드 속도 개선 — 업로드 전 이미지 압축 추가~~ (2026.02.10 완료)
- [x] ~~배경 스와이프 스냅백 버그 수정~~ (2026.02.10 완료)
  - 원인: `ListHeaderComponent`를 함수 컴포넌트(() => JSX)로 전달 → 매 렌더마다 새 함수 참조 → FlatList 헤더 리마운트 → ScrollView 스크롤 위치 리셋
  - JSX 엘리먼트 변수(`const listHeader = <JSX />`)로 변경하여 reconciliation만 수행
- [x] ~~프로필 수정 후 닉네임 즉시 반영 안 되는 버그 수정~~ (2026.02.10 완료)
  - EditProfileScreen: 저장 후 `refreshProfileStore(user.uid)` 호출 추가
  - MyHomeScreen: 닉네임을 `profile?.displayName` (스토어) 우선으로 읽도록 변경
- [x] ~~API 호출 후 스토어 미갱신 버그 일괄 수정 (7개 화면)~~ (2026.02.10 완료)
  - **HIGH**: CreateProductScreen (상품 생성 후 `loadItems()`), CreatePostScreen (게시글 생성 후 `loadPosts()`), ChatListScreen (`useEffect`→`useFocusEffect`), FriendsScreen (`useEffect`→`useFocusEffect`), MyProductsScreen (`useEffect`→`useFocusEffect`)
  - **MEDIUM**: CreateBookingScreen (모임 생성 후 `loadBookings()`), FriendRequestsScreen (`useEffect`→`useFocusEffect`)
- [x] ~~HANDOFF.md 인수인계 문서 생성~~ (2026.02.10 완료)
- [x] ~~ImageViewerModal, BackgroundMediaEditor 컴포넌트 신규 추가~~ (2026.02.10 완료)
- [x] ~~TypeScript 0 에러 유지~~ (2026.02.10 완료)

### 2026.02.09 프로필 좋아요 Firestore 연동 (26차 배치)

- [x] ~~useProfileStore에 `likeCount` 필드 + 좋아요 액션 추가 (useProfileStore.ts)~~ (2026.02.09 완료)
  - `UserProfile`에 `likeCount: number` 필드 추가
  - `toggleProfileLike(targetUid, likerUid)`: 트랜잭션 기반 좋아요 토글 (결정적 문서 ID `profileLikes/{targetUid}_{likerUid}` + `users/{uid}.likeCount` increment/decrement)
  - `checkProfileLiked(targetUid, likerUid)`: 좋아요 상태 확인
  - marketplace `likeProduct/unlikeProduct` 트랜잭션 패턴 재사용
- [x] ~~MyHomeScreen 좋아요 하드코딩 제거 → Firestore 연동 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - `useState(42)` → `profile?.likeCount || 0` 동기화
  - `handleLikeToggle` → `toggleProfileLike` 호출 + 낙관적 UI + 실패 시 롤백
  - `useEffect`에서 `checkProfileLiked` 호출하여 초기 liked 상태 설정
- [x] ~~ProfileScreen 좋아요 하드코딩 제거 → Firestore 연동 (ProfileScreen.tsx)~~ (2026.02.09 완료)
  - 동일 패턴: `useState(42)` → `profile?.likeCount || 0`
  - `handleLike` → async + `toggleProfileLike` + 낙관적 UI + 롤백
  - 타인 프로필 좋아요 토글 지원 (`targetUserId` 활용)
- [x] ~~Firestore 보안 규칙 업데이트 (firestore.rules)~~ (2026.02.09 완료)
  - `users/{userId}` update 규칙에 `likeCount` 필드 예외 추가 (인증된 사용자 허용)
  - `profileLikes/{likeId}` 컬렉션 규칙 추가: read/create(인증), delete(본인만), update(불가)
- [x] ~~TypeScript 0 에러, ESLint 0 에러 확인~~ (2026.02.09 완료)

### 2026.02.09 My홈피 프로필 인터랙티브 기능 + 전체 lint 정리 (25차 배치)

- [x] ~~UserProfile 타입 확장 (useProfileStore.ts)~~ (2026.02.09 완료)
  - `FavoriteCourse` 인터페이스 추가: `{ name: string, id?: string, location?: { lat, lng } }`
  - `favoriteCourses` 타입 변경: `string[]` → `FavoriteCourse[]`
  - 새 필드 추가: `roundingStyles`, `golfExperience`, `monthlyRounds`, `overseasGolf`
- [x] ~~MyHomeScreen 골프 스탯 터치 편집 기능 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - 스탯 칩 `View` → `TouchableOpacity` 전환, 터치 시 편집 모달 오픈
  - `STAT_OPTIONS` 상수: 평균타수/골프경력/월라운드/해외골프별 선택 옵션
  - 스탯 편집 모달: 옵션 선택 버튼 + 평균타수 직접 입력 → Firestore 저장
- [x] ~~MyHomeScreen 자주 가는 골프장 추가/삭제 기능 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - 섹션 제목 옆 `+` 버튼 → 골프장 입력 모달 (slide 애니메이션)
  - 태그 롱프레스 → Alert 확인 → Firestore에서 삭제
  - `normalizeCourses()` 마이그레이션 헬퍼: `string[]` → `FavoriteCourse[]` 호환
- [x] ~~MyHomeScreen 라운딩 스타일 토글 선택 기능 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - `ROUNDING_STYLE_OPTIONS` 12개 미리 정의 옵션
  - 스타일 선택 모달: 칩 토글 (최대 5개) → Firestore 저장
  - `userData.roundingStyles` Firestore 연동 (기존 하드코딩 대체)
- [x] ~~ProfileScreen favoriteCourses 호환성 수정 (ProfileScreen.tsx)~~ (2026.02.09 완료)
  - `FavoriteCourse` 객체 타입 대응: `typeof course === 'string' ? course : course.name`
- [x] ~~피드 다중 이미지 지원 (useFeedStore.ts, feed-types.ts)~~ (2026.02.09 완료)
  - `FeedPost` 타입에 `images?: string[]` 필드 추가
  - `useFeedStore` 매핑에서 `images` 배열 처리 추가
- [x] ~~Firestore bookings 복합 인덱스 추가 (firestore.indexes.json)~~ (2026.02.09 완료)
  - `participants.members` (CONTAINS) + `createdAt` (DESC) 복합 인덱스
- [x] ~~전체 ESLint 자동 수정 + 미사용 import 제거~~ (2026.02.09 완료)
  - `npm run lint:fix` 전체 적용: prettier 포맷팅 384개 에러 자동 수정
  - 미사용 import 수동 제거: BookingDetailScreen(`useRef`), paymentAPI(`FirestoreTimestamp`), firebaseAttendance(`AttendanceRecord`), MyHomeScreen(`spacing`, `fs`)
  - SettingsScreen `require` eslint-disable 주석 추가
  - `functions/lib/` .gitignore 추가
  - 최종 결과: **TypeScript 0 에러, ESLint 0 에러** (532 warnings만 잔존 - 기존 `any` 타입)

### 2026.02.09 My 홈피 다이어리 & 방명록 기능 구현 (22차 배치)

- [x] ~~MyHomeScreen 사진첩 탭 제거 → 탭 구조 3개로 변경 (전체/다이어리/방명록) (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - tabs 배열에서 `{ id: 'photo' }` 제거
  - `buildPostsQuery()`의 `photo` 분기 제거
  - `_filterByTab()`의 `photo` 분기 제거
  - 다이어리 탭이 글+이미지+위치를 통합하여 사진첩 역할도 겸함
- [x] ~~MyHomeScreen FAB 플로팅 액션 버튼 추가 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - 우측 하단 FAB 버튼 (FeedScreen의 fabButton 패턴 재활용)
  - all/diary 탭: `navigation.navigate('Feed', { screen: 'CreatePost', params: { type: 'diary' } })`
  - guestbook 탭: 방명록 작성 모달 열기
- [x] ~~MyHomeScreen 방명록 작성 모달 구현 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - 바텀시트 스타일 모달 (KeyboardAvoidingView 적용)
  - TextInput 멀티라인, 최대 200자, 글자 수 카운터
  - Firestore `users/{uid}/guestbook/` 저장 (authorId, authorName, authorImage, content, createdAt)
  - 등록 버튼 비활성/활성/로딩 상태 처리
  - 성공 후 방명록 리스트 자동 갱신
- [x] ~~MyHomeScreen 기존 "개발 예정" 방명록 버튼 제거 → FAB로 대체 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
- [x] ~~CreatePostScreen type 파라미터 수신 및 Firestore 저장 (CreatePostScreen.tsx)~~ (2026.02.09 완료)
  - `useRoute()`로 route params 수신
  - `type: routeParams.type || 'photo'` 필드를 Firestore 게시물에 추가
- [x] ~~TypeScript typecheck 0 에러 유지~~ (2026.02.09 완료)

### 2026.02.09 프로필 사진 권한 수정 + My홈피 프로필 UI 최적화 (24차 배치)

- [x] ~~app.json에 expo-image-picker 플러그인 추가 (빌드 시 Android/iOS 네이티브 권한 자동 설정)~~ (2026.02.09 완료)
- [x] ~~imageUtils.ts 이미지 선택 권한을 expo 내장 API로 전환 (imageUtils.ts)~~ (2026.02.09 완료)
  - 커스텀 `requestStoragePermission`/`requestCameraPermission` (devicePermissions.ts) 제거
  - `import * as ImagePicker from 'expo-image-picker'` 정적 import로 변경 (동적 require 제거)
  - `pickImageFromGallery`: `ImagePicker.requestMediaLibraryPermissionsAsync()` 사용
  - `pickMultipleImages`: `ImagePicker.requestMediaLibraryPermissionsAsync()` 사용
  - `takePhoto`: `ImagePicker.requestCameraPermissionsAsync()` 사용
  - `MediaTypeOptions.Images` → `['images']` (최신 expo-image-picker API)
  - 권한 거부 시 "설정으로 이동" 버튼 포함 Alert 추가 (`Linking.openSettings()`)
- [x] ~~MyHomeScreen 프로필 헤더 UI 리디자인 - 모던 프로필 카드 스타일 (MyHomeScreen.tsx)~~ (2026.02.09 완료)
  - 배경 이미지 200px → 160px (배경만, 컨텐츠 없음)
  - 흰색 프로필 카드 `marginTop: -50` 오프셋 배치 (배경 위로 겹침)
  - 프로필 사진 80px → 90px, 배경 하단에 걸치는 오프셋 배치 (`marginTop: -45`)
  - 텍스트 색상: 흰색(배경 위) → 검정(흰색 카드 위)으로 가독성 향상
  - 명시적 "프로필 수정" 아웃라인 버튼 추가 (기존 사진 터치 대체)
  - 방문자 카운터 + 통계를 프로필 카드 내부로 통합 (별도 statsSection 제거)
  - 구분선으로 섹션 분리
- [x] ~~전화번호 비공개 검증 완료: UI(FriendProfileScreen) + API(getUserProfile) 이중 보호 확인, 추가 조치 불필요~~ (2026.02.09 완료)
- [x] ~~imageUtils.test.ts 테스트 mock 업데이트 (devicePermissions → expo 내장 권한 mock)~~ (2026.02.09 완료)
- [x] ~~TypeScript typecheck 0 에러 유지~~ (2026.02.09 완료)

### 2026.02.09 전체 앱 감사 기반 일괄 수정 - 보안/UI/품질 개선 (23차 배치)

- [x] ~~법적 문서 수정: 홍길동→김강우, 연락처→support@golfpub.kr, 날짜 2026.02.09 업데이트 (PrivacyPolicy, LocationTerms, Support)~~ (2026.02.09 완료)
- [x] ~~Firestore 보안 규칙 강화 (firestore.rules)~~ (2026.02.09 완료)
  - pubs/golfCourses: `isSignedIn()` → 관리자 또는 평점 필드만 업데이트 가능
  - applications: 주최자 또는 신청자 본인만 수정/삭제 가능
  - bookingParticipants: 신청자 본인 또는 해당 부킹 주최자만 수정 가능
- [x] ~~DEFAULT_AVATAR 상수 생성 및 17개 파일 하드코딩 URL 교체 (constants/images.ts + 16개 화면)~~ (2026.02.09 완료)
- [x] ~~Modal onRequestClose 누락 2건 추가 (GolfCourseReviewScreen, FilterSheet)~~ (2026.02.09 완료)
- [x] ~~SettingsScreen 개선: 앱 버전 app.json 동기화, 캐시 삭제 에러 메시지 수정, 저작권 연도 2026 업데이트~~ (2026.02.09 완료)
- [x] ~~FeedScreen 풀투리프레시(RefreshControl) 추가~~ (2026.02.09 완료)
- [x] ~~8개 화면 SafeAreaView 추가 (BookingRequests, PopularBookings, RecommendedBookings, RequestStatus, ChatList, CreateGroup, GroupList, Invite)~~ (2026.02.09 완료)
- [x] ~~경합 조건 수정 (firebaseBooking, firebaseFriends, marketplaceAPI)~~ (2026.02.09 완료)
  - joinBooking: read-then-write → runTransaction 원자적 처리
  - acceptFriendRequest: 개별 write → runTransaction (중복 수락 방지)
  - likeProduct/unlikeProduct: query→write → 결정적 docId + runTransaction
- [x] ~~스텁 화면 3개 개선: CreateGroup, GroupList, Invite → 헤더+뒤로가기+"곧 출시" UI~~ (2026.02.09 완료)
- [x] ~~빈 유틸리티 파일 2개 삭제 (dateUtils.ts, membershipGate.ts)~~ (2026.02.09 완료)
- [x] ~~TypeScript typecheck 0 에러 유지~~ (2026.02.09 완료)

### 2026.02.08 전체 코드베이스 감사 - 8개 버그 카테고리 일괄 수정 (20차 배치)

- [x] ~~HomeScreen 네비게이션 크래시 수정 (HomeScreen.tsx)~~ (2026.02.08 완료)
  - `params: { booking }` (객체) → `params: { bookingId: booking.id }` (문자열)
  - BookingDetailScreen이 `bookingId` 파라미터를 기대하는데 전체 객체를 전달하여 크래시
- [x] ~~FeedScreen 좋아요/댓글 Firestore 영속화 (FeedScreen.tsx)~~ (2026.02.08 완료)
  - handleLike: 로컬 토글만 → 낙관적 UI + posts/{id}/likes 서브컬렉션 + likes 카운터 증감 + 실패 시 롤백
  - handleSubmitComment: 로컬 배열만 → posts/{id}/comments 서브컬렉션 저장 + comments 카운터 증가
- [x] ~~PostDetailScreen 좋아요/댓글/삭제 Firestore 영속화 (PostDetailScreen.tsx)~~ (2026.02.08 완료)
  - handleLike: 낙관적 UI + posts/{id}/likes 서브컬렉션 + 실패 시 롤백
  - handleCommentLike: comments 서브컬렉션 likes 필드 업데이트
  - handleSendComment: posts/{id}/comments 서브컬렉션 저장 (댓글/대댓글 모두)
  - handleDeleteComment: comments 서브컬렉션 삭제 + 카운터 감소
  - handleDeletePost: Alert만 표시 → Firestore status='deleted' 소프트 삭제 구현
- [x] ~~Firestore rules 누락 컬렉션 규칙 추가 (firestore.rules)~~ (2026.02.08 완료)
  - golfCourses 컬렉션: 읽기(로그인), 생성/삭제(관리자), 수정(로그인 - 평점 업데이트용)
  - users/{userId}/blockedUsers 서브컬렉션: 본인만 CRUD
  - posts/{postId}/likes 서브컬렉션: 본인만 생성/삭제
  - chatRooms 삭제: `isSignedIn()` → `participantIds에 포함된 사용자만` 제한
- [x] ~~new Date() → FirestoreTimestamp.now() 전환 (3개 스토어, 12곳)~~ (2026.02.08 완료)
  - useBookingStore: createBooking(2), updateBooking(1), joinBooking(1), leaveBooking(1)
  - useFriendStore: sendFriendRequest(1), acceptFriendRequest(1)
  - useProfileStore: updateProfile(1), uploadProfileImage(1), addPoints(2), subtractPoints(2)
- [x] ~~.update() → .set({merge:true}) 전환 (5개 파일, 11곳)~~ (2026.02.08 완료)
  - useProfileStore: updateProfile, uploadProfileImage (문서 미존재 크래시 방지)
  - golfCourseAPI: updateGolfCourseRating 2곳
  - pubAPI: updatePubRating 2곳
  - firebaseFriends: acceptFriendRequest stats 2곳, removeFriend stats 2곳
  - useFriendStore: acceptFriendRequest 1곳
- [x] ~~복합 인덱스 3개 추가 + Storage rules 수정 (firestore.indexes.json, storage.rules)~~ (2026.02.08 완료)
  - pubs: location + rating (지역별 인기순 정렬)
  - pub_reviews: pubId + createdAt (펍별 최신 리뷰)
  - golf_course_reviews: courseId + createdAt (골프장별 최신 리뷰)
  - storage.rules reviews/: `reviews/{userId}/{reviewId}/{file}` → `reviews/{reviewId}/{file}` (코드 경로 일치)
- [x] ~~joinBooking/leaveBooking 경쟁 조건 수정 (useBookingStore.ts)~~ (2026.02.08 완료)
  - read → check → update 패턴 → Firestore runTransaction 원자적 처리
  - 동시 참가 시 정원 초과 방지, 동시 탈퇴 시 참가자 수 불일치 방지
- [x] ~~TypeScript typecheck 0 에러 유지~~ (2026.02.08 완료)

### 2026.02.08 채팅 메시지 전송/읽음 처리 실패 수정 (19차 핫픽스)

- [x] ~~useChatStore sendMessage/sendImage: update() → set({merge:true}) 변경 (useChatStore.ts)~~ (2026.02.08 완료)
  - BookingDetailScreen에서 `chatId: booking_${booking.id}`로 채팅방 진입 시, chatRoom 문서가 Firestore에 미존재
  - `.update()`는 문서 없으면 실패 → `.set({}, { merge: true })`로 변경하여 문서 없어도 자동 생성
- [x] ~~useChatStore markAsRead: chatRoom update → set({merge:true}) 변경 (useChatStore.ts)~~ (2026.02.08 완료)
  - 동일 원인으로 unreadCount 업데이트 실패 → set+merge로 수정
- [x] ~~useChatStore 타임스탬프: new Date() → FirestoreTimestamp.now() 전환 (useChatStore.ts)~~ (2026.02.08 완료)
  - sendMessage, sendImage, sendSystemMessage, createChatRoom 4곳 서버 타임스탬프 전환
- [x] ~~Firestore 규칙: chatRooms/messages update 허용 (firestore.rules)~~ (2026.02.08 완료)
  - `allow update: if false` → `allow update: if isSignedIn() && readBy 필드만 변경 허용`
  - 읽음 처리(readBy 배열 업데이트) 차단되던 문제 해결
- [x] ~~Firestore 규칙 배포 완료~~ (2026.02.08 완료)

### 2026.02.08 Storage 보안 규칙 경로 불일치 수정 (18차 핫픽스)

- [x] ~~Storage 보안 규칙 - bookings/ 경로 신규 추가 (storage.rules)~~ (2026.02.08 완료)
  - 모집글 이미지 업로드 실패 원인: `bookings/{bookingId}/{fileName}` 규칙이 없어 catch-all `allow write: if false`에 차단됨
- [x] ~~Storage 보안 규칙 - chats/ 경로 신규 추가 (storage.rules)~~ (2026.02.08 완료)
  - 채팅 이미지 업로드도 동일 원인으로 차단됨
- [x] ~~Storage 보안 규칙 - products/ 경로 수정 (storage.rules)~~ (2026.02.08 완료)
  - 규칙 `marketplace/{userId}/{itemId}/{file}` → 코드 경로 `products/{productId}/{file}`로 수정
- [x] ~~Storage 보안 규칙 - posts/ 경로 세그먼트 수정 (storage.rules)~~ (2026.02.08 완료)
  - 규칙 `posts/{userId}/{postId}/{file}` (4세그먼트) → 코드 경로 `posts/{postId}/{file}` (3세그먼트)로 수정
- [x] ~~Firebase Storage 규칙 배포 완료~~ (2026.02.08 완료)

### 2026.02.08 CRITICAL 감사 이슈 6건 수정 (17차 배치)

- [x] ~~친구 시스템 Firestore 컬렉션 경로 수정 (firebaseFriends.ts + useFriendStore.ts)~~ (2026.02.08 완료)
  - flat `friends` 컬렉션 → `users/{userId}/friends` 서브컬렉션으로 6곳 수정
  - sendFriendRequest: 기존 친구 확인 경로 수정
  - acceptFriendRequest: 양방향 서브컬렉션에 friend 문서 생성
  - getFriendsList: 서브컬렉션 조회 + 배치 프로필 조인 (10개씩 분할)
  - getFriendProfile/getSuggestedFriends/removeFriend: 서브컬렉션 경로 통일
  - useFriendStore: loadFriends 프로필 조인 재작성, sendFriendRequest/acceptFriendRequest/removeFriend 경로 수정
- [x] ~~알림 딥링킹 크래시 수정 (GolfCourseReviewScreen.tsx)~~ (2026.02.08 완료)
  - `route.params?.course` (객체)만 지원 → `route.params?.courseId` (문자열) 파라미터도 지원
  - 딥링킹에서 courseId만 전달해도 크래시 없이 리뷰 화면 로드
- [x] ~~MyHomeScreen Firestore 삭제 로직 추가 (MyHomeScreen.tsx)~~ (2026.02.08 완료)
  - handleDeleteContent: 로컬 상태만 변경 → Firestore `posts/{id}` 실제 삭제 추가
  - handleDeleteGuestbook: 로컬 상태만 변경 → Firestore `users/{uid}/guestbook/{id}` 실제 삭제 추가
  - handleChangeVisibility: Firestore `posts/{id}` visibility 필드 업데이트 추가
- [x] ~~useMarketplaceStore Firestore 타임스탬프 수정 (useMarketplaceStore.ts)~~ (2026.02.08 완료)
  - `new Date()` → `FirestoreTimestamp.now()` (서버 타임스탬프) 3곳 교체
  - createItem: createdAt/updatedAt, updateItem: updatedAt
- [x] ~~CreatePostScreen Firebase 연동 (CreatePostScreen.tsx)~~ (2026.02.08 완료)
  - handlePublish: Alert만 표시 → Firestore `posts` 컬렉션 실제 저장 구현
  - 이미지 업로드: firebaseStorage.uploadMultipleImages → URL 배열 저장
  - author/content/images/hashtags/location/visibility/likes/comments/status/createdAt 필드 저장
  - publishing 로딩 상태 + 게시 버튼 비활성화 추가
- [x] ~~골프장 리뷰 좋아요 Firestore 저장 (GolfCourseReviewScreen.tsx)~~ (2026.02.08 완료)
  - handleLike: 로컬 상태만 변경 → 낙관적 업데이트 + Firestore likes 필드 저장
  - 실패 시 UI 자동 롤백 처리
- [x] ~~TypeScript typecheck 0 에러 유지~~ (2026.02.08 완료)

### 2026.02.08 Cloud Functions 전체 감사 - 3개 근본 원인 수정 (16차 핫픽스)

- [x] ~~Cloud Functions 리전 미지정 수정 (firebaseFunctions.ts)~~ (2026.02.08 완료)
  - `functions().httpsCallable(name)` → `functions('asia-northeast3').httpsCallable(name)`
  - 모든 Cloud Functions 호출이 us-central1(기본값)로 전송되어 not_found 에러 발생하던 근본 원인 해결
- [x] ~~adjustPoints 사용자 문서 미존재 시 자동 생성 (functions/src/utils/points.ts)~~ (2026.02.08 완료)
  - 신규 사용자의 출석체크 시 user 문서가 없어 `HttpsError("not-found")` 발생하던 문제
  - Transaction 내에서 기본값(points: 0, stats: {})으로 자동 생성
- [x] ~~사용자 프로필 초기화 필드 보완 (authService.ts)~~ (2026.02.08 완료)
  - `createUserProfile()`에 points, pointBalance, role('GENERAL'), stats(5개 카운터) 초기값 추가
  - `set()` → `set({ merge: true })` 변경 (기존 데이터 보존)
- [x] ~~Firestore 규칙 부킹 참가자 수정 허용 (firestore.rules)~~ (2026.02.08 완료)
  - bookings update: 호스트만 수정 가능 → 로그인 사용자도 participants/status/updatedAt 필드 수정 가능
  - users update: points 필드를 role/pointBalance와 함께 서버 전용 보호 필드에 추가
- [x] ~~Cloud Functions 12개 재배포 + Firestore 규칙 배포 + 앱 재빌드~~ (2026.02.08 완료)

### 2026.02.08 가격제안/카카오맵/이미지압축/쿼리최적화/Lazy Loading/테스트 확장 (15차 배치)

- [x] ~~가격 제안 기능 구현~~ (2026.02.08 완료)
  - marketplaceAPI.ts: PriceOffer 인터페이스 + getOffers/acceptOffer/rejectOffer/getMyProductOffers 4개 함수
  - `src/screens/marketplace/OfferManagementScreen.tsx` 신규 생성 (판매자용 제안 관리 화면)
  - App.tsx MarketplaceStackNavigator에 OfferManagement 라우트 추가
  - acceptOffer: batch 처리 (수락 1건 + 나머지 거절 + 상품 RESERVED 상태)
- [x] ~~카카오맵 연동~~ (2026.02.08 완료)
  - PubDetailScreen: Google Maps URL → Alert 3개 옵션 (카카오맵/네이버맵/구글맵)
  - KakaoMapService.openNavigation 카카오맵, nmap:// 네이버맵, maps.google.com 구글맵
- [x] ~~이미지 캐싱 & 리사이징~~ (2026.02.08 완료)
  - imageUtils.ts: compressImage(maxWidth=1200, quality=0.7) + createThumbnail(size=200)
  - uploadImageToStorage: 업로드 전 자동 압축 적용
- [x] ~~Firestore 쿼리 최적화~~ (2026.02.08 완료)
  - marketplaceAPI.getProducts: cursor-based pagination (lastDoc 파라미터 + startAfter)
- [x] ~~앱 시작 속도 개선~~ (2026.02.08 완료)
  - React.lazy로 11개 화면 지연 로딩 (멤버십 8 + 친구그룹 3)
  - withSuspense HOC + LazyFallback 컴포넌트 생성
  - Tab.Navigator screenOptions에 lazy: true 적용
- [x] ~~통합 테스트 확장 (20 → 52개)~~ (2026.02.08 완료)
  - imageUtils.test.ts (9개): compressImage, createThumbnail, pickImageFromGallery, takePhoto, pickMultipleImages
  - tossPayments.test.ts (8개): generateOrderId, calculateRefundAmount, calculatePlatformFee
  - kakaoMap.test.ts (4개): calculateDistance, getKakaoMapLink, getShareLink
  - listOptimization.test.ts (7개): flatListOptimizedProps, chatListOptimizedProps, createGetItemLayout, defaultKeyExtractor
  - dateUtils.test.ts (2개): 모듈 존재 확인, export 함수 확인
- [x] ~~Functions 빌드 0 에러, TypeScript typecheck 0 에러, Jest 52/52 통과~~ (2026.02.08 완료)

### 2026.02.08 Deep Linking/Error Boundary/Validation/알림/결제내역 등 7개 기능 구현 (14차 배치)

- [x] ~~Deep Linking URL 설정~~ (2026.02.08 완료)
  - App.tsx에 `linking` config 추가: `golfpub://` + `https://golfpub.app` prefix
  - 7개 탭 전체 라우트 매핑 (Home, Bookings, Feed, Chat, Marketplace, GolfCourse, MyHome)
  - 파라미터 경로 지원: `bookings/:bookingId`, `feed/:postId`, `marketplace/:productId`, `golfcourse/:courseId`, `chat/:chatId`
- [x] ~~Error Boundary 컴포넌트 생성 + 적용~~ (2026.02.08 완료)
  - `src/components/common/ErrorBoundary.tsx` 신규 생성 (React class component)
  - getDerivedStateFromError + componentDidCatch로 크래시 캐치
  - 에러 화면 UI (재시작 버튼 포함), 프로젝트 테마 색상 적용
  - App.tsx NavigationContainer를 ErrorBoundary로 래핑
- [x] ~~Input Validation 5개 폼 연동~~ (2026.02.08 완료)
  - RegisterScreen: `validators.isValidNickname`, `isValidEmail`, `isValidPassword` 적용
  - LoginScreen: `validators.isValidEmail` 적용
  - EditProfileScreen: 복잡한 정규식 → `validators.isValidPhoneNumber`, `isValidNickname` 대체
  - CreateProductScreen: `validators.isValidAmount` 적용
  - CreateBookingScreen: `validators.isValidAmount` 적용
- [x] ~~console.log 2건 제거 + .env.example 정리~~ (2026.02.08 완료)
  - golfCourses.ts: console.log 2줄 제거 (모듈 로드 시 불필요 출력)
  - .env.example: TOSS_SECRET_KEY(클라이언트 불필요), WEATHER_*, CLOUDFLARE_*, API_BASE_URL, KAKAO_REDIRECT_URI 제거
- [x] ~~채팅 메시지 알림 Cloud Function 구현~~ (2026.02.08 완료)
  - `functions/src/functions/chat/sendChatNotification.ts` 신규 생성: FCM 푸시 + Firestore 기록
  - functions/src/index.ts에 export 추가
  - firebaseChat.ts: `firebaseMessaging.createNotification` (Firestore-only) → `callFunction('sendChatNotification')` (FCM 실제 푸시) 전환
- [x] ~~결제 내역 조회 화면 구현~~ (2026.02.08 완료)
  - `src/services/api/paymentAPI.ts` 신규 생성: getPaymentHistory, getPaymentDetail
  - `src/screens/profile/PaymentHistoryScreen.tsx` 신규 생성: FlatList, 상태 뱃지, 날짜/금액 포맷
  - App.tsx MyHomeStackNavigator에 PaymentHistory 라우트 추가
- [x] ~~Cloud Functions 12개 Firebase 배포 성공 (sendChatNotification 신규 1개 포함)~~ (2026.02.08 완료)
- [x] ~~Functions 빌드 0 에러, TypeScript typecheck 0 에러, Jest 20/20 통과~~ (2026.02.08 완료)

### 2026.02.08 알림/예약취소/공유/테스트 등 8개 기능 구현 (13차 배치)

- [x] ~~푸시 알림 딥링킹 완성~~ (2026.02.08 완료)
  - NotificationListScreen 전체 구현 (FlatList, 알림 타입별 아이콘 16종, 시간 포맷, 읽음/미읽음, 모두 읽기)
  - App.tsx에 FCM 초기화 (`firebaseMessaging.initialize`) + 미읽은 알림 수 구독
  - useNotificationStore: markAsRead Firestore 업데이트 연동, data 필드 추가
  - firebaseMessaging: 딥링크 3건 추가 (booking_cancelled, point_earned, coupon_issued)
  - navigationRef.ts 타입 에러 수정
- [x] ~~예약 취소/탈퇴 Cloud Functions 구현~~ (2026.02.08 완료)
  - `bookingCancel` CF: 호스트 검증 + 참가자 일괄 취소 + 알림 전송
  - `bookingWithdraw` CF: Transaction 기반 참가자 제거 + 정원 상태 롤백 + 호스트 알림
  - firebaseBooking.ts: cancelBooking/withdrawFromBooking → Cloud Function 호출로 전환
  - Firebase 배포 완료 (총 11개 함수)
- [x] ~~리뷰 시스템 버그 수정~~ (2026.02.08 완료)
  - pubAPI.ts: 리뷰 전체 삭제 시 rating 0 리셋 누락 수정 (golfCourseAPI는 이미 구현됨)
- [x] ~~카카오 메시지 공유 → React Native Share API 전환~~ (2026.02.08 완료)
  - kakaoMessage.ts 전면 재작성: 카카오 SDK share API (v5에서 제거됨) → `Share.share()` 네이티브 공유
  - shareBooking, shareProduct, inviteFriend, shareGolfCourse, shareCustomMessage, shareLink 6개 메서드
- [x] ~~FlatList 성능 최적화 유틸리티 생성~~ (2026.02.08 완료)
  - `src/utils/listOptimization.ts`: flatListOptimizedProps, chatListOptimizedProps, createGetItemLayout, defaultKeyExtractor
- [x] ~~CI/CD GitHub Actions 워크플로우 설정~~ (2026.02.08 완료)
  - `.github/workflows/ci.yml`: lint-and-typecheck, functions-build, test, android-build (EAS) 4개 Job
- [x] ~~Jest 테스트 프레임워크 설정 + 20개 테스트~~ (2026.02.08 완료)
  - jest.config.js (ts-jest, @/ 별칭), `__tests__/setup.ts` (Firebase/RN 전체 Mock)
  - formatters 8개 + validators 8개 + kakaoMessage 4개 = 20개 테스트 통과
- [x] ~~유틸리티 함수 실제 로직 구현~~ (2026.02.08 완료)
  - formatters.ts: formatPrice, formatNumber, formatDate, formatDateTime, formatPhoneNumber, formatRelativeTime, formatDistance
  - validators.ts: isValidEmail, isValidPhoneNumber, isValidPassword, isValidNickname, isValidAmount, isValidUrl, isValidReviewContent, isValidRating
- [x] ~~Functions 빌드 0 에러, TypeScript typecheck 0 에러, Jest 20/20 통과~~ (2026.02.08 완료)
- [x] ~~Cloud Functions 11개 Firebase 배포 성공 (bookingCancel, bookingWithdraw 신규 2개 포함)~~ (2026.02.08 완료)

### 2026.02.08 Cloud Functions 전체 구현 + 클라이언트 연동 (12차 배치)

- [x] ~~functions/ 프로젝트 초기화 (firebase-admin v12, firebase-functions v5, TypeScript)~~ (2026.02.08 완료)
- [x] ~~firebase.json functions 섹션 + emulators.functions(port 5001) 추가~~ (2026.02.08 완료)
- [x] ~~.firebaserc 생성 (project: golf-pub)~~ (2026.02.08 완료)
- [x] ~~서버 공통 유틸리티 4개 생성 (requireAuth, adjustPoints, sendPushNotification, errors)~~ (2026.02.08 완료)
- [x] ~~Cloud Functions 11개 구현~~ (2026.02.08 완료)
  - kakaoToken: 카카오 토큰 검증 → Firebase Custom Token 발급
  - attendanceCheckIn: 출석 체크 + 연속 보너스 포인트 (Transaction 기반)
  - pointsEarn/pointsDeduct: 포인트 적립/차감 (runTransaction 원자적 처리)
  - paymentConfirm/paymentCancel: Toss API 결제 확인/취소 (서버 사이드 검증)
  - bookingApprove/bookingReject: 참가 승인/거절 (호스트 검증 + Transaction + 알림)
  - couponIssue/couponRedeem: 쿠폰 발급(ADMIN)/사용 (유효성 검증)
  - sendNotification: 범용 알림 전송 (ADMIN)
- [x] ~~@react-native-firebase/functions 설치 + firebaseFunctions.ts 래퍼 생성~~ (2026.02.08 완료)
- [x] ~~useAuthStore 카카오 로그인: Anonymous Auth → kakaoToken Cloud Function + Custom Token~~ (2026.02.08 완료)
- [x] ~~firebaseAttendance markAttendance → attendanceCheckIn Cloud Function~~ (2026.02.08 완료)
- [x] ~~profileAPI earnPoints/spendPoints → pointsEarn/pointsDeduct Cloud Function~~ (2026.02.08 완료)
- [x] ~~tossPayments confirmPayment/cancelPayment → paymentConfirm/paymentCancel Cloud Function~~ (2026.02.08 완료)
- [x] ~~firebaseBooking approve/rejectBookingRequest → bookingApprove/bookingReject Cloud Function~~ (2026.02.08 완료)
- [x] ~~functions npm run build 0 에러, 클라이언트 typecheck 0 신규 에러~~ (2026.02.08 완료)
- [x] ~~Secret Manager API 활성화 + KAKAO_REST_API_KEY 시크릿 등록~~ (2026.02.08 완료)
- [x] ~~Cloud Functions 9개 Firebase 배포 성공 (asia-northeast3, 2nd Gen)~~ (2026.02.08 완료)
  - 배포 완료: kakaoToken, attendanceCheckIn, pointsEarn, pointsDeduct, bookingApprove, bookingReject, couponIssue, couponRedeem, sendNotification
  - 미배포: paymentConfirm, paymentCancel (TOSS_SECRET_KEY 실제 키 설정 후 활성화 예정)
  - 기존 1st Gen 함수 5개 삭제 (kakaoLogin, kakaoUnlink, onBookingJoinRequest, onUserCreate, onUserDelete)

### 2026.02.08 프로젝트 감사 8개 액션 아이템 전체 구현 + notifee→expo-notifications 전환 (11차 배치)

- [x] ~~ESLint/Prettier 설정 수정~~ (2026.02.08 완료)
  - `.prettierrc` endOfLine "auto" 추가 (Windows CRLF 호환)
  - `.eslintrc.js` 중복 `rules` 키 제거 + `import/no-unresolved` off
- [x] ~~크로스 탭 네비게이션 8건 수정~~ (2026.02.08 완료)
  - `navigation.navigate()` → cross-tab 패턴 `(navigation as any).navigate('TabName', { screen, params })` 전환
  - BookingDetailScreen, FeedScreen, PostDetailScreen, GolfCourseSearchScreen, GolfCourseDetailScreen, MarketplaceScreen, ProductDetailScreen, HomeScreen
- [x] ~~WriteReviewScreen 신규 생성~~ (2026.02.08 완료)
  - `src/screens/golfcourse/WriteReviewScreen.tsx` 생성
  - 별점 입력, 텍스트 리뷰, 이미지 업로드 (expo-image-picker), Firestore 저장
  - AuthNavigator에 라우트 등록
- [x] ~~console.log 제거 + 미사용 import 정리~~ (2026.02.08 완료)
  - 전체 src/ 디렉토리 스캔, 미사용 변수/import 제거
  - ESLint 에러 0개 달성
- [x] ~~MyHomeScreen Mock→Firestore 전환~~ (2026.02.08 완료)
  - Mock 데이터 생성기 제거 → Firestore `posts`, `users/{uid}/guestbook` 쿼리
  - 커서 기반 페이지네이션 (`startAfter`) 구현
  - ContentItem.id / GuestbookItem.id 타입 number→string
- [x] ~~"개발 예정" Alert 15건 실구현~~ (2026.02.08 완료)
  - 이미지 업로드: expo-image-picker + Firebase Storage 연동
  - 외부 링크: Kakao/Naver/Google Maps `Linking.openURL` 연결
  - 신고/차단: Firestore `reports`, `blocks` 컬렉션 CRUD
  - 네비게이션: 실제 화면으로 이동 (WriteReview, EditProfile 등)
- [x] ~~Toss Payments 결제 서비스 구현~~ (2026.02.08 완료)
  - `tossPayments.ts`: requestPayment, confirmPayment, cancelPayment (시뮬레이션 모드)
  - 환불 정책: 2일 전 100%, 1일 전 50%, 당일 0%
  - 플랫폼 수수료 5% 계산
  - PaymentScreen + MembershipPaymentScreen 연동
- [x] ~~subscriptionService 멤버십 구독 관리 구현~~ (2026.02.08 완료)
  - getSubscription, subscribe, cancelSubscription, changePlan, checkExpiration
  - Firestore `users/{userId}` membership 필드 관리
- [x] ~~@notifee/react-native 제거 → expo-notifications 전환~~ (2026.02.08 완료)
  - @notifee/react-native 패키지 제거 (Expo managed workflow 비호환)
  - expo-notifications 설치 및 연동
  - setBadgeCount → Notifications.setBadgeCountAsync
  - createChannel → Notifications.setNotificationChannelAsync
  - displayNotification → Notifications.scheduleNotificationAsync
  - app.json plugins에서 @notifee/react-native 항목 제거
- [x] ~~FCM 알림 전송 연동~~ (2026.02.08 완료)
  - firebaseBooking.ts: 부킹 참여 시 호스트에게 알림, 취소 시 참가자에게 알림
  - firebaseFriends.ts: 친구 요청 시 대상 사용자에게 알림
- [x] ~~Firestore 인덱스 Firebase 배포~~ (2026.02.08 완료)
  - `firebase deploy --only firestore:indexes` 실행
  - bookings(status+createdAt), posts(status+createdAt), chatRooms(participantIds+updatedAt) 등 15개 인덱스 활성화
- [x] ~~Android dev client 빌드 + 디바이스 테스트~~ (2026.02.08 완료)
  - `expo run:android` 네이티브 빌드 성공 (Firebase 모듈 포함)
  - SM_S901N 디바이스 설치 및 정상 실행 확인
  - TypeScript 0 에러, ESLint 0 에러

### 2026.02.07 Firebase 전체 배포 + Permission 에러 수정 + 코드베이스 감사 (10차 배치)

- [x] ~~Firestore permission-denied 에러 2건 수정~~ (2026.02.07 완료)
  - 출석 확인 실패: `allow read: if isOwner(resource.data.userId)` → `allow read: if isSignedIn()` (문서 미존재 시 resource null 대응)
  - 부킹 로드 실패: HomeScreen `loadData()` 호출을 `if (user?.uid)` 블록 내부로 이동
  - 카카오 로그인: 가짜 user 객체 → `auth().signInAnonymously()` 실제 Firebase Auth 세션 생성
- [x] ~~Firebase Console Anonymous Auth 활성화~~ (2026.02.07 완료)
- [x] ~~Realtime Database 보안 규칙 생성 및 배포 (database.rules.json)~~ (2026.02.07 완료)
  - chatRooms, messages, typing, presence, readReceipts 규칙 설정
- [x] ~~Storage 보안 규칙 배포 (storage.rules)~~ (2026.02.07 완료)
- [x] ~~Firestore 복합 인덱스 누락분 추가 및 배포~~ (2026.02.07 완료)
  - 기존 5개 + 신규 12개 = 총 17개 인덱스
  - posts: status+createdAt, author.id+createdAt (Feed 화면 에러 수정)
  - bookings: status+createdAt, participants.list+date
  - products: sellerId+createdAt
  - chatRooms: participantIds+updatedAt
  - friendRequests: toUserId+status+createdAt, fromUserId+status+createdAt
  - attendance: userId+date
  - pubs: rating+reviewCount
  - friendships: userId1+userId2+status
  - notifications: isRead+createdAt (COLLECTION_GROUP)
- [x] ~~firebase.json에 database 설정 추가~~ (2026.02.07 완료)
- [x] ~~firebase deploy 한 번에 전체 배포 (firestore:rules, firestore:indexes, storage, database)~~ (2026.02.07 완료)
- [x] ~~Gradle JVM 메모리 2048m → 4096m 증가 (Android 빌드 OOM 방지)~~ (2026.02.07 완료)
- [x] ~~오래된 typescript-errors.txt 삭제 (현재 tsc 에러 0개)~~ (2026.02.07 완료)
- [x] ~~전체 코드베이스 감사 (4개 병렬 에이전트)~~ (2026.02.07 완료)
  - Firebase 설정 감사: 서비스 7개 구현 완료, Realtime DB 규칙 누락 발견 → 수정
  - 서드파티 서비스 감사: Toss Payments/Spotify 스텁, 카카오 메시지 스텁 확인
  - 빌드 설정 감사: JVM OOM, iOS Podfile 미존재 확인
  - 코드 완성도 감사: TODO 31개, console.log 위반 2개, musicAPI 빈 스텁 확인

### 2026.02.07 Firestore 보안 규칙 + Seed 데이터 + 경로 정리 (9차 배치)

- [x] ~~firestore.rules 코드-규칙 불일치 7곳 수정~~ (2026.02.07 완료)
  - marketplace → products (컬렉션명 변경)
  - booking_participants → bookingParticipants (camelCase)
  - point_history → pointHistory (camelCase)
  - notifications → users/{uid}/notifications (서브컬렉션)
  - comments → posts/{postId}/comments (서브컬렉션)
  - posts: authorId → author.id (필드 구조)
  - friends: fromUserId/toUserId 제한 → isSignedIn() 완화 (양방향 문서 생성)
- [x] ~~누락 컬렉션 규칙 12개 추가~~ (2026.02.07 완료)
  - chatRooms + messages 서브컬렉션
  - friendRequests, product_likes, pubs, pub_reviews, golf_course_reviews
  - bookings/{id}/applications 서브컬렉션
  - users/{uid}/pointHistory, points, coupons, reviews 서브컬렉션
- [x] ~~Firebase 규칙 배포 (firebase deploy --only firestore:rules)~~ (2026.02.07 완료)
- [x] ~~Seed 데이터 유틸리티 생성 (src/utils/seedData.ts)~~ (2026.02.07 완료)
  - bookings 3건 (OPEN 2건 + COMPLETED 1건)
  - posts 3건 (라운딩 후기, 장비 추천, 스코어)
  - products 3건 (드라이버, 골프공, 캐디백)
  - 중복 방지 (seedId 체크), 삭제 함수 포함
- [x] ~~상대 경로 → @/ 변환 (17파일, 23곳) - 전체 코드베이스 상대 경로 0건 달성~~ (2026.02.07 완료)
  - components/booking: BookingFilter, BookingFilterComponent, BookingListItem, ParticipantAvatar
  - components/membership: ComparisonTable, MembershipBadge, PlanCard
  - constants: membershipPlans
  - services/api: bookingAPI, friendAPI, marketplaceAPI, profileAPI
  - store: useAuthStore, useBookingStore, useFriendStore, useProfileStore
  - utils: permissions
- [x] ~~TypeScript typecheck 0 에러 유지~~ (2026.02.07 완료)

### 2026.02.07 채팅/골프장/피드 Mock→Firestore 전환 (7차 배치)

- [x] ~~ChatListScreen - Mock 3건 + 로컬 Chat 인터페이스 제거 → useChatStore.loadChatRooms 연결~~ (2026.02.07 완료)
- [x] ~~ChatRoomScreen - Mock 4건 + 로컬 Message 인터페이스 제거 → useChatStore.listenToMessages 실시간 연결~~ (2026.02.07 완료)
- [x] ~~GolfCourseDetailScreen - mockReviews 2건 제거 → golfCourseAPI.getGolfCourseReviews 연결, 상대경로 3개 수정~~ (2026.02.07 완료)
- [x] ~~GolfCourseReviewScreen - mockReviews 3건 제거 → golfCourseAPI 조회/작성 연결, 상대경로 2개 수정~~ (2026.02.07 완료)
- [x] ~~PostDetailScreen - mockPost+mockComments 제거 → useFeedStore.getPostById/getPostComments 연결, console.log 제거, 상대경로 2개 수정~~ (2026.02.07 완료)
- [x] ~~golfCourseAPI.ts 신규 생성 (getGolfCourseReviews, createGolfCourseReview)~~ (2026.02.07 완료)
- [x] ~~useFeedStore.ts - getPostById, getPostComments 액션 추가~~ (2026.02.07 완료)
- [x] ~~golfcourse-types.ts - GolfCourseReview.id/courseId 타입 number → number|string~~ (2026.02.07 완료)
- [x] ~~useChatStore.ts - 상대 경로 → @/ 수정~~ (2026.02.07 완료)
- [x] ~~5개 화면 로딩/빈 상태 UI 추가~~ (2026.02.07 완료)

### 2026.02.07 펍 화면 Mock→Firestore 전환 (6차 배치)

- [x] ~~BestPubsScreen - MOCK_PUBS 3건 + 로컬 Pub 인터페이스 제거 → pubAPI.getPopularPubs 연결~~ (2026.02.07 완료)
- [x] ~~PubDetailScreen - MOCK_PUB 객체 제거 → pubAPI.getPubById 연결, prop→hook 전환 (useNavigation/useRoute)~~ (2026.02.07 완료)
- [x] ~~PubReviewsScreen - MOCK_REVIEWS 3건 + 로컬 Review 인터페이스 제거 → pubAPI.getPubReviews 연결, prop→hook 전환~~ (2026.02.07 완료)
- [x] ~~pubAPI.ts - console.log 8개 제거 (getPubs/getPubById/getPopularPubs/getPubReviews/createPubReview/updatePubRating/getNearbyPubs)~~ (2026.02.07 완료)
- [x] ~~3개 화면 Mock 필드 → Pub/PubReview 타입 매핑 (image→images[0], tags→features, hours→openTime-closeTime, userAvatar→userImage, content→comment, date→createdAt)~~ (2026.02.07 완료)
- [x] ~~3개 화면 로딩/빈 상태 UI + Pull-to-refresh 추가~~ (2026.02.07 완료)

### 2026.02.07 친구 관리 Mock→Firestore 전환 (4차 배치)

- [x] ~~FriendsScreen - mockFriends 5건 제거 → getFriendsList + getPendingRequests 연결, console.log 제거, 통계 실제 데이터 연결~~ (2026.02.07 완료)
- [x] ~~FriendRequestsScreen - mockReceivedRequests 3건 + mockSentRequests 2건 제거 → getPendingRequests/getSentRequests/acceptFriendRequest/rejectFriendRequest/cancelFriendRequest 연결~~ (2026.02.07 완료)
- [x] ~~FriendProfileScreen - mockFriendProfile 제거 → route params friendId로 getFriendProfile 조회, removeFriend 실제 API 연결~~ (2026.02.07 완료)
- [x] ~~AddFriendScreen - mockSuggestions 3건 + mockSearchResults 2건 제거 → getSuggestedFriends 연결, Mock fallback 제거~~ (2026.02.07 완료)
- [x] ~~firebaseFriends.ts - getSentRequests, cancelFriendRequest, getFriendProfile, getSuggestedFriends 4개 함수 추가~~ (2026.02.07 완료)
- [x] ~~4개 화면 상대 경로(../../) → @/ 경로 별칭 변경~~ (2026.02.07 완료)
- [x] ~~4개 화면 로딩/빈 상태 UI + Pull-to-refresh 추가~~ (2026.02.07 완료)

### 2026.02.07 내 정보/프로필 Mock→Firestore 전환 (3차 배치)

- [x] ~~HostedMeetupsScreen - Mock 3건 제거 → getMyHostedBookings + cancelBooking 연결, console.log 3곳 제거~~ (2026.02.07 완료)
- [x] ~~JoinedMeetupsScreen - Mock 4건 제거 → getMyJoinedBookings 연결~~ (2026.02.07 완료)
- [x] ~~MyPostsScreen - Mock 3건 제거 → useFeedStore.loadMyPosts 신규 함수 연결, setTimeout 제거~~ (2026.02.07 완료)
- [x] ~~MyReviewsScreen - Mock 3건 제거 → profileAPI.getMyReviews 신규 함수 연결, setTimeout 제거~~ (2026.02.07 완료)
- [x] ~~PointHistoryScreen - Mock 8건 + 하드코딩 totalPoints 제거 → profileAPI.getPointHistory 연결, user.pointBalance 사용~~ (2026.02.07 완료)
- [x] ~~CouponsScreen - Mock 5건 제거 → profileAPI.getCoupons 연결, Coupon 타입 사용, isUsed/expiryDate 기반 상태 판별~~ (2026.02.07 완료)
- [x] ~~ProfileScreen - 하드코딩 통계(24, 4.8★) 제거 → useProfileStore.loadProfile 연결, setTimeout 제거~~ (2026.02.07 완료)
- [x] ~~useFeedStore.ts - loadMyPosts(userId) 함수 추가 (posts 컬렉션 author.id 쿼리)~~ (2026.02.07 완료)
- [x] ~~profileAPI.ts - getMyReviews() 함수 추가 (users/{uid}/reviews 서브컬렉션 조회)~~ (2026.02.07 완료)
- [x] ~~7개 화면 상대 경로(../../) → @/ 경로 별칭 변경~~ (2026.02.07 완료)
- [x] ~~7개 화면 로딩/빈 상태 UI + Pull-to-refresh 추가~~ (2026.02.07 완료)

### 2026.02.07 예약 상세 보완 + 중고마켓 완성

- [x] ~~BookingDetailScreen - Mock booking/host 객체 제거 → useBookingStore.getBooking 연결~~ (2026.02.07 완료)
- [x] ~~BookingDetailScreen - bookingId 타입 number→string 변경, joinBooking 실제 호출~~ (2026.02.07 완료)
- [x] ~~firebaseBooking.ts - getBookingRequests/approveBookingRequest/rejectBookingRequest 3개 함수 추가~~ (2026.02.07 완료)
- [x] ~~BookingRequestsScreen - MOCK_REQUESTS 제거 → firebaseBooking 실제 API 연결~~ (2026.02.07 완료)
- [x] ~~ProductDetailScreen - mockProduct 제거 → marketplaceAPI.getProductById 연결~~ (2026.02.07 완료)
- [x] ~~ProductDetailScreen - 조회수 증가(increaseViewCount), 찜하기/취소(likeProduct/unlikeProduct) 연결~~ (2026.02.07 완료)
- [x] ~~CreateProductScreen - console.log 제거 → marketplaceAPI.createProduct 실제 호출~~ (2026.02.07 완료)
- [x] ~~MyProductsScreen - mockMyProducts 제거 → marketplaceAPI.getMyProducts/deleteProduct/updateProductStatus 연결~~ (2026.02.07 완료)
- [x] ~~5개 화면 상대 경로(../../) → @/ 경로 별칭 변경~~ (2026.02.07 완료)
- [x] ~~5개 화면 로딩/에러/빈 상태 UI 추가~~ (2026.02.07 완료)

---

## 🔨 개발해야 할 부분 (미완료)

### 🔴 우선순위 높음 (P0 - 필수)

- [ ] **결제 시스템 연동** - Toss Payments 실제 결제 플로우 구현
  - [x] ~~멤버십 결제 → 시뮬레이션 모드 구현 (tossPayments + subscriptionService)~~ (2026.02.08 완료)
  - [x] ~~예약 참가비 결제 → 시뮬레이션 모드 구현~~ (2026.02.08 완료)
  - [x] ~~결제 성공/실패 처리~~ (2026.02.08 완료)
  - [x] ~~결제 확인/취소 Cloud Functions 구현 (Toss API 서버 사이드 검증)~~ (2026.02.08 완료)
  - [x] ~~결제 내역 조회~~ (2026.02.08 완료)
  - [ ] Toss Payments SDK 클라이언트 위젯 연동 (@tosspayments/widget-sdk-react-native)

- [ ] **Mock 데이터 → 실제 API 교체**
  - [x] ~~BookingListScreen - Mock 예약 데이터 제거 → Firestore 연동~~ (2026.02.07 완료)
  - [x] ~~MarketplaceScreen - Mock 상품 데이터 제거 → Firestore 연동~~ (2026.02.07 완료)
  - [x] ~~FeedScreen - Mock 스토리/게시글 제거 → Firestore 연동~~ (2026.02.07 완료)
  - [x] ~~HomeScreen - Mock 데이터 정리 (알림뱃지, 멤버십배너)~~ (2026.02.07 완료)
  - [x] ~~BookingDetailScreen - Mock 제거 → useBookingStore 연결~~ (2026.02.07 완료)
  - [x] ~~BookingRequestsScreen - Mock 제거 → firebaseBooking 연결~~ (2026.02.07 완료)
  - [x] ~~ProductDetailScreen - Mock 제거 → marketplaceAPI 연결~~ (2026.02.07 완료)
  - [x] ~~CreateProductScreen - 실제 등록 API 연결~~ (2026.02.07 완료)
  - [x] ~~MyProductsScreen - Mock 제거 → marketplaceAPI 연결~~ (2026.02.07 완료)
  - [x] ~~HostedMeetupsScreen - Mock 제거 → firebaseBooking 연결~~ (2026.02.07 완료)
  - [x] ~~JoinedMeetupsScreen - Mock 제거 → firebaseBooking 연결~~ (2026.02.07 완료)
  - [x] ~~MyPostsScreen - Mock 제거 → useFeedStore.loadMyPosts 연결~~ (2026.02.07 완료)
  - [x] ~~MyReviewsScreen - Mock 제거 → profileAPI.getMyReviews 연결~~ (2026.02.07 완료)
  - [x] ~~PointHistoryScreen - Mock 제거 → profileAPI.getPointHistory 연결~~ (2026.02.07 완료)
  - [x] ~~CouponsScreen - Mock 제거 → profileAPI.getCoupons 연결~~ (2026.02.07 완료)
  - [x] ~~ProfileScreen - 하드코딩 제거 → useProfileStore.loadProfile 연결~~ (2026.02.07 완료)
  - [x] ~~FriendsScreen - mockFriends 제거 → getFriendsList 연결~~ (2026.02.07 완료)
  - [x] ~~FriendRequestsScreen - Mock 제거 → Firebase accept/reject/cancel 연결~~ (2026.02.07 완료)
  - [x] ~~FriendProfileScreen - Mock 제거 → getFriendProfile 연결~~ (2026.02.07 완료)
  - [x] ~~AddFriendScreen - Mock 제거 → getSuggestedFriends 연결, fallback 제거~~ (2026.02.07 완료)
  - [x] ~~ApplicantProfileScreen - Mock 제거 → getApplicantProfile + approve/reject 연결~~ (2026.02.07 완료)
  - [x] ~~PaymentScreen - 하드코딩 제거 → getBookingDetail 연결, console.log/setTimeout 제거~~ (2026.02.07 완료)
  - [x] ~~PopularBookingsScreen - Mock 제거 → getPopularBookings 연결~~ (2026.02.07 완료)
  - [x] ~~RecommendedBookingsScreen - Mock 제거 → getRecommendedBookings 연결~~ (2026.02.07 완료)
  - [x] ~~RequestStatusScreen - Mock 제거 → getRequestStatus 연결~~ (2026.02.07 완료)
  - [x] ~~BestPubsScreen - Mock 제거 → pubAPI.getPopularPubs 연결~~ (2026.02.07 완료)
  - [x] ~~PubDetailScreen - Mock 제거 → pubAPI.getPubById 연결~~ (2026.02.07 완료)
  - [x] ~~PubReviewsScreen - Mock 제거 → pubAPI.getPubReviews 연결~~ (2026.02.07 완료)
  - [x] ~~ChatListScreen - Mock 제거 → useChatStore.loadChatRooms 연결~~ (2026.02.07 완료)
  - [x] ~~ChatRoomScreen - Mock 제거 → useChatStore.listenToMessages 연결~~ (2026.02.07 완료)
  - [x] ~~GolfCourseDetailScreen - Mock 리뷰 제거 → golfCourseAPI 연결~~ (2026.02.07 완료)
  - [x] ~~GolfCourseReviewScreen - Mock 리뷰 제거 → golfCourseAPI 조회/작성 연결~~ (2026.02.07 완료)
  - [x] ~~PostDetailScreen - Mock 게시글+댓글 제거 → useFeedStore 연결~~ (2026.02.07 완료)

- [ ] **푸시 알림 완성** - Firebase Cloud Messaging
  - [x] ~~FCM 토큰 등록 & 서버 전송~~ (2026.02.08 완료)
  - [x] ~~알림 수신 처리 (포그라운드/백그라운드) → expo-notifications 연동~~ (2026.02.08 완료)
  - [x] ~~알림 클릭 시 딥링킹~~ (2026.02.08 완료)
  - [x] ~~알림 뱃지 업데이트 → Notifications.setBadgeCountAsync~~ (2026.02.08 완료)
  - [x] ~~알림 종류별 처리 (예약 참여/취소, 친구 요청)~~ (2026.02.08 완료)
  - [x] ~~채팅 메시지 알림 전송~~ (2026.02.08 완료)

### 🟡 우선순위 중간 (P1 - 중요)

- [x] ~~**예약 상세 기능 보완**~~ (2026.02.08 완료)
  - [x] ~~BookingDetailScreen - Mock 제거 → useBookingStore.getBooking 연결~~ (2026.02.07 완료)
  - [x] ~~BookingRequestsScreen - Mock 제거 → firebaseBooking 실제 API 연결~~ (2026.02.07 완료)
  - [x] ~~예약 취소/환불 프로세스~~ (2026.02.08 완료)
  - [x] ~~예약 상태 변경 알림~~ (2026.02.08 완료)

- [x] ~~**리뷰 시스템 완성**~~ (2026.02.08 완료)
  - [x] ~~골프장 리뷰 작성 → Firestore 저장 (golfCourseAPI.createGolfCourseReview)~~ (2026.02.07 완료)
  - [x] ~~골프장 리뷰 조회 → Firestore 연동 (golfCourseAPI.getGolfCourseReviews)~~ (2026.02.07 완료)
  - [x] ~~펍 리뷰 작성 → Firestore 저장 (pubAPI.createPubReview)~~ (2026.02.07 완료)
  - [x] ~~리뷰 별점 집계 & 표시~~ (2026.02.08 완료)
  - [x] ~~리뷰 수정/삭제~~ (2026.02.08 완료)

- [ ] **중고마켓 기능 완성**
  - [x] ~~ProductDetailScreen - Mock 제거 → marketplaceAPI 연결 (조회수, 찜, 상세조회)~~ (2026.02.07 완료)
  - [x] ~~CreateProductScreen - console.log 제거 → marketplaceAPI.createProduct 연결~~ (2026.02.07 완료)
  - [x] ~~MyProductsScreen - Mock 제거 → marketplaceAPI 연결 (삭제, 상태변경)~~ (2026.02.07 완료)
  - [x] ~~이미지 업로드 → Firebase Storage 연동 (expo-image-picker + firebaseStorage)~~ (2026.02.08 완료)
  - [x] ~~판매자-구매자 채팅 연결~~ (2026.02.08 완료)
  - [x] ~~가격 제안 기능~~ (2026.02.08 완료)

- [ ] **포인트 & 쿠폰 시스템**
  - [x] ~~포인트 적립/사용 로직 → Cloud Functions (Transaction 기반 원자적 처리)~~ (2026.02.08 완료)
  - [x] ~~쿠폰 발급/사용 로직 → Cloud Functions (ADMIN 발급, 유효성 검증 사용)~~ (2026.02.08 완료)
  - [x] ~~포인트/쿠폰 내역 Firestore 연동~~ (2026.02.07 완료)
  - [x] ~~출석 체크 포인트 → Cloud Functions (중복 방지 + 연속 보너스)~~ (2026.02.08 완료)

### 🟢 우선순위 낮음 (P2 - 개선)

- [ ] **음악/Spotify 연동**
  - [ ] Spotify API 연동
  - [ ] 음악 플레이리스트 기능
  - [ ] 음악 선물하기 기능 (GiftMusicModal)

- [ ] **골프장 추천 시스템**
  - [ ] 위치 기반 골프장 추천
  - [ ] 날씨 연계 추천 알고리즘
  - [ ] 사용자 선호도 기반 추천

- [ ] **카카오 연동 확장**
  - [x] ~~카카오맵 연동 (골프장/펍 위치)~~ (2026.02.08 완료)
  - [x] ~~카카오 메시지 공유 (모임 초대) → React Native Share API로 전환~~ (2026.02.08 완료)

- [x] ~~**성능 최적화**~~ (2026.02.08 완료)
  - [x] ~~이미지 캐싱 & 리사이징~~ (2026.02.08 완료)
  - [x] ~~Firestore 쿼리 최적화~~ (2026.02.08 완료)
  - [x] ~~리스트 가상화 (FlatList 최적화) → listOptimization.ts~~ (2026.02.08 완료)
  - [x] ~~앱 시작 속도 개선~~ (2026.02.08 완료)

### 🔵 배포 준비 (P3)

- [ ] **에러 추적 & 분석**
  - [ ] Sentry 에러 추적 연동
  - [ ] Firebase Analytics 이벤트 추적
  - [ ] 사용자 행동 분석

- [ ] **테스트**
  - [x] ~~단위 테스트 작성 (formatters, validators, kakaoMessage - 20개)~~ (2026.02.08 완료)
  - [x] ~~통합 테스트 확장 (imageUtils, tossPayments, kakaoMap, listOptimization, dateUtils - 52개)~~ (2026.02.08 완료)
  - [ ] E2E 테스트 (주요 사용자 시나리오)

- [x] ~~**CI/CD 파이프라인**~~ (2026.02.08 완료)
  - [x] ~~GitHub Actions 설정~~ (2026.02.08 완료)
  - [x] ~~자동 빌드 (Android EAS Build)~~ (2026.02.08 완료)
  - [x] ~~코드 품질 검사 (ESLint, TypeScript)~~ (2026.02.08 완료)
  - [x] ~~테스트 자동 실행~~ (2026.02.08 완료)

- [ ] **앱 스토어 배포**
  - [ ] Android - Google Play Store 등록
  - [ ] iOS - App Store 등록
  - [ ] 앱 아이콘 & 스플래시 스크린 최종화
  - [ ] 스토어 스크린샷 & 설명 준비

---

## 📊 진행률 요약

| 카테고리 | 전체 | 완료 | 미완료 | 진행률 |
|----------|------|------|--------|--------|
| 인증 & 프로필 | 6 | 6 | 0 | 100% |
| 네비게이션 & UI | 8 | 8 | 0 | 100% |
| 채팅 | 5 | 5 | 0 | 100% |
| 예약/모임 | 10 | 10 | 0 | 100% |
| 피드/소셜 | 5 | 5 | 0 | 100% |
| 친구 관리 | 5 | 5 | 0 | 100% |
| 중고마켓 | 10 | 10 | 0 | 100% |
| 골프장/펍 | 8 | 8 | 0 | 100% |
| 멤버십/결제 | 9 | 9 | 0 | 100% |
| 알림 | 6 | 6 | 0 | 100% |
| 포인트/쿠폰 | 5 | 5 | 0 | 100% |
| 내 정보/프로필 화면 | 7 | 7 | 0 | 100% |
| 리뷰 시스템 | 5 | 5 | 0 | 100% |
| 음악 | 4 | 0 | 4 | 0% |
| 테스트/배포 | 10 | 6 | 4 | 60% |
| 코드 품질 | 4 | 4 | 0 | 100% |
| 친구 Mock→API 전환 | 4 | 4 | 0 | 100% |
| 예약 Mock→API 전환 (5차) | 5 | 5 | 0 | 100% |
| 펍 Mock→API 전환 (6차) | 3 | 3 | 0 | 100% |
| 채팅/골프장/피드 Mock→API (7차) | 5 | 5 | 0 | 100% |
| 코드 품질 정리 (8차) | 3 | 3 | 0 | 100% |
| Firestore 규칙 + Seed + 경로 (9차) | 5 | 5 | 0 | 100% |
| Firebase 배포 + 감사 (10차) | 10 | 10 | 0 | 100% |
| 감사 액션 아이템 + 알림 (11차) | 12 | 12 | 0 | 100% |
| Cloud Functions + 연동 + 배포 (12차) | 16 | 16 | 0 | 100% |
| 알림/예약취소/공유/테스트 (13차) | 10 | 10 | 0 | 100% |
| Deep Linking/ErrorBoundary/Validation (14차) | 8 | 8 | 0 | 100% |
| 가격제안/카카오맵/이미지압축/최적화/테스트 (15차) | 7 | 7 | 0 | 100% |
| Cloud Functions 전체 감사 핫픽스 (16차) | 5 | 5 | 0 | 100% |
| CRITICAL 감사 이슈 수정 (17차) | 7 | 7 | 0 | 100% |
| Storage 규칙 핫픽스 (18차) | 5 | 5 | 0 | 100% |
| 채팅 전송/읽음 핫픽스 (19차) | 5 | 5 | 0 | 100% |
| 전체 코드베이스 감사 일괄 수정 (20차) | 9 | 9 | 0 | 100% |
| Cloud Functions 클라이언트 전환 완료 (21차) | 3 | 3 | 0 | 100% |
| My 홈피 다이어리 & 방명록 구현 (22차) | 6 | 6 | 0 | 100% |
| 전체 앱 감사 일괄 수정 (23차) | 11 | 11 | 0 | 100% |
| 프로필 권한 수정 + My홈피 UI 최적화 (24차) | 6 | 6 | 0 | 100% |
| **전체** | **252** | **249** | **3** | **99%** |

---

## 📝 일일 개발 기록

### 2026.02.09

> **프로필 좋아요 Firestore 연동 26차 배치 (4개 파일, +137/-12줄)**
> - useProfileStore.ts: `likeCount` 필드 추가, `toggleProfileLike`/`checkProfileLiked` 액션 구현 (트랜잭션 기반, marketplace 패턴 재사용)
> - MyHomeScreen.tsx: `useState(42)` → Firestore `profile.likeCount` 동기화, 낙관적 UI + 롤백
> - ProfileScreen.tsx: 동일 패턴 적용, 타인 프로필 좋아요 토글 지원
> - firestore.rules: `profileLikes` 컬렉션 규칙 추가, `users` likeCount 예외 허용
> - 최종: **TypeScript 0 에러, ESLint 0 에러** (544 warnings - 기존 any 타입)

> **My홈피 프로필 인터랙티브 기능 + 전체 lint 정리 25차 배치 (10개 파일)**
> - useProfileStore.ts: `FavoriteCourse` 인터페이스 추가, `favoriteCourses` string[]→FavoriteCourse[] 전환, roundingStyles/golfExperience/monthlyRounds/overseasGolf 필드 추가
> - MyHomeScreen.tsx: 골프 스탯 터치 편집 모달, 골프장 추가/롱프레스 삭제, 라운딩 스타일 12개 옵션 토글 선택 → Firestore CRUD 연동 (3개 모달, 7개 핸들러, 10개 state, ~15개 스타일 추가)
> - ProfileScreen.tsx: FavoriteCourse 객체 타입 호환성 수정
> - feed-types.ts + useFeedStore.ts: FeedPost에 images 필드 추가, 다중 이미지 매핑 처리
> - firestore.indexes.json: bookings 복합 인덱스 (participants.members + createdAt)
> - 전체 ESLint --fix 적용: prettier 384개 에러 자동 수정 + 미사용 import 4건 수동 제거
> - 최종: **TypeScript 0 에러, ESLint 0 에러** (532 warnings - 기존 any 타입)

> **프로필 사진 권한 수정 + My홈피 프로필 UI 최적화 24차 배치 (4개 파일)**
> - app.json: expo-image-picker 플러그인 추가 (빌드 시 네이티브 권한 자동 설정)
> - imageUtils.ts: 커스텀 권한 함수(devicePermissions) 제거 → expo 내장 `requestMediaLibraryPermissionsAsync`/`requestCameraPermissionsAsync` 사용, 동적 require → 정적 import, 권한 거부 시 "설정으로 이동" Alert 추가
> - MyHomeScreen.tsx: 프로필 헤더 리디자인 - 배경 160px + 흰색 카드 오프셋(-50px) + 프로필사진 90px 오프셋 + "프로필 수정" 버튼 + 방문자카운터/통계 카드 내부 통합
> - 전화번호 비공개: UI + API 이중 보호 확인, 추가 조치 불필요
> - imageUtils.test.ts: expo 내장 권한 mock으로 업데이트

> **전체 앱 감사 기반 일괄 수정 23차 배치 (35개 파일, +481/-263줄)**
> - 법적 문서: 홍길동→김강우, 연락처 통일 (support@golfpub.kr), 업데이트 날짜 수정
> - Firestore 규칙: pubs/golfCourses 평점 필드만 수정 허용, applications/bookingParticipants 주최자 권한 추가
> - DEFAULT_AVATAR/DEFAULT_PUB_IMAGE 상수 생성, 17개 파일 하드코딩 pravatar URL 교체
> - Modal onRequestClose 2건, SettingsScreen 버전동기화/에러메시지/저작권, FeedScreen RefreshControl
> - SafeAreaView 8개 화면 추가, 경합 조건 3건 트랜잭션 수정, 스텁 3개 개선, 빈 유틸 2개 삭제

> **My 홈피 다이어리 & 방명록 기능 구현 22차 배치 (2개 파일, +213/-42줄)**
> - MyHomeScreen 사진첩 탭 제거 → 3탭 구조(전체/다이어리/방명록)로 변경. 다이어리가 글+이미지+위치 통합하여 사진첩 역할 겸함
> - FAB 플로팅 액션 버튼 추가: all/diary 탭에서는 CreatePost(type='diary')로 이동, guestbook 탭에서는 방명록 작성 모달 오픈
> - 방명록 작성 바텀시트 모달 구현: TextInput(200자), KeyboardAvoidingView, Firestore `users/{uid}/guestbook/` 저장, 등록 후 리스트 자동 갱신
> - 기존 "개발 예정" Alert 방명록 버튼 제거 → FAB로 대체
> - CreatePostScreen: `useRoute()`로 type 파라미터 수신, Firestore 게시물에 `type` 필드 추가
> - TypeScript typecheck 0 에러 유지

### 2026.02.08

> **Cloud Functions 클라이언트 전환 완료 21차 배치 (2개 파일, +20/-87줄)**
> - 서버 Cloud Functions 15개 전체 구현 확인 (빌드 0 에러): kakaoToken, attendanceCheckIn, pointsEarn/Deduct, paymentConfirm/Cancel, bookingApprove/Reject/Cancel/Withdraw, couponIssue/Redeem, sendChatNotification, sendNotification
> - profileAPI.issueCoupon: 직접 Firestore 쓰기 → `couponIssue` CF 호출 (ADMIN 서버 검증, 알림 전송 포함)
> - profileAPI.useCoupon: 직접 Firestore read+write → `couponRedeem` CF 호출 (서버 유효성 검증: 존재/미사용/미만료)
> - firebaseBooking.leaveBooking: 직접 Firestore 4단계 쓰기(read→check→update→subquery) → `bookingWithdraw` CF 재사용 (Transaction 원자적 처리, 호스트 알림 포함)
> - 클라이언트→Cloud Functions 전환 함수 총 13개 완료 (직접 Firestore 쓰기 코드 87줄 삭제)
> - 클라이언트 TypeScript typecheck 0 에러 + 서버 빌드 0 에러
>
> **전체 코드베이스 감사 - 8개 버그 카테고리 일괄 수정 20차 배치 (12개 파일, +358/-129줄)**
> - 4개 병렬 감사 에이전트로 전체 코드베이스(screens, stores, services, rules, navigation) 자동 스캔 → CRITICAL 4건, HIGH 7건, MEDIUM 2건 발견
> - HomeScreen: `{ booking }` → `{ bookingId: booking.id }` 네비게이션 크래시 수정
> - FeedScreen/PostDetailScreen: 좋아요·댓글이 로컬 React state에서만 동작하고 Firestore에 미저장 → 낙관적 UI + posts/likes·comments 서브컬렉션 영속화 + 실패 시 롤백
> - PostDetailScreen handleDeletePost: Alert만 표시 → Firestore `status='deleted'` 소프트 삭제 구현
> - useBookingStore joinBooking/leaveBooking: read→check→update 패턴 → `runTransaction` 원자적 처리 (동시 참가 시 정원 초과 경쟁 조건 방지)
> - 12곳 `new Date()` → `FirestoreTimestamp.now()` 서버 타임스탬프 전환 (useBookingStore 5곳, useFriendStore 2곳, useProfileStore 6곳). 클라이언트-서버 시간 불일치 및 orderBy 정렬 오류 방지
> - 11곳 `.update()` → `.set({merge:true})` 전환 (useProfileStore, golfCourseAPI, pubAPI, firebaseFriends, useFriendStore). 문서 미존재 시 크래시 방지
> - Firestore rules: golfCourses, users/blockedUsers, posts/likes 3개 컬렉션 규칙 추가 + chatRooms 삭제를 참가자만으로 제한
> - 복합 인덱스 3개 추가 (pubs location+rating, pub_reviews pubId+createdAt, golf_course_reviews courseId+createdAt)
> - Storage rules: reviews/ 경로 `{userId}/{reviewId}/{file}` → `{reviewId}/{file}` 코드 일치 수정
> - TypeScript typecheck 0 에러 유지
>
> **채팅 메시지 전송/읽음 처리 실패 수정 19차 핫픽스 (2개 파일, +26/-19줄)**
> - 근본 원인: BookingDetailScreen에서 `chatId: booking_${bookingId}`로 채팅방 진입 시 해당 chatRoom 문서가 Firestore에 존재하지 않음. `.update()`는 문서 미존재 시 에러 throw
> - useChatStore.ts: sendMessage/sendImage/markAsRead에서 chatRoom 문서 `.update()` → `.set({}, { merge: true })`로 변경 (문서 없으면 자동 생성)
> - useChatStore.ts: sendMessage/sendImage/sendSystemMessage/createChatRoom에서 `new Date()` → `FirestoreTimestamp.now()` 서버 타임스탬프 전환
> - firestore.rules: `chatRooms/{roomId}/messages/{messageId}` update 규칙을 `if false` → `if isSignedIn() && readBy만 변경 허용`으로 수정 (읽음 처리 차단 해제)
> - Firestore 규칙 배포 완료
>
> **Storage 보안 규칙 경로 불일치 수정 18차 핫픽스 (1개 파일, +71/-31줄)**
> - 모집글 이미지 업로드 실패 근본 원인: storage.rules에 `bookings/` 경로 규칙이 없어 catch-all `allow write: if false`에 차단
> - `bookings/{bookingId}/{fileName}`, `chats/{roomId}/{fileName}` 규칙 신규 추가
> - `marketplace/{userId}/{itemId}/{file}` → `products/{productId}/{file}` 경로 수정 (코드-규칙 불일치)
> - `posts/{userId}/{postId}/{file}` → `posts/{postId}/{file}` 세그먼트 수 수정 (코드-규칙 불일치)
> - Firebase Storage 규칙 배포 완료
>
> **CRITICAL 감사 이슈 6건 수정 17차 배치 (6개 파일, +235/-85줄)**
> - 친구 시스템: flat `friends` 컬렉션 → `users/{userId}/friends` 서브컬렉션으로 전면 수정 (firebaseFriends.ts 6곳, useFriendStore.ts 4개 메서드 재작성). 데이터가 서브컬렉션에 저장되는데 flat 컬렉션을 조회하여 친구 목록이 항상 비어있던 근본 원인 해결
> - 알림 딥링킹: GolfCourseReviewScreen이 `route.params?.course` (전체 객체)만 받아 courseId만 넘기는 딥링킹 시 크래시. courseId 파라미터도 지원하도록 수정
> - MyHomeScreen 삭제: 게시물/방명록 삭제 시 로컬 상태만 변경되고 Firestore는 그대로 남아있던 문제 → 실제 Firestore 삭제 + visibility 변경 반영 추가
> - useMarketplaceStore 타임스탬프: `new Date()` → `FirestoreTimestamp.now()` (서버 타임스탬프) 교체. 클라이언트-서버 시간 불일치 및 orderBy 쿼리 오류 방지
> - CreatePostScreen Firebase 연동: handlePublish가 Alert만 표시하고 실제 Firestore 저장 없이 끝나던 문제 → 이미지 업로드(firebaseStorage) + Firestore posts 컬렉션 저장 구현
> - 골프장 리뷰 좋아요: 화면 내에서만 토글되고 Firestore에 저장되지 않던 문제 → 낙관적 업데이트 + Firestore likes 필드 저장 (실패 시 롤백)
> - TypeScript typecheck 0 에러, 전체 진행률 98% → **99%**
>
> **Cloud Functions 전체 감사 - 3개 근본 원인 수정 (16차 핫픽스)**
> - firebaseFunctions.ts: Cloud Functions 리전 미지정 → `functions('asia-northeast3')` 명시 (모든 CF 호출이 us-central1로 가서 not_found 에러 발생하던 근본 원인)
> - functions/src/utils/points.ts: 사용자 문서 미존재 시 `HttpsError("not-found")` throw → 기본값으로 자동 생성 (points: 0, stats: {})
> - authService.ts: `createUserProfile()`에 points/pointBalance/role/stats 초기값 추가 + `set({ merge: true })` 적용
> - firestore.rules: bookings update 규칙에 참가자(participants/status/updatedAt) 필드 수정 허용 추가 (부킹 참가 실패 해결)
> - firestore.rules: users update에 points 보호 필드 추가 (role, pointBalance와 함께 서버 전용)
> - Cloud Functions 12개 재배포 + Firestore 규칙 배포 완료
> - 앱 재빌드 + SM_S901N 디바이스 설치 완료
>
> **디바이스 테스트 버그 3건 수정 + Firestore 인덱스 추가**
> - LoginScreen: 카카오 accessToken이 login()에 전달되지 않던 문제 수정 (result.profile → { ...result.profile, accessToken: result.accessToken })
> - RegisterScreen: Android KeyboardAvoidingView behavior undefined → 'height' 변경 + keyboardVerticalOffset 추가 (비밀번호 확인 입력 시 키보드가 화면 가림 해결)
> - MyHomeScreen: 방명록 탭에서 FlatList contentContainerStyle paddingHorizontal이 ListHeaderComponent까지 영향주는 레이아웃 축소 버그 수정 (paddingHorizontal → 개별 카드 marginHorizontal로 이동)
> - firestore.indexes.json: posts(author.id + type + createdAt) 복합 인덱스 추가 + Firebase 배포
>
> **날씨 위젯 문구 개선 (UX)**
> - weatherAPI.ts: 골프 점수 40점 미만 부정적 문구 완화 + 상황별 세분화
> - 40~59점: "⚠️ 주의하세요" → "☁️ 날씨를 확인하세요"로 어조 완화
> - 20~39점: 기온/강수/바람에 따라 세분화 (추위 🥶 / 더위 🥵 / 비 🌧️ / 바람 💨)
> - 0~19점: 극한 기온 시 추위/더위 문구, 기타 시 실내 연습 권유
> - 골프 활동 의욕을 꺾지 않고 실제 날씨 원인을 안내하는 방향으로 전환
>
> **가격제안/카카오맵/이미지압축/쿼리최적화/Lazy Loading/테스트 확장 15차 배치 (10개 파일, +910/-35줄)**
> - 가격 제안 기능: marketplaceAPI.ts에 PriceOffer 인터페이스 + getOffers/acceptOffer/rejectOffer/getMyProductOffers 4개 함수 추가, OfferManagementScreen.tsx 신규 생성 (판매자용 제안 관리, FlatList 그룹핑, 수락/거절 확인 다이얼로그), acceptOffer batch 처리 (1건 수락 + 나머지 전체 거절 + 상품 RESERVED)
> - 카카오맵 연동: PubDetailScreen 길찾기 Google Maps URL → Alert.alert 3개 옵션 (카카오맵 openNavigation/네이버맵 nmap:// scheme/구글맵 maps.google.com), KakaoMapService 임포트 추가
> - 이미지 압축: imageUtils.ts에 compressImage(expo-image-manipulator, maxWidth=1200, quality=0.7) + createThumbnail(size=200) 추가, uploadImageToStorage에서 업로드 전 자동 압축 적용
> - Firestore 쿼리 최적화: marketplaceAPI.getProducts에 lastDoc 파라미터 + startAfter 커서 기반 페이지네이션 추가
> - 앱 시작 속도: React.lazy()로 11개 화면 지연 로딩 (멤버십 8 + 친구그룹 3), withSuspense HOC + LazyFallback 컴포넌트 생성, Tab.Navigator lazy: true 적용
> - 테스트 확장 20→52개: imageUtils(9), tossPayments(8), kakaoMap(4), listOptimization(7), dateUtils(2) + jest.mock virtual:true 패턴 적용
> - Functions 빌드 0 에러, TypeScript typecheck 0 에러, Jest 52/52 통과
> - 전체 진행률: 95% → **98%**
>
> **Deep Linking/Error Boundary/Validation/알림/결제내역 등 7개 기능 구현 14차 배치 (14개 파일, +550/-68줄)**
> - Deep Linking URL 설정: App.tsx에 linking config 추가 (golfpub:// + https://golfpub.app prefix, 7개 탭 전체 라우트 매핑, 파라미터 경로 지원)
> - Error Boundary 컴포넌트: ErrorBoundary.tsx 신규 생성 (React class component, 크래시 캐치 + 재시작 UI), App.tsx NavigationContainer 래핑
> - Input Validation 5개 폼 연동: RegisterScreen(닉네임/이메일/비밀번호), LoginScreen(이메일), EditProfileScreen(전화번호/닉네임), CreateProductScreen(가격), CreateBookingScreen(가격) → validators.ts 중앙 함수 적용
> - console.log 2건 제거 (golfCourses.ts) + .env.example 정리 (불필요 변수 제거: TOSS_SECRET_KEY, WEATHER_*, CLOUDFLARE_* 등)
> - 채팅 메시지 알림 CF: sendChatNotification 신규 생성 (FCM 실제 푸시 + Firestore 기록), firebaseChat.ts createNotification → callFunction 전환
> - 결제 내역 조회: paymentAPI.ts (getPaymentHistory/getPaymentDetail), PaymentHistoryScreen.tsx (FlatList, 상태 뱃지, 날짜/금액 포맷)
> - Cloud Functions 12개 Firebase 배포 완료 (sendChatNotification 신규 1개)
> - Functions 빌드 0 에러, TypeScript typecheck 0 에러, Jest 20/20 통과
> - 전체 진행률: 94% → **95%**
>
> **알림/예약취소/공유/테스트 등 8개 기능 구현 13차 배치 (22개 파일, +11,812/-5,420줄)**
> - 푸시 알림 딥링킹 완성: NotificationListScreen 전체 구현 (FlatList, 16종 아이콘, 읽음/미읽음, 모두 읽기), App.tsx FCM 초기화 + 미읽은 수 구독, useNotificationStore markAsRead Firestore 연동, firebaseMessaging 딥링크 3건 추가 (booking_cancelled/point_earned/coupon_issued)
> - 예약 취소/탈퇴 Cloud Functions: bookingCancel(호스트 검증+일괄 취소+알림), bookingWithdraw(Transaction 참가자 제거+정원 롤백+호스트 알림), firebaseBooking.ts cancelBooking/withdrawFromBooking → CF 호출 전환
> - 리뷰 시스템: pubAPI.ts 빈 리뷰 시 rating 0 리셋 누락 버그 수정
> - 카카오 공유: kakaoMessage.ts 전면 재작성 → React Native Share API (카카오 SDK v5에서 share API 제거됨)
> - 성능 최적화: listOptimization.ts 생성 (flatListOptimizedProps, chatListOptimizedProps, createGetItemLayout)
> - CI/CD: .github/workflows/ci.yml (lint-typecheck, functions-build, test, android-eas-build 4개 Job)
> - 테스트: jest.config.js + __tests__/setup.ts (Firebase/RN 전체 Mock) + 20개 테스트 (formatters 8 + validators 8 + kakaoMessage 4)
> - 유틸리티 구현: formatters.ts (7개 함수), validators.ts (8개 함수) 스텁 → 실제 로직 구현
> - Cloud Functions 11개 Firebase 배포 완료 (bookingCancel, bookingWithdraw 신규 2개 추가)
> - Functions 빌드 0 에러, TypeScript typecheck 0 에러, Jest 20/20 통과
> - 전체 진행률: 90% → **94%**
>
> **Cloud Functions 전체 구현 + 클라이언트 연동 12차 배치 (42개 파일, +2,287/-341줄)**
> - functions/ 프로젝트 초기화: firebase-admin v12, firebase-functions v5, TypeScript, ESLint 설정
> - firebase.json functions 섹션 + emulators.functions(port 5001) 추가, .firebaserc 생성
> - 서버 공통 유틸 4개: requireAuth/requireAdmin(인증 검증), adjustPoints(runTransaction 원자적 포인트 처리), sendPushNotification(FCM+Firestore), errors(HttpsError 래핑)
> - Cloud Functions 11개 구현 (asia-northeast3 리전):
>   - kakaoToken: 카카오 API 토큰 검증 → admin.auth().createCustomToken() 발급 + Firestore 프로필 upsert
>   - attendanceCheckIn: 중복 체크(attendance/{uid}_{today}) + 연속 출석 보너스(100/300/500/2000) + Transaction 기반 통계 업데이트
>   - pointsEarn/pointsDeduct: runTransaction으로 잔액 검증 + 원자적 업데이트 + pointHistory 기록 (balanceBefore/After)
>   - paymentConfirm: Toss API POST confirm + payments 컬렉션 생성 + booking 상태 연동
>   - paymentCancel: 소유자 검증 + Toss API POST cancel + 부분 취소(PARTIAL_CANCELED) 지원
>   - bookingApprove: 호스트 검증 + Transaction(정원 체크 + 참가자 추가 + full 상태) + 알림
>   - bookingReject: 호스트 검증 + 상태 변경 + 알림
>   - couponIssue(ADMIN): 쿠폰 생성 + 알림, couponRedeem: 유효성(미사용+미만료) 검증
>   - sendNotification(ADMIN): 범용 알림 전송
> - 클라이언트 연동: @react-native-firebase/functions 설치, firebaseFunctions.ts callFunction() 래퍼
> - useAuthStore: signInAnonymously() → kakaoToken CF + signInWithCustomToken() 전환
> - firebaseAttendance: 직접 Firestore 쓰기 → attendanceCheckIn CF (서버에서 중복/보너스 처리)
> - profileAPI: earnPoints batch write → pointsEarn CF, spendPoints batch write → pointsDeduct CF
> - tossPayments: 시뮬레이션 confirmPayment/cancelPayment → paymentConfirm/Cancel CF (실제 Toss API 서버 검증)
> - firebaseBooking: 직접 Firestore update → bookingApprove/Reject CF (호스트 검증+Transaction+알림)
> - BookingRequestsScreen/ApplicantProfileScreen: rejectBookingRequest 호출에 bookingId, userId 파라미터 추가
> - functions build 0 에러, 클라이언트 typecheck 0 신규 에러
> - Secret Manager API 활성화 + KAKAO_REST_API_KEY 시크릿 등록
> - Cloud Functions 9개 Firebase 배포 성공 (asia-northeast3, 2nd Gen): kakaoToken, attendanceCheckIn, pointsEarn/Deduct, bookingApprove/Reject, couponIssue/Redeem, sendNotification
> - 기존 1st Gen 함수 5개 삭제 (kakaoLogin, kakaoUnlink, onBookingJoinRequest, onUserCreate, onUserDelete)
> - paymentConfirm/Cancel은 TOSS_SECRET_KEY 실제 키 설정 후 배포 예정
> - 전체 진행률: 88% → **90%**
>
> **프로젝트 감사 8개 액션 아이템 전체 구현 + notifee→expo-notifications 전환 11차 배치 (174개 파일, +12,066/-5,162줄)**
> - ESLint/Prettier 설정 수정: endOfLine "auto", 중복 rules 키 제거, import/no-unresolved off
> - 크로스 탭 네비게이션 8건 수정: navigate() → cross-tab 패턴 전환
> - WriteReviewScreen 신규 생성: 별점/텍스트/이미지 업로드, Firestore 저장, AuthNavigator 등록
> - console.log 제거 + 미사용 import/변수 정리 → ESLint 0 에러 달성
> - MyHomeScreen Mock→Firestore 전환: 커서 기반 페이지네이션, guestbook 서브컬렉션 쿼리
> - "개발 예정" Alert 15건 실구현: 이미지 업로드, 외부 지도 링크, 신고/차단 Firestore, 실제 네비게이션
> - Toss Payments 결제 서비스 구현: 시뮬레이션 모드, 환불 정책(2일전 100%/1일전 50%/당일 0%), 수수료 5%
> - subscriptionService 멤버십 구독 관리: getSubscription/subscribe/cancel/changePlan/checkExpiration
> - @notifee/react-native 제거 → expo-notifications 전환 (Expo managed workflow 비호환 문제 해결)
> - FCM 알림 전송 연동: 부킹 참여→호스트 알림, 부킹 취소→참가자 알림, 친구 요청→대상 알림
> - Firestore 인덱스 15개 Firebase 배포 완료 (bookings/posts/chatRooms 복합 인덱스)
> - app.json plugins에서 @notifee/react-native 제거
> - expo run:android 네이티브 빌드 + SM_S901N 디바이스 정상 실행 확인
> - TypeScript 0 에러, ESLint 0 에러 유지
> - 전체 진행률: 83% → **88%**

### 2026.02.07

> **Firebase 전체 배포 + Permission 에러 수정 + 코드베이스 감사 10차 배치**
> - Firestore permission-denied 에러 2건 수정: 출석(resource null 대응), 부킹(auth 타이밍), 카카오 로그인(Anonymous Auth 세션)
> - Firebase Console에서 Anonymous Auth 활성화 (카카오 로그인 필수)
> - Realtime Database 보안 규칙 신규 생성 (database.rules.json): chatRooms, messages, typing, presence, readReceipts
> - firebase.json에 database 설정 추가, firebase deploy로 전체 배포 (firestore:rules, indexes, storage, database)
> - Firestore 복합 인덱스 총 17개 배포: 기존 잘못된 posts authorId→author.id 수정, 누락 인덱스 12개 추가
> - Feed 화면 failed-precondition 에러 수정 (posts status+createdAt 인덱스 추가)
> - Gradle JVM 메모리 -Xmx2048m → -Xmx4096m (Android 빌드 OOM 방지)
> - 오래된 typescript-errors.txt 삭제 (현재 tsc 에러 0개 확인)
> - 전체 코드베이스 감사 4개 병렬 에이전트 실행: Firebase/서드파티/빌드/코드완성도
> - 앱 빌드 및 SM_S901N 디바이스 설치 + 테스트 완료, 추가 에러 없음
>
> **Firestore 보안 규칙 수정 + 배포 + Seed 데이터 + 상대 경로 정리 9차 배치 (20개 파일)**
> - firestore.rules 전면 개편: 코드와 불일치 7곳 수정 + 누락 컬렉션 규칙 12개 추가 (19개 규칙 → 306줄 → 399줄)
> - 불일치 수정: marketplace→products, booking_participants→bookingParticipants, point_history→pointHistory, notifications/comments 서브컬렉션화, posts author.id 필드 구조, friends 양방향 문서
> - 누락 규칙 추가: chatRooms+messages, friendRequests, product_likes, pubs, pub_reviews, golf_course_reviews, bookings/applications, users/pointHistory, users/points, users/coupons, users/reviews
> - Firebase에 규칙 배포 완료 (firebase deploy --only firestore:rules → permission-denied 에러 해결)
> - src/utils/seedData.ts 신규 생성: bookings 3건 + posts 3건 + products 3건 Seed 함수, 중복 방지(seedId), 삭제 함수 포함
> - 상대 경로 23곳 → @/ 변환 (17파일): components 7 + services 4 + stores 4 + utils 1 + constants 1 → 전체 코드베이스 상대 경로 0건 달성
> - typecheck 0 에러 유지
>
> **코드 품질 정리 8차 배치 (27개 파일, 150줄 삭제)**
> - console.log 총 91곳 제거: 스크린 4개(6곳) + 서비스 7개(73곳) + 유틸 2개(12곳)
> - 서비스 파일별: bookingAPI(11), friendAPI(13), marketplaceAPI(15), membershipAPI(3), weatherAPI(2), kakaoMessage(16), kakaoMap(11)
> - 유틸 파일별: devicePermissions(10), imageUtils(2)
> - 상대 경로 29곳 → @/ 별칭 변환 (16개 스크린 파일)
> - 보존: logger.ts의 console.log (로거 구현체), kakaoMap.ts JSDoc 주석 내 예시 2건
> - typecheck 0 에러 유지
>
> **채팅/골프장/피드 Mock→Firestore 전환 7차 배치 (5개 화면 + 서비스 2개)**
> - ChatListScreen: Mock 3건 + 로컬 Chat 인터페이스 제거 → useChatStore.loadChatRooms 연결, formatChatTime 헬퍼 + getOtherParticipant 헬퍼 구현, 로딩/새로고침/빈 상태 UI 추가
> - ChatRoomScreen: Mock 4건 + 로컬 Message 인터페이스 제거 → useChatStore.listenToMessages 실시간 연결, sendMessage/sendImage/markAsRead 연결, ImagePicker 카메라/앨범, 키보드 애니메이션 유지
> - GolfCourseDetailScreen: mockReviews 2건 제거 → golfCourseAPI.getGolfCourseReviews(courseId, 2) 연결, 상대경로 3개 → @/ 수정
> - GolfCourseReviewScreen: mockReviews 3건 제거 → golfCourseAPI.getGolfCourseReviews 조회 + createGolfCourseReview 작성 연결, 상대경로 2개 수정, averageRating 빈 배열 처리, 로딩/빈 상태 UI 추가
> - PostDetailScreen: mockPost + mockComments 제거 → useFeedStore.getPostById/getPostComments 연결, console.log 제거, 상대경로 2개 수정, 로딩 early return 패턴 적용
> - golfCourseAPI.ts 신규 생성: getGolfCourseReviews(courseId, limit), createGolfCourseReview(courseId, reviewData)
> - useFeedStore.ts: getPostById(postId), getPostComments(postId) 액션 추가
> - golfcourse-types.ts: GolfCourseReview.id/courseId 타입 number → number|string (Firestore doc ID 호환)
> - useChatStore.ts: 상대 경로 → @/ 수정
> - typecheck 0 에러 유지
>
> **펍 화면 Mock→Firestore 전환 6차 배치 (3개 화면 + pubAPI 정리)**
> - BestPubsScreen: MOCK_PUBS 3건 + 로컬 Pub 인터페이스 제거 → pubAPI.getPopularPubs(20) 연결, useNavigation 훅 사용, 로딩/새로고침/빈 상태 UI 추가
> - PubDetailScreen: MOCK_PUB 객체 제거 → pubAPI.getPubById(pubId) 연결, prop기반 ({ route, navigation }) → useNavigation/useRoute 훅 전환, Mock 필드 매핑 (image→images[0], tags→features, hours→openTime-closeTime, isPartner→features.includes('제휴')), 로딩/빈 상태 UI 추가
> - PubReviewsScreen: MOCK_REVIEWS 3건 + 로컬 Review 인터페이스 제거 → pubAPI.getPubReviews(pubId) + PubReview 타입 사용, prop→hook 전환, 필드 매핑 (userAvatar→userImage, content→comment, date→createdAt), RefreshControl + 로딩/빈 상태 UI 추가, averageRating 빈 배열 처리
> - pubAPI.ts: console.log 8개 제거 (7개 함수에서 성공/정보 로그 제거)
> - typecheck 0 에러 유지
>
> **예약 화면 Mock→Firestore 전환 5차 배치 (5개 화면 + firebase 함수 4개)**
> - ApplicantProfileScreen: MOCK_APPLICANT 제거 → getApplicantProfile로 Firestore users 컬렉션 조회, approveBookingRequest/rejectBookingRequest 실제 API 연결, 로딩/빈 상태 UI 추가
> - PaymentScreen: 하드코딩 booking 객체 제거 → getBookingDetail + users 컬렉션 호스트 이름 조인, console.log 제거, setTimeout 제거, 상대 경로 → @/ 수정, bookingId 타입 number→string
> - PopularBookingsScreen: MOCK_BOOKINGS 2건 + 로컬 Booking 인터페이스 제거 → getPopularBookings 연결 (참가자 많은 순 정렬), setTimeout 제거, 로딩/빈 상태 UI 추가
> - RecommendedBookingsScreen: MOCK_BOOKINGS 2건 + 로컬 Booking 인터페이스 제거 → getRecommendedBookings 연결 (본인 호스팅 제외), 로딩/새로고침/빈 상태 UI 추가
> - RequestStatusScreen: MOCK_REQUEST 제거 → getRequestStatus 연결 (bookingParticipants + bookings + users 3개 컬렉션 조인), 로딩/빈 상태 UI 추가
> - firebaseBooking.ts: getPopularBookings(인기 부킹), getRecommendedBookings(추천 부킹), getRequestStatus(신청 상태), getApplicantProfile(신청자 프로필) 4개 함수 추가
> - typecheck 0 에러 유지
>
> **친구 관리 Mock→Firestore 전환 4차 배치 (4개 화면 + firebase 함수 4개)**
> - FriendsScreen: mockFriends 5건 제거 → getFriendsList + getPendingRequests 연결, console.log 제거, 하드코딩 통계(24, 48) → user.stats 연결, 뱃지 "3" → pendingCount 동적 표시
> - FriendRequestsScreen: mockReceivedRequests 3건 + mockSentRequests 2건 제거 → getPendingRequests/getSentRequests 연결, accept/reject/cancel 실제 Firebase API 호출, 사용자 정보 enrichment(users 컬렉션 조회)
> - FriendProfileScreen: mockFriendProfile 제거 → route params friendId로 getFriendProfile 조회 (프로필 + 친구관계 + 최근 함께한 모임), removeFriend 실제 API 연결, console.log 제거
> - AddFriendScreen: mockSuggestions 3건 + mockSearchResults 2건 제거 → getSuggestedFriends 연결, Firebase 에러 시 Mock fallback 제거 → 에러 Alert 표시, 검색 로딩 스피너 추가
> - firebaseFriends.ts: getSentRequests(보낸 요청 조회), cancelFriendRequest(요청 취소), getFriendProfile(프로필+관계+모임 조회), getSuggestedFriends(추천 친구) 4개 함수 추가
> - 전체 4개 화면: 상대 경로 → @/ 경로 변경, console.log 제거, 로딩/빈 상태 UI + Pull-to-refresh 추가
> - typecheck 0 에러 유지
>
> **내 정보/프로필 Mock→Firestore 전환 3차 배치 (7개 화면 + 서비스 2개)**
> - HostedMeetupsScreen: Mock 3건 제거 → getMyHostedBookings + cancelBooking 연결, console.log 3곳 제거
> - JoinedMeetupsScreen: Mock 4건 제거 → getMyJoinedBookings 연결
> - MyPostsScreen: Mock 3건 제거 → useFeedStore.loadMyPosts 신규 함수 연결, setTimeout 제거
> - MyReviewsScreen: Mock 3건 제거 → profileAPI.getMyReviews 신규 함수 연결, setTimeout 제거
> - PointHistoryScreen: Mock 8건 + 하드코딩 totalPoints 제거 → profileAPI.getPointHistory 연결, user.pointBalance 사용
> - CouponsScreen: Mock 5건 제거 → profileAPI.getCoupons 연결, Coupon 타입 사용, isUsed/expiryDate 기반 상태 판별
> - ProfileScreen: 하드코딩 통계(24, 4.8★) 제거 → useProfileStore.loadProfile 연결, setTimeout 제거
> - useFeedStore.ts: loadMyPosts(userId) 함수 추가 (posts 컬렉션 author.id 쿼리)
> - profileAPI.ts: getMyReviews() 함수 추가 (users/{uid}/reviews 서브컬렉션 조회)
> - 전체 7개 화면: 상대 경로 → @/ 경로 변경, 로딩/빈 상태 UI + Pull-to-refresh 추가
> - typecheck 0 에러 유지
>
> **예약 상세 보완 + 중고마켓 완성 (5개 화면 + firebase 함수 3개)**
> - BookingDetailScreen: Mock booking/host 객체 제거 → useBookingStore.getBooking 연결, bookingId 타입 number→string, joinBooking 실제 호출
> - firebaseBooking.ts: getBookingRequests(호스트용 신청 목록 조회), approveBookingRequest(승인), rejectBookingRequest(거절) 3개 함수 신규 추가
> - BookingRequestsScreen: MOCK_REQUESTS 3건 제거 → firebaseBooking 실제 API로 승인/거절 처리
> - ProductDetailScreen: mockProduct 제거 → marketplaceAPI.getProductById 연결, increaseViewCount 조회수 증가, likeProduct/unlikeProduct 찜 연동 (optimistic update)
> - CreateProductScreen: console.log 제거 → marketplaceAPI.createProduct 실제 호출, 등록 중 로딩 상태 추가 (이미지 업로드는 Firebase Storage 연동 TODO)
> - MyProductsScreen: mockMyProducts 3건 제거 → marketplaceAPI.getMyProducts/deleteProduct/updateProductStatus 연결
> - 전체 5개 화면: 상대 경로 → @/ 경로 변경, console.log 제거, 로딩/에러/빈 상태 UI 추가
> - typecheck 0 에러 유지
>
> **Mock → Firestore API 교체 (4개 화면)**
> - BookingListScreen: 인라인 Mock 3건 제거 → useBookingStore 연결, 에러 상태 UI 추가
> - MarketplaceScreen: mockProducts 6건 제거 → useMarketplaceStore 연결, 로딩/에러/빈 상태 UI 추가
> - FeedScreen: mockUser/mockStories/mockCommentsData/mockFeeds 전부 제거 → useFeedStore 신규 생성
> - HomeScreen: 알림 뱃지 "3" → useNotificationStore 실시간 unreadCount 연결, 멤버십 배너 → MEMBERSHIP_PLANS 상수 연결
> - MarketItem 타입 제거 → Product 타입으로 통일 (sellerId 추가, 컬렉션명 products로 통일)
> - feed-types.ts ID number→string 변경, FeedPost/FeedStory 인터페이스 추가
> - useFeedStore.ts 신규 생성 (Zustand 스토어 8개로 확장)
> - PostDetailScreen, MyProductsScreen 타입 호환성 수정
> - typecheck 0 에러 유지
>
> **개발 환경 개선 & 타입 안정화**
> - CLAUDE.md 프로젝트 가이드 생성 (매 대화 자동 컨텍스트 제공)
> - package.json에 lint, typecheck, check 스크립트 추가
> - TypeScript 타입 에러 168개 전체 수정 (41개 파일, typecheck 0 에러 달성)
>   - Booking 타입 통일 (booking-types.ts ↔ useBookingStore.ts)
>   - User 타입 보완, 카카오 SDK 타입 수정, Navigation 타입 안정화
> - 홈 멤버십 배너 그라데이션 보라색 계열로 변경
> - 개발 일정 추적 파일 생성 (DEVELOPMENT_LOG.md)

### 2026.02.06

> - 프로젝트 기본 베이스 완성 (89개 화면, 48개 컴포넌트)
> - UI/UX 전면 수정 + 누락 화면 생성
> - Firebase 연동 (Auth, Firestore, Storage, Chat)
> - 크로스탭 네비게이션 버그 수정
> - 코드 품질 개선 (민감 로그 제거, 색상 통일, 타입 수정)
> - AsyncStorage 의존성 제거

---

## 🔄 업데이트 방법

1. 작업 완료 시 해당 항목에 `[x]`와 `~~취소선~~` 추가
2. 새로운 작업이 생기면 해당 섹션에 `- [ ]` 항목 추가
3. 일일 개발 기록에 날짜와 내용 추가
4. 진행률 요약 테이블 업데이트
5. 이 파일과 함께 커밋: `git add DEVELOPMENT_LOG.md`

### 체크 표시 예시

```markdown
완료 전: - [ ] 기능 구현
완료 후: - [x] ~~기능 구현~~ (2026.02.07 완료)
```
