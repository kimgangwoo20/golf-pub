// MyPostsScreen.tsx - 내가 쓴 모집글 화면

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../store/useAuthStore';

// Mock 내가 쓴 모집글 데이터
const mockMyPosts = [
  {
    id: 1,
    title: '주말 라운딩 같이 치실 분!',
    golfCourse: '세라지오CC',
    location: '경기 광주',
    date: '2025.01.17',
    time: '10:00',
    price: 120000,
    currentPlayers: 4,
    maxPlayers: 4,
    status: 'completed', // recruiting, completed, cancelled
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    createdAt: '2025.01.10',
  },
  {
    id: 2,
    title: '평일 오후 라운딩',
    golfCourse: '남서울CC',
    location: '서울 강남',
    date: '2025.01.30',
    time: '14:00',
    price: 150000,
    currentPlayers: 2,
    maxPlayers: 4,
    status: 'recruiting',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
    createdAt: '2025.01.15',
  },
  {
    id: 3,
    title: '초보 환영 라운딩',
    golfCourse: '대관령CC',
    location: '강원 평창',
    date: '2025.02.05',
    time: '09:00',
    price: 100000,
    currentPlayers: 1,
    maxPlayers: 4,
    status: 'recruiting',
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400',
    createdAt: '2025.01.20',
  },
];

export const MyPostsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState(mockMyPosts);
  const [refreshing, setRefreshing] = useState(false);

  // 새로고침
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'recruiting') {
      return { text: '모집중', color: '#2E7D32', bgColor: '#E8F5E9' };
    } else if (status === 'completed') {
      return { text: '완료', color: '#666', bgColor: '#F5F5F5' };
    } else {
      return { text: '취소', color: '#FF3B30', bgColor: '#FFE5E5' };
    }
  };

  const handleEditPost = (id: number) => {
    Alert.alert('모집글 수정', '수정 기능은 개발 예정입니다.');
    // TODO: 수정 화면으로 이동
  };

  const handleDeletePost = (id: number) => {
    Alert.alert(
      '모집글 삭제',
      '이 모집글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setPosts(posts.filter(p => p.id !== id));
            Alert.alert('완료', '모집글이 삭제되었습니다.');
          },
        },
      ]
    );
  };

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
              {posts.filter(p => p.status === 'recruiting').length}
            </Text>
            <Text style={styles.statLabel}>모집중</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {posts.filter(p => p.status === 'completed').length}
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
              tintColor="#2E7D32"
              colors={['#2E7D32']}
            />
          }
        >
          <View style={styles.postList}>
            {posts.map((post) => {
              const statusBadge = getStatusBadge(post.status);

              return (
                <View key={post.id} style={styles.postCard}>
                  {/* 이미지 */}
                  <Image source={{ uri: post.image }} style={styles.postImage} />

                  {/* 상태 배지 */}
                  <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                    <Text style={[styles.statusText, { color: statusBadge.color }]}>
                      {statusBadge.text}
                    </Text>
                  </View>

                  {/* 내용 */}
                  <View style={styles.postContent}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postInfo}>⛳ {post.golfCourse} · {post.location}</Text>
                    <Text style={styles.postInfo}>📅 {post.date} {post.time}</Text>

                    <View style={styles.postFooter}>
                      <Text style={styles.postPrice}>
                        {post.price.toLocaleString()}원/인
                      </Text>
                      <Text style={styles.postPlayers}>
                        {post.currentPlayers}/{post.maxPlayers}명
                      </Text>
                    </View>

                    <Text style={styles.postDate}>작성일: {post.createdAt}</Text>

                    {/* 버튼 */}
                    {post.status === 'recruiting' && (
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
    color: '#2E7D32',
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
    color: '#2E7D32',
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
    color: '#2E7D32',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  bottomSpacing: {
    height: 40,
  },
});