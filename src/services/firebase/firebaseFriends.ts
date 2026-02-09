// 👥 Firebase 친구 시스템 서비스
// 친구 추가, 검색, 요청 관리

import firestore from '@react-native-firebase/firestore';
import { FirestoreTimestamp } from './firebaseConfig';
import { firebaseMessaging } from './firebaseMessaging';
import { DEFAULT_AVATAR } from '@/constants/images';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  handicap: number;
  location: string;
  mutualFriends: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

/**
 * 친구 검색 (이름, 위치, 핸디캡)
 */
export const searchFriends = async (query: string, currentUserId: string): Promise<Friend[]> => {
  try {
    // Firestore는 부분 검색을 직접 지원하지 않으므로
    // 클라이언트 사이드에서 필터링 또는 Algolia 같은 검색 서비스 사용 권장

    const snapshot = await firestore()
      .collection('users')
      .where('name', '>=', query)
      .where('name', '<=', query + '\uf8ff')
      .limit(20)
      .get();

    const friends: Friend[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (doc.id !== currentUserId) {
        friends.push({
          id: doc.id,
          name: data.name,
          avatar: data.avatar || DEFAULT_AVATAR,
          handicap: data.handicap || 0,
          location: data.location || '미등록',
          mutualFriends: 0, // 공통 친구 수: 성능상 목록 조회에서는 0으로 두고, 프로필 상세에서 개별 계산
          status: 'pending',
          createdAt: data.createdAt || FirestoreTimestamp.now(),
        });
      }
    }

    return friends;
  } catch (error) {
    console.error('친구 검색 실패:', error);
    return [];
  }
};

/**
 * 친구 요청 보내기
 */
export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // 이미 친구인지 확인 (서브컬렉션 경로)
    const existingFriend = await firestore()
      .collection('users')
      .doc(fromUserId)
      .collection('friends')
      .doc(toUserId)
      .get();

    if (existingFriend.exists) {
      return {
        success: false,
        message: '이미 친구이거나 요청을 보낸 상태입니다.',
      };
    }

    // 친구 요청 생성
    const requestId = `${fromUserId}_${toUserId}`;
    await firestore().collection('friendRequests').doc(requestId).set({
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: FirestoreTimestamp.now(),
    });

    // 상대방에게 알림 발송
    try {
      // 요청자 이름 조회
      const fromUserDoc = await firestore().collection('users').doc(fromUserId).get();
      const fromUserName = fromUserDoc.data()?.name || fromUserDoc.data()?.displayName || '누군가';

      await firebaseMessaging.createNotification(
        toUserId,
        'friend_request',
        '새 친구 요청',
        `${fromUserName}님이 친구 요청을 보냈습니다.`,
        { fromUserId },
      );
    } catch {
      // 알림 전송 실패 시 요청 처리에 영향 없음
    }

    return {
      success: true,
      message: '친구 요청을 보냈습니다!',
    };
  } catch (error) {
    console.error('친구 요청 실패:', error);
    return {
      success: false,
      message: '친구 요청에 실패했습니다.',
    };
  }
};

/**
 * 친구 요청 수락
 */
export const acceptFriendRequest = async (
  requestId: string,
  fromUserId: string,
  toUserId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const requestRef = firestore().collection('friendRequests').doc(requestId);

    // 트랜잭션으로 중복 수락 방지
    const result = await firestore().runTransaction(async (transaction) => {
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists) {
        return { success: false, message: '존재하지 않는 요청입니다.' };
      }

      const requestData = requestDoc.data();
      if (requestData?.status === 'accepted') {
        return { success: false, message: '이미 수락된 요청입니다.' };
      }

      // 친구 요청 상태 업데이트
      transaction.update(requestRef, {
        status: 'accepted',
        acceptedAt: FirestoreTimestamp.now(),
      });

      // 양방향 친구 관계 생성
      transaction.set(
        firestore().collection('users').doc(fromUserId).collection('friends').doc(toUserId),
        { friendId: toUserId, createdAt: FirestoreTimestamp.now() },
      );

      transaction.set(
        firestore().collection('users').doc(toUserId).collection('friends').doc(fromUserId),
        { friendId: fromUserId, createdAt: FirestoreTimestamp.now() },
      );

      return { success: true, message: '친구가 되었습니다!' };
    });

    if (!result.success) {
      return result;
    }

    // 트랜잭션 외부: 통계 업데이트 (실패해도 친구 관계에 영향 없음)
    await firestore()
      .collection('users')
      .doc(fromUserId)
      .set(
        {
          'stats.friendsCount': firestore.FieldValue.increment(1),
        },
        { merge: true },
      );

    await firestore()
      .collection('users')
      .doc(toUserId)
      .set(
        {
          'stats.friendsCount': firestore.FieldValue.increment(1),
        },
        { merge: true },
      );

    return {
      success: true,
      message: '친구가 되었습니다!',
    };
  } catch (error) {
    console.error('친구 수락 실패:', error);
    return {
      success: false,
      message: '친구 수락에 실패했습니다.',
    };
  }
};

