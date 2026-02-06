// FeedScreen.tsx - Witty 스타일 소셜 피드

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  TextInput,
  Platform,
  Modal,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';

const { width } = Dimensions.get('window');

// Mock 사용자 데이터
const mockUser = {
  id: 1,
  name: '김골프',
  profileImage: 'https://i.pravatar.cc/150?img=12',
  isLive: false,
};

// Mock 친구 스토리 데이터
const mockStories = [
  {
    id: 1,
    userId: 2,
    userName: '이민지',
    userImage: 'https://i.pravatar.cc/150?img=45',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
  },
  {
    id: 2,
    userId: 3,
    userName: '박정우',
    userImage: 'https://i.pravatar.cc/150?img=33',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
  },
  {
    id: 3,
    userId: 4,
    userName: '최수진',
    userImage: 'https://i.pravatar.cc/150?img=27',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
  },
];

// Mock 댓글 데이터
interface Comment {
  id: number;
  feedId: number;
  userName: string;
  userImage: string;
  content: string;
  time: string;
  likes: number;
  replies?: Comment[];
  parentId?: number;
}

// 답글 대상 정보
interface ReplyTarget {
  commentId: number;
  userName: string;
}

const mockCommentsData: Comment[] = [
  { id: 1, feedId: 1, userName: '박정우', userImage: 'https://i.pravatar.cc/150?img=33', content: '우와 날씨 진짜 좋아보여요!', time: '1시간 전', likes: 5, replies: [
    { id: 101, feedId: 1, userName: '이민지', userImage: 'https://i.pravatar.cc/150?img=45', content: '감사합니다! 😊', time: '50분 전', likes: 2, parentId: 1 }
  ] },
  { id: 2, feedId: 1, userName: '최수진', userImage: 'https://i.pravatar.cc/150?img=27', content: '스코어 어떻게 되셨어요?', time: '1시간 전', likes: 3 },
  { id: 3, feedId: 1, userName: '김철수', userImage: 'https://i.pravatar.cc/150?img=15', content: '저도 다음에 같이 가요~', time: '30분 전', likes: 1 },
  { id: 4, feedId: 2, userName: '이민지', userImage: 'https://i.pravatar.cc/150?img=45', content: '어떤 드라이버예요?', time: '4시간 전', likes: 8, replies: [
    { id: 104, feedId: 2, userName: '박정우', userImage: 'https://i.pravatar.cc/150?img=33', content: '테일러메이드 스텔스2예요!', time: '3시간 전', likes: 4, parentId: 4 }
  ] },
  { id: 5, feedId: 2, userName: '최수진', userImage: 'https://i.pravatar.cc/150?img=27', content: '비거리 30m 대박이네요 👍', time: '3시간 전', likes: 12 },
  { id: 6, feedId: 3, userName: '박정우', userImage: 'https://i.pravatar.cc/150?img=33', content: '축하드려요!! 🎉🎉', time: '20시간 전', likes: 15 },
  { id: 7, feedId: 3, userName: '이민지', userImage: 'https://i.pravatar.cc/150?img=45', content: '대단해요! 저도 빨리 100타 깨고 싶네요', time: '18시간 전', likes: 7 },
];

// Mock 피드 데이터
const mockFeeds = [
  {
    id: 1,
    userId: 2,
    userName: '이민지',
    userImage: 'https://i.pravatar.cc/150?img=45',
    time: '2시간 전',
    content: '오늘 남서울CC에서 라운딩했습니다! 날씨 최고였어요 ⛳🏌️',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600',
    likes: 67,
    comments: 45,
    location: '남서울CC',
    tags: ['#골프', '#라운딩', '#남서울CC'],
  },
  {
    id: 2,
    userId: 3,
    userName: '박정우',
    userImage: 'https://i.pravatar.cc/150?img=33',
    time: '5시간 전',
    content: '드라이버 새로 샀어요! 비거리가 30m 늘었습니다 🚀',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600',
    likes: 124,
    comments: 38,
    location: null,
    tags: ['#골프용품', '#드라이버', '#테일러메이드'],
  },
  {
    id: 3,
    userId: 4,
    userName: '최수진',
    userImage: 'https://i.pravatar.cc/150?img=27',
    time: '1일 전',
    content: '100타 돌파 기념! 🎉 드디어 100타를 깼습니다!',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600',
    likes: 232,
    comments: 89,
    location: '레이크사이드CC',
    tags: ['#100타돌파', '#기념', '#골프'],
  },
];

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount: unreadNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    subscribeToUnreadCount,
    unsubscribeFromUnreadCount,
  } = useNotificationStore();
  const insets = useSafeAreaInsets();

  const [selectedTab, setSelectedTab] = useState('all');
  const [likedFeeds, setLikedFeeds] = useState<number[]>([]);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Comment[]>(mockCommentsData);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; parentId?: number } | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(7); // TODO: 실제 메시지 store에서 가져오기

  // Instagram/YouTube 스타일 키보드 처리
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // 현재 사용자 이름 (본인 댓글 확인용)
  const currentUserName = user?.displayName || '사용자';

  // 알림 구독
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        subscribeToNotifications(user.id);
        subscribeToUnreadCount(user.id);
      }
      return () => {
        unsubscribeFromNotifications();
        unsubscribeFromUnreadCount();
      };
    }, [user?.id])
  );

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // 탭 데이터
  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'friends', label: '친구' },
    { id: 'following', label: '팔로잉' },
  ];

  const handleLike = (feedId: number) => {
    if (likedFeeds.includes(feedId)) {
      setLikedFeeds(likedFeeds.filter(id => id !== feedId));
    } else {
      setLikedFeeds([...likedFeeds, feedId]);
    }
  };

  const handleComment = useCallback((feedId: number) => {
    setSelectedFeedId(feedId);
    setCommentModalVisible(true);
  }, []);

  const handleSubmitComment = () => {
    if (!commentText.trim() || !selectedFeedId) return;

    // 수정 모드인 경우
    if (editingComment) {
      handleEditSubmit();
      return;
    }

    const newComment: Comment = {
      id: Date.now(),
      feedId: selectedFeedId,
      userName: currentUserName,
      userImage: user?.photoURL || 'https://i.pravatar.cc/150?img=1',
      content: commentText.trim(),
      time: '방금 전',
      likes: 0,
    };

    if (replyTarget) {
      // 답글인 경우: 해당 댓글의 replies 배열에 추가
      setComments(prev => prev.map(comment => {
        if (comment.id === replyTarget.commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), { ...newComment, parentId: comment.id }],
          };
        }
        return comment;
      }));
      setReplyTarget(null);
    } else {
      // 일반 댓글
      setComments(prev => [...prev, newComment]);
    }
    setCommentText('');
  };

  // 댓글 좋아요
  const handleCommentLike = (commentId: number) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // 답글 달기 시작
  const startReply = (commentId: number, userName: string) => {
    setReplyTarget({ commentId, userName });
    setEditingComment(null);
    // setTimeout으로 state 업데이트 후 focus
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // 답글 취소
  const cancelReply = () => {
    setReplyTarget(null);
  };

  // 댓글 수정 시작
  const startEditComment = (comment: Comment, parentId?: number) => {
    setEditingComment({ id: comment.id, parentId });
    setCommentText(comment.content);
    setReplyTarget(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // 댓글 수정 취소
  const cancelEdit = () => {
    setEditingComment(null);
    setCommentText('');
  };

  // 댓글 삭제
  const handleDeleteComment = (commentId: number, parentId?: number) => {
    Alert.alert(
      '댓글 삭제',
      '이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            if (parentId) {
              // 답글 삭제
              setComments(prev => prev.map(comment => {
                if (comment.id === parentId) {
                  return {
                    ...comment,
                    replies: (comment.replies || []).filter(reply => reply.id !== commentId),
                  };
                }
                return comment;
              }));
            } else {
              // 댓글 삭제
              setComments(prev => prev.filter(comment => comment.id !== commentId));
            }
          },
        },
      ]
    );
  };

  // 댓글 수정 제출
  const handleEditSubmit = () => {
    if (!commentText.trim() || !editingComment) return;

    if (editingComment.parentId) {
      // 답글 수정
      setComments(prev => prev.map(comment => {
        if (comment.id === editingComment.parentId) {
          return {
            ...comment,
            replies: (comment.replies || []).map(reply =>
              reply.id === editingComment.id
                ? { ...reply, content: commentText.trim() }
                : reply
            ),
          };
        }
        return comment;
      }));
    } else {
      // 댓글 수정
      setComments(prev => prev.map(comment =>
        comment.id === editingComment.id
          ? { ...comment, content: commentText.trim() }
          : comment
      ));
    }

    setEditingComment(null);
    setCommentText('');
  };

  const getCommentsForFeed = (feedId: number) => {
    return comments.filter(c => c.feedId === feedId);
  };

  const handleStoryPress = (storyId: number) => {
    Alert.alert('스토리', '스토리 상세 보기는 개발 예정입니다.');
  };

  const handleAddFriend = (userId: number, userName: string) => {
    if (!user?.id) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    const hasGolfPubMembership = true;

    if (!hasGolfPubMembership) {
      Alert.alert(
        'Golf Pub 구독 필요',
        '친구 추가 기능은 Golf Pub 구독자만 이용할 수 있습니다.\n\n지금 구독하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '구독하기',
            onPress: () => navigation.navigate('Home' as never, { screen: 'Membership' } as never),
          },
        ]
      );
      return;
    }

    Alert.alert(
      '친구 추가',
      `${userName}님에게 친구 요청을 보내시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '요청 보내기',
          onPress: () => Alert.alert('완료', `${userName}님에게 친구 요청을 보냈습니다.`),
        },
      ]
    );
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Witty 스타일 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: mockUser.profileImage }}
              style={styles.headerAvatar}
            />
            <Text style={styles.headerName}>{mockUser.name}</Text>
          </View>

          <View style={styles.headerRight}>
            {mockUser.isLive && (
              <View style={styles.liveButton}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('NotificationList' as never)}
            >
              <Text style={styles.iconText}>🔔</Text>
              {/* 알림 뱃지 - 읽지 않은 알림이 있을 때만 표시 */}
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Chat' as never, { screen: 'ChatList' } as never)}
            >
              <Text style={styles.iconText}>✉️</Text>
              {/* 메시지 뱃지 - 읽지 않은 메시지가 있을 때만 표시 */}
              {unreadMessages > 0 && (
                <View style={styles.messageBadge}>
                  <Text style={styles.messageBadgeText}>
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 탭 */}
        <View style={styles.tabSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem,
                  selectedTab === tab.id && styles.tabItemActive
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[
                  styles.tabLabel,
                  selectedTab === tab.id && styles.tabLabelActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 스토리 섹션 */}
          <View style={styles.storySection}>
            <Text style={styles.sectionTitle}>스토리</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storyContainer}
            >
              {mockStories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyItem}
                  onPress={() => handleStoryPress(story.id)}
                >
                  <View style={styles.storyImageWrapper}>
                    <Image
                      source={{ uri: story.userImage }}
                      style={styles.storyImage}
                    />
                    <View style={styles.storyRing} />
                  </View>
                  <Text style={styles.storyName} numberOfLines={1}>
                    {story.userName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 피드 리스트 */}
          <View style={styles.feedSection}>
            {mockFeeds.map((feed) => (
              <View key={feed.id} style={styles.feedCard}>
                {/* 피드 헤더 */}
                <View style={styles.feedHeader}>
                  <Image
                    source={{ uri: feed.userImage }}
                    style={styles.feedAvatar}
                  />
                  <View style={styles.feedUserInfo}>
                    <Text style={styles.feedUserName}>{feed.userName}</Text>
                    <Text style={styles.feedTime}>{feed.time}</Text>
                  </View>
                </View>

                {/* 피드 내용 */}
                <Text style={styles.feedContent}>{feed.content}</Text>

                {/* 피드 이미지 */}
                <Image
                  source={{ uri: feed.image }}
                  style={styles.feedImage}
                />

                {/* 위치 */}
                {feed.location && (
                  <View style={styles.feedMeta}>
                    <View style={styles.locationTag}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText}>{feed.location}</Text>
                    </View>
                  </View>
                )}

                {/* 태그 */}
                {feed.tags && feed.tags.length > 0 && (
                  <View style={styles.feedTags}>
                    {feed.tags.map((tag, index) => (
                      <Text key={index} style={styles.tagText}>{tag} </Text>
                    ))}
                  </View>
                )}

                {/* 액션 버튼 */}
                <View style={styles.feedActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLike(feed.id)}
                  >
                    <Text style={[
                      styles.actionIcon,
                      likedFeeds.includes(feed.id) && styles.actionIconActive
                    ]}>
                      {likedFeeds.includes(feed.id) ? '❤️' : '🤍'}
                    </Text>
                    <Text style={styles.actionLabel}>
                      {likedFeeds.includes(feed.id) ? feed.likes + 1 : feed.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleComment(feed.id)}
                  >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionLabel}>{getCommentsForFeed(feed.id).length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleAddFriend(feed.userId, feed.userName)}
                  >
                    <Text style={styles.actionIcon}>👤</Text>
                    <Text style={styles.actionLabel}>친구추가</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 글쓰기 플로팅 버튼 */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleCreatePost}
        >
          <Text style={styles.fabIcon}>✏️</Text>
        </TouchableOpacity>

        {/* 댓글 모달 - Instagram/YouTube 스타일 */}
        <Modal
          visible={commentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            Keyboard.dismiss();
            setCommentModalVisible(false);
          }}
        >
          <View style={styles.modalWrapper}>
            {/* 배경 터치시 닫기 */}
            <TouchableWithoutFeedback onPress={() => {
              Keyboard.dismiss();
              setCommentModalVisible(false);
            }}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            {/* 모달 컨텐츠 */}
            <Animated.View
              style={[
                styles.modalContent,
                {
                  // 키보드가 올라오면 모달 전체를 위로 이동
                  transform: [{ translateY: Animated.multiply(keyboardHeight, -1) }],
                }
              ]}
            >
              {/* 헤더 */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>댓글</Text>
                <TouchableOpacity onPress={() => {
                  Keyboard.dismiss();
                  setCommentModalVisible(false);
                }}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* 댓글 목록 */}
              <FlatList
                data={selectedFeedId ? getCommentsForFeed(selectedFeedId) : []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item: comment }) => {
                  const isCommentLiked = likedComments.has(comment.id);
                  const isMyComment = comment.userName === currentUserName;
                  return (
                    <View>
                      {/* 댓글 */}
                      <View style={styles.commentItem}>
                        <Image source={{ uri: comment.userImage }} style={styles.commentAvatar} />
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentUserName}>{comment.userName}</Text>
                            <Text style={styles.commentTime}>{comment.time}</Text>
                            {/* 본인 댓글일 경우 수정/삭제 버튼 */}
                            {isMyComment && (
                              <View style={styles.commentEditActions}>
                                <TouchableOpacity
                                  style={styles.editDeleteButton}
                                  onPress={() => startEditComment(comment)}
                                >
                                  <Text style={styles.editButtonText}>수정</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.editDeleteButton}
                                  onPress={() => handleDeleteComment(comment.id)}
                                >
                                  <Text style={styles.deleteButtonText}>삭제</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                          <Text style={styles.commentText}>{comment.content}</Text>
                          {/* 액션 버튼 */}
                          <View style={styles.commentActions}>
                            <TouchableOpacity
                              style={styles.commentAction}
                              onPress={() => handleCommentLike(comment.id)}
                            >
                              <Text style={styles.commentActionIcon}>
                                {isCommentLiked ? '❤️' : '🤍'}
                              </Text>
                              <Text style={styles.commentActionText}>
                                {comment.likes + (isCommentLiked ? 1 : 0)}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.commentAction}
                              onPress={() => startReply(comment.id, comment.userName)}
                            >
                              <Text style={styles.commentActionText}>답글 달기</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* 답글 목록 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <View style={styles.repliesContainer}>
                          {comment.replies.map((reply) => {
                            const isReplyLiked = likedComments.has(reply.id);
                            const isMyReply = reply.userName === currentUserName;
                            return (
                              <View key={reply.id} style={styles.replyItem}>
                                <Image source={{ uri: reply.userImage }} style={styles.replyAvatar} />
                                <View style={styles.commentContent}>
                                  <View style={styles.commentHeader}>
                                    <Text style={styles.commentUserName}>{reply.userName}</Text>
                                    <Text style={styles.commentTime}>{reply.time}</Text>
                                    {/* 본인 답글일 경우 수정/삭제 버튼 */}
                                    {isMyReply && (
                                      <View style={styles.commentEditActions}>
                                        <TouchableOpacity
                                          style={styles.editDeleteButton}
                                          onPress={() => startEditComment(reply, comment.id)}
                                        >
                                          <Text style={styles.editButtonText}>수정</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          style={styles.editDeleteButton}
                                          onPress={() => handleDeleteComment(reply.id, comment.id)}
                                        >
                                          <Text style={styles.deleteButtonText}>삭제</Text>
                                        </TouchableOpacity>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={styles.commentText}>{reply.content}</Text>
                                  <View style={styles.commentActions}>
                                    <TouchableOpacity
                                      style={styles.commentAction}
                                      onPress={() => handleCommentLike(reply.id)}
                                    >
                                      <Text style={styles.commentActionIcon}>
                                        {isReplyLiked ? '❤️' : '🤍'}
                                      </Text>
                                      <Text style={styles.commentActionText}>
                                        {reply.likes + (isReplyLiked ? 1 : 0)}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                }}
                contentContainerStyle={styles.commentList}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.emptyComments}>
                    <Text style={styles.emptyCommentsText}>아직 댓글이 없습니다</Text>
                  </View>
                }
              />

              {/* 수정 모드 표시 */}
              {editingComment && (
                <View style={styles.editIndicator}>
                  <Text style={styles.editIndicatorText}>
                    댓글 수정 중
                  </Text>
                  <TouchableOpacity onPress={cancelEdit}>
                    <Text style={styles.replyIndicatorCancel}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 답글 표시 */}
              {replyTarget && !editingComment && (
                <View style={styles.replyIndicator}>
                  <Text style={styles.replyIndicatorText}>
                    @{replyTarget.userName}에게 답글 작성 중
                  </Text>
                  <TouchableOpacity onPress={cancelReply}>
                    <Text style={styles.replyIndicatorCancel}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 댓글 입력창 - 키보드 위에 항상 표시 */}
              <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom || 16 }]}>
                <TextInput
                  ref={inputRef}
                  style={styles.commentInput}
                  placeholder={
                    editingComment
                      ? "댓글 수정..."
                      : replyTarget
                        ? `@${replyTarget.userName}에게 답글 달기...`
                        : "댓글을 입력하세요..."
                  }
                  placeholderTextColor="#999"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.commentSendButton, !commentText.trim() && styles.commentSendButtonDisabled]}
                  onPress={handleSubmitComment}
                  disabled={!commentText.trim()}
                >
                  <Text style={styles.commentSendText}>게시</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Witty 스타일 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
  },
  iconText: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  messageBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  messageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // 탭
  tabSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabItemActive: {
    backgroundColor: '#7C3AED',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabLabelActive: {
    color: '#fff',
  },

  scrollView: {
    flex: 1,
  },

  // 스토리 섹션
  storySection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  storyContainer: {
    paddingHorizontal: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 70,
  },
  storyImageWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  storyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E5E5',
  },
  storyRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  storyName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // 피드 섹션
  feedSection: {
    gap: 8,
  },
  feedCard: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingTop: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  feedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  feedUserInfo: {
    flex: 1,
  },
  feedUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  feedTime: {
    fontSize: 12,
    color: '#999',
  },
  feedContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  feedImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#E5E5E5',
  },
  feedMeta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  feedTags: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagText: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },
  feedActions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionIconActive: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  bottomSpacing: {
    height: 80,
  },

  // 플로팅 버튼
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
  },

  // 댓글 모달 - Instagram/YouTube 스타일
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    // 키보드가 올라올 때 모달이 화면 밖으로 나가지 않도록
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCommentsText: {
    fontSize: 15,
    color: '#999',
  },
  commentList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionIcon: {
    fontSize: 14,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666',
  },
  repliesContainer: {
    marginLeft: 48,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5E5',
    paddingLeft: 12,
    marginBottom: 8,
  },
  replyItem: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5E5',
    marginRight: 10,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  replyIndicatorText: {
    fontSize: 13,
    color: '#7C3AED',
  },
  replyIndicatorCancel: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 8,
  },
  editIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  editIndicatorText: {
    fontSize: 13,
    color: '#E65100',
  },
  commentEditActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
  },
  editDeleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  editButtonText: {
    fontSize: 12,
    color: '#7C3AED',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ff4444',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    marginRight: 8,
  },
  commentSendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
  },
  commentSendButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  commentSendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
