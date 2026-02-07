# Golf Pub 백엔드 상세 설계서

> 작성일: 2026-02-06
> 버전: 1.0.0

---

## 목차

1. [시스템 아키텍처](#1-시스템-아키텍처)
2. [기술 스택](#2-기술-스택)
3. [데이터베이스 설계](#3-데이터베이스-설계)
4. [API 설계](#4-api-설계)
5. [인증 시스템](#5-인증-시스템)
6. [결제 시스템](#6-결제-시스템)
7. [실시간 기능](#7-실시간-기능)
8. [파일 저장소](#8-파일-저장소)
9. [알림 시스템](#9-알림-시스템)
10. [보안 설계](#10-보안-설계)
11. [배포 및 인프라](#11-배포-및-인프라)
12. [개발 로드맵](#12-개발-로드맵)

---

## 1. 시스템 아키텍처

### 1.1 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              클라이언트 계층                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │  iOS 앱     │    │ Android 앱  │    │   Web 앱    │                      │
│  │ (React Native) │  │ (React Native) │  │  (Next.js)  │                      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                      │
└─────────┼──────────────────┼──────────────────┼─────────────────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway                                     │
│                         (AWS API Gateway / Nginx)                           │
│                    • Rate Limiting • Load Balancing                         │
│                    • SSL Termination • Request Routing                      │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   메인 API 서버   │  │  결제 서비스     │  │  알림 서비스     │
│   (NestJS)       │  │  (NestJS)       │  │  (NestJS)       │
│                  │  │                  │  │                  │
│ • 인증/인가       │  │ • Toss 결제     │  │ • FCM 푸시      │
│ • 부킹 관리       │  │ • 환불 처리     │  │ • 이메일 발송   │
│ • 사용자 관리     │  │ • 구독 관리     │  │ • SMS 발송     │
│ • 친구 관리       │  │ • 웹훅 처리     │  │ • 인앱 알림    │
│ • 중고거래        │  │                  │  │                  │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            데이터 계층                                       │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   PostgreSQL    │   Firebase      │     Redis       │   Elasticsearch       │
│  (메인 DB)       │  (실시간 DB)     │   (캐시/세션)    │    (검색 엔진)         │
│                 │                 │                 │                       │
│ • 사용자        │ • 채팅 메시지    │ • 세션 저장     │ • 골프장 검색         │
│ • 결제 내역     │ • 온라인 상태    │ • API 캐싱     │ • 상품 검색           │
│ • 부킹 예약     │ • 타이핑 상태    │ • Rate Limit  │ • 사용자 검색         │
│ • 거래 내역     │ • 실시간 알림    │ • 랭킹 데이터  │                       │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          외부 서비스 연동                                    │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   Kakao API     │   Toss Payments │  Firebase       │   기타 API            │
│                 │                 │                 │                       │
│ • 소셜 로그인    │ • 카드 결제     │ • FCM 푸시     │ • 날씨 API           │
│ • 카카오맵      │ • 가상계좌      │ • Storage      │ • 공공데이터 (골프장) │
│ • 카카오톡 공유  │ • 정기 결제     │ • Auth         │ • Cloudflare Images  │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────┘
```

### 1.2 마이크로서비스 구조

```
golf-pub-backend/
├── apps/
│   ├── api-gateway/          # API 게이트웨이
│   ├── main-api/             # 메인 API 서버
│   ├── payment-service/      # 결제 서비스
│   ├── notification-service/ # 알림 서비스
│   └── scheduler-service/    # 스케줄러 (크론잡)
│
├── libs/
│   ├── common/               # 공통 유틸리티
│   ├── database/             # DB 연결/모델
│   ├── firebase-admin/       # Firebase Admin SDK
│   └── external-apis/        # 외부 API 클라이언트
│
└── infrastructure/
    ├── docker/               # Docker 설정
    ├── kubernetes/           # K8s 배포 설정
    └── terraform/            # 인프라 코드
```

---

## 2. 기술 스택

### 2.1 백엔드 프레임워크

| 구분 | 기술 | 선택 이유 |
|------|------|----------|
| **런타임** | Node.js 20 LTS | TypeScript 지원, 비동기 처리 우수 |
| **프레임워크** | NestJS 10 | 모듈화, DI, TypeScript 네이티브 |
| **ORM** | Prisma 5 | Type-safe, 마이그레이션 관리 |
| **Validation** | class-validator | DTO 검증 |
| **API 문서** | Swagger (OpenAPI) | 자동 문서화 |

### 2.2 데이터베이스

| 구분 | 기술 | 용도 |
|------|------|------|
| **Primary DB** | PostgreSQL 16 | 트랜잭션 데이터, ACID 보장 |
| **Realtime DB** | Firebase Realtime | 채팅, 온라인 상태 |
| **Cache** | Redis 7 | 세션, API 캐싱, Rate Limit |
| **Search** | Elasticsearch 8 | 전문 검색 (골프장, 상품) |

### 2.3 인프라

| 구분 | 기술 | 비고 |
|------|------|------|
| **컨테이너** | Docker | 개발/배포 환경 통일 |
| **오케스트레이션** | Kubernetes (GKE) | 자동 스케일링 |
| **CI/CD** | GitHub Actions | 자동 배포 |
| **모니터링** | Prometheus + Grafana | 메트릭 수집/시각화 |
| **로깅** | ELK Stack | 로그 수집/분석 |

---

## 3. 데이터베이스 설계

### 3.1 PostgreSQL 스키마 (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              사용자 관련                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│       users         │       │    user_profiles    │
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │──────<│ user_id (PK, FK)    │
│ firebase_uid        │       │ bio                 │
│ email               │       │ level              │
│ phone_number        │       │ handicap           │
│ provider            │       │ golf_experience    │
│ status              │       │ favorite_course    │
│ role                │       │ average_score      │
│ created_at          │       │ profile_image_url  │
│ updated_at          │       │ updated_at         │
└─────────────────────┘       └─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐       ┌─────────────────────┐
│   user_memberships  │       │      friends        │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ user_id (FK)        │       │ user_id (FK)        │
│ plan_id (FK)        │       │ friend_id (FK)      │
│ status              │       │ status              │
│ start_date          │       │ created_at          │
│ end_date            │       └─────────────────────┘
│ auto_renew          │
└─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              부킹 관련                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│      bookings       │       │ booking_participants│
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │──────<│ id (PK)             │
│ host_id (FK)        │       │ booking_id (FK)     │
│ golf_course_id (FK) │       │ user_id (FK)        │
│ title               │       │ status              │
│ description         │       │ payment_id (FK)     │
│ play_date           │       │ joined_at           │
│ play_time           │       └─────────────────────┘
│ max_participants    │
│ current_participants│       ┌─────────────────────┐
│ green_fee           │       │  booking_comments   │
│ level_requirement   │       ├─────────────────────┤
│ drink_allowed       │       │ id (PK)             │
│ pace_preference     │       │ booking_id (FK)     │
│ status              │       │ user_id (FK)        │
│ created_at          │       │ content             │
│ updated_at          │       │ created_at          │
└─────────────────────┘       └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              결제 관련                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│      payments       │       │   payment_refunds   │
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │──────<│ id (PK)             │
│ user_id (FK)        │       │ payment_id (FK)     │
│ order_id            │       │ amount              │
│ toss_payment_key    │       │ reason              │
│ amount              │       │ status              │
│ method              │       │ refunded_at         │
│ status              │       └─────────────────────┘
│ type                │
│ metadata            │       ┌─────────────────────┐
│ paid_at             │       │    subscriptions    │
│ created_at          │       ├─────────────────────┤
└─────────────────────┘       │ id (PK)             │
                              │ user_id (FK)        │
                              │ plan_id (FK)        │
                              │ billing_key         │
                              │ status              │
                              │ next_billing_date   │
                              │ created_at          │
                              └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              중고거래 관련                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│      products       │       │   product_images    │
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │──────<│ id (PK)             │
│ seller_id (FK)      │       │ product_id (FK)     │
│ category            │       │ image_url           │
│ title               │       │ order               │
│ description         │       └─────────────────────┘
│ price               │
│ condition           │       ┌─────────────────────┐
│ status              │       │    transactions     │
│ view_count          │       ├─────────────────────┤
│ location            │       │ id (PK)             │
│ created_at          │       │ product_id (FK)     │
│ updated_at          │       │ seller_id (FK)      │
└─────────────────────┘       │ buyer_id (FK)       │
                              │ payment_id (FK)     │
                              │ status              │
                              │ completed_at        │
                              └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              골프장/펍 관련                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│    golf_courses     │       │  golf_course_reviews│
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │──────<│ id (PK)             │
│ name                │       │ course_id (FK)      │
│ address             │       │ user_id (FK)        │
│ phone               │       │ rating              │
│ website             │       │ content             │
│ latitude            │       │ images              │
│ longitude           │       │ created_at          │
│ holes               │       └─────────────────────┘
│ par                 │
│ course_type         │
│ facilities          │
│ rating_avg          │
│ review_count        │
└─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│        pubs         │       │     pub_reviews     │
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │──────<│ id (PK)             │
│ name                │       │ pub_id (FK)         │
│ address             │       │ user_id (FK)        │
│ phone               │       │ rating              │
│ latitude            │       │ content             │
│ longitude           │       │ created_at          │
│ opening_hours       │       └─────────────────────┘
│ facilities          │
│ menu_items          │
│ rating_avg          │
└─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              포인트/멤버십                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│   membership_plans  │       │    point_history    │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ name                │       │ user_id (FK)        │
│ description         │       │ amount              │
│ price               │       │ type (EARN/USE)     │
│ duration_months     │       │ reason              │
│ benefits (JSONB)    │       │ reference_id        │
│ is_active           │       │ balance_after       │
└─────────────────────┘       │ created_at          │
                              └─────────────────────┘

┌─────────────────────┐
│       coupons       │
├─────────────────────┤
│ id (PK)             │
│ code                │
│ discount_type       │
│ discount_value      │
│ min_order_amount    │
│ max_discount        │
│ valid_from          │
│ valid_until         │
│ usage_limit         │
│ used_count          │
└─────────────────────┘
```

### 3.2 Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== 사용자 ====================

model User {
  id           String   @id @default(uuid())
  firebaseUid  String   @unique @map("firebase_uid")
  email        String?  @unique
  phoneNumber  String?  @map("phone_number")
  provider     Provider @default(EMAIL)
  status       UserStatus @default(ACTIVE)
  role         UserRole @default(USER)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  profile         UserProfile?
  memberships     UserMembership[]
  bookingsHosted  Booking[] @relation("BookingHost")
  participations  BookingParticipant[]
  products        Product[]
  payments        Payment[]
  pointHistory    PointHistory[]
  reviews         GolfCourseReview[]
  friends         Friend[] @relation("UserFriends")
  friendOf        Friend[] @relation("FriendOf")

  @@map("users")
}

model UserProfile {
  userId          String   @id @map("user_id")
  nickname        String?
  bio             String?
  level           GolfLevel?
  handicap        Int?
  golfExperience  Int?      @map("golf_experience")
  favoriteCourse  String?   @map("favorite_course")
  averageScore    Int?      @map("average_score")
  profileImageUrl String?   @map("profile_image_url")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

enum Provider {
  EMAIL
  KAKAO
  APPLE
  GOOGLE
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum GolfLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  PRO
}

// ==================== 친구 ====================

model Friend {
  id        String       @id @default(uuid())
  userId    String       @map("user_id")
  friendId  String       @map("friend_id")
  status    FriendStatus @default(PENDING)
  createdAt DateTime     @default(now()) @map("created_at")

  user   User @relation("UserFriends", fields: [userId], references: [id])
  friend User @relation("FriendOf", fields: [friendId], references: [id])

  @@unique([userId, friendId])
  @@map("friends")
}

enum FriendStatus {
  PENDING
  ACCEPTED
  BLOCKED
}

// ==================== 부킹 ====================

model Booking {
  id                  String        @id @default(uuid())
  hostId              String        @map("host_id")
  golfCourseId        String?       @map("golf_course_id")
  title               String
  description         String?
  playDate            DateTime      @map("play_date")
  playTime            String        @map("play_time")
  maxParticipants     Int           @map("max_participants")
  currentParticipants Int           @default(1) @map("current_participants")
  greenFee            Int?          @map("green_fee")
  levelRequirement    GolfLevel?    @map("level_requirement")
  drinkAllowed        Boolean       @default(true) @map("drink_allowed")
  pacePreference      PacePreference? @map("pace_preference")
  status              BookingStatus @default(OPEN)
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  host         User                 @relation("BookingHost", fields: [hostId], references: [id])
  golfCourse   GolfCourse?          @relation(fields: [golfCourseId], references: [id])
  participants BookingParticipant[]
  comments     BookingComment[]

  @@index([playDate])
  @@index([status])
  @@map("bookings")
}

model BookingParticipant {
  id        String              @id @default(uuid())
  bookingId String              @map("booking_id")
  userId    String              @map("user_id")
  status    ParticipantStatus   @default(PENDING)
  paymentId String?             @map("payment_id")
  joinedAt  DateTime            @default(now()) @map("joined_at")

  booking Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  user    User     @relation(fields: [userId], references: [id])
  payment Payment? @relation(fields: [paymentId], references: [id])

  @@unique([bookingId, userId])
  @@map("booking_participants")
}

model BookingComment {
  id        String   @id @default(uuid())
  bookingId String   @map("booking_id")
  userId    String   @map("user_id")
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("booking_comments")
}

enum BookingStatus {
  OPEN
  FULL
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum ParticipantStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum PacePreference {
  SLOW
  NORMAL
  FAST
}

// ==================== 결제 ====================

model Payment {
  id             String        @id @default(uuid())
  userId         String        @map("user_id")
  orderId        String        @unique @map("order_id")
  tossPaymentKey String?       @map("toss_payment_key")
  amount         Int
  method         PaymentMethod?
  status         PaymentStatus @default(PENDING)
  type           PaymentType
  metadata       Json?
  paidAt         DateTime?     @map("paid_at")
  createdAt      DateTime      @default(now()) @map("created_at")

  user          User                 @relation(fields: [userId], references: [id])
  refunds       PaymentRefund[]
  participants  BookingParticipant[]
  transactions  Transaction[]

  @@index([userId])
  @@index([status])
  @@map("payments")
}

model PaymentRefund {
  id         String       @id @default(uuid())
  paymentId  String       @map("payment_id")
  amount     Int
  reason     String?
  status     RefundStatus @default(PENDING)
  refundedAt DateTime?    @map("refunded_at")

  payment Payment @relation(fields: [paymentId], references: [id])

  @@map("payment_refunds")
}

model Subscription {
  id              String             @id @default(uuid())
  userId          String             @map("user_id")
  planId          String             @map("plan_id")
  billingKey      String?            @map("billing_key")
  status          SubscriptionStatus @default(ACTIVE)
  nextBillingDate DateTime?          @map("next_billing_date")
  createdAt       DateTime           @default(now()) @map("created_at")
  cancelledAt     DateTime?          @map("cancelled_at")

  plan MembershipPlan @relation(fields: [planId], references: [id])

  @@map("subscriptions")
}

enum PaymentMethod {
  CARD
  VIRTUAL_ACCOUNT
  TRANSFER
  MOBILE
  POINT
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
  PARTIAL_REFUNDED
}

enum PaymentType {
  BOOKING
  PRODUCT
  MEMBERSHIP
  POINT
}

enum RefundStatus {
  PENDING
  COMPLETED
  FAILED
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
  EXPIRED
}

// ==================== 멤버십 ====================

model MembershipPlan {
  id             String   @id @default(uuid())
  name           String
  description    String?
  price          Int
  durationMonths Int      @map("duration_months")
  benefits       Json
  isActive       Boolean  @default(true) @map("is_active")

  subscriptions Subscription[]
  memberships   UserMembership[]

  @@map("membership_plans")
}

model UserMembership {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  planId    String           @map("plan_id")
  status    MembershipStatus @default(ACTIVE)
  startDate DateTime         @map("start_date")
  endDate   DateTime         @map("end_date")
  autoRenew Boolean          @default(true) @map("auto_renew")

  user User           @relation(fields: [userId], references: [id])
  plan MembershipPlan @relation(fields: [planId], references: [id])

  @@map("user_memberships")
}

enum MembershipStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

// ==================== 포인트 ====================

model PointHistory {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  amount       Int
  type         PointType
  reason       String
  referenceId  String?   @map("reference_id")
  balanceAfter Int       @map("balance_after")
  createdAt    DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("point_history")
}

enum PointType {
  EARN
  USE
  EXPIRE
  REFUND
}

// ==================== 중고거래 ====================

model Product {
  id          String          @id @default(uuid())
  sellerId    String          @map("seller_id")
  category    ProductCategory
  title       String
  description String?
  price       Int
  condition   ProductCondition
  status      ProductStatus   @default(AVAILABLE)
  viewCount   Int             @default(0) @map("view_count")
  location    String?
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  seller       User           @relation(fields: [sellerId], references: [id])
  images       ProductImage[]
  transactions Transaction[]

  @@index([category])
  @@index([status])
  @@map("products")
}

model ProductImage {
  id        String @id @default(uuid())
  productId String @map("product_id")
  imageUrl  String @map("image_url")
  order     Int    @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model Transaction {
  id          String            @id @default(uuid())
  productId   String            @map("product_id")
  sellerId    String            @map("seller_id")
  buyerId     String            @map("buyer_id")
  paymentId   String?           @map("payment_id")
  status      TransactionStatus @default(PENDING)
  completedAt DateTime?         @map("completed_at")

  product Product  @relation(fields: [productId], references: [id])
  payment Payment? @relation(fields: [paymentId], references: [id])

  @@map("transactions")
}

enum ProductCategory {
  DRIVER
  WOOD
  IRON
  PUTTER
  WEDGE
  BAG
  SHOES
  GLOVES
  BALLS
  CLOTHING
  ACCESSORIES
  OTHER
}

enum ProductCondition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  POOR
}

enum ProductStatus {
  AVAILABLE
  RESERVED
  SOLD
  HIDDEN
}

enum TransactionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  DISPUTED
}

// ==================== 골프장 ====================

model GolfCourse {
  id          String   @id @default(uuid())
  name        String
  address     String
  phone       String?
  website     String?
  latitude    Float?
  longitude   Float?
  holes       Int      @default(18)
  par         Int      @default(72)
  courseType  String?  @map("course_type")
  facilities  Json?
  ratingAvg   Float    @default(0) @map("rating_avg")
  reviewCount Int      @default(0) @map("review_count")

  bookings Booking[]
  reviews  GolfCourseReview[]

  @@map("golf_courses")
}

model GolfCourseReview {
  id        String   @id @default(uuid())
  courseId  String   @map("course_id")
  userId    String   @map("user_id")
  rating    Int
  content   String?
  images    Json?
  createdAt DateTime @default(now()) @map("created_at")

  course GolfCourse @relation(fields: [courseId], references: [id])
  user   User       @relation(fields: [userId], references: [id])

  @@map("golf_course_reviews")
}

// ==================== 쿠폰 ====================

model Coupon {
  id             String       @id @default(uuid())
  code           String       @unique
  discountType   DiscountType @map("discount_type")
  discountValue  Int          @map("discount_value")
  minOrderAmount Int?         @map("min_order_amount")
  maxDiscount    Int?         @map("max_discount")
  validFrom      DateTime     @map("valid_from")
  validUntil     DateTime     @map("valid_until")
  usageLimit     Int?         @map("usage_limit")
  usedCount      Int          @default(0) @map("used_count")

  @@map("coupons")
}

enum DiscountType {
  PERCENTAGE
  FIXED
}
```

### 3.3 Firebase Realtime Database 구조

```json
{
  "chats": {
    "{chatId}": {
      "type": "direct | group | booking",
      "participants": {
        "{userId}": true
      },
      "lastMessage": {
        "text": "string",
        "senderId": "string",
        "timestamp": 1234567890
      },
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  },

  "messages": {
    "{chatId}": {
      "{messageId}": {
        "text": "string",
        "senderId": "string",
        "type": "text | image | system",
        "imageUrl": "string?",
        "timestamp": 1234567890,
        "readBy": {
          "{userId}": 1234567890
        }
      }
    }
  },

  "userPresence": {
    "{userId}": {
      "online": true,
      "lastSeen": 1234567890
    }
  },

  "typing": {
    "{chatId}": {
      "{userId}": {
        "isTyping": true,
        "timestamp": 1234567890
      }
    }
  },

  "notifications": {
    "{userId}": {
      "{notificationId}": {
        "type": "friend_request | booking_invite | message | system",
        "title": "string",
        "body": "string",
        "data": {},
        "read": false,
        "createdAt": 1234567890
      }
    }
  }
}
```

---

## 4. API 설계

### 4.1 RESTful API 엔드포인트

#### 인증 API

```
POST   /api/v1/auth/kakao              # 카카오 로그인
POST   /api/v1/auth/apple              # Apple 로그인
POST   /api/v1/auth/email/signup       # 이메일 회원가입
POST   /api/v1/auth/email/signin       # 이메일 로그인
POST   /api/v1/auth/refresh            # 토큰 갱신
POST   /api/v1/auth/logout             # 로그아웃
DELETE /api/v1/auth/withdraw           # 회원 탈퇴
```

#### 사용자 API

```
GET    /api/v1/users/me                # 내 정보 조회
PATCH  /api/v1/users/me                # 내 정보 수정
GET    /api/v1/users/:id               # 사용자 정보 조회
GET    /api/v1/users/:id/profile       # 사용자 프로필 조회
PATCH  /api/v1/users/me/profile        # 내 프로필 수정
POST   /api/v1/users/me/profile/image  # 프로필 이미지 업로드
```

#### 친구 API

```
GET    /api/v1/friends                 # 친구 목록 조회
POST   /api/v1/friends/request         # 친구 요청 보내기
GET    /api/v1/friends/requests        # 받은 친구 요청 목록
POST   /api/v1/friends/requests/:id/accept   # 친구 요청 수락
POST   /api/v1/friends/requests/:id/reject   # 친구 요청 거절
DELETE /api/v1/friends/:id             # 친구 삭제
POST   /api/v1/friends/:id/block       # 친구 차단
```

#### 부킹 API

```
GET    /api/v1/bookings                # 부킹 목록 조회 (필터링/페이징)
POST   /api/v1/bookings                # 부킹 생성
GET    /api/v1/bookings/:id            # 부킹 상세 조회
PATCH  /api/v1/bookings/:id            # 부킹 수정
DELETE /api/v1/bookings/:id            # 부킹 삭제
POST   /api/v1/bookings/:id/join       # 부킹 참가 신청
DELETE /api/v1/bookings/:id/leave      # 부킹 참가 취소
POST   /api/v1/bookings/:id/participants/:userId/approve  # 참가 승인
POST   /api/v1/bookings/:id/participants/:userId/reject   # 참가 거절
GET    /api/v1/bookings/:id/comments   # 댓글 목록
POST   /api/v1/bookings/:id/comments   # 댓글 작성
GET    /api/v1/bookings/my/hosted      # 내가 만든 부킹
GET    /api/v1/bookings/my/joined      # 내가 참가한 부킹
```

#### 결제 API

```
POST   /api/v1/payments/booking/:bookingId/prepare   # 부킹 결제 준비
POST   /api/v1/payments/confirm                      # 결제 승인
GET    /api/v1/payments/:id                          # 결제 상세 조회
GET    /api/v1/payments/history                      # 결제 내역 조회
POST   /api/v1/payments/:id/refund                   # 환불 요청
POST   /api/v1/payments/subscription/register        # 정기결제 등록
DELETE /api/v1/payments/subscription/cancel          # 정기결제 해지
```

#### 멤버십 API

```
GET    /api/v1/memberships/plans       # 멤버십 플랜 목록
GET    /api/v1/memberships/my          # 내 멤버십 정보
POST   /api/v1/memberships/subscribe   # 멤버십 구독
POST   /api/v1/memberships/cancel      # 멤버십 해지
```

#### 포인트 API

```
GET    /api/v1/points/balance          # 포인트 잔액 조회
GET    /api/v1/points/history          # 포인트 내역 조회
POST   /api/v1/points/use              # 포인트 사용
```

#### 중고거래 API

```
GET    /api/v1/products                # 상품 목록 조회
POST   /api/v1/products                # 상품 등록
GET    /api/v1/products/:id            # 상품 상세 조회
PATCH  /api/v1/products/:id            # 상품 수정
DELETE /api/v1/products/:id            # 상품 삭제
POST   /api/v1/products/:id/images     # 상품 이미지 업로드
PATCH  /api/v1/products/:id/status     # 상품 상태 변경
GET    /api/v1/products/my             # 내 상품 목록
POST   /api/v1/products/:id/purchase   # 구매 요청
```

#### 골프장 API

```
GET    /api/v1/golf-courses            # 골프장 목록 (검색/필터)
GET    /api/v1/golf-courses/:id        # 골프장 상세
GET    /api/v1/golf-courses/:id/reviews       # 골프장 리뷰 목록
POST   /api/v1/golf-courses/:id/reviews       # 골프장 리뷰 작성
GET    /api/v1/golf-courses/nearby     # 근처 골프장
```

#### 알림 API

```
GET    /api/v1/notifications           # 알림 목록
PATCH  /api/v1/notifications/:id/read  # 알림 읽음 처리
POST   /api/v1/notifications/read-all  # 전체 읽음 처리
DELETE /api/v1/notifications/:id       # 알림 삭제
PUT    /api/v1/notifications/settings  # 알림 설정 변경
```

### 4.2 API 응답 형식

#### 성공 응답

```typescript
// 단일 데이터
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "example"
  }
}

// 목록 데이터 (페이징)
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 에러 응답

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "올바른 이메일 형식이 아닙니다"
      }
    ]
  }
}
```

### 4.3 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|----------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `CONFLICT` | 409 | 충돌 (중복 등) |
| `PAYMENT_FAILED` | 402 | 결제 실패 |
| `RATE_LIMIT` | 429 | 요청 횟수 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

---

## 5. 인증 시스템

### 5.1 인증 흐름도

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          카카오 로그인 흐름                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────┐      ┌─────────┐      ┌─────────────┐      ┌─────────────┐
│  앱     │      │ 카카오   │      │ 백엔드 서버  │      │  Firebase   │
└────┬────┘      └────┬────┘      └──────┬──────┘      └──────┬──────┘
     │                │                   │                   │
     │ 1. 로그인 요청  │                   │                   │
     │───────────────>│                   │                   │
     │                │                   │                   │
     │ 2. 카카오 토큰  │                   │                   │
     │<───────────────│                   │                   │
     │                │                   │                   │
     │ 3. 토큰 + 프로필 전송               │                   │
     │────────────────────────────────────>│                   │
     │                │                   │                   │
     │                │                   │ 4. 토큰 검증        │
     │                │                   │──────────────────>│
     │                │                   │                   │
     │                │                   │ 5. 사용자 생성/조회 │
     │                │                   │<──────────────────│
     │                │                   │                   │
     │                │                   │ 6. Custom Token   │
     │                │                   │<──────────────────│
     │                │                   │                   │
     │ 7. Custom Token + 사용자 정보       │                   │
     │<────────────────────────────────────│                   │
     │                │                   │                   │
     │ 8. signInWithCustomToken           │                   │
     │────────────────────────────────────────────────────────>│
     │                │                   │                   │
     │ 9. Firebase ID Token               │                   │
     │<────────────────────────────────────────────────────────│
     │                │                   │                   │
     │ 10. API 요청 (Bearer Token)        │                   │
     │────────────────────────────────────>│                   │
     │                │                   │ 11. 토큰 검증      │
     │                │                   │──────────────────>│
     │                │                   │                   │
```

### 5.2 JWT 토큰 구조

```typescript
// Firebase ID Token Payload
{
  "iss": "https://securetoken.google.com/golf-pub",
  "aud": "golf-pub",
  "auth_time": 1234567890,
  "user_id": "firebase_uid",
  "sub": "firebase_uid",
  "iat": 1234567890,
  "exp": 1234567890,
  "email": "user@example.com",
  "email_verified": true,
  "firebase": {
    "identities": {
      "email": ["user@example.com"]
    },
    "sign_in_provider": "custom"
  },
  // Custom Claims
  "role": "user",
  "provider": "kakao",
  "membership": "premium"
}
```

### 5.3 인증 미들웨어

```typescript
// src/auth/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseAdminService } from '../services/firebase-admin.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private firebaseAdmin: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증 토큰이 필요합니다');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.firebaseAdmin.verifyIdToken(token);
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        provider: decodedToken.provider,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
```

---

## 6. 결제 시스템

### 6.1 Toss Payments 연동 흐름

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          결제 흐름 (부킹 참가)                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   앱    │      │ 백엔드 서버  │      │Toss Payments│      │  Database   │
└────┬────┘      └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
     │                  │                    │                    │
     │ 1. 결제 준비 요청 │                    │                    │
     │─────────────────>│                    │                    │
     │                  │                    │                    │
     │                  │ 2. 주문 정보 저장   │                    │
     │                  │───────────────────────────────────────>│
     │                  │                    │                    │
     │ 3. orderId 반환  │                    │                    │
     │<─────────────────│                    │                    │
     │                  │                    │                    │
     │ 4. Toss 결제창 호출                   │                    │
     │──────────────────────────────────────>│                    │
     │                  │                    │                    │
     │ 5. 결제 진행 (사용자)                 │                    │
     │<─────────────────────────────────────>│                    │
     │                  │                    │                    │
     │ 6. paymentKey 반환                   │                    │
     │<──────────────────────────────────────│                    │
     │                  │                    │                    │
     │ 7. 결제 승인 요청 (paymentKey, orderId, amount)            │
     │─────────────────>│                    │                    │
     │                  │                    │                    │
     │                  │ 8. 결제 승인 API   │                    │
     │                  │───────────────────>│                    │
     │                  │                    │                    │
     │                  │ 9. 승인 결과       │                    │
     │                  │<───────────────────│                    │
     │                  │                    │                    │
     │                  │ 10. 결제 정보 저장 │                    │
     │                  │───────────────────────────────────────>│
     │                  │                    │                    │
     │                  │ 11. 부킹 참가자 추가                    │
     │                  │───────────────────────────────────────>│
     │                  │                    │                    │
     │ 12. 결제 완료 응답│                    │                    │
     │<─────────────────│                    │                    │
```

### 6.2 결제 서비스 구현

```typescript
// src/payment/services/toss-payment.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import axios from 'axios';

@Injectable()
export class TossPaymentService {
  private readonly apiUrl = 'https://api.tosspayments.com/v1';
  private readonly secretKey: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.secretKey = this.config.get('TOSS_SECRET_KEY');
  }

  // 결제 준비 (주문 생성)
  async preparePayment(dto: PreparePaymentDto): Promise<PreparePaymentResult> {
    const orderId = this.generateOrderId();

    // 결제 정보 사전 저장
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        userId: dto.userId,
        amount: dto.amount,
        type: dto.type,
        status: 'PENDING',
        metadata: {
          bookingId: dto.bookingId,
          productId: dto.productId,
        },
      },
    });

    return {
      orderId,
      amount: dto.amount,
      orderName: dto.orderName,
      customerName: dto.customerName,
      successUrl: `${this.config.get('APP_URL')}/payment/success`,
      failUrl: `${this.config.get('APP_URL')}/payment/fail`,
    };
  }

  // 결제 승인
  async confirmPayment(dto: ConfirmPaymentDto): Promise<Payment> {
    // 저장된 결제 정보 확인
    const payment = await this.prisma.payment.findUnique({
      where: { orderId: dto.orderId },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다');
    }

    // 금액 검증
    if (payment.amount !== dto.amount) {
      throw new BadRequestException('결제 금액이 일치하지 않습니다');
    }

    // Toss Payments 승인 API 호출
    const authHeader = Buffer.from(`${this.secretKey}:`).toString('base64');

    try {
      const response = await axios.post(
        `${this.apiUrl}/payments/confirm`,
        {
          paymentKey: dto.paymentKey,
          orderId: dto.orderId,
          amount: dto.amount,
        },
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 결제 정보 업데이트
      const updatedPayment = await this.prisma.payment.update({
        where: { orderId: dto.orderId },
        data: {
          tossPaymentKey: dto.paymentKey,
          status: 'COMPLETED',
          method: this.mapPaymentMethod(response.data.method),
          paidAt: new Date(),
        },
      });

      // 부킹 참가자 승인 처리
      if (payment.metadata?.bookingId) {
        await this.handleBookingPayment(payment, updatedPayment);
      }

      return updatedPayment;
    } catch (error) {
      await this.prisma.payment.update({
        where: { orderId: dto.orderId },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException(error.response?.data?.message || '결제 승인 실패');
    }
  }

  // 환불 처리
  async refundPayment(paymentId: string, dto: RefundDto): Promise<PaymentRefund> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.status !== 'COMPLETED') {
      throw new BadRequestException('환불할 수 없는 결제입니다');
    }

    const authHeader = Buffer.from(`${this.secretKey}:`).toString('base64');

    try {
      await axios.post(
        `${this.apiUrl}/payments/${payment.tossPaymentKey}/cancel`,
        {
          cancelReason: dto.reason,
          cancelAmount: dto.amount || payment.amount,
        },
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const refund = await this.prisma.paymentRefund.create({
        data: {
          paymentId: payment.id,
          amount: dto.amount || payment.amount,
          reason: dto.reason,
          status: 'COMPLETED',
          refundedAt: new Date(),
        },
      });

      // 결제 상태 업데이트
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: dto.amount < payment.amount ? 'PARTIAL_REFUNDED' : 'REFUNDED',
        },
      });

      return refund;
    } catch (error) {
      throw new BadRequestException('환불 처리 실패');
    }
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `GP-${timestamp}-${random}`.toUpperCase();
  }
}
```

### 6.3 정기결제 (구독)

```typescript
// src/payment/services/subscription.service.ts
@Injectable()
export class SubscriptionService {
  // 빌링키 발급 (정기결제 카드 등록)
  async registerBillingKey(dto: RegisterBillingKeyDto): Promise<BillingKey> {
    const authHeader = Buffer.from(`${this.secretKey}:`).toString('base64');

    const response = await axios.post(
      `${this.apiUrl}/billing/authorizations/issue`,
      {
        authKey: dto.authKey,
        customerKey: dto.userId,
      },
      {
        headers: { Authorization: `Basic ${authHeader}` },
      },
    );

    // 빌링키 저장
    await this.prisma.subscription.create({
      data: {
        userId: dto.userId,
        planId: dto.planId,
        billingKey: response.data.billingKey,
        status: 'ACTIVE',
        nextBillingDate: this.calculateNextBillingDate(dto.planId),
      },
    });

    return response.data;
  }

  // 자동 결제 실행 (스케줄러에서 호출)
  async processBilling(subscriptionId: string): Promise<Payment> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new BadRequestException('유효하지 않은 구독입니다');
    }

    const orderId = this.generateOrderId();
    const authHeader = Buffer.from(`${this.secretKey}:`).toString('base64');

    try {
      const response = await axios.post(
        `${this.apiUrl}/billing/${subscription.billingKey}`,
        {
          amount: subscription.plan.price,
          orderId,
          orderName: `${subscription.plan.name} 정기결제`,
          customerKey: subscription.userId,
        },
        {
          headers: { Authorization: `Basic ${authHeader}` },
        },
      );

      // 결제 기록 저장
      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          userId: subscription.userId,
          tossPaymentKey: response.data.paymentKey,
          amount: subscription.plan.price,
          method: 'CARD',
          status: 'COMPLETED',
          type: 'MEMBERSHIP',
          paidAt: new Date(),
        },
      });

      // 다음 결제일 업데이트
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          nextBillingDate: this.calculateNextBillingDate(subscription.planId),
        },
      });

      // 멤버십 연장
      await this.extendMembership(subscription.userId, subscription.planId);

      return payment;
    } catch (error) {
      // 결제 실패 처리
      await this.handleBillingFailure(subscription);
      throw error;
    }
  }
}
```

---

## 7. 실시간 기능

### 7.1 Firebase Realtime Database 서비스

```typescript
// src/realtime/services/firebase-realtime.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseRealtimeService {
  private db: admin.database.Database;

  constructor() {
    this.db = admin.database();
  }

  // 채팅방 생성
  async createChatRoom(dto: CreateChatRoomDto): Promise<string> {
    const chatRef = this.db.ref('chats').push();

    await chatRef.set({
      type: dto.type,
      participants: dto.participantIds.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}),
      lastMessage: null,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    });

    // 참가자들의 채팅방 목록에 추가
    const updates = {};
    dto.participantIds.forEach(userId => {
      updates[`userChats/${userId}/${chatRef.key}`] = true;
    });
    await this.db.ref().update(updates);

    return chatRef.key;
  }

  // 메시지 전송
  async sendMessage(chatId: string, dto: SendMessageDto): Promise<string> {
    const messageRef = this.db.ref(`messages/${chatId}`).push();

    const message = {
      text: dto.text,
      senderId: dto.senderId,
      type: dto.type || 'text',
      imageUrl: dto.imageUrl || null,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      readBy: { [dto.senderId]: admin.database.ServerValue.TIMESTAMP },
    };

    await messageRef.set(message);

    // 마지막 메시지 업데이트
    await this.db.ref(`chats/${chatId}`).update({
      lastMessage: {
        text: dto.text,
        senderId: dto.senderId,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      },
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    });

    // 참가자들에게 푸시 알림 전송
    await this.sendChatNotification(chatId, dto);

    return messageRef.key;
  }

  // 메시지 읽음 처리
  async markAsRead(chatId: string, userId: string): Promise<void> {
    const messagesRef = this.db.ref(`messages/${chatId}`);
    const snapshot = await messagesRef.once('value');

    const updates = {};
    snapshot.forEach(child => {
      if (!child.val().readBy?.[userId]) {
        updates[`${child.key}/readBy/${userId}`] = admin.database.ServerValue.TIMESTAMP;
      }
    });

    if (Object.keys(updates).length > 0) {
      await messagesRef.update(updates);
    }
  }

  // 온라인 상태 관리
  async setUserPresence(userId: string, online: boolean): Promise<void> {
    const presenceRef = this.db.ref(`userPresence/${userId}`);

    if (online) {
      await presenceRef.set({
        online: true,
        lastSeen: admin.database.ServerValue.TIMESTAMP,
      });

      // 연결 해제 시 자동으로 오프라인 처리
      presenceRef.onDisconnect().set({
        online: false,
        lastSeen: admin.database.ServerValue.TIMESTAMP,
      });
    } else {
      await presenceRef.set({
        online: false,
        lastSeen: admin.database.ServerValue.TIMESTAMP,
      });
    }
  }

  // 타이핑 상태
  async setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    const typingRef = this.db.ref(`typing/${chatId}/${userId}`);

    if (isTyping) {
      await typingRef.set({
        isTyping: true,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      // 5초 후 자동 해제
      typingRef.onDisconnect().remove();
    } else {
      await typingRef.remove();
    }
  }
}
```

### 7.2 실시간 알림 처리

```typescript
// src/realtime/services/notification-realtime.service.ts
@Injectable()
export class NotificationRealtimeService {
  // 실시간 알림 추가
  async addNotification(userId: string, notification: NotificationDto): Promise<string> {
    const notifRef = this.db.ref(`notifications/${userId}`).push();

    await notifRef.set({
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      read: false,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });

    return notifRef.key;
  }

