/**
 * 개발용 Seed 데이터 생성 유틸리티
 * 앱 내에서 실행 가능 (Firebase Admin SDK 불필요)
 *
 * 사용법:
 * import { seedDemoData } from '@/utils/seedData';
 * await seedDemoData();
 */
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const BOOKINGS_COLLECTION = 'bookings';
const PRODUCTS_COLLECTION = 'products';
const POSTS_COLLECTION = 'posts';

// 시드 데이터 중복 생성 방지용 체크
const checkAlreadySeeded = async (collection: string, field: string, value: string): Promise<boolean> => {
  const snapshot = await firestore()
    .collection(collection)
    .where(field, '==', value)
    .limit(1)
    .get();
  return !snapshot.empty;
};

// 부킹 시드 데이터 (3건)
const seedBookings = async (uid: string, displayName: string) => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 중복 체크
  const alreadySeeded = await checkAlreadySeeded(BOOKINGS_COLLECTION, 'seedId', 'seed-booking-1');
  if (alreadySeeded) {
    return;
  }

  const bookings = [
    {
      seedId: 'seed-booking-1',
      title: '주말 라운딩 함께해요',
      golfCourse: '블루원 용인CC',
      golfCourseId: 'bluone-yongin',
      date: nextWeek.toISOString().split('T')[0],
      time: '07:00',
      maxPlayers: 4,
      currentPlayers: 2,
      status: 'OPEN',
      hostId: uid,
      hostName: displayName,
      description: '주말에 가볍게 라운딩 하실 분 구합니다. 초보자도 환영!',
      fee: 150000,
      skillLevel: 'ALL',
      participants: {
        current: 2,
        max: 4,
        members: [
          { uid, name: displayName, role: 'host' },
          { uid: 'demo-user-2', name: '김골프', role: 'member' },
        ],
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    {
      seedId: 'seed-booking-2',
      title: '평일 조인 모집',
      golfCourse: '남서울CC',
      golfCourseId: 'namseoul-cc',
      date: nextMonth.toISOString().split('T')[0],
      time: '09:30',
      maxPlayers: 3,
      currentPlayers: 1,
      status: 'OPEN',
      hostId: uid,
      hostName: displayName,
      description: '평일 오전 조인 구합니다. 비용 나눠서!',
      fee: 120000,
      skillLevel: 'INTERMEDIATE',
      participants: {
        current: 1,
        max: 3,
        members: [
          { uid, name: displayName, role: 'host' },
        ],
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    {
      seedId: 'seed-booking-3',
      title: '지난주 완료된 라운딩',
      golfCourse: '파인밸리CC',
      golfCourseId: 'pine-valley-cc',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '06:30',
      maxPlayers: 4,
      currentPlayers: 4,
      status: 'COMPLETED',
      hostId: uid,
      hostName: displayName,
      description: '즐거운 라운딩이었습니다!',
      fee: 180000,
      skillLevel: 'ADVANCED',
      participants: {
        current: 4,
        max: 4,
        members: [
          { uid, name: displayName, role: 'host' },
          { uid: 'demo-user-2', name: '김골프', role: 'member' },
          { uid: 'demo-user-3', name: '이파크', role: 'member' },
          { uid: 'demo-user-4', name: '박드라이버', role: 'member' },
        ],
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
  ];

  const batch = firestore().batch();
  for (const booking of bookings) {
    const ref = firestore().collection(BOOKINGS_COLLECTION).doc();
    batch.set(ref, booking);
  }
  await batch.commit();
};

// 피드 게시글 시드 데이터 (3건)
const seedPosts = async (uid: string, displayName: string, photoURL: string) => {
  const alreadySeeded = await checkAlreadySeeded(POSTS_COLLECTION, 'seedId', 'seed-post-1');
  if (alreadySeeded) {
    return;
  }

  const posts = [
    {
      seedId: 'seed-post-1',
      author: {
        id: uid,
        name: displayName,
        image: photoURL,
      },
      content: '오늘 블루원 용인CC에서 라운딩 다녀왔습니다! 날씨가 정말 좋았네요. 드라이버가 잘 맞아서 기분 좋은 하루였습니다 ⛳',
      images: [],
      hashtags: ['라운딩후기', '블루원용인', '골프일상'],
      likes: 12,
      comments: 3,
      visibility: 'public',
      status: 'published',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    {
      seedId: 'seed-post-2',
      author: {
        id: uid,
        name: displayName,
        image: photoURL,
      },
      content: '초보자에게 추천하는 드라이버! 테일러메이드 SIM2 사용 중인데 관용성이 정말 좋습니다. 슬라이스가 줄었어요.',
      images: [],
      hashtags: ['장비추천', '드라이버', '테일러메이드'],
      likes: 8,
      comments: 5,
      visibility: 'public',
      status: 'published',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    {
      seedId: 'seed-post-3',
      author: {
        id: uid,
        name: displayName,
        image: photoURL,
      },
      content: '오늘의 스코어: 92타! 드디어 100타를 깼습니다 🎉 퍼팅 연습이 효과가 있었나 봅니다.',
      images: [],
      hashtags: ['스코어', '100타깨기', '퍼팅'],
      likes: 25,
      comments: 10,
      visibility: 'public',
      status: 'published',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
  ];

  const batch = firestore().batch();
  for (const post of posts) {
    const ref = firestore().collection(POSTS_COLLECTION).doc();
    batch.set(ref, post);
  }
  await batch.commit();
};

// 중고마켓 상품 시드 데이터 (3건)
const seedProducts = async (uid: string, displayName: string, photoURL: string) => {
  const alreadySeeded = await checkAlreadySeeded(PRODUCTS_COLLECTION, 'seedId', 'seed-product-1');
  if (alreadySeeded) {
    return;
  }

  const products = [
    {
      seedId: 'seed-product-1',
      title: '테일러메이드 SIM2 드라이버',
      description: '1년 사용했습니다. 상태 좋고 그립도 교체했습니다. 직거래 선호.',
      price: 250000,
      category: 'driver',
      condition: 'good',
      images: [],
      sellerId: uid,
      sellerName: displayName,
      sellerImage: photoURL,
      sellerRating: 4.5,
      status: 'available',
      viewCount: 15,
      likeCount: 3,
      location: '서울 강남구',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    {
      seedId: 'seed-product-2',
      title: '타이틀리스트 Pro V1 골프공 (2더즌)',
      description: '새 제품입니다. 선물 받았는데 다른 브랜드 사용 중이라 판매합니다.',
      price: 80000,
      category: 'ball',
      condition: 'new',
      images: [],
      sellerId: uid,
      sellerName: displayName,
      sellerImage: photoURL,
      sellerRating: 4.5,
      status: 'available',
      viewCount: 22,
      likeCount: 7,
      location: '서울 서초구',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    {
      seedId: 'seed-product-3',
      title: '핑 캐디백 (2024 모델)',
      description: '거의 새것. 3번 사용했습니다. 방수 기능 있고 수납공간 넉넉합니다.',
      price: 180000,
      category: 'bag',
      condition: 'likeNew',
      images: [],
      sellerId: uid,
      sellerName: displayName,
      sellerImage: photoURL,
      sellerRating: 4.5,
      status: 'available',
      viewCount: 30,
      likeCount: 5,
      location: '경기 성남시',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
  ];

  const batch = firestore().batch();
  for (const product of products) {
    const ref = firestore().collection(PRODUCTS_COLLECTION).doc();
    batch.set(ref, product);
  }
  await batch.commit();
};

/**
 * 데모 데이터 전체 생성
 * 이미 시드 데이터가 있으면 스킵
 */
export const seedDemoData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const uid = user.uid;
    const displayName = user.displayName || '테스트 사용자';
    const photoURL = user.photoURL || '';

    await seedBookings(uid, displayName);
    await seedPosts(uid, displayName, photoURL);
    await seedProducts(uid, displayName, photoURL);

    return { success: true, message: '시드 데이터 생성 완료' };
  } catch (error: any) {
    console.error('시드 데이터 생성 실패:', error);
    return { success: false, message: error.message || '시드 데이터 생성 실패' };
  }
};

/**
 * 시드 데이터 삭제
 */
export const clearSeedData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const collections = [BOOKINGS_COLLECTION, POSTS_COLLECTION, PRODUCTS_COLLECTION];

    for (const col of collections) {
      const snapshot = await firestore()
        .collection(col)
        .where('seedId', '>=', 'seed-')
        .where('seedId', '<=', 'seed-\uf8ff')
        .get();

      if (!snapshot.empty) {
        const batch = firestore().batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
    }

    return { success: true, message: '시드 데이터 삭제 완료' };
  } catch (error: any) {
    console.error('시드 데이터 삭제 실패:', error);
    return { success: false, message: error.message || '시드 데이터 삭제 실패' };
  }
};
