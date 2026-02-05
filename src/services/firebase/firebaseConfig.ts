// 🔥 firebaseConfig.ts
// Firebase 초기화 및 설정
// @react-native-firebase는 google-services.json을 통해 자동 초기화됩니다

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';

// Firebase 앱 참조 (자동 초기화됨)
const firebaseApp = firebase.app();
console.log('✅ Firebase 연결됨:', firebaseApp.name);

// Firestore 설정 (서울 리전)
const firestoreInstance = firestore();

// 오프라인 지속성 활성화
firestoreInstance.settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  persistence: true,
});

console.log('✅ Firestore 오프라인 지속성 활성화');

// Realtime Database 설정 (서울 리전)
const databaseInstance = database();

// 오프라인 지속성 활성화
databaseInstance.setPersistenceEnabled(true);
databaseInstance.setPersistenceCacheSizeBytes(10000000); // 10MB

console.log('✅ Realtime Database 오프라인 지속성 활성화');

// Storage 설정
const storageInstance = storage();

// 업로드 타임아웃 설정 (60초)
storageInstance.setMaxUploadRetryTime(60000);

// Messaging 설정
const messagingInstance = messaging();

// Auth 설정
const authInstance = auth();

/**
 * Firestore 컬렉션 참조
 */
export const collections = {
  // 사용자
  users: () => firestoreInstance.collection('users'),

  // 부킹
  bookings: () => firestoreInstance.collection('bookings'),
  bookingComments: (bookingId: string) =>
    firestoreInstance.collection('bookings').doc(bookingId).collection('comments'),
  bookingParticipants: (bookingId: string) =>
    firestoreInstance.collection('bookings').doc(bookingId).collection('participants'),

  // 중고거래
  products: () => firestoreInstance.collection('products'),
  productComments: (productId: string) =>
    firestoreInstance.collection('products').doc(productId).collection('comments'),

  // 친구
  friends: (userId: string) =>
    firestoreInstance.collection('users').doc(userId).collection('friends'),
  friendRequests: (userId: string) =>
    firestoreInstance.collection('users').doc(userId).collection('friendRequests'),

  // 피드
  posts: () => firestoreInstance.collection('posts'),
  postComments: (postId: string) =>
    firestoreInstance.collection('posts').doc(postId).collection('comments'),
  postLikes: (postId: string) =>
    firestoreInstance.collection('posts').doc(postId).collection('likes'),

  // 술집
  pubs: () => firestoreInstance.collection('pubs'),
  pubReviews: (pubId: string) =>
    firestoreInstance.collection('pubs').doc(pubId).collection('reviews'),

  // 골프장
  golfCourses: () => firestoreInstance.collection('golfCourses'),
  golfCourseReviews: (courseId: string) =>
    firestoreInstance.collection('golfCourses').doc(courseId).collection('reviews'),

  // 알림
  notifications: (userId: string) =>
    firestoreInstance.collection('users').doc(userId).collection('notifications'),

  // 트랜잭션
  transactions: () => firestoreInstance.collection('transactions'),

  // 멤버십
  memberships: (userId: string) =>
    firestoreInstance.collection('users').doc(userId).collection('memberships'),

  // 포인트
  pointHistory: (userId: string) =>
    firestoreInstance.collection('users').doc(userId).collection('pointHistory'),

  // 쿠폰
  coupons: (userId: string) =>
    firestoreInstance.collection('users').doc(userId).collection('coupons'),
};

/**
 * Realtime Database 참조
 */
export const realtimeRefs = {
  // 채팅방 목록
  chatRooms: (userId: string) =>
    databaseInstance.ref(`chatRooms/${userId}`),

  // 특정 채팅방
  chatRoom: (roomId: string) =>
    databaseInstance.ref(`chatRooms/${roomId}`),

  // 메시지
  messages: (roomId: string) =>
    databaseInstance.ref(`messages/${roomId}`),

  // 특정 메시지
  message: (roomId: string, messageId: string) =>
    databaseInstance.ref(`messages/${roomId}/${messageId}`),

  // 온라인 상태
  presence: (userId: string) =>
    databaseInstance.ref(`presence/${userId}`),

  // 타이핑 상태
  typing: (roomId: string, userId: string) =>
    databaseInstance.ref(`typing/${roomId}/${userId}`),

  // 읽음 상태
  readReceipts: (roomId: string, userId: string) =>
    databaseInstance.ref(`readReceipts/${roomId}/${userId}`),
};

/**
 * Storage 참조
 */
export const storageRefs = {
  // 프로필 이미지
  profileImages: (userId: string) =>
    storageInstance.ref(`profiles/${userId}/avatar.jpg`),

  // 채팅 이미지
  chatImages: (roomId: string, imageId: string) =>
    storageInstance.ref(`chats/${roomId}/${imageId}.jpg`),

  // 부킹 이미지
  bookingImages: (bookingId: string, imageId: string) =>
    storageInstance.ref(`bookings/${bookingId}/${imageId}.jpg`),

  // 상품 이미지
  productImages: (productId: string, imageId: string) =>
    storageInstance.ref(`products/${productId}/${imageId}.jpg`),

  // 포스트 이미지
  postImages: (postId: string, imageId: string) =>
    storageInstance.ref(`posts/${postId}/${imageId}.jpg`),

  // 리뷰 이미지
  reviewImages: (reviewId: string, imageId: string) =>
    storageInstance.ref(`reviews/${reviewId}/${imageId}.jpg`),
};

/**
 * Firestore Timestamp 유틸리티
 */
export const FirestoreTimestamp = {
  now: () => firestore.FieldValue.serverTimestamp(),
  fromDate: (date: Date) => firestore.Timestamp.fromDate(date),
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
  now: () => database.ServerValue.TIMESTAMP,
};

/**
 * 에러 핸들링 유틸리티
 */
export const handleFirebaseError = (error: any): string => {
  console.error('Firebase Error:', error);

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
 * Export instances
 */
export {
  firebaseApp,
  firestoreInstance as firestore,
  databaseInstance as database,
  storageInstance as storage,
  messagingInstance as messaging,
  authInstance as auth,
};

export default firebaseApp;