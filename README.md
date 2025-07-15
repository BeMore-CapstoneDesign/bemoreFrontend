# BeMore - AI 기반 감정 분석 & CBT 피드백 서비스

BeMore는 **NestJS 백엔드 + Next.js 프론트엔드** 기반으로 멀티모달 감정 분석, 인지행동치료(CBT) 피드백, 대화 리포트 PDF 생성까지 제공하는 현대적 심리 케어 서비스입니다.

> 🎉 **최근 업데이트**: Gemini API 모델 업데이트 및 데이터베이스 세션 관리 개선 완료!

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-green?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 🏗️ **아키텍처 개요**

### **NestJS 백엔드 + Next.js 프론트엔드 구조**
```
📁 NestJS Backend (TypeScript)
├── 🎤 Gemini API 통합
├── 🎭 감정 분석 엔진
├── 📊 CBT 피드백 시스템
├── 🗄️ Prisma ORM + PostgreSQL/SQLite
└── 📄 PDF 리포트 생성

📁 Next.js Frontend (TypeScript)
├── 🎨 UI/UX 컴포넌트
├── 📱 반응형 디자인
├── 🗃️ 상태 관리
└── 📡 NestJS API 통신
```

### **데이터 플로우**
```
사용자 입력 → Next.js Frontend → NestJS Backend → Gemini API → 응답 → UI 업데이트
     ↓
[텍스트/음성/이미지] → [API 요청] → [감정 분석] → [CBT 피드백] → [PDF 리포트]
```

---

## ✨ 주요 기능

### 🤖 **AI 채팅 & 감정 분석**
- **Gemini API 기반 AI 상담사**
- **멀티모달 감정 분석** (텍스트, 음성, 이미지)
- **실시간 CBT 피드백** 및 맞춤형 대화
- **감정 변화 추적** 및 세션 히스토리

### 📊 **세션 리포트 & PDF 생성**
- **한글 폰트 지원** (NotoSansKR)
- **BeMore 브랜드 컬러** (보라/파랑)
- **카드형 레이아웃** 및 자동 줄바꿈
- **감정 변화 그래프** 및 CBT 기법 제안

### 🎨 **현대적 UI/UX**
- **반응형 디자인** (모바일/데스크톱)
- **직관적 인터페이스** 및 접근성
- **로딩 애니메이션** 및 사용자 피드백
- **다크/라이트 모드** 지원

---

## 🚀 **빠른 시작**

### 1. **프로젝트 클론**
```bash
# 프론트엔드
git clone https://github.com/BeMore-CapstoneDesign/bemoreFrontend.git
cd bemoreFrontend

# 백엔드
git clone https://github.com/BeMore-CapstoneDesign/bemoreBackend.git
cd bemoreBackend
```

### 2. **환경 변수 설정**

#### **프론트엔드 (.env.local)**
```env
# 백엔드 API 기본 URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 개발 환경 설정
NEXT_PUBLIC_SUPPRESS_REACT_WARNINGS=true
NEXT_PUBLIC_ENV=development

# 앱 정보
NEXT_PUBLIC_APP_NAME=BeMore
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### **백엔드 (.env)**
```env
# Database (개발용 SQLite)
DATABASE_URL="file:./dev.db"

# Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# JWT
JWT_SECRET="bemore-jwt-secret-key-2024"

# Server
PORT=3000

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DEST="./uploads"
```

### 3. **의존성 설치 및 실행**

#### **백엔드 실행**
```bash
cd bemoreBackend

# 의존성 설치
npm install

# 데이터베이스 초기화
npx prisma db push

# 개발 서버 실행
npm run start:dev
```

#### **프론트엔드 실행**
```bash
cd bemoreFrontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. **접속 확인**
- **프론트엔드**: http://localhost:3001
- **백엔드 API**: http://localhost:3000/api
- **API 문서**: http://localhost:3000/api/docs

### 5. **기능 테스트**
```bash
# 백엔드 API 테스트
curl -X POST http://localhost:3000/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요, 오늘 기분이 좋지 않아요"}'

# 예상 응답
{
  "success": true,
  "data": {
    "content": "안녕하세요. 오늘 기분이 좋지 않다고 하셨네요...",
    "emotionAnalysis": {
      "primaryEmotion": "슬픔",
      "confidence": 0.95,
      "suggestions": ["현재 상황에 대한 구체적인 내용 파악..."]
    }
  }
}
```

---

## 🛠️ **개발 가이드**

