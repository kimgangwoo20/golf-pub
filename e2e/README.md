# E2E 테스트 (Maestro)

## 설치
```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows (WSL)
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## 실행
```bash
# 전체 테스트
maestro test e2e/

# 개별 플로우
maestro test e2e/01-login-flow.yaml
maestro test e2e/02-home-screen.yaml
maestro test e2e/03-booking-flow.yaml
maestro test e2e/04-feed-flow.yaml
maestro test e2e/05-marketplace-flow.yaml
maestro test e2e/06-chat-flow.yaml
maestro test e2e/07-profile-flow.yaml
```

## 테스트 시나리오
1. 로그인/회원가입 플로우
2. 홈 화면 탐색
3. 부킹 생성/참가
4. 피드 게시글 작성
5. 중고마켓 상품 등록
6. 채팅 메시지 전송
7. 프로필 편집
