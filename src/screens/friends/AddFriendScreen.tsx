// AddFriendScreen.tsx - 친구 추가 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { searchFriends, sendFriendRequest } from '@/services/firebase/firebaseFriends';
import { useAuthStore } from '../../store/useAuthStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock 추천 친구 데이터
const mockSuggestions = [
  {
    id: 1,
    name: '강준호',
    image: 'https://i.pravatar.cc/150?img=8',
    handicap: 16,
    location: '서울 강동구',
    mutualFriends: 12,
  },
  {
    id: 2,
    name: '윤서연',
    image: 'https://i.pravatar.cc/150?img=25',
    handicap: 20,
    location: '경기 하남시',
    mutualFriends: 8,
  },
  {
    id: 3,
    name: '한민재',
    image: 'https://i.pravatar.cc/150?img=31',
    handicap: 14,
    location: '서울 송파구',
    mutualFriends: 15,
  },
];

// Mock 검색 결과
const mockSearchResults = [
  {
    id: 4,
    name: '이도현',
    image: 'https://i.pravatar.cc/150?img=52',
    handicap: 18,
    location: '서울 강남구',
    mutualFriends: 3,
  },
  {
    id: 5,
    name: '이지은',
    image: 'https://i.pravatar.cc/150?img=47',
    handicap: 22,
    location: '서울 서초구',
    mutualFriends: 0,
  },
];

type TabType = 'search' | 'suggestions' | 'qr';

