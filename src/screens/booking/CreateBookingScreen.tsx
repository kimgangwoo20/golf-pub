// CreateBookingScreen.tsx - 모집글 작성 화면
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Platform,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/styles/theme';
import { SkillLevel } from '@/types/booking-types';
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { validators } from '@/utils/validators';
import { firebaseStorage } from '@/services/firebase/firebaseStorage';
import { useMembershipGate } from '@/hooks/useMembershipGate';
import { PremiumGuard } from '@/components/common/PremiumGuard';

export const CreateBookingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { checkAccess } = useMembershipGate();

  // 폼 상태
  const [title, setTitle] = useState('');
  const [golfCourse, setGolfCourse] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState<SkillLevel>('any');
  const [description, setDescription] = useState('');
  const [hasPub, setHasPub] = useState(false);
  const [pubName, setPubName] = useState('');
  const [showPubTimePicker, setShowPubTimePicker] = useState(false);
  const [selectedPubTime, setSelectedPubTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(19, 0, 0, 0);
    return d;
  });
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const MAX_IMAGES = 4;

  const pickImages = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      Alert.alert('이미지 제한', `최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const levels: { key: SkillLevel; label: string; desc: string }[] = [
    { key: 'any', label: '누구나', desc: '실력 무관' },
    { key: 'beginner', label: '초보', desc: '1-2년차' },
    { key: 'intermediate', label: '중급', desc: '3-5년차' },
    { key: 'advanced', label: '고급', desc: '5년 이상' },
  ];

  const playerCounts = ['2', '3', '4'];

  // 날짜 포맷 (YYYY-MM-DD)
  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 시간 포맷 (HH:MM)
  const formatTime = (d: Date): string => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 날짜 표시 (한국어)
  const formatDateDisplay = (d: Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = days[d.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  const onPubTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPubTimePicker(false);
    }
    if (date) {
      setSelectedPubTime(date);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('입력 오류', '제목을 입력해주세요.');
      return false;
    }
    if (!golfCourse.trim()) {
      Alert.alert('입력 오류', '골프장을 입력해주세요.');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('입력 오류', '지역을 입력해주세요.');
      return false;
    }
    if (!price.trim() || !validators.isValidAmount(Number(price))) {
      Alert.alert('입력 오류', '가격을 정확히 입력해주세요. (양수만 가능)');
      return false;
    }
    if (hasPub && !pubName.trim()) {
      Alert.alert('입력 오류', '술집 이름을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert('모집글 등록', '골프 모집글을 등록하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '등록',
        onPress: async () => {
          try {
            setSubmitting(true);
            const user = useAuthStore.getState().user;
            if (!user) {
              Alert.alert('오류', '로그인이 필요합니다.');
              return;
            }

            // Firestore에 undefined 값이 들어가지 않도록 정리
            const bookingData: Record<string, any> = {
              hostId: user.uid,
              title: title.trim(),
              course: golfCourse.trim(),
              location: location.trim(),
              date: formatDate(selectedDate),
              time: formatTime(selectedTime),
              host: {
                name: user.displayName || '호스트',
                avatar: user.photoURL || '',
                rating: 0,
                handicap: 18,
                level: 'intermediate',
              },
              price: {
                original: Number(price),
                discount: 0,
                perPerson: true,
              },
              participants: {
                current: 1,
                max: Number(maxPlayers),
                members: [{ uid: user.uid, name: user.displayName || '호스트', role: 'host' }],
              },
              conditions: {
                level: level,
                pace: 'normal',
                drinking: hasPub ? 'yes' : 'no',
              },
              status: 'OPEN',
              level,
              hasPub,
            };

            // 선택 필드는 값이 있을 때만 추가 (undefined 방지)
            if (description.trim()) {
              bookingData.description = description.trim();
            }
            if (hasPub && pubName.trim()) {
              bookingData.pubName = pubName.trim();
              bookingData.pubTime = formatTime(selectedPubTime);
            }

            // 이미지 업로드
            if (images.length > 0) {
              const tempId = `booking_${Date.now()}`;
              const uploadResults = await firebaseStorage.uploadMultipleImages(
                images,
                `bookings/${tempId}`,
              );
              const imageUrls = uploadResults.map((r) => r.url);
              bookingData.images = imageUrls;
              // 첫 번째 이미지를 대표 이미지로
              bookingData.image = imageUrls[0];
            }

            await useBookingStore.getState().createBooking(bookingData as any);
            // 모임 목록 스토어 갱신
            await useBookingStore.getState().loadBookings();

            Alert.alert('등록 완료', '모집글이 등록되었습니다!', [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ]);
          } catch (error: any) {
            Alert.alert('등록 실패', error.message || '모집글 등록에 실패했습니다.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  // 멤버십 게이팅: 비구독 남성 차단
  if (!checkAccess('createBooking')) {
    return <PremiumGuard feature="모임 만들기" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>모집글 작성</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
          <Text
            style={[
              styles.headerButton,
              styles.headerButtonPrimary,
              submitting && styles.headerButtonDisabled,
            ]}
          >
            {submitting ? '등록 중...' : '등록'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 제목 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              제목 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="예: 주말 라운딩 같이 치실 분!"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          {/* 골프장 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              골프장 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="예: 세라지오CC"
              value={golfCourse}
              onChangeText={setGolfCourse}
            />
          </View>

          {/* 지역 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              지역 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="예: 경기 광주"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* 날짜 & 시간 - 피커 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              날짜 & 시간 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.pickerButton, styles.halfInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.pickerIcon}>📅</Text>
                <Text style={styles.pickerText}>{formatDateDisplay(selectedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, styles.halfInput]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.pickerIcon}>🕐</Text>
                <Text style={styles.pickerText}>{formatTime(selectedTime)}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={onDateChange}
                locale="ko"
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minuteInterval={10}
                onChange={onTimeChange}
                locale="ko"
              />
            )}
          </View>

          {/* 인원 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              최대 인원 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipRow}>
              {playerCounts.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[styles.chip, maxPlayers === count && styles.chipActive]}
                  onPress={() => setMaxPlayers(count)}
                >
                  <Text style={[styles.chipText, maxPlayers === count && styles.chipTextActive]}>
                    {count}명
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 가격 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              1인당 가격 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="120000"
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
              />
              <Text style={styles.priceUnit}>원</Text>
            </View>
            <Text style={styles.hint}>그린피, 카트비 등 모든 비용 포함</Text>
          </View>

          {/* 실력 레벨 */}
          <View style={styles.section}>
            <Text style={styles.label}>실력 레벨</Text>
            <View style={styles.levelGrid}>
              {levels.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.levelCard, level === item.key && styles.levelCardActive]}
                  onPress={() => setLevel(item.key)}
                >
                  <Text style={[styles.levelLabel, level === item.key && styles.levelLabelActive]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.levelDesc, level === item.key && styles.levelDescActive]}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 술집 연계 */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>술집 연계</Text>
                <Text style={styles.hint}>라운딩 후 골프 Pub에서 모임</Text>
              </View>
              <Switch
                value={hasPub}
                onValueChange={setHasPub}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>

            {hasPub && (
              <View style={styles.pubInputs}>
                <TextInput
                  style={styles.input}
                  placeholder="술집 이름 (예: 골프 Pub 횡성점)"
                  value={pubName}
                  onChangeText={setPubName}
                />
                <TouchableOpacity
                  style={[styles.pickerButton, { marginTop: 8 }]}
                  onPress={() => setShowPubTimePicker(true)}
                >
                  <Text style={styles.pickerIcon}>🕐</Text>
                  <Text style={styles.pickerText}>{formatTime(selectedPubTime)}</Text>
                </TouchableOpacity>
                {showPubTimePicker && (
                  <DateTimePicker
                    value={selectedPubTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minuteInterval={10}
                    onChange={onPubTimeChange}
                    locale="ko"
                  />
                )}
              </View>
            )}
          </View>

          {/* 이미지 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              사진 ({images.length}/{MAX_IMAGES})
            </Text>
            <View style={styles.imageRow}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.imageRemoveButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.imageRemoveText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < MAX_IMAGES && (
                <TouchableOpacity style={styles.imageAddButton} onPress={pickImages}>
                  <Text style={styles.imageAddIcon}>+</Text>
                  <Text style={styles.imageAddText}>사진 추가</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.hint}>골프장, 코스 사진 등을 추가하면 참가율이 높아져요</Text>
          </View>

          {/* 상세 설명 */}
          <View style={styles.section}>
            <Text style={styles.label}>상세 설명</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="라운딩 관련 상세 내용을 작성해주세요"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* 하단 여백 */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 등록 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? '등록 중...' : '모집글 등록하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'white',
  },
  headerButton: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerButtonPrimary: {
    color: colors.primary,
    fontWeight: '600',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  required: {
    color: colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgSecondary,
  },
  charCount: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.bgSecondary,
    gap: 8,
  },
  pickerIcon: {
    fontSize: 18,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: 'white',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
  },
  levelCardActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  levelLabelActive: {
    color: colors.primary,
  },
  levelDesc: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  levelDescActive: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pubInputs: {
    marginTop: 16,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  imageAddButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  imageAddIcon: {
    fontSize: 24,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  imageAddText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  textArea: {
    height: 150,
    paddingTop: 16,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: 'white',
  },
  submitButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
