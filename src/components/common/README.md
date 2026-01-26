# 🧩 Common 컴포넌트 완성 패키지

## 📦 포함 파일 (5개)

**위치:** `src/components/common/`

1. ✅ **Avatar.tsx** (110줄)
   - 사용자 아바타 표시
   - 이미지 또는 이니셜 표시
   - 온라인 상태 배지
   - 크기 조절 가능 (small/medium/large 또는 숫자)

2. ✅ **Badge.tsx** (120줄)
   - 배지 표시 (숫자, 텍스트, 점)
   - 다양한 variant (primary, success, warning, danger, info)
   - 크기 조절 (small/medium/large)
   - 최대 숫자 표시 (99+)

3. ✅ **Modal.tsx** (165줄)
   - 모달 다이얼로그
   - 제목, 내용, 버튼 커스터마이징
   - 외부 클릭으로 닫기
   - 스크롤 가능한 내용

4. ✅ **LoadingSpinner.tsx** (65줄)
   - 로딩 스피너 표시
   - 로딩 메시지 표시
   - 전체 화면 오버레이 옵션
   - 크기/색상 조절

5. ✅ **EmptyState.tsx** (75줄)
   - 빈 상태 표시
   - 아이콘, 제목, 설명 표시
   - 액션 버튼 추가 가능

---

## ✅ 안전 수칙 적용

- ✅ **Named export** - 모든 파일 `export const`
- ✅ **TypeScript** - 완전한 Props 타입 정의
- ✅ **JSDoc 주석** - Props 설명 포함
- ✅ **재사용 가능** - 다양한 옵션 제공
- ✅ **Expo 호환** - React Native API만 사용

---

## 🚀 설치 방법

### Step 1: 압축 해제
```
Common-Components-Complete.zip 압축 해제
```

### Step 2: 파일 설치 (5개)
```
5개 파일 전체
→ C:\Projects\golf-pub-app\src\components\common\
  (기존 빈 파일 덮어쓰기)
```

### Step 3: 앱 재시작
```bash
npm start -- --clear
```

---

## 📖 사용 예시

### **Avatar 사용**
```typescript
import { Avatar } from '@/components/common/Avatar';

// 이미지 아바타
<Avatar uri="https://example.com/avatar.jpg" size="medium" />

// 이니셜 아바타
<Avatar name="홍길동" size="large" badge="online" />

// 커스텀 크기
<Avatar uri="..." size={80} />
```

### **Badge 사용**
```typescript
import { Badge } from '@/components/common/Badge';

// 숫자 배지
<Badge content={5} variant="danger" size="small" />

// 최대 숫자 표시
<Badge content={150} max={99} variant="primary" />

// 점 배지
<Badge dot variant="success" size="medium" />

// 텍스트 배지
<Badge content="NEW" variant="warning" />
```

### **Modal 사용**
```typescript
import { Modal } from '@/components/common/Modal';

const [visible, setVisible] = useState(false);

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="확인"
  confirmText="확인"
  cancelText="취소"
  onConfirm={() => {
    // 확인 로직
    setVisible(false);
  }}
>
  <Text>모달 내용</Text>
</Modal>
```

### **LoadingSpinner 사용**
```typescript
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// 기본 스피너
<LoadingSpinner />

// 메시지 포함
<LoadingSpinner message="로딩 중..." />

// 전체 화면
<LoadingSpinner fullScreen message="처리 중..." />

// 커스텀 색상
<LoadingSpinner color="#10b981" size="large" />
```

### **EmptyState 사용**
```typescript
import { EmptyState } from '@/components/common/EmptyState';

<EmptyState
  icon="📭"
  title="데이터가 없습니다"
  description="새로운 데이터를 추가해보세요"
  buttonText="추가하기"
  onButtonPress={() => {
    // 추가 로직
  }}
/>
```

---

## 📊 완성도 업데이트

### Before:
- ❌ Common 컴포넌트: 5개 모두 빈파일

### After:
- ✅ Common 컴포넌트: 5개 완성

**Common 컴포넌트: 0% → 100%** 🎉

---

## 🎯 다음 작업

### Phase 3: Friend 시스템 (7개)
**Screens (4개):**
1. FriendListScreen.tsx
2. CreateGroupScreen.tsx (Friend용)
3. GroupListScreen.tsx
4. InviteScreen.tsx

**Components (3개):**
5. FriendCard.tsx
6. GroupCard.tsx
7. InviteCodeCard.tsx

### Phase 4: Pub 시스템 (6개)
**Screens (3개):**
1. BestPubsScreen.tsx
2. PubDetailScreen.tsx
3. PubReviewsScreen.tsx

**Components (3개):**
4. PubBadge.tsx
5. PubCard.tsx
6. PubReviewCard.tsx