/**
 * 친구 요청 거절
 */
export const rejectFriendRequest = async (
  requestId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await firestore().collection('friendRequests').doc(requestId).update({
      status: 'rejected',
      rejectedAt: FirestoreTimestamp.now(),
    });

    return {
      success: true,
      message: '친구 요청을 거절했습니다.',
    };
  } catch (error) {
    console.error('친구 거절 실패:', error);
    return {
      success: false,
      message: '친구 거절에 실패했습니다.',
    };
  }
};

/**
 * 친구 목록 가져오기
 */
export const getFriendsList = async (userId: string): Promise<Friend[]> => {
  try {
    // 서브컬렉션 경로: users/{userId}/friends
    const snapshot = await firestore().collection('users').doc(userId).collection('friends').get();

    const friendIds = snapshot.docs.map((doc) => doc.id);

    if (friendIds.length === 0) {
      return [];
    }

    // Firestore의 'in' 쿼리는 최대 10개까지만 지원
    // 10개 이상인 경우 분할 쿼리 필요
    const friends: Friend[] = [];

    for (let i = 0; i < friendIds.length; i += 10) {
      const batch = friendIds.slice(i, i + 10);
      const usersSnapshot = await firestore()
        .collection('users')
        .where(firestore.FieldPath.documentId(), 'in', batch)
        .get();

      usersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        friends.push({
          id: doc.id,
          name: data.name,
          avatar: data.avatar || DEFAULT_AVATAR,
          handicap: data.handicap || 0,
          location: data.location || '미등록',
          mutualFriends: 0,
          status: 'accepted',
          createdAt: data.createdAt || FirestoreTimestamp.now(),
        });
      });
    }

    return friends;
  } catch (error) {
    console.error('친구 목록 조회 실패:', error);
    return [];
  }
};

/**
 * 받은 친구 요청 목록
 */