export const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // QR 관련 상태
  const [qrScanModalVisible, setQrScanModalVisible] = useState(false);
  const [myQrModalVisible, setMyQrModalVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleSearch = async () => {
    if (searchText.trim().length < 2) {
      Alert.alert('알림', '2자 이상 입력해주세요.');
      return;
    }

    if (!user?.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    try {
      const currentUserId = user.uid;

      const results = await searchFriends(searchText, currentUserId);

      if (results.length === 0) {
        Alert.alert('검색 결과 없음', '검색 결과가 없습니다. 다른 검색어를 입력해주세요.');
        setSearchResults([]);
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      console.error('친구 검색 실패:', error);
      // Firebase 연결 실패 시 Mock 데이터 사용
      Alert.alert(
        '알림',
        'Firebase 연결이 필요합니다.\n임시로 Mock 데이터를 표시합니다.',
        [{ text: '확인' }]
      );
      setSearchResults(mockSearchResults);
    }
  };

  const handleAddFriend = async (userId: number, userName: string) => {
    if (!user?.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    Alert.alert(
      '친구 추가',
      `${userName}님에게 친구 요청을 보내시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '요청',
          onPress: async () => {
            try {
              const currentUserId = user.uid;

              const result = await sendFriendRequest(currentUserId, userId.toString());

              if (result.success) {
                Alert.alert('완료', result.message);
              } else {
                Alert.alert('알림', result.message);
              }
            } catch (error) {
              console.error('친구 요청 실패:', error);
              // Firebase 연결 실패 시 Mock 동작
              Alert.alert(
                '알림',
                'Firebase 연결이 필요합니다.\n친구 요청을 보냈습니다. (Mock)',
                [{ text: '확인' }]
              );
            }
          },
        },
      ]
    );
  };

  // QR 코드 스캔 시작
  const handleQRScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
        return;
      }
    }
    setScanned(false);
    setQrScanModalVisible(true);
  };

  // 내 QR 코드 보기
  const handleShowMyQR = () => {
    if (!user?.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    setMyQrModalVisible(true);
  };

  // QR 코드 스캔 결과 처리
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // QR 코드 데이터 파싱 (형식: golfpub://friend/{userId})
      const match = data.match(/golfpub:\/\/friend\/(.+)/);

      if (!match) {
        Alert.alert('오류', '유효하지 않은 QR 코드입니다.', [
          { text: '확인', onPress: () => setScanned(false) }
        ]);
        return;
      }

      const friendId = match[1];

      // 자기 자신 체크
      if (friendId === user?.uid) {
        Alert.alert('알림', '자신의 QR 코드입니다.', [
          { text: '확인', onPress: () => setScanned(false) }
        ]);
        return;
      }

      setQrScanModalVisible(false);

      // 친구 요청 보내기
      Alert.alert(
        'QR 코드 인식 완료',
        '이 사용자에게 친구 요청을 보내시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => setScanned(false)
          },
          {
            text: '요청 보내기',
            onPress: async () => {
              try {
                if (!user?.uid) {
                  Alert.alert('알림', '로그인이 필요합니다.');
                  return;
                }
                const result = await sendFriendRequest(user.uid, friendId);
                if (result.success) {
                  Alert.alert('완료', result.message);
                } else {
                  Alert.alert('알림', result.message);
                }
              } catch (error) {
                console.error('친구 요청 실패:', error);
                Alert.alert('완료', 'QR 코드로 친구 요청을 보냈습니다. (Mock)');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('QR 코드 처리 오류:', error);
      Alert.alert('오류', 'QR 코드 처리 중 오류가 발생했습니다.', [
        { text: '확인', onPress: () => setScanned(false) }
      ]);
    }
  };

  // 내 QR 코드 데이터 생성
  const getMyQRData = () => {
    return `golfpub://friend/${user?.uid || 'unknown'}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>친구 추가</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              검색
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
            onPress={() => setActiveTab('suggestions')}
          >
            <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
              추천
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'qr' && styles.activeTab]}
            onPress={() => setActiveTab('qr')}
          >
            <Text style={[styles.tabText, activeTab === 'qr' && styles.activeTabText]}>
              QR 코드
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 검색 탭 */}
          {activeTab === 'search' && (
            <View style={styles.tabContent}>
              <View style={styles.searchSection}>
                <Text style={styles.sectionTitle}>친구 검색</Text>
                <Text style={styles.sectionDescription}>
                  아이디, 이름, 전화번호로 검색하세요
                </Text>

                <View style={styles.searchInputContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="검색어를 입력하세요"
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
                  />
                  <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>검색</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 검색 결과 */}
              {searchResults.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={styles.sectionTitle}>검색 결과</Text>
                  {searchResults.map((user) => (
                    <View key={user.id} style={styles.userCard}>
                      <Image source={{ uri: user.image }} style={styles.userImage} />

                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userHandicap}>⛳ {user.handicap}</Text>
                        <Text style={styles.userLocation}>📍 {user.location}</Text>
                        {user.mutualFriends > 0 && (
                          <Text style={styles.mutualText}>
                            공통 친구 {user.mutualFriends}명
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddFriend(user.id, user.name)}
                      >
                        <Text style={styles.addButtonText}>추가</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 추천 탭 */}
          {activeTab === 'suggestions' && (
            <View style={styles.tabContent}>
              <View style={styles.suggestionsSection}>
                <Text style={styles.sectionTitle}>추천 친구</Text>
                <Text style={styles.sectionDescription}>
                  공통 친구가 많은 골퍼를 추천합니다
                </Text>

                {mockSuggestions.map((user) => (
                  <View key={user.id} style={styles.userCard}>
                    <Image source={{ uri: user.image }} style={styles.userImage} />

                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userHandicap}>⛳ {user.handicap}</Text>
                      <Text style={styles.userLocation}>📍 {user.location}</Text>
                      <Text style={styles.mutualText}>
                        공통 친구 {user.mutualFriends}명
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddFriend(user.id, user.name)}
                    >
                      <Text style={styles.addButtonText}>추가</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* QR 코드 탭 */}
          {activeTab === 'qr' && (
            <View style={styles.tabContent}>
              <View style={styles.qrSection}>
                <Text style={styles.sectionTitle}>QR 코드로 친구 추가</Text>

                <TouchableOpacity style={styles.qrCard} onPress={handleQRScan}>
                  <Text style={styles.qrIcon}>📷</Text>
                  <Text style={styles.qrTitle}>QR 코드 스캔</Text>
                  <Text style={styles.qrDescription}>
                    친구의 QR 코드를 스캔하세요
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.qrCard} onPress={handleShowMyQR}>
                  <Text style={styles.qrIcon}>📱</Text>
                  <Text style={styles.qrTitle}>내 QR 코드 보기</Text>
                  <Text style={styles.qrDescription}>
                    내 QR 코드를 친구에게 보여주세요
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* QR 스캔 모달 */}
        <Modal
          visible={qrScanModalVisible}
          animationType="slide"
          onRequestClose={() => setQrScanModalVisible(false)}
        >
          <SafeAreaView style={styles.qrModalContainer}>
            <View style={styles.qrModalHeader}>
              <TouchableOpacity
                style={styles.qrModalCloseButton}
                onPress={() => setQrScanModalVisible(false)}
              >
                <Text style={styles.qrModalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.qrModalTitle}>QR 코드 스캔</Text>
              <View style={styles.qrModalPlaceholder} />
            </View>

            <View style={styles.cameraContainer}>
              <CameraView
                onBarcodeScanned={scanned ? undefined : (result) => handleBarCodeScanned({ type: result.type, data: result.data })}
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />
              {/* 스캔 가이드 오버레이 */}
              <View style={styles.scanOverlay}>
                <View style={styles.scanGuide}>
                  <View style={[styles.scanCorner, styles.topLeft]} />
                  <View style={[styles.scanCorner, styles.topRight]} />
                  <View style={[styles.scanCorner, styles.bottomLeft]} />
                  <View style={[styles.scanCorner, styles.bottomRight]} />
                </View>
              </View>
            </View>

            <View style={styles.qrModalFooter}>
              <Text style={styles.qrModalHint}>
                친구의 QR 코드를 사각형 안에 맞춰주세요
              </Text>
              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanButtonText}>다시 스캔</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </Modal>

        {/* 내 QR 코드 모달 */}
        <Modal
          visible={myQrModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setMyQrModalVisible(false)}
        >
          <View style={styles.myQrModalOverlay}>
            <View style={styles.myQrModalContent}>
              <View style={styles.myQrHeader}>
                <Text style={styles.myQrTitle}>내 QR 코드</Text>
                <TouchableOpacity
                  style={styles.myQrCloseButton}
                  onPress={() => setMyQrModalVisible(false)}
                >
                  <Text style={styles.myQrCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.qrCodeWrapper}>
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getMyQRData())}` }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.myQrInfo}>
                <Text style={styles.myQrName}>
                  {user?.displayName || '사용자'}
                </Text>
                <Text style={styles.myQrHint}>
                  친구가 이 QR 코드를 스캔하면{'\n'}친구 요청이 전송됩니다
                </Text>
              </View>

              <TouchableOpacity
                style={styles.myQrCloseBtn}
                onPress={() => setMyQrModalVisible(false)}
              >
                <Text style={styles.myQrCloseBtnText}>닫기</Text>
              </TouchableOpacity>
            </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#10b981',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  searchButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  resultsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userHandicap: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  mutualText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  addButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  qrSection: {
    gap: 16,
  },
  qrCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qrIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  qrDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },

  // QR 스캔 모달 스타일
  qrModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  qrModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  qrModalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrModalCloseText: {
    fontSize: 24,
    color: '#fff',
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  qrModalPlaceholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanGuide: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10b981',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  qrModalFooter: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  qrModalHint: {
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  rescanButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  rescanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // 내 QR 코드 모달 스타일
  myQrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  myQrModalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  myQrHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  myQrTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  myQrCloseButton: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myQrCloseText: {
    fontSize: 20,
    color: '#666',
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  qrCodeImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#fff',
  },
  myQrInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  myQrName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  myQrHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  myQrCloseBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  myQrCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});