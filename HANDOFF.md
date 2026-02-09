# 인수인계: BackgroundMediaEditor 모달 렌더링 버그

## 현재 버그
**BackgroundMediaEditor 모달이 열리면 화면이 어두워지지만(overlay 작동), 내부 흰색 컨테이너와 버튼들이 보이지 않음.**

### 재현 방법
1. My 홈피 탭 이동
2. 히어로 영역 우상단 🖼️ 버튼 탭
3. 화면이 어두워지지만 편집 UI가 표시되지 않음

---

## 핵심 파일

### 1. `src/components/common/BackgroundMediaEditor.tsx` (메인 버그 파일)
- **Modal 구조**: 단일 Modal 안에 4개 레이어 (메인 / 미리보기 / 액션시트 / 알림)
- `Alert.alert()`을 Modal 내부에서 사용하면 Alert가 Modal 뒤에 가려지므로, 커스텀 ActionSheet + Alert Dialog 오버레이로 대체함
- **레이어 zIndex**: 미리보기(30) < 액션시트(40) < Alert(50)
- 각 오버레이는 `StyleSheet.absoluteFillObject` + `zIndex` 사용

### 2. `src/screens/my/MyHomeScreen.tsx`
- Line ~1096: `setBgEditorVisible(true)` → BackgroundMediaEditor 열기
- Line ~1813: `<BackgroundMediaEditor visible={bgEditorVisible} media={backgroundMedia} ...>`
- Line ~284: `backgroundMedia` = `profile?.backgroundMedia` 또는 빈 배열
- Line ~287: `photoList` = backgroundMedia URLs 또는 `[null]` (빈 슬라이드 1개)

### 3. `src/services/api/profileAPI.ts`
- `addBackgroundMedia(uri, type)`: Storage `backgrounds/{uid}/` 업로드 → Firestore `backgroundMedia[]` 배열 추가
- `removeBackgroundMedia(url)`: Storage 삭제 → Firestore 배열 제거 + 순서 재정렬
- `reorderBackgroundMedia(media)`: 순서 변경 (UI 미연결)

### 4. `src/store/useProfileStore.ts`
- `UserProfile` 인터페이스에 `backgroundMedia?` 필드 추가됨
- `loadProfile()`: Firestore `users/{uid}` 문서 전체를 가져옴 (backgroundMedia 포함)

### 5. `storage.rules`
- `backgrounds/{userId}/{fileName}` 규칙 있음
- `isMedia()` 헬퍼: 이미지 또는 동영상 contentType 검증
- **이미 배포 완료** (`firebase deploy --only storage`)

---

## 의심되는 원인

### Modal 내부 컨테이너가 화면에 표시되지 않는 문제

현재 구조:
```tsx
<Modal transparent animationType="slide">
  <View style={overlay}>          // flex:1, justifyContent:'flex-end', rgba 배경
    <Pressable style={overlayDismiss} />  // flex:1 (터치 시 닫기)
    <View style={container}>       // backgroundColor:#fff, maxHeight:'85%', borderRadius
      <SafeAreaView style={safeArea}>  // flex:1 ← 문제 의심!
        ... 드래그핸들, 헤더, FlatList, 버튼 ...
      </SafeAreaView>
    </View>
  </View>
</Modal>
```

**가능한 원인들:**
1. `container`에 `flex`나 고정 높이 없이 `maxHeight:'85%'`만 설정 → 내부 `SafeAreaView`의 `flex:1`이 부모 높이를 결정 못해 0px로 렌더링
2. `safeArea`의 `flex:1`이 `container` 안에서 높이를 확보하지 못함
3. Android에서 `transparent` Modal + `animationType="slide"` 조합의 렌더링 이슈

**시도해볼 수정:**
- `safeArea`에서 `flex: 1` 제거
- `container`에 `minHeight: 300` 추가
- `container`에 `flex: 0` 명시
- 또는 `container`를 `flex` 기반이 아닌 고정 높이로 변경

---

## 이전에 시도했다가 실패한 방법들

| 시도 | 결과 | 원인 |
|------|------|------|
| Modal 안에 중첩 Modal | Android에서 렌더링 안 됨 | Android Modal 중첩 미지원 |
| 조건부 return으로 Modal 교체 | 새 Modal 안 나타남 | 언마운트/리마운트 시 Android 렌더링 실패 |
| 단일 Modal + 내부 오버레이 (flex:1) | 오버레이 보이나 버튼 없음 | `flex:1`로 위치 계산 실패, `absoluteFillObject` 필요 |
| Alert.alert() 사용 | 화면 어두워지나 Alert 안 보임 | Modal 뒤에 Alert가 가려짐 |
| 커스텀 ActionSheet + Alert 오버레이 (현재) | 모달 열리나 내부 컨텐츠 안 보임 | **container/safeArea 레이아웃 문제 의심** |

---

## 작동하는 참고 패턴

### 프로필 수정 (EditProfileScreen.tsx)
- `showImagePickerOptions()` → `Alert.alert()` 사용 (Modal 밖에서 호출하므로 정상 작동)
- 프로필 편집은 Modal이 아닌 별도 Screen이라 Alert 문제 없음

### ImageCropModal (정상 작동하는 Modal)
- `src/components/common/ImageCropModal.tsx` 참고
- 이 모달은 정상적으로 표시됨 → 구조 비교하면 원인 파악 가능

---

## 완료된 작업 (이번 세션)

1. ✅ `storage.rules`: `isMedia()` 헬퍼 추가, `backgrounds/` contentType 검증 (배포 완료)
2. ✅ `useProfileStore.ts`: `UserProfile`에 `backgroundMedia?` 필드 추가
3. ✅ `MyHomeScreen.tsx`: 빈 슬라이드 `[null,null]` → `[null]`, 미사용 `backgroundImage` 코드 제거
4. ✅ `BackgroundMediaEditor.tsx`: `Alert.alert` → 커스텀 오버레이 전환 (렌더링 버그 남음)
5. ✅ TypeScript 0 에러, ESLint 0 에러

## 미완료 작업

1. ❌ **BackgroundMediaEditor 모달 내부 컨텐츠 렌더링 수정** (핵심 버그)
2. ❌ 디바이스 테스트 미완료 (모달 열림은 확인, 내용 표시 안 됨)

---

## 환경

- Metro 번들러: 포트 8081 실행 중 (background task `bd1f16e`)
- 디바이스: SM_S901N (Galaxy S22)
- 빌드: `npx expo run:android` (성공, 12s)
- TypeScript: 0 에러
- ESLint: 0 에러 (warnings만 - 기존 `no-explicit-any`)

## 명령어
```bash
npx expo run:android          # 빌드 & 디바이스 연결
npx tsc --noEmit              # 타입 체크
npx eslint src/... --fix      # 린트
firebase deploy --only storage # Storage 규칙 배포
```
