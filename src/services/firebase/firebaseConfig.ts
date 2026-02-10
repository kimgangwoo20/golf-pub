// 🔥 firebaseConfig.ts
// Firebase 초기화 및 설정 (Modular API)
// @react-native-firebase는 google-services.json을 통해 자동 초기화됩니다

import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  runTransaction,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  FieldPath,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getStorage, ref as storageRef } from '@react-native-firebase/storage';
import {
  getDatabase,
  ref as databaseRef,
  serverTimestamp as rtdbServerTimestamp,
} from '@react-native-firebase/database';
import { getMessaging } from '@react-native-firebase/messaging';

// Modular 인스턴스 생성
const firestoreInstance = getFirestore();
const authInstance = getAuth();
const storageInstance = getStorage();
const databaseInstance = getDatabase();
const messagingInstance = getMessaging();

/**
 * Firestore 컬렉션 참조 (modular)
 */
export const collections = {
  // 사용자
  users: () => collection(firestoreInstance, 'users'),

  // 부킹
  bookings: () => collection(firestoreInstance, 'bookings'),
  bookingComments: (bookingId: string) =>
    collection(firestoreInstance, 'bookings', bookingId, 'comments'),
  bookingParticipants: (bookingId: string) =>
    collection(firestoreInstance, 'bookings', bookingId, 'participants'),

  // 중고거래
  products: () => collection(firestoreInstance, 'products'),
  productComments: (productId: string) =>
    collection(firestoreInstance, 'products', productId, 'comments'),

  // 친구
  friends: (userId: string) => collection(firestoreInstance, 'users', userId, 'friends'),
  friendRequests: (userId: string) =>
    collection(firestoreInstance, 'users', userId, 'friendRequests'),

  // 피드
  posts: () => collection(firestoreInstance, 'posts'),
  postComments: (postId: string) => collection(firestoreInstance, 'posts', postId, 'comments'),
  postLikes: (postId: string) => collection(firestoreInstance, 'posts', postId, 'likes'),

  // 술집
  pubs: () => collection(firestoreInstance, 'pubs'),
  pubReviews: (pubId: string) => collection(firestoreInstance, 'pubs', pubId, 'reviews'),

  // 골프장
  golfCourses: () => collection(firestoreInstance, 'golfCourses'),
  golfCourseReviews: (courseId: string) =>
    collection(firestoreInstance, 'golfCourses', courseId, 'reviews'),

  // 알림
  notifications: (userId: string) =>
    collection(firestoreInstance, 'users', userId, 'notifications'),

  // 트랜잭션
  transactions: () => collection(firestoreInstance, 'transactions'),

  // 멤버십
  memberships: (userId: string) => collection(firestoreInstance, 'users', userId, 'memberships'),

  // 포인트
  pointHistory: (userId: string) => collection(firestoreInstance, 'users', userId, 'pointHistory'),

  // 쿠폰
  coupons: (userId: string) => collection(firestoreInstance, 'users', userId, 'coupons'),
};

/**
 * Realtime Database 참조 (modular)
 */
export const realtimeRefs = {
  // 채팅방 목록
  chatRooms: (userId: string) => databaseRef(databaseInstance, `chatRooms/${userId}`),

  // 특정 채팅방
  chatRoom: (roomId: string) => databaseRef(databaseInstance, `chatRooms/${roomId}`),

  // 메시지
  messages: (roomId: string) => databaseRef(databaseInstance, `messages/${roomId}`),

  // 특정 메시지
  message: (roomId: string, messageId: string) =>
    databaseRef(databaseInstance, `messages/${roomId}/${messageId}`),

  // 온라인 상태
  presence: (userId: string) => databaseRef(databaseInstance, `presence/${userId}`),

  // 타이핑 상태
  typing: (roomId: string, userId: string) =>
    databaseRef(databaseInstance, `typing/${roomId}/${userId}`),

  // 읽음 상태
  readReceipts: (roomId: string, userId: string) =>
    databaseRef(databaseInstance, `readReceipts/${roomId}/${userId}`),
};