  // 알림 읽음 처리
  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    await this.db.ref(`notifications/${userId}/${notificationId}`).update({
      read: true,
    });
  }

  // 모든 알림 읽음 처리
  async markAllAsRead(userId: string): Promise<void> {
    const snapshot = await this.db.ref(`notifications/${userId}`).once('value');

    const updates = {};
    snapshot.forEach(child => {
      if (!child.val().read) {
        updates[`${child.key}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await this.db.ref(`notifications/${userId}`).update(updates);
    }
  }
}
```

---

## 8. 파일 저장소

### 8.1 Firebase Storage 서비스

```typescript
// src/storage/services/firebase-storage.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

@Injectable()
export class FirebaseStorageService {
  private bucket: admin.storage.Bucket;

  constructor() {
    this.bucket = admin.storage().bucket();
  }

  // 이미지 업로드 (리사이징 포함)
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const filename = `${folder}/${uuidv4()}.webp`;
    const fileRef = this.bucket.file(filename);

    // 이미지 리사이징 및 WebP 변환
    const resizedBuffer = await sharp(file.buffer)
      .resize(options?.maxWidth || 1200, options?.maxHeight || 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: options?.quality || 80 })
      .toBuffer();

    // 업로드
    await fileRef.save(resizedBuffer, {
      metadata: {
        contentType: 'image/webp',
        metadata: {
          uploadedBy: options?.userId,
          originalName: file.originalname,
        },
      },
    });

    // Public URL 생성
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filename}`;

    // 썸네일 생성 (선택사항)
    let thumbnailUrl: string | null = null;
    if (options?.createThumbnail) {
      thumbnailUrl = await this.createThumbnail(file.buffer, folder);
    }

    return {
      url: publicUrl,
      thumbnailUrl,
      filename,
      size: resizedBuffer.length,
    };
  }

  // 썸네일 생성
  private async createThumbnail(buffer: Buffer, folder: string): Promise<string> {
    const filename = `${folder}/thumbnails/${uuidv4()}.webp`;
    const fileRef = this.bucket.file(filename);

    const thumbnailBuffer = await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 60 })
      .toBuffer();

    await fileRef.save(thumbnailBuffer, {
      metadata: { contentType: 'image/webp' },
    });

    await fileRef.makePublic();
    return `https://storage.googleapis.com/${this.bucket.name}/${filename}`;
  }

  // 파일 삭제
  async deleteFile(filename: string): Promise<void> {
    try {
      await this.bucket.file(filename).delete();
    } catch (error) {
      if (error.code !== 404) throw error;
    }
  }

  // Signed URL 생성 (비공개 파일용)
  async getSignedUrl(filename: string, expiresIn: number = 3600): Promise<string> {
    const [url] = await this.bucket.file(filename).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }
}
```

### 8.2 업로드 폴더 구조

```
golf-pub-storage/
├── profiles/           # 프로필 이미지
│   ├── {userId}.webp
│   └── thumbnails/
│       └── {userId}.webp
│
├── products/           # 상품 이미지
│   ├── {productId}/
│   │   ├── 1.webp
│   │   ├── 2.webp
│   │   └── thumbnails/
│   │       └── 1.webp
│
├── chat/               # 채팅 이미지
│   ├── {chatId}/
│   │   └── {messageId}.webp
│
├── reviews/            # 리뷰 이미지
│   ├── golf-courses/
│   │   └── {reviewId}/
│   └── pubs/
│       └── {reviewId}/
│
└── posts/              # 피드 게시물 이미지
    └── {postId}/
```

---

## 9. 알림 시스템

### 9.1 FCM 푸시 알림

```typescript
// src/notification/services/fcm.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class FcmService {
  constructor(private prisma: PrismaService) {}

  // 단일 사용자에게 푸시 알림
  async sendToUser(userId: string, notification: PushNotification): Promise<void> {
    const tokens = await this.getUserFcmTokens(userId);
    if (tokens.length === 0) return;

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        type: notification.type,
        ...notification.data,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: this.getChannelId(notification.type),
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: await this.getUnreadCount(userId),
          },
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      // 실패한 토큰 정리
      if (response.failureCount > 0) {
        const failedTokens = tokens.filter((_, i) => !response.responses[i].success);
        await this.removeInvalidTokens(userId, failedTokens);
      }
    } catch (error) {
      console.error('FCM 전송 실패:', error);
    }
  }

  // 여러 사용자에게 푸시 알림
  async sendToUsers(userIds: string[], notification: PushNotification): Promise<void> {
    await Promise.all(userIds.map(userId => this.sendToUser(userId, notification)));
  }

  // 토픽 구독
  async subscribeToTopic(userId: string, topic: string): Promise<void> {
    const tokens = await this.getUserFcmTokens(userId);
    if (tokens.length > 0) {
      await admin.messaging().subscribeToTopic(tokens, topic);
    }
  }

  // 토픽으로 푸시 알림
  async sendToTopic(topic: string, notification: PushNotification): Promise<void> {
    await admin.messaging().send({
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
    });
  }

  private getChannelId(type: NotificationType): string {
    const channels: Record<NotificationType, string> = {
      CHAT: 'chat_messages',
      BOOKING: 'booking_updates',
      FRIEND: 'friend_requests',
      PAYMENT: 'payment_updates',
      SYSTEM: 'system_notifications',
    };
    return channels[type] || 'default';
  }
}
```

### 9.2 알림 유형 및 템플릿

```typescript
// src/notification/templates/notification-templates.ts
export const NotificationTemplates = {
  // 친구 요청
  FRIEND_REQUEST: (senderName: string) => ({
    title: '친구 요청',
    body: `${senderName}님이 친구 요청을 보냈습니다`,
    type: 'FRIEND',
  }),

  // 친구 요청 수락
  FRIEND_ACCEPTED: (friendName: string) => ({
    title: '친구 추가 완료',
    body: `${friendName}님과 친구가 되었습니다`,
    type: 'FRIEND',
  }),

  // 부킹 참가 신청
  BOOKING_JOIN_REQUEST: (userName: string, bookingTitle: string) => ({
    title: '참가 신청',
    body: `${userName}님이 "${bookingTitle}" 부킹에 참가 신청했습니다`,
    type: 'BOOKING',
  }),

  // 부킹 참가 승인
  BOOKING_APPROVED: (bookingTitle: string) => ({
    title: '참가 승인',
    body: `"${bookingTitle}" 부킹 참가가 승인되었습니다`,
    type: 'BOOKING',
  }),

  // 부킹 참가 거절
  BOOKING_REJECTED: (bookingTitle: string) => ({
    title: '참가 거절',
    body: `"${bookingTitle}" 부킹 참가가 거절되었습니다`,
    type: 'BOOKING',
  }),

  // 새 채팅 메시지
  NEW_MESSAGE: (senderName: string, preview: string) => ({
    title: senderName,
    body: preview.length > 50 ? `${preview.substring(0, 50)}...` : preview,
    type: 'CHAT',
  }),

  // 결제 완료
  PAYMENT_COMPLETED: (orderName: string, amount: number) => ({
    title: '결제 완료',
    body: `${orderName} ${amount.toLocaleString()}원 결제가 완료되었습니다`,
    type: 'PAYMENT',
  }),

  // 환불 완료
  REFUND_COMPLETED: (amount: number) => ({
    title: '환불 완료',
    body: `${amount.toLocaleString()}원이 환불되었습니다`,
    type: 'PAYMENT',
  }),

  // 멤버십 만료 예정
  MEMBERSHIP_EXPIRING: (daysLeft: number) => ({
    title: '멤버십 만료 예정',
    body: `멤버십이 ${daysLeft}일 후 만료됩니다. 갱신해주세요!`,
    type: 'SYSTEM',
  }),
};
```

---

## 10. 보안 설계

### 10.1 보안 체크리스트

#### API 보안
- [x] HTTPS 강제 (TLS 1.3)
- [x] JWT 토큰 기반 인증
- [x] Rate Limiting (Redis)
- [x] CORS 설정
- [x] Helmet.js (보안 헤더)
- [x] Input Validation (class-validator)
- [x] SQL Injection 방지 (Prisma ORM)
- [x] XSS 방지 (sanitize-html)

#### 데이터 보안
- [x] 비밀번호 해싱 (bcrypt, salt rounds: 12)
- [x] 민감 정보 암호화 (AES-256)
- [x] 환경 변수 관리 (.env)
- [x] 결제 정보 토큰화 (Toss 빌링키)
- [x] 로그 마스킹

#### 인프라 보안
- [x] VPC 네트워크 격리
- [x] 방화벽 규칙
- [x] DDoS 방어 (Cloudflare)
- [x] 정기 보안 업데이트
- [x] 침입 탐지 시스템

### 10.2 Rate Limiting 설정

```typescript
// src/common/guards/rate-limit.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';

