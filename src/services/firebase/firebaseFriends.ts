// 👥 Firebase 친구 시스템 서비스
// 친구 추가, 검색, 요청 관리

import firestore from '@react-native-firebase/firestore';
import { FirestoreTimestamp } from './firebaseConfig';

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
export const searchFriends = async (
  query: string,
  currentUserId: string,
): Promise<Friend[]> => {
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
          avatar: data.avatar || 'https://i.pravatar.cc/150',
          handicap: data.handicap || 0,
          location: data.location || '미등록',
          mutualFriends: 0, // TODO: 공통 친구 수 계산
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
    // 이미 친구인지 확인
    const existingFriend = await firestore()
      .collection('friends')
      .doc(`${fromUserId}_${toUserId}`)
      .get();

    if (existingFriend.exists) {
      return {
        success: false,
        message: '이미 친구이거나 요청을 보낸 상태입니다.',
      };
    }

    // 친구 요청 생성
    const requestId = `${fromUserId}_${toUserId}`;
    await firestore()
      .collection('friendRequests')
      .doc(requestId)
      .set({
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: FirestoreTimestamp.now(),
      });

    // 상대방에게 알림 발송 (TODO: Firebase Cloud Messaging)
    
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
    // 친구 요청 상태 업데이트
    await firestore()
      .collection('friendRequests')
      .doc(requestId)
      .update({
        status: 'accepted',
        acceptedAt: FirestoreTimestamp.now(),
      });

    // 양방향 친구 관계 생성
    const batch = firestore().batch();

    batch.set(
      firestore().collection('friends').doc(`${fromUserId}_${toUserId}`),
      {
        userId: fromUserId,
        friendId: toUserId,
        createdAt: FirestoreTimestamp.now(),
      },
    );

    batch.set(
      firestore().collection('friends').doc(`${toUserId}_${fromUserId}`),
      {
        userId: toUserId,
        friendId: fromUserId,
        createdAt: FirestoreTimestamp.now(),
      },
    );

    await batch.commit();

    // 사용자 통계 업데이트
    await firestore()
      .collection('users')
      .doc(fromUserId)
      .update({
        'stats.friendsCount': firestore.FieldValue.increment(1),
      });

    await firestore()
      .collection('users')
      .doc(toUserId)
      .update({
        'stats.friendsCount': firestore.FieldValue.increment(1),
      });

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
    await firestore()
      .collection('friendRequests')
      .doc(requestId)
      .update({
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
    const snapshot = await firestore()
      .collection('friends')
      .where('userId', '==', userId)
      .get();

    const friendIds = snapshot.docs.map((doc) => doc.data().friendId);

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
          avatar: data.avatar || 'https://i.pravatar.cc/150',
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
 * 친구 삭제
 */
export const removeFriend = async (
  userId: string,
  friendId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // 양방향 친구 관계 삭제
    const batch = firestore().batch();

    batch.delete(firestore().collection('friends').doc(`${userId}_${friendId}`));
    batch.delete(firestore().collection('friends').doc(`${friendId}_${userId}`));

    await batch.commit();

    // 사용자 통계 업데이트
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        'stats.friendsCount': firestore.FieldValue.increment(-1),
      });

    await firestore()
      .collection('users')
      .doc(friendId)
      .update({
        'stats.friendsCount': firestore.FieldValue.increment(-1),
      });

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