export const getPendingRequests = async (userId: string): Promise<FriendRequest[]> => {
  try {
    const snapshot = await firestore()
      .collection('friendRequests')
      .where('toUserId', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FriendRequest[];
  } catch (error) {
    console.error('친구 요청 조회 실패:', error);
    return [];
  }
};

/**
 * 보낸 친구 요청 목록
 */
export const getSentRequests = async (userId: string): Promise<FriendRequest[]> => {
  try {
    const snapshot = await firestore()
      .collection('friendRequests')
      .where('fromUserId', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FriendRequest[];
  } catch (error) {
    console.error('보낸 요청 조회 실패:', error);
    return [];
  }
};

/**
 * 친구 요청 취소 (보낸 요청 삭제)
 */
export const cancelFriendRequest = async (
  requestId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await firestore().collection('friendRequests').doc(requestId).delete();

    return {
      success: true,
      message: '친구 요청을 취소했습니다.',
    };
  } catch (error) {
    console.error('친구 요청 취소 실패:', error);
    return {
      success: false,
      message: '친구 요청 취소에 실패했습니다.',
    };
  }
};

/**
 * 친구 프로필 조회 (users 컬렉션에서 사용자 정보 + 친구 관계 정보)
 */
export const getFriendProfile = async (
  currentUserId: string,
  friendId: string,
): Promise<{
  profile: any;
  friendshipInfo: any;
  recentMeetups: any[];
} | null> => {
  try {
    // 사용자 프로필 조회
    const userDoc = await firestore().collection('users').doc(friendId).get();

    if (!userDoc.exists) {
      return null;
    }

    const profileData = userDoc.data();

    // 친구 관계 정보 조회 (서브컬렉션 경로)
    const friendDoc = await firestore()
      .collection('users')
      .doc(currentUserId)
      .collection('friends')
      .doc(friendId)
      .get();

    const friendshipInfo = friendDoc.exists ? friendDoc.data() : null;

    // 최근 함께한 모임 조회 (bookings에서 둘 다 참여한 것)
    const bookingsSnapshot = await firestore()
      .collection('bookings')
      .where('participants.list', 'array-contains', friendId)
      .orderBy('date', 'desc')
      .limit(5)
      .get();

    const recentMeetups = bookingsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((b: any) => b.participants?.list?.includes(currentUserId));

    return {
      profile: {
        id: friendId,
        name: profileData?.name || profileData?.displayName || '사용자',
        avatar: profileData?.avatar || profileData?.photoURL || '',
        handicap: profileData?.handicap || 0,
        location: profileData?.location || '미등록',
        bio: profileData?.bio || '',
        joinedDate: profileData?.createdAt?.toDate?.() || null,
        stats: {
          totalMeetups: profileData?.stats?.gamesPlayed || 0,
          totalRounds: profileData?.stats?.totalRounds || 0,
          averageScore: profileData?.stats?.averageScore || 0,
        },
      },
      friendshipInfo: friendshipInfo
        ? {
            friendsSince: friendshipInfo.createdAt?.toDate?.() || null,
          }
        : null,
      recentMeetups: recentMeetups.map((m: any) => ({
        id: m.id,
        title: m.title || '모임',
        course: m.course?.name || m.golfCourse || '',
        date: m.date,
      })),
    };
  } catch (error) {
    console.error('친구 프로필 조회 실패:', error);
    return null;
  }
};

/**
 * 추천 친구 목록 (최근 가입한 사용자 중 아직 친구가 아닌 사용자)
 */
export const getSuggestedFriends = async (userId: string): Promise<Friend[]> => {
  try {
    // 현재 친구 목록 가져오기 (서브컬렉션 경로)
    const friendsSnapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('friends')
      .get();

    const friendIds = new Set(friendsSnapshot.docs.map((doc) => doc.id));
    friendIds.add(userId); // 자기 자신 제외

    // 최근 가입한 사용자 조회
    const usersSnapshot = await firestore()
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const suggestions: Friend[] = [];

    for (const doc of usersSnapshot.docs) {
      if (friendIds.has(doc.id)) continue;
      if (suggestions.length >= 10) break;

      const data = doc.data();
      suggestions.push({
        id: doc.id,
        name: data.name || data.displayName || '사용자',
        avatar: data.avatar || data.photoURL || '',
        handicap: data.handicap || 0,
        location: data.location || '미등록',
        mutualFriends: 0,
        status: 'pending',
        createdAt: data.createdAt || FirestoreTimestamp.now(),
      });
    }

    return suggestions;
  } catch (error) {
    console.error('추천 친구 조회 실패:', error);
    return [];
  }
};

/**
 * 친구 삭제
 */
export const removeFriend = async (
  userId: string,
  friendId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // 양방향 친구 관계 삭제 (서브컬렉션 경로)
    const batch = firestore().batch();

    batch.delete(firestore().collection('users').doc(userId).collection('friends').doc(friendId));
    batch.delete(firestore().collection('users').doc(friendId).collection('friends').doc(userId));

    await batch.commit();

    // 사용자 통계 업데이트 (set+merge로 문서 없어도 안전)
    await firestore()
      .collection('users')
      .doc(userId)
      .set(
        {
          'stats.friendsCount': firestore.FieldValue.increment(-1),
        },
        { merge: true },
      );

    await firestore()
      .collection('users')
      .doc(friendId)
      .set(
        {
          'stats.friendsCount': firestore.FieldValue.increment(-1),
        },
        { merge: true },
      );

    return {
      success: true,
      message: '친구를 삭제했습니다.',
    };
  } catch (error) {
    console.error('친구 삭제 실패:', error);
    return {
      success: false,
      message: '친구 삭제에 실패했습니다.',
    };
  }
};