### **프로젝트 구조**
```
bemore-frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 컴포넌트
│   ├── services/           # API 서비스
│   ├── types/              # TypeScript 타입 정의
│   └── utils/              # 유틸리티 함수
├── public/                 # 정적 파일
├── .env.local             # 환경 변수
└── package.json

bemore-backend/
├── src/
│   ├── modules/            # NestJS 모듈
│   ├── controllers/        # API 컨트롤러
│   ├── services/          # 비즈니스 로직
│   └── prisma/            # 데이터베이스 스키마
├── .env                   # 환경 변수
└── package.json
```

### **주요 API 엔드포인트**
```typescript
// AI 채팅
POST /api/chat/gemini
{
  "message": "사용자 메시지",
  "sessionId": "세션 ID",
  "emotionContext": { ... }
}

// 감정 분석
POST /api/emotion/analyze
// multipart/form-data: text, audio, image

// 세션 히스토리
GET /api/history/{userId}

// PDF 리포트
POST /api/history/session/{sessionId}/pdf
```

### **환경별 설정**

#### **개발 환경**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL="file:./dev.db"
```

#### **프로덕션 환경**
```env
NEXT_PUBLIC_API_URL=https://api.bemore.com
DATABASE_URL="postgresql://user:pass@host:5432/bemore"
```

---

## 📚 **기술 스택**

### **프론트엔드**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS
- **State Management**: React Hooks + Context
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **HTTP Client**: Axios

### **백엔드**
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL / SQLite (Prisma ORM)
- **AI Integration**: Google Gemini API
- **Authentication**: JWT
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI

### **개발 도구**
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git
- **Deployment**: Vercel (Frontend) / Railway (Backend)

---

## 🧪 **테스트**

### **API 테스트**
```bash
# VSCode REST Client 사용
# test-api.http 파일에서 "Send Request" 클릭

# 또는 curl 사용
curl -X POST http://localhost:3000/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "테스트 메시지"}'
```

### **프론트엔드 테스트**
```bash
npm run test
npm run test:e2e
```

## 🔧 **최근 해결된 문제들**

### ✅ **Gemini API 모델 업데이트**
- **문제**: `gemini-pro` 모델이 더 이상 지원되지 않음
- **해결**: `gemini-1.5-flash` 모델로 업데이트
- **결과**: AI 채팅 기능 정상 작동

### ✅ **데이터베이스 세션 관리 개선**
- **문제**: 외래키 제약 조건 위반으로 메시지 저장 실패
- **해결**: 세션 생성 로직 단순화 및 사용자 생성 순서 최적화
- **결과**: 안정적인 세션 및 메시지 저장

### ✅ **백엔드-프론트엔드 통합 완료**
- **상태**: 모든 API 엔드포인트 정상 작동
- **테스트**: 실제 채팅 및 감정 분석 기능 검증 완료
- **성능**: 빠른 응답 시간 및 안정적인 데이터 처리

---

## 📄 **문서**

- [📋 API 통합 상태](API_INTEGRATION_STATUS.md)
- [🔧 환경 변수 가이드](ENV_USAGE_GUIDE.md)
- [🏗️ 아키텍처 문서](ARCHITECTURE.md)
- [📈 마이그레이션 계획](MIGRATION_PLAN.md)
- [⚙️ 백엔드 환경 설정](BACKEND_ENV_STATUS.md)
- [🔍 문제 해결 가이드](TROUBLESHOOTING.md)

## 🚀 **다음 개발 계획**

### **단기 목표 (1-2주)**
- [ ] 사용자 인증 시스템 구현
- [ ] 음성 입력 기능 추가
- [ ] 실시간 감정 분석 대시보드
- [ ] 모바일 앱 최적화

### **중기 목표 (1-2개월)**
- [ ] 멀티모달 감정 분석 (음성 + 표정)
- [ ] 개인화된 CBT 프로그램
- [ ] 그룹 세션 기능
- [ ] AI 기반 진단 시스템

### **장기 목표 (3-6개월)**
- [ ] 전문가 상담사 연동
- [ ] 임상 데이터 분석
- [ ] 연구 기관 협력
- [ ] 글로벌 서비스 확장

---

## 🤝 **기여하기**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

## 🙌 **팀원**

- **Frontend Developer**: [@your-username](https://github.com/your-username)
- **Backend Developer**: [@your-username](https://github.com/your-username)
- **UI/UX Designer**: [@your-username](https://github.com/your-username)

---

## 💜 **BeMore는 여러분의 마음을 항상 응원합니다!**

> "마음의 변화는 작은 대화에서 시작됩니다. BeMore와 함께 더 나은 내일을 만들어가세요."

---

**Made with ❤️ by BeMore Team**