// Rate Limit 설정
export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    // 전역: 1분에 60회
    {
      name: 'short',
      ttl: 60000,
      limit: 60,
    },
    // 장기: 1시간에 1000회
    {
      name: 'long',
      ttl: 3600000,
      limit: 1000,
    },
  ],
};

// 특정 엔드포인트별 제한
export const RateLimits = {
  // 로그인: 5분에 10회
  LOGIN: { ttl: 300000, limit: 10 },
  // SMS 인증: 1분에 3회
  SMS_VERIFY: { ttl: 60000, limit: 3 },
  // 결제: 1분에 5회
  PAYMENT: { ttl: 60000, limit: 5 },
  // 파일 업로드: 1분에 10회
  UPLOAD: { ttl: 60000, limit: 10 },
};
```

### 10.3 Firebase 보안 규칙

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근
    function isAuthenticated() {
      return request.auth != null;
    }

    // 본인 확인
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // 관리자 확인
    function isAdmin() {
      return request.auth.token.role == 'admin';
    }

    // 사용자 컬렉션
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();

      // 서브컬렉션
      match /friends/{friendId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
    }

    // 부킹 컬렉션
    match /bookings/{bookingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
        resource.data.hostId == request.auth.uid;
    }

    // 상품 컬렉션
    match /products/{productId} {
      allow read: if true;  // 공개 읽기
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
        resource.data.sellerId == request.auth.uid;
    }
  }
}

// Realtime Database Rules
{
  "rules": {
    "chats": {
      "$chatId": {
        ".read": "auth != null && data.child('participants').child(auth.uid).exists()",
        ".write": "auth != null && data.child('participants').child(auth.uid).exists()"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null && root.child('chats').child($chatId).child('participants').child(auth.uid).exists()",
        ".write": "auth != null && root.child('chats').child($chatId).child('participants').child(auth.uid).exists()"
      }
    },
    "userPresence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "notifications": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 11. 배포 및 인프라

### 11.1 Docker 설정

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# 빌드
COPY . .
RUN npm run build
RUN npx prisma generate

# 프로덕션 이미지
FROM node:20-alpine AS runner

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# 환경 변수
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/golfpub
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: golfpub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 11.2 Kubernetes 배포

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: golf-pub-api
  labels:
    app: golf-pub-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: golf-pub-api
  template:
    metadata:
      labels:
        app: golf-pub-api
    spec:
      containers:
        - name: api
          image: gcr.io/golf-pub/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: golf-pub-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: golf-pub-secrets
                  key: redis-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: golf-pub-api-service
spec:
  selector:
    app: golf-pub-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: golf-pub-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: golf-pub-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### 11.3 CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  PROJECT_ID: golf-pub
  GKE_CLUSTER: golf-pub-cluster
  GKE_ZONE: asia-northeast3-a
  IMAGE: gcr.io/golf-pub/api

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ env.PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}

      - name: Configure Docker
        run: gcloud auth configure-docker

      - name: Build Docker image
        run: |
          docker build -t $IMAGE:${{ github.sha }} .
          docker tag $IMAGE:${{ github.sha }} $IMAGE:latest

      - name: Push to GCR
        run: |
          docker push $IMAGE:${{ github.sha }}
          docker push $IMAGE:latest

      - name: Get GKE credentials
        run: |
          gcloud container clusters get-credentials $GKE_CLUSTER --zone $GKE_ZONE

      - name: Deploy to GKE
        run: |
          kubectl set image deployment/golf-pub-api api=$IMAGE:${{ github.sha }}
          kubectl rollout status deployment/golf-pub-api

      - name: Run database migrations
        run: |
          kubectl exec -it deployment/golf-pub-api -- npx prisma migrate deploy
```

### 11.4 비용 추정 (월간)

| 서비스 | 사양 | 예상 비용 |
|--------|------|----------|
| **GKE (Kubernetes)** | e2-medium x 3 nodes | ~$100 |
| **Cloud SQL (PostgreSQL)** | db-g1-small | ~$30 |
| **Redis (Memorystore)** | 1GB | ~$30 |
| **Firebase** | Blaze (종량제) | ~$20 |
| **Cloud Storage** | 50GB | ~$5 |
| **Cloud CDN** | 100GB 전송 | ~$10 |
| **Monitoring** | 기본 | $0 |
| **합계** | | **~$195/월** |

> 초기 단계에서는 Railway + Supabase 조합으로 $20/월 이하로 시작 가능

---

## 12. 개발 로드맵

### Phase 1: 핵심 인프라 (2주)

```
Week 1:
├── [ ] NestJS 프로젝트 셋업
├── [ ] Prisma + PostgreSQL 연결
├── [ ] Firebase Admin SDK 설정
├── [ ] Docker 환경 구성
└── [ ] 기본 CI/CD 파이프라인

Week 2:
├── [ ] 인증 시스템 (카카오/이메일)
├── [ ] 사용자 CRUD API
├── [ ] Firebase Custom Token 발급
└── [ ] API 문서화 (Swagger)
```

