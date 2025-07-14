# Gemini API 할당량 문제 해결 가이드

## 문제 상황
- API 키를 삭제하고 재발급해도 동일한 429 에러 발생
- "You exceeded your current quota" 메시지

## 가능한 원인

### 1. 프로젝트 레벨 할당량 초과
- 같은 프로젝트에서 API 키를 재발급해도 프로젝트 전체 할당량이 초과됨
- **해결책**: 새로운 Google 계정으로 새 프로젝트 생성

### 2. 계정 레벨 제한
- Google 계정 자체에 제한이 걸려있을 수 있음
- **해결책**: 완전히 새로운 Google 계정 사용

### 3. IP 기반 제한
- 특정 IP에서의 요청이 제한될 수 있음
- **해결책**: 다른 네트워크에서 테스트

## 해결 단계

### 1단계: 새로운 Google 계정 생성
1. 완전히 새로운 Google 계정 생성
2. [Google AI Studio](https://aistudio.google.com/)에 새 계정으로 로그인
3. 새 프로젝트 생성
4. 새 API 키 생성

### 2단계: 환경 변수 업데이트
```bash
# .env.local 파일 수정
NEXT_PUBLIC_GEMINI_API_KEY=새로운_API_키
```

### 3단계: 테스트
```bash
npm run dev
```

## 대안 해결책

### Mock 모드 활용
- 현재 Mock 모드가 잘 작동하고 있음
- 사용자 경험에 큰 문제 없음

### 다른 AI API 고려
- OpenAI API
- Anthropic Claude API
- 기타 AI API

## 확인 사항
- Google AI Studio에서 할당량 확인
- 프로젝트 설정에서 제한 확인
- 계정 상태 확인 