/**
 * Storage 참조 (modular)
 */
export const storageRefs = {
  // 프로필 이미지
  profileImages: (userId: string) => storageRef(storageInstance, `profiles/${userId}/avatar.jpg`),

  // 채팅 이미지
  chatImages: (roomId: string, imageId: string) =>
    storageRef(storageInstance, `chats/${roomId}/${imageId}.jpg`),

  // 부킹 이미지
  bookingImages: (bookingId: string, imageId: string) =>
    storageRef(storageInstance, `bookings/${bookingId}/${imageId}.jpg`),

  // 상품 이미지
  productImages: (productId: string, imageId: string) =>
    storageRef(storageInstance, `products/${productId}/${imageId}.jpg`),

  // 포스트 이미지
  postImages: (postId: string, imageId: string) =>
    storageRef(storageInstance, `posts/${postId}/${imageId}.jpg`),

  // 리뷰 이미지
  reviewImages: (reviewId: string, imageId: string) =>
    storageRef(storageInstance, `reviews/${reviewId}/${imageId}.jpg`),
};

/**
 * FieldPath.documentId() 유틸리티
 * 모듈러 API의 FieldPath 타입 정의에 documentId()가 누락되어 있으므로 런타임 캐스트 사용
 */
export const documentId = (): FieldPath => (FieldPath as any).documentId();

/**
 * Firestore Timestamp 유틸리티
 */
export const FirestoreTimestamp = {
  now: () => serverTimestamp(),
  fromDate: (date: Date) => Timestamp.fromDate(date),
  toDate: (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return new Date();
  },
};

/**
 * Realtime Database Timestamp 유틸리티
 */
export const RealtimeTimestamp = {
  now: () => rtdbServerTimestamp(),
};

/**
 * 에러 핸들링 유틸리티
 */
export const handleFirebaseError = (error: any): string => {
  // Firebase 에러 코드 매핑
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': '잘못된 이메일 형식입니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/user-not-found': '사용자를 찾을 수 없습니다.',
    'auth/wrong-password': '잘못된 비밀번호입니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'firestore/permission-denied': '권한이 없습니다.',
    'firestore/unavailable': '서버와 연결할 수 없습니다.',
    'storage/unauthorized': '파일 업로드 권한이 없습니다.',
    'storage/canceled': '파일 업로드가 취소되었습니다.',
    'storage/unknown': '파일 업로드 중 오류가 발생했습니다.',
  };

  return errorMessages[error.code] || '알 수 없는 오류가 발생했습니다.';
};

/**
 * Modular 유틸 re-exports (소비자 파일에서 직접 import 대신 사용)
 */
export {
  collection,
  doc,
  writeBatch,
  runTransaction,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  FieldPath,
};

// Firestore modular 추가 함수 re-export
export {
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  startAfter,
  collectionGroup,
  increment,
  arrayUnion,
  arrayRemove,
} from '@react-native-firebase/firestore';

// Auth modular 함수 re-export
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithCustomToken,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser,
} from '@react-native-firebase/auth';

// Storage modular 함수 re-export
export { ref as storageRefFn, getDownloadURL, deleteObject } from '@react-native-firebase/storage';

// Database modular 함수 re-export
export {
  ref as databaseRefFn,
  set as rtdbSet,
  update as rtdbUpdate,
  get as rtdbGet,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  push as rtdbPush,
  remove as rtdbRemove,
  off as rtdbOff,
} from '@react-native-firebase/database';

// Messaging modular 함수 re-export
export {
  getToken as getMessagingToken,
  onMessage,
  onTokenRefresh,
  requestPermission as requestMessagingPermission,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

// Functions modular 함수 re-export
export { getFunctions, httpsCallable } from '@react-native-firebase/functions';

/**
 * Export instances
 */
export {
  firestoreInstance as firestore,
  databaseInstance as database,
  storageInstance as storage,
  messagingInstance as messaging,
  authInstance as auth,
};
