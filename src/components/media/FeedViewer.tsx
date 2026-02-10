// FeedViewer.tsx - 인스타그램 스타일 피드 뷰어 (세로+가로 스크롤 + 댓글)

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  Keyboard,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export interface FeedItem {
  id: string | number; // Firestore 문서 ID (string) 또는 기존 숫자 ID 지원
  type: string;
  mediaType: 'image' | 'video';
  icon: string;
  title: string;
  description: string;
  image: string;
  mediaUrl: string;
  mediaUrls?: string[];
  likes: number;
  comments: number;
  date: string;
  authorId: string;
  visibility: string;
}

// 댓글 인터페이스
interface Comment {
  id: number;
  feedId: string | number; // Firestore 문서 ID (string) 또는 숫자 ID 지원
  userName: string;
  userImage: string;
  content: string;
  time: string;
  likes: number;
  replies?: Comment[];
  parentId?: number;
}

interface ReplyTarget {
  commentId: number;
  userName: string;
}

interface FeedViewerProps {
  visible: boolean;
  items: FeedItem[];
  initialIndex: number;
  onClose: () => void;
  onLike?: (id: string | number) => void;
  onComment?: (id: string | number, comment: string) => void;
  authorName?: string;
  authorImage?: string;
}

// Mock 댓글 데이터 생성
const generateMockComments = (): Comment[] => [
  {
    id: 1,
    feedId: 1,
    userName: '이민지',
    userImage: 'https://i.pravatar.cc/150?img=45',
    content: '우와 날씨 진짜 좋아보여요!',
    time: '1시간 전',
    likes: 5,
    replies: [
      {
        id: 101,
        feedId: 1,
        userName: '박정우',
        userImage: 'https://i.pravatar.cc/150?img=33',
        content: '맞아요 완전 좋았어요!',
        time: '50분 전',
        likes: 2,
        parentId: 1,
      },
    ],
  },
  {
    id: 2,
    feedId: 1,
    userName: '최수진',
    userImage: 'https://i.pravatar.cc/150?img=27',
    content: '스코어 어떻게 되셨어요?',
    time: '1시간 전',
    likes: 3,
  },
  {
    id: 3,
    feedId: 2,
    userName: '박정우',
    userImage: 'https://i.pravatar.cc/150?img=33',
    content: '골프장 풍경 최고네요!',
    time: '3시간 전',
    likes: 8,
  },
  {
    id: 4,
    feedId: 3,
    userName: '이민지',
    userImage: 'https://i.pravatar.cc/150?img=45',
    content: '스윙 폼이 좋아지셨네요!',
    time: '5시간 전',
    likes: 12,
  },
  {
    id: 5,
    feedId: 4,
    userName: '최수진',
    userImage: 'https://i.pravatar.cc/150?img=27',
    content: '100타 돌파 축하드려요!! 🎉',
    time: '1일 전',
    likes: 15,
  },
  {
    id: 6,
    feedId: 4,
    userName: '김철수',
    userImage: 'https://i.pravatar.cc/150?img=15',
    content: '대단해요! 저도 목표입니다',
    time: '1일 전',
    likes: 7,
  },
  {
    id: 7,
    feedId: 5,
    userName: '박정우',
    userImage: 'https://i.pravatar.cc/150?img=33',
    content: '새 드라이버 어떤 건가요?',
    time: '2일 전',
    likes: 4,
  },
];

// 가로 이미지 캐러셀 컴포넌트
const ImageCarousel: React.FC<{ urls: string[] }> = React.memo(({ urls }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (urls.length === 1) {
    return (
      <Image
        source={{ uri: urls[0] }}
        style={carouselStyles.singleImage}
        resizeMode="contain"
        onError={() => {}}
      />
    );
  }

  return (
    <View style={carouselStyles.container}>
      <FlatList
        data={urls}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item: url }) => (
          <Image
            source={{ uri: url }}
            style={carouselStyles.image}
            resizeMode="contain"
            onError={() => {}}
          />
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
      />
      {/* 페이지 인디케이터 (점) */}
      <View style={carouselStyles.dots}>
        {urls.map((_, i) => (
          <View
            key={i}
            style={[carouselStyles.dot, i === activeIndex && carouselStyles.dotActive]}
          />
        ))}
      </View>
      {/* 페이지 번호 */}
      <View style={carouselStyles.counter}>
        <Text style={carouselStyles.counterText}>
          {activeIndex + 1}/{urls.length}
        </Text>
      </View>
    </View>
  );
});

const carouselStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  singleImage: {
    width,
    flex: 1,
  },
  image: {
    width,
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counter: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export const FeedViewer: React.FC<FeedViewerProps> = ({
  visible,
  items,
  initialIndex,
  onClose,
  onLike,
  onComment,
  authorName,
  authorImage,
}) => {
  const [_currentIndex, setCurrentIndex] = useState(initialIndex);
  const [likedItems, setLikedItems] = useState<Set<string | number>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // 댓글 상태
  const [comments, setComments] = useState<Comment[]>(generateMockComments);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState<string | number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; parentId?: number } | null>(
    null,
  );

  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const currentUserName = authorName || '사용자';

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? 250 : 100,
        useNativeDriver: false,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? 250 : 100,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const handleLike = useCallback(
    (itemId: string | number) => {
      setLikedItems((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
      onLike?.(itemId);
    },
    [onLike],
  );

  // 댓글 모달 열기
  const handleOpenComments = useCallback((feedId: string | number) => {
    setSelectedFeedId(feedId);
    setCommentModalVisible(true);
  }, []);

  // 댓글 가져오기
  const getCommentsForFeed = useCallback(
    (feedId: string | number) => {
      return comments.filter((c) => c.feedId === feedId);
    },
    [comments],
  );

  // 댓글 등록
  const handleSubmitComment = useCallback(() => {
    if (!commentText.trim() || !selectedFeedId) return;

    if (editingComment) {
      // 수정 모드
      if (editingComment.parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === editingComment.parentId) {
              return {
                ...c,
                replies: (c.replies || []).map((r) =>
                  r.id === editingComment.id ? { ...r, content: commentText.trim() } : r,
                ),
              };
            }
            return c;
          }),
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === editingComment.id ? { ...c, content: commentText.trim() } : c)),
        );
      }
      setEditingComment(null);
      setCommentText('');
      return;
    }

    const newComment: Comment = {
      id: Date.now(),
      feedId: selectedFeedId,
      userName: currentUserName,
      userImage: authorImage || 'https://i.pravatar.cc/150?img=1',
      content: commentText.trim(),
      time: '방금 전',
      likes: 0,
    };

    if (replyTarget) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === replyTarget.commentId) {
            return { ...c, replies: [...(c.replies || []), { ...newComment, parentId: c.id }] };
          }
          return c;
        }),
      );
      setReplyTarget(null);
    } else {
      setComments((prev) => [...prev, newComment]);
    }

    onComment?.(selectedFeedId, commentText.trim());
    setCommentText('');
  }, [
    commentText,
    selectedFeedId,
    editingComment,
    replyTarget,
    currentUserName,
    authorImage,
    onComment,
  ]);

  // 댓글 좋아요
  const handleCommentLike = useCallback((commentId: number) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }, []);

  // 답글 시작
  const startReply = useCallback((commentId: number, userName: string) => {
    setReplyTarget({ commentId, userName });
    setEditingComment(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // 수정 시작
  const startEdit = useCallback((comment: Comment, parentId?: number) => {
    setEditingComment({ id: comment.id, parentId });
    setCommentText(comment.content);
    setReplyTarget(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // 댓글 삭제
  const handleDeleteComment = useCallback((commentId: number, parentId?: number) => {
    if (parentId) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: (c.replies || []).filter((r) => r.id !== commentId) };
          }
          return c;
        }),
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }, []);

  // 댓글 모달 닫기
  const closeCommentModal = useCallback(() => {
    Keyboard.dismiss();
    setCommentModalVisible(false);
    setReplyTarget(null);
    setEditingComment(null);
    setCommentText('');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      const isLiked = likedItems.has(item.id);
      const imageUrls =
        item.mediaUrls && item.mediaUrls.length > 0
          ? item.mediaUrls
          : [item.mediaUrl || item.image];
      const feedComments = getCommentsForFeed(item.id);

      return (
        <View style={[styles.slide, { height }]}>
          {/* 헤더 */}
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <View style={styles.authorInfo}>
              {authorImage && (
                <Image
                  source={{ uri: authorImage }}
                  style={styles.authorAvatar}
                  onError={() => {}}
                />
              )}
              <View>
                <Text style={styles.authorName}>{authorName || '사용자'}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 미디어 - 가로 스크롤 캐러셀 */}
          <View style={styles.mediaContainer}>
            <ImageCarousel urls={imageUrls} />
          </View>

          {/* 하단 정보 */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.description} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            {/* 액션 버튼 */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
                <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionText}>{item.likes + (isLiked ? 1 : 0)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOpenComments(item.id)}
              >
                <Text style={styles.actionIcon}>{'💬'}</Text>
                <Text style={styles.actionText}>{feedComments.length || item.comments}</Text>
              </TouchableOpacity>
            </View>

            {/* 포스트 인디케이터 */}
            <Text style={styles.pageIndicator}>
              {items.indexOf(item) + 1} / {items.length}
            </Text>
          </View>
        </View>
      );
    },
    [
      likedItems,
      authorImage,
      authorName,
      onClose,
      handleLike,
      handleOpenComments,
      items,
      insets,
      getCommentsForFeed,
    ],
  );

  if (!items[initialIndex]) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 세로 스크롤 - 포스트 간 이동 */}
        <FlatList
          ref={flatListRef}
          data={items}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.y / height);
            setCurrentIndex(newIndex);
          }}
          keyExtractor={(item) => item.id.toString()}
          decelerationRate="fast"
          snapToInterval={height}
          snapToAlignment="start"
        />

        {/* 댓글 모달 */}
        <Modal
          visible={commentModalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeCommentModal}
        >
          <View style={commentStyles.wrapper}>
            <TouchableWithoutFeedback onPress={closeCommentModal}>
              <View style={commentStyles.overlay} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                commentStyles.content,
                { transform: [{ translateY: Animated.multiply(keyboardHeight, -1) }] },
              ]}
            >
              {/* 헤더 */}
              <View style={commentStyles.header}>
                <Text style={commentStyles.headerTitle}>댓글</Text>
                <TouchableOpacity onPress={closeCommentModal}>
                  <Text style={commentStyles.headerClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* 댓글 목록 */}
              <FlatList
                data={selectedFeedId ? getCommentsForFeed(selectedFeedId) : []}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={commentStyles.list}
                ListEmptyComponent={
                  <View style={commentStyles.empty}>
                    <Text style={commentStyles.emptyText}>아직 댓글이 없습니다</Text>
                  </View>
                }
                renderItem={({ item: comment }) => {
                  const isLiked = likedComments.has(comment.id);
                  const isMine = comment.userName === currentUserName;
                  return (
                    <View>
                      {/* 댓글 */}
                      <View style={commentStyles.item}>
                        <Image
                          source={{ uri: comment.userImage }}
                          style={commentStyles.avatar}
                          onError={() => {}}
                        />
                        <View style={commentStyles.body}>
                          <View style={commentStyles.meta}>
                            <Text style={commentStyles.userName}>{comment.userName}</Text>
                            <Text style={commentStyles.time}>{comment.time}</Text>
                            {isMine && (
                              <View style={commentStyles.editActions}>
                                <TouchableOpacity
                                  style={commentStyles.editBtn}
                                  onPress={() => startEdit(comment)}
                                >
                                  <Text style={commentStyles.editText}>수정</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={commentStyles.editBtn}
                                  onPress={() => handleDeleteComment(comment.id)}
                                >
                                  <Text style={commentStyles.deleteText}>삭제</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                          <Text style={commentStyles.text}>{comment.content}</Text>
                          <View style={commentStyles.actionRow}>
                            <TouchableOpacity
                              style={commentStyles.action}
                              onPress={() => handleCommentLike(comment.id)}
                            >
                              <Text style={commentStyles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                              <Text style={commentStyles.actionLabel}>
                                {comment.likes + (isLiked ? 1 : 0)}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={commentStyles.action}
                              onPress={() => startReply(comment.id, comment.userName)}
                            >
                              <Text style={commentStyles.actionLabel}>답글 달기</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* 답글 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <View style={commentStyles.repliesBox}>
                          {comment.replies.map((reply) => {
                            const rLiked = likedComments.has(reply.id);
                            const rMine = reply.userName === currentUserName;
                            return (
                              <View key={reply.id} style={commentStyles.replyItem}>
                                <Image
                                  source={{ uri: reply.userImage }}
                                  style={commentStyles.replyAvatar}
                                  onError={() => {}}
                                />
                                <View style={commentStyles.body}>
                                  <View style={commentStyles.meta}>
                                    <Text style={commentStyles.userName}>{reply.userName}</Text>
                                    <Text style={commentStyles.time}>{reply.time}</Text>
                                    {rMine && (
                                      <View style={commentStyles.editActions}>
                                        <TouchableOpacity
                                          style={commentStyles.editBtn}
                                          onPress={() => startEdit(reply, comment.id)}
                                        >
                                          <Text style={commentStyles.editText}>수정</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          style={commentStyles.editBtn}
                                          onPress={() => handleDeleteComment(reply.id, comment.id)}
                                        >
                                          <Text style={commentStyles.deleteText}>삭제</Text>
                                        </TouchableOpacity>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={commentStyles.text}>{reply.content}</Text>
                                  <View style={commentStyles.actionRow}>
                                    <TouchableOpacity
                                      style={commentStyles.action}
                                      onPress={() => handleCommentLike(reply.id)}
                                    >
                                      <Text style={commentStyles.actionIcon}>
                                        {rLiked ? '❤️' : '🤍'}
                                      </Text>
                                      <Text style={commentStyles.actionLabel}>
                                        {reply.likes + (rLiked ? 1 : 0)}
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
              />

              {/* 수정 표시 */}
              {editingComment && (
                <View style={commentStyles.indicator}>
                  <Text style={commentStyles.indicatorEditText}>댓글 수정 중</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingComment(null);
                      setCommentText('');
                    }}
                  >
                    <Text style={commentStyles.indicatorCancel}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 답글 표시 */}
              {replyTarget && !editingComment && (
                <View style={commentStyles.indicator}>
                  <Text style={commentStyles.indicatorReplyText}>
                    @{replyTarget.userName}에게 답글 작성 중
                  </Text>
                  <TouchableOpacity onPress={() => setReplyTarget(null)}>
                    <Text style={commentStyles.indicatorCancel}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 입력창 */}
              <View style={[commentStyles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
                <TextInput
                  ref={inputRef}
                  style={commentStyles.input}
                  placeholder={
                    editingComment
                      ? '댓글 수정...'
                      : replyTarget
                        ? `@${replyTarget.userName}에게 답글 달기...`
                        : '댓글을 입력하세요...'
                  }
                  placeholderTextColor="#999"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    commentStyles.sendBtn,
                    !commentText.trim() && commentStyles.sendBtnDisabled,
                  ]}
                  onPress={handleSubmitComment}
                  disabled={!commentText.trim()}
                >
                  <Text style={commentStyles.sendText}>게시</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

// 댓글 모달 스타일
const commentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerClose: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionLabel: {
    fontSize: 12,
    color: '#666',
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  editText: {
    fontSize: 12,
    color: '#10b981',
  },
  deleteText: {
    fontSize: 12,
    color: '#ff4444',
  },
  repliesBox: {
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
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  indicatorReplyText: {
    fontSize: 13,
    color: '#10b981',
  },
  indicatorEditText: {
    fontSize: 13,
    color: '#E65100',
  },
  indicatorCancel: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  input: {
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
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#10b981',
    borderRadius: 20,
  },
  sendBtnDisabled: {
    backgroundColor: '#E5E5E5',
  },
  sendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

// 메인 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  authorName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
  },
  mediaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pageIndicator: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
  },
});
