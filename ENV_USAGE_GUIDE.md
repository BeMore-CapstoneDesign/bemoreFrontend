# BeMore 프론트엔드 환경 변수 사용 가이드

## 📁 파일 구조

```
bemore-frontend/
├── .env.local          # 로컬 개발용 환경 변수 (git에 커밋되지 않음)
├── .env.local.backup   # 백업 파일
└── src/
    └── services/
        └── api.ts      # API 서비스에서 환경 변수 사용
```

## 🔧 환경 변수 설정

### 현재 설정된 환경 변수

```env
# 백엔드 API 기본 URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 개발 환경 설정
NEXT_PUBLIC_SUPPRESS_REACT_WARNINGS=true

# 개발 환경 플래그
NEXT_PUBLIC_ENV=development

# 앱 정보
NEXT_PUBLIC_APP_NAME=BeMore
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 💻 코드에서 사용 방법

### 1. API 서비스에서 사용

```typescript
// src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,  // 환경 변수 사용
      timeout: 30000,
    });
  }
}
```

### 2. 컴포넌트에서 사용

```typescript
// src/components/Header.tsx
export default function Header() {
  return (
    <header>
      <h1>{process.env.NEXT_PUBLIC_APP_NAME}</h1>
      <span>v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
    </header>
  );
}
```

### 3. 조건부 렌더링에서 사용

```typescript
// src/components/DebugInfo.tsx
export default function DebugInfo() {
  if (process.env.NEXT_PUBLIC_ENV === 'development') {
    return (
      <div className="debug-info">
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <p>Environment: {process.env.NEXT_PUBLIC_ENV}</p>
      </div>
    );
  }
  return null;
}
```

## 🚨 주의사항

### 1. NEXT_PUBLIC_ 접두사 필수
- 브라우저에서 접근하려면 반드시 `NEXT_PUBLIC_`으로 시작해야 합니다.
- 접두사가 없으면 서버 사이드에서만 접근 가능합니다.

### 2. 민감한 정보 보호
```env
# ❌ 절대 하지 말 것
NEXT_PUBLIC_DATABASE_PASSWORD=secret123
NEXT_PUBLIC_JWT_SECRET=my-secret-key

# ✅ 안전한 사용법
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=BeMore
```

### 3. 환경 변수 변경 후 재시작
```bash
# 환경 변수 변경 후 개발 서버 재시작
npm run dev
```

## 🔄 환경별 설정

### 개발 환경 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=development
```

### 프로덕션 환경 (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.bemore.com
NEXT_PUBLIC_ENV=production
```

### 테스트 환경 (.env.test)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=test
```

## 📋 체크리스트

- [ ] 모든 환경 변수가 `NEXT_PUBLIC_`으로 시작하는가?
- [ ] 민감한 정보가 포함되지 않았는가?
- [ ] .gitignore에 .env*가 포함되어 있는가?
- [ ] 환경 변수 변경 후 서버를 재시작했는가?
- [ ] 백업 파일이 생성되어 있는가?

## 🛠️ 문제 해결

### 환경 변수가 읽히지 않는 경우
1. 파일명 확인: `.env.local` 또는 `.env`
2. NEXT_PUBLIC_ 접두사 확인
3. 개발 서버 재시작
4. 파일 인코딩 확인 (UTF-8)

### 타입스크립트 에러가 발생하는 경우
```typescript
// types/env.d.ts 파일 생성
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_ENV: string;
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_VERSION: string;
  }
}
``` 