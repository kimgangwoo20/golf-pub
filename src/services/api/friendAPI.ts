// 👥 friendAPI.ts
// 친구 관리 API - Firebase Firestore 연동

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Friend, FriendRequest, FriendshipStatus } from '@/types/friend-types';

/**
 * Firestore 컬렉션
 */
const FRIENDSHIPS_COLLECTION = 'friendships';
const USERS_COLLECTION = 'users';

/**
 * 친구 API
 * 
 * Firebase Firestore 구조:
 * 
 * friendships/
 *   {friendshipId}/
 *     - userId1: "user123"
 *     - userId2: "user456"
 *     - status: "pending" | "accepted" | "blocked"
 *     - initiatorId: "user123" (요청 보낸 사람)
 *     - message: "친구 추가 요청입니다"
 *     - createdAt: Timestamp
 *     - acceptedAt: Timestamp (optional)
 */
export const friendAPI = {
  /**
   * 친구 요청 보내기
   * 
   * @param targetUserId 친구 요청 받을 사용자 ID
   * @param message 요청 메시지 (선택)
   * @returns 친구 요청 ID
   */
  sendFriendRequest: async (targetUserId: string, message?: string): Promise<string> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      if (currentUser.uid === targetUserId) {
        throw new Error('자기 자신에게는 친구 요청을 보낼 수 없습니다.');
      }

      // 이미 친구 관계가 있는지 확인
      const existingFriendship = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId1', 'in', [currentUser.uid, targetUserId])
        .where('userId2', 'in', [currentUser.uid, targetUserId])
        .get();

      if (!existingFriendship.empty) {
        const friendship = existingFriendship.docs[0].data();
        if (friendship.status === 'accepted') {
          throw new Error('이미 친구입니다.');
        } else if (friendship.status === 'pending') {
          throw new Error('이미 친구 요청을 보냈거나 받았습니다.');
        } else if (friendship.status === 'blocked') {
          throw new Error('차단된 사용자입니다.');
        }
      }

      // 친구 요청 생성
      const friendshipData = {
        userId1: currentUser.uid,
        userId2: targetUserId,
        status: 'pending' as FriendshipStatus,
        initiatorId: currentUser.uid,
        message: message || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .add(friendshipData);

      return docRef.id;
    } catch (error: any) {
      console.error('❌ 친구 요청 전송 실패:', error);
      throw new Error(error.message || '친구 요청에 실패했습니다.');
    }
  },

  /**
   * 친구 요청 승인
   * 
   * @param friendshipId 친구 관계 ID
   */
  acceptFriendRequest: async (friendshipId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const friendshipDoc = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .doc(friendshipId)
        .get();

      if (!friendshipDoc.exists) {
        throw new Error('친구 요청을 찾을 수 없습니다.');
      }

      const friendship = friendshipDoc.data();

      // 받은 사람만 승인 가능
      if (friendship?.userId2 !== currentUser.uid) {
        throw new Error('친구 요청을 승인할 권한이 없습니다.');
      }

      if (friendship?.status !== 'pending') {
        throw new Error('승인할 수 없는 상태입니다.');
      }

      // 승인
      await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .doc(friendshipId)
        .update({
          status: 'accepted',
          acceptedAt: firestore.FieldValue.serverTimestamp(),
        });

    } catch (error: any) {
      console.error('❌ 친구 요청 승인 실패:', error);
      throw new Error(error.message || '친구 요청 승인에 실패했습니다.');
    }
  },

  /**
   * 친구 요청 거절
   * 
   * @param friendshipId 친구 관계 ID
   */
  rejectFriendRequest: async (friendshipId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const friendshipDoc = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .doc(friendshipId)
        .get();

      if (!friendshipDoc.exists) {
        throw new Error('친구 요청을 찾을 수 없습니다.');
      }

      const friendship = friendshipDoc.data();

      // 받은 사람만 거절 가능
      if (friendship?.userId2 !== currentUser.uid) {
        throw new Error('친구 요청을 거절할 권한이 없습니다.');
      }

      // 거절 = 삭제
      await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .doc(friendshipId)
        .delete();

    } catch (error: any) {
      console.error('❌ 친구 요청 거절 실패:', error);
      throw new Error(error.message || '친구 요청 거절에 실패했습니다.');
    }
  },

  /**
   * 친구 목록 조회
   * 
   * @returns 친구 목록
   */
  getFriends: async (): Promise<Friend[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 내가 userId1인 경우
      const friendships1 = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId1', '==', currentUser.uid)
        .where('status', '==', 'accepted')
        .get();

      // 내가 userId2인 경우
      const friendships2 = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId2', '==', currentUser.uid)
        .where('status', '==', 'accepted')
        .get();

      // 친구 ID 목록
      const friendIds: string[] = [];
      
      friendships1.docs.forEach(doc => {
        const data = doc.data();
        friendIds.push(data.userId2);
      });

      friendships2.docs.forEach(doc => {
        const data = doc.data();
        friendIds.push(data.userId1);
      });

      if (friendIds.length === 0) {
        return [];
      }

      // 친구 정보 가져오기 (최대 10개씩)
      const friends: Friend[] = [];
      const chunks = [];
      for (let i = 0; i < friendIds.length; i += 10) {
        chunks.push(friendIds.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        const usersSnapshot = await firestore()
          .collection(USERS_COLLECTION)
          .where(firestore.FieldPath.documentId(), 'in', chunk)
          .get();

        usersSnapshot.docs.forEach(doc => {
          const data = doc.data();
          friends.push({
            id: doc.id,
            name: data.name || data.displayName || '익명',
            image: data.photoURL || data.avatar || '',
            handicap: data.handicap || 0,
            location: data.location || '미등록',
            bio: data.bio || '',
            mutualFriends: 0, // TODO: 계산
            status: 'accepted',
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          } as unknown as Friend);
        });
      }

      return friends;
    } catch (error: any) {
      console.error('❌ 친구 목록 조회 실패:', error);
      throw new Error(error.message || '친구 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 받은 친구 요청 목록
   * 
   * @returns 받은 친구 요청 목록
   */
  getReceivedFriendRequests: async (): Promise<FriendRequest[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const snapshot = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId2', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      if (snapshot.empty) {
        return [];
      }

      // 요청 보낸 사람 정보 가져오기
      const senderIds = snapshot.docs.map(doc => doc.data().userId1);
      const requests: FriendRequest[] = [];

      // 중복 제거
      const uniqueSenderIds = [...new Set(senderIds)];
      const chunks = [];
      for (let i = 0; i < uniqueSenderIds.length; i += 10) {
        chunks.push(uniqueSenderIds.slice(i, i + 10));
      }

      const senderDataMap: { [key: string]: any } = {};
      for (const chunk of chunks) {
        const usersSnapshot = await firestore()
          .collection(USERS_COLLECTION)
          .where(firestore.FieldPath.documentId(), 'in', chunk)
          .get();

        usersSnapshot.docs.forEach(doc => {
          senderDataMap[doc.id] = doc.data();
        });
      }

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const senderData = senderDataMap[data.userId1] || {};

        requests.push({
          id: doc.id,
          userId: data.userId1,
          userName: senderData.name || senderData.displayName || '익명',
          userImage: senderData.photoURL || senderData.avatar || '',
          userHandicap: senderData.handicap || 0,
          userLocation: senderData.location || '미등록',
          mutualFriends: 0, // TODO: 계산
          message: data.message || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          type: 'received',
        } as unknown as FriendRequest);

      });

      return requests;
    } catch (error: any) {
      console.error('❌ 받은 친구 요청 조회 실패:', error);
      throw new Error(error.message || '친구 요청을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 보낸 친구 요청 목록
   * 
   * @returns 보낸 친구 요청 목록
   */
  getSentFriendRequests: async (): Promise<FriendRequest[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const snapshot = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId1', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      if (snapshot.empty) {
        return [];
      }

      // 요청 받은 사람 정보 가져오기
      const receiverIds = snapshot.docs.map(doc => doc.data().userId2);
      const requests: FriendRequest[] = [];

      const uniqueReceiverIds = [...new Set(receiverIds)];
      const chunks = [];
      for (let i = 0; i < uniqueReceiverIds.length; i += 10) {
        chunks.push(uniqueReceiverIds.slice(i, i + 10));
      }

      const receiverDataMap: { [key: string]: any } = {};
      for (const chunk of chunks) {
        const usersSnapshot = await firestore()
          .collection(USERS_COLLECTION)
          .where(firestore.FieldPath.documentId(), 'in', chunk)
          .get();

        usersSnapshot.docs.forEach(doc => {
          receiverDataMap[doc.id] = doc.data();
        });
      }

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const receiverData = receiverDataMap[data.userId2] || {};

        requests.push({
          id: doc.id,
          userId: data.userId2,
          userName: receiverData.name || receiverData.displayName || '익명',
          userImage: receiverData.photoURL || receiverData.avatar || '',
          userHandicap: receiverData.handicap || 0,
          userLocation: receiverData.location || '미등록',
          mutualFriends: 0,
          message: data.message || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          type: 'sent',
        } as unknown as FriendRequest);

      });

      return requests;
    } catch (error: any) {
      console.error('❌ 보낸 친구 요청 조회 실패:', error);
      throw new Error(error.message || '친구 요청을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 친구 삭제
   * 
   * @param friendId 친구 ID
   */
  removeFriend: async (friendId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 친구 관계 찾기
      const friendships = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId1', 'in', [currentUser.uid, friendId])
        .where('userId2', 'in', [currentUser.uid, friendId])
        .where('status', '==', 'accepted')
        .get();

      if (friendships.empty) {
        throw new Error('친구 관계를 찾을 수 없습니다.');
      }

      // 삭제
      await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .doc(friendships.docs[0].id)
        .delete();

    } catch (error: any) {
      console.error('❌ 친구 삭제 실패:', error);
      throw new Error(error.message || '친구 삭제에 실패했습니다.');
    }
  },

  /**
   * 사용자 차단
   * 
   * @param userId 차단할 사용자 ID
   */
  blockUser: async (userId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      if (currentUser.uid === userId) {
        throw new Error('자기 자신을 차단할 수 없습니다.');
      }

      // 기존 관계 확인
      const existingFriendship = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId1', 'in', [currentUser.uid, userId])
        .where('userId2', 'in', [currentUser.uid, userId])
        .get();

      if (!existingFriendship.empty) {
        // 기존 관계 업데이트
        await firestore()
          .collection(FRIENDSHIPS_COLLECTION)
          .doc(existingFriendship.docs[0].id)
          .update({
            status: 'blocked',
            blockedBy: currentUser.uid,
            blockedAt: firestore.FieldValue.serverTimestamp(),
          });
      } else {
        // 새로운 차단 관계 생성
        await firestore()
          .collection(FRIENDSHIPS_COLLECTION)
          .add({
            userId1: currentUser.uid,
            userId2: userId,
            status: 'blocked',
            blockedBy: currentUser.uid,
            blockedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

    } catch (error: any) {
      console.error('❌ 사용자 차단 실패:', error);
      throw new Error(error.message || '사용자 차단에 실패했습니다.');
    }
  },

  /**
   * 차단 해제
   * 
   * @param userId 차단 해제할 사용자 ID
   */
  unblockUser: async (userId: string): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 차단 관계 찾기
      const blockRelation = await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('userId1', 'in', [currentUser.uid, userId])
        .where('userId2', 'in', [currentUser.uid, userId])
        .where('status', '==', 'blocked')
        .get();

      if (blockRelation.empty) {
        throw new Error('차단 관계를 찾을 수 없습니다.');
      }

      const data = blockRelation.docs[0].data();
      
      // 본인이 차단한 경우만 해제 가능
      if (data.blockedBy !== currentUser.uid) {
        throw new Error('차단을 해제할 권한이 없습니다.');
      }

      // 삭제
      await firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .doc(blockRelation.docs[0].id)
        .delete();

    } catch (error: any) {
      console.error('❌ 차단 해제 실패:', error);
      throw new Error(error.message || '차단 해제에 실패했습니다.');
    }
  },

  /**
   * 사용자 검색
   * 
   * @param query 검색어 (이름 or 이메일)
   * @param limit 결과 개수
   * @returns 검색 결과
   */
  searchUsers: async (query: string, limit: number = 20): Promise<Friend[]> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      if (!query || query.trim().length < 2) {
        throw new Error('검색어는 2자 이상 입력해주세요.');
      }

      // Firestore는 full-text search를 지원하지 않으므로
      // 이름이 검색어로 시작하는 사용자를 찾습니다
      const snapshot = await firestore()
        .collection(USERS_COLLECTION)
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .limit(limit)
        .get();

      const users: Friend[] = [];

      snapshot.docs.forEach(doc => {
        // 본인 제외
        if (doc.id === currentUser.uid) return;

        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name || data.displayName || '익명',
          image: data.photoURL || data.avatar || '',
          handicap: data.handicap || 0,
          location: data.location || '미등록',
          bio: data.bio || '',
          mutualFriends: 0,
          status: 'pending', // 검색 결과는 상태 확인 필요
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        } as unknown as Friend);
      });

      return users;
    } catch (error: any) {
      console.error('❌ 사용자 검색 실패:', error);
      throw new Error(error.message || '사용자 검색에 실패했습니다.');
    }
  },
};