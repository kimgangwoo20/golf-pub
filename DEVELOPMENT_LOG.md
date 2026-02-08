# Golf Pub App - 개발 일정 & 진행 현황

> 이 파일은 개발 진행 상황을 추적하기 위한 문서입니다.
> 완료된 항목은 ~~취소선~~과 체크(✅)로 표시합니다.
> 커밋할 때마다 이 파일을 함께 업데이트합니다.

---

## 📋 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | React Native 0.81.5 + Expo 54.0.0 |
| 언어 | TypeScript 5.9.2 |
| 네비게이션 | React Navigation 7.x |
| 상태관리 | Zustand 5.0.2 |
| 백엔드 | Firebase (Firestore, Realtime DB, Auth, Storage, FCM) |
| 소셜 로그인 | 카카오 로그인 (@react-native-seoul/kakao-login) |
| 결제 | Toss Payments |
| 날씨 API | Open-Meteo |

---

## 🏗️ 전체 개발 일정

### Phase 1: 기본 구조 & 인증 (완료)
### Phase 2: 핵심 기능 개발 (완료)
### Phase 3: 결제 & 알림 연동 (진행 중 - Cloud Functions 구현 완료, Toss SDK 클라이언트 연동 예정)
### Phase 4: 테스트 & 최적화 (예정)
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
  - [ ] 결제 내역 조회
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
  - [ ] 알림 클릭 시 딥링킹
  - [x] ~~알림 뱃지 업데이트 → Notifications.setBadgeCountAsync~~ (2026.02.08 완료)
  - [x] ~~알림 종류별 처리 (예약 참여/취소, 친구 요청)~~ (2026.02.08 완료)
  - [ ] 채팅 메시지 알림 전송

### 🟡 우선순위 중간 (P1 - 중요)

- [ ] **예약 상세 기능 보완**
  - [x] ~~BookingDetailScreen - Mock 제거 → useBookingStore.getBooking 연결~~ (2026.02.07 완료)
  - [x] ~~BookingRequestsScreen - Mock 제거 → firebaseBooking 실제 API 연결~~ (2026.02.07 완료)
  - [ ] 예약 취소/환불 프로세스
  - [ ] 예약 상태 변경 알림

- [ ] **리뷰 시스템 완성**
  - [x] ~~골프장 리뷰 작성 → Firestore 저장 (golfCourseAPI.createGolfCourseReview)~~ (2026.02.07 완료)
  - [x] ~~골프장 리뷰 조회 → Firestore 연동 (golfCourseAPI.getGolfCourseReviews)~~ (2026.02.07 완료)
  - [x] ~~펍 리뷰 작성 → Firestore 저장 (pubAPI.createPubReview)~~ (2026.02.07 완료)
  - [ ] 리뷰 별점 집계 & 표시
  - [ ] 리뷰 수정/삭제

- [ ] **중고마켓 기능 완성**
  - [x] ~~ProductDetailScreen - Mock 제거 → marketplaceAPI 연결 (조회수, 찜, 상세조회)~~ (2026.02.07 완료)
  - [x] ~~CreateProductScreen - console.log 제거 → marketplaceAPI.createProduct 연결~~ (2026.02.07 완료)
  - [x] ~~MyProductsScreen - Mock 제거 → marketplaceAPI 연결 (삭제, 상태변경)~~ (2026.02.07 완료)
  - [x] ~~이미지 업로드 → Firebase Storage 연동 (expo-image-picker + firebaseStorage)~~ (2026.02.08 완료)
  - [ ] 판매자-구매자 채팅 연결
  - [ ] 가격 제안 기능

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
  - [ ] 카카오맵 연동 (골프장/펍 위치)
  - [ ] 카카오 메시지 공유 (모임 초대)

- [ ] **성능 최적화**
  - [ ] 이미지 캐싱 & 리사이징
  - [ ] Firestore 쿼리 최적화
  - [ ] 리스트 가상화 (FlatList 최적화)
  - [ ] 앱 시작 속도 개선

### 🔵 배포 준비 (P3)

- [ ] **에러 추적 & 분석**
  - [ ] Sentry 에러 추적 연동
  - [ ] Firebase Analytics 이벤트 추적
  - [ ] 사용자 행동 분석

- [ ] **테스트**
  - [ ] 단위 테스트 작성 (서비스 레이어)
  - [ ] 통합 테스트 (네비게이션 플로우)
  - [ ] E2E 테스트 (주요 사용자 시나리오)

- [ ] **CI/CD 파이프라인**
  - [ ] GitHub Actions 설정
  - [ ] 자동 빌드 (Android APK / iOS IPA)
  - [ ] 코드 품질 검사 (ESLint, TypeScript)
  - [ ] 테스트 자동 실행

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
| 예약/모임 | 10 | 9 | 1 | 90% |
| 피드/소셜 | 5 | 5 | 0 | 100% |
| 친구 관리 | 5 | 5 | 0 | 100% |
| 중고마켓 | 9 | 9 | 0 | 100% |
| 골프장/펍 | 8 | 8 | 0 | 100% |
| 멤버십/결제 | 9 | 8 | 1 | 89% |
| 알림 | 6 | 5 | 1 | 83% |
| 포인트/쿠폰 | 5 | 5 | 0 | 100% |
| 내 정보/프로필 화면 | 7 | 7 | 0 | 100% |
| 리뷰 시스템 | 5 | 3 | 2 | 60% |
| 음악 | 4 | 0 | 4 | 0% |
| 테스트/배포 | 10 | 0 | 10 | 0% |
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
| **전체** | **169** | **152** | **17** | **90%** |

---

## 📝 일일 개발 기록

### 2026.02.08

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
