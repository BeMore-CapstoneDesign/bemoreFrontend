# BeMore 백엔드-프론트엔드 연동 점검 결과

## 🔍 현재 상태

### ❌ 문제점
1. **백엔드 서버 미실행**: `http://localhost:3000`에서 백엔드 서버가 실행되지 않음
2. **프론트엔드 서버 미실행**: `http://localhost:3001`에서 프론트엔드 서버도 실행되지 않음
3. **환경 변수 설정**: 백엔드 API URL이 설정되지 않음

### ✅ 정상 상태
1. **프론트엔드 코드**: API 서비스가 올바르게 구현됨
2. **API 엔드포인트**: 백엔드 호출을 위한 엔드포인트가 올바르게 정의됨
3. **환경 변수**: Gemini API 키는 설정되어 있음

## 🛠️ 해결 방안

### 1단계: 백엔드 서버 실행
```bash
# 백엔드 프로젝트 디렉토리로 이동
cd ../bemore-backend  # 또는 백엔드 프로젝트 경로

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
DATABASE_URL="postgresql://username:password@localhost:5432/bemore"
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-jwt-secret"
PORT=3000

# 개발 서버 실행
npm run start:dev
```

### 2단계: 프론트엔드 서버 실행
```bash
# 현재 디렉토리에서
npm run dev
```

### 3단계: 환경 변수 추가
프론트엔드의 `.env.local` 파일에 백엔드 API URL 추가:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDGVKTfBli9qhZZp-meGJacOFjqeuQcCl4
NEXT_PUBLIC_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
NEXT_PUBLIC_SUPPRESS_REACT_WARNINGS=true
```

## 🧪 테스트 방법

### 1. 백엔드 API 직접 테스트
```bash
# 헬스 체크
curl http://localhost:3000/api/health

# 채팅 API 테스트
curl -X POST http://localhost:3000/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "테스트 메시지", "sessionId": "test-123"}'
```

### 2. VSCode REST Client 사용
`test-api.http` 파일을 VSCode에서 열고 "Send Request" 버튼을 클릭하여 각 API를 테스트

### 3. 브라우저에서 테스트
1. 프론트엔드 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3001` 접속
3. 채팅 기능 테스트

## 📋 점검 체크리스트

- [ ] 백엔드 서버가 실행 중인가? (`http://localhost:3000`)
- [ ] 프론트엔드 서버가 실행 중인가? (`http://localhost:3001`)
- [ ] `.env.local`에 `NEXT_PUBLIC_API_URL`이 설정되어 있는가?
- [ ] 백엔드 `.env`에 `GEMINI_API_KEY`가 설정되어 있는가?
- [ ] API 응답이 정상적으로 오는가? (200 OK, JSON 구조)
- [ ] CORS 에러가 발생하지 않는가?

## 🚨 문제 해결

### 백엔드 서버가 실행되지 않는 경우
1. 백엔드 프로젝트가 존재하는지 확인
2. `package.json`에 start 스크립트가 있는지 확인
3. 포트 3000이 다른 프로세스에 의해 사용되고 있는지 확인

### CORS 에러가 발생하는 경우
백엔드에서 CORS 설정 추가:
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

### API 응답이 오지 않는 경우
1. 백엔드 로그 확인
2. 네트워크 탭에서 요청/응답 확인
3. 환경 변수 설정 확인

## 📞 추가 지원

문제가 지속되는 경우 다음 정보를 함께 제공해주세요:
- 백엔드 서버 로그
- 브라우저 네트워크 탭 스크린샷
- 에러 메시지
- 환경 변수 설정 (민감한 정보 제외) 