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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/styles/theme';
import { SkillLevel } from '@/types/booking-types';

export const CreateBookingScreen: React.FC = () => {
  const navigation = useNavigation();

  // 폼 상태
  const [title, setTitle] = useState('');
  const [golfCourse, setGolfCourse] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState<SkillLevel>('any');
  const [description, setDescription] = useState('');
  const [hasPub, setHasPub] = useState(false);
  const [pubName, setPubName] = useState('');
  const [pubTime, setPubTime] = useState('');

  const levels: { key: SkillLevel; label: string; desc: string }[] = [
    { key: 'any', label: '누구나', desc: '실력 무관' },
    { key: 'beginner', label: '초보', desc: '1-2년차' },
    { key: 'intermediate', label: '중급', desc: '3-5년차' },
    { key: 'advanced', label: '고급', desc: '5년 이상' },
  ];

  const playerCounts = ['2', '3', '4'];

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
    if (!date.trim()) {
      Alert.alert('입력 오류', '날짜를 입력해주세요.');
      return false;
    }
    if (!time.trim()) {
      Alert.alert('입력 오류', '시간을 입력해주세요.');
      return false;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('입력 오류', '가격을 정확히 입력해주세요.');
      return false;
    }
    if (hasPub && (!pubName.trim() || !pubTime.trim())) {
      Alert.alert('입력 오류', '술집 연계 정보를 모두 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert(
      '모집글 등록',
      '골프 모집글을 등록하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '등록',
          onPress: () => {
            // TODO: API 호출하여 모집글 등록
            Alert.alert('등록 완료', '모집글이 등록되었습니다!', [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>모집글 작성</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={[styles.headerButton, styles.headerButtonPrimary]}>등록</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

        {/* 날짜 & 시간 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            날짜 & 시간 <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="2025-01-18"
              value={date}
              onChangeText={setDate}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="08:00"
              value={time}
              onChangeText={setTime}
            />
          </View>
          <Text style={styles.hint}>형식: YYYY-MM-DD, HH:MM</Text>
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
              <Text style={styles.label}>🍺 술집 연계</Text>
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
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="예상 시간 (예: 19:00)"
                value={pubTime}
                onChangeText={setPubTime}
              />
            </View>
          )}
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

      {/* 하단 등록 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>모집글 등록하기</Text>
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
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});