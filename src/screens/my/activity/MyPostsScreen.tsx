// MyPostsScreen.tsx - 내가 쓴 모집글 화면 (Firestore 연동)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeedStore } from '@/store/useFeedStore';

export const MyPostsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { myPosts, loading: storeLoading, loadMyPosts } = useFeedStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadMyPosts(user.uid);
    }
  }, [user?.uid, loadMyPosts]);

  const handleRefresh = useCallback(async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    await loadMyPosts(user.uid);
    setRefreshing(false);
  }, [user?.uid, loadMyPosts]);

  const getStatusBadge = (status: string) => {
    if (status === 'recruiting' || status === 'published') {
      return { text: '모집중', color: '#10b981', bgColor: '#E8F5E9' };
    } else if (status === 'completed') {
      return { text: '완료', color: '#666', bgColor: '#F5F5F5' };
    } else {
      return { text: '취소', color: '#FF3B30', bgColor: '#FFE5E5' };
    }
  };

  const handleEditPost = (id: string) => {
    // Feed 탭의 CreatePost 화면으로 이동하여 수정
    (navigation as any).navigate('Feed', { screen: 'CreatePost', params: { editId: id } });
  };

  const handleDeletePost = (id: string) => {
    Alert.alert('모집글 삭제', '이 모집글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const { firestore: firebaseFirestore } =
              await import('@/services/firebase/firebaseConfig');
            await firebaseFirestore.collection('posts').doc(id).delete();
            Alert.alert('완료', '모집글이 삭제되었습니다.');
            if (user?.uid) {
              loadMyPosts(user.uid);
            }
          } catch (error: any) {
            Alert.alert('오류', error.message || '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const posts = myPosts as any[];

  if (storeLoading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>내가 쓴 모집글</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내가 쓴 모집글</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 통계 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>총 작성</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {
                posts.filter((p: any) => p.status === 'recruiting' || p.status === 'published')
                  .length
              }
            </Text>
            <Text style={styles.statLabel}>모집중</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {posts.filter((p: any) => p.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
        >
          {posts.length > 0 ? (
            <View style={styles.postList}>
              {posts.map((post: any) => {
                const statusBadge = getStatusBadge(post.status);

                return (
                  <View key={post.id} style={styles.postCard}>
                    {/* 이미지 */}
                    {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}

                    {/* 상태 배지 */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                      <Text style={[styles.statusText, { color: statusBadge.color }]}>
                        {statusBadge.text}
                      </Text>
                    </View>

                    {/* 내용 */}
                    <View style={styles.postContent}>
                      <Text style={styles.postTitle}>{post.title || post.content}</Text>
                      {post.golfCourse && (
                        <Text style={styles.postInfo}>
                          ⛳ {post.golfCourse} · {post.location}
                        </Text>
                      )}
                      {post.date && <Text style={styles.postInfo}>📅 {post.date}</Text>}

                      {post.price > 0 && (
                        <View style={styles.postFooter}>
                          <Text style={styles.postPrice}>{post.price.toLocaleString()}원/인</Text>
                          {post.maxPlayers > 0 && (
                            <Text style={styles.postPlayers}>
                              {post.currentPlayers}/{post.maxPlayers}명
                            </Text>
                          )}
                        </View>
                      )}

                      {post.createdAt && (
                        <Text style={styles.postDate}>
                          작성일: {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                        </Text>
                      )}

                      {/* 버튼 */}
                      {(post.status === 'recruiting' || post.status === 'published') && (
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => handleEditPost(post.id)}
                          >
                            <Text style={styles.editButtonText}>수정</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeletePost(post.id)}
                          >
                            <Text style={styles.deleteButtonText}>삭제</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>작성한 모집글이 없습니다</Text>
            </View>
          )}

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  postList: {
    marginHorizontal: 16,
    gap: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5E5',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  postInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  postPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  postPlayers: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#E8F5E9',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
});