### Phase 2: 핵심 기능 (3주)

```
Week 3:
├── [ ] 부킹 CRUD API
├── [ ] 부킹 참가 관리
├── [ ] 부킹 필터링/검색
└── [ ] 부킹 알림

Week 4:
├── [ ] Toss Payments 연동
├── [ ] 결제 API
├── [ ] 환불 처리
└── [ ] 결제 웹훅

Week 5:
├── [ ] 친구 시스템 API
├── [ ] 중고거래 API
├── [ ] 이미지 업로드
└── [ ] FCM 푸시 알림
```

### Phase 3: 고급 기능 (2주)

```
Week 6:
├── [ ] 멤버십 시스템
├── [ ] 정기결제 (구독)
├── [ ] 포인트 시스템
└── [ ] 쿠폰 시스템

Week 7:
├── [ ] 골프장 API
├── [ ] 리뷰 시스템
├── [ ] 검색 (Elasticsearch)
└── [ ] 성능 최적화
```

### Phase 4: 안정화 (1주)

```
Week 8:
├── [ ] 부하 테스트
├── [ ] 보안 점검
├── [ ] 모니터링 설정
├── [ ] 문서화 완료
└── [ ] 프로덕션 배포
```

---

## 부록

### A. 환경 변수 목록

```env
# 서버
NODE_ENV=production
PORT=3000
API_URL=https://api.golfpub.app

# 데이터베이스
DATABASE_URL=postgresql://user:password@host:5432/golfpub
REDIS_URL=redis://host:6379

# Firebase
FIREBASE_PROJECT_ID=golf-pub
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@golf-pub.iam.gserviceaccount.com

# Toss Payments
TOSS_CLIENT_KEY=test_ck_xxx
TOSS_SECRET_KEY=test_sk_xxx

# 카카오
KAKAO_REST_API_KEY=xxx
KAKAO_ADMIN_KEY=xxx

# 보안
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-byte-encryption-key

# 외부 API
WEATHER_API_KEY=xxx
```

### B. API 테스트 (Postman Collection)

Postman Collection 다운로드: `docs/GolfPub-API.postman_collection.json`

### C. 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [Prisma 공식 문서](https://www.prisma.io/docs/)
- [Toss Payments API](https://docs.tosspayments.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Kakao Login API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

---

> 이 문서는 Golf Pub 앱 백엔드 개발의 가이드라인입니다.
> 실제 구현 시 비즈니스 요구사항에 따라 조정될 수 있습니다.
