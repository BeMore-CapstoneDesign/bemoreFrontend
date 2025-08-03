# BeMore - AI 기반 감정 분석 & CBT 피드백 서비스

BeMore는 **NestJS 백엔드 + Next.js 프론트엔드** 기반으로 멀티모달 감정 분석, 인지행동치료(CBT) 피드백, 대화 리포트 PDF 생성까지 제공하는 현대적 심리 케어 서비스입니다.

> �� **최근 업데이트**: 영상 상담 UX 대폭 개선, 카메라 좌우반전 해결, 오류 예방 규칙 체계화 완료!

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-green?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 📋 **목차**

- [🏗️ 아키텍처 개요](#️-아키텍처-개요)
- [✨ 주요 기능](#-주요-기능)
- [🚀 빠른 시작](#-빠른-시작)
- [📁 프로젝트 구조](#-프로젝트-구조)
- [🎯 개발 규칙](#-개발-규칙)
- [🛠️ 개발 환경](#️-개발-환경)
- [🚨 오류 예방](#-오류-예방)
- [📚 API 문서](#-api-문서)
- [🔧 트러블슈팅](#-트러블슈팅)
- [📊 백엔드 연동 상태](#-백엔드-연동-상태)

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
├── 🗃️ Zustand 상태 관리
└── 📡 NestJS API 통신
```

### **데이터 플로우**
```
사용자 입력 → Next.js Frontend → NestJS Backend → Gemini API → 응답 → UI 업데이트
     ↓
[텍스트/음성/이미지] → [API 요청] → [감정 분석] → [CBT 피드백] → [PDF 리포트]
```

---

## ✨ **주요 기능**

### 🎥 **영상 상담 감정 분석 (최신 개선사항)**
- **원클릭 상담 시작**: "알겠습니다" 버튼으로 즉시 분석 시작
- **실시간 화상 상담** 기반 감정 분석
- **명확한 상태 표시**: 연결 중/연결됨/분석 중/종료됨
- **녹화 시간 카운터**: 실시간 상담 시간 표시
- **간소화된 컨트롤**: 카메라/마이크/전체화면/상담 종료
- **깔끔한 UI**: 불필요한 버튼 제거, 중앙 영역 최적화
- **카메라 좌우반전 해결**: 거울처럼 자연스러운 화면 표시
- **상담 종료 후 자동 결과**: 분석 결과 모달 자동 표시

### 🤖 **AI 채팅 & 감정 분석**
- **Gemini API 기반 AI 상담사**
- **멀티모달 감정 분석** (텍스트, 음성, 이미지)
- **실시간 표정 분석** (MediaPipe Face Landmarker)
- **실시간 음성 분석** (Web Audio API)
- **통합 멀티모달 분석** (신뢰도 가중치 적용)
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
- **실시간 멀티모달 대시보드**
- **VAD 기반 감정 시각화**
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
```

### 3. **의존성 설치 및 실행**
```bash
# 프론트엔드
npm install
npm run dev

# 백엔드 (별도 터미널에서)
npm install
npm run start:dev
```

### 4. **접속**
- **프론트엔드**: http://localhost:3005
- **백엔드**: http://localhost:3000

---

## 📁 **프로젝트 구조**

```
📁 bemore-frontend/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 analysis/           # 감정 분석 페이지
│   │   ├── 📁 history/           # 히스토리 페이지
│   │   ├── 📁 profile/           # 마이페이지
│   │   └── 📁 settings/          # 설정 페이지
│   ├── 📁 components/            # React 컴포넌트
│   │   ├── 📁 analysis/          # 감정 분석 컴포넌트
│   │   ├── 📁 layout/           # 레이아웃 컴포넌트
│   │   └── 📁 ui/               # 공통 UI 컴포넌트
│   ├── 📁 hooks/                # Custom Hooks
│   ├── 📁 modules/              # 상태 관리 (Zustand)
│   ├── 📁 services/             # API 서비스
│   ├── 📁 types/                # TypeScript 타입 정의
│   └── 📁 utils/                # 유틸리티 함수
├── 📁 .cursor/rules/            # 개발 규칙 (Cursor IDE)
├── 📁 public/                   # 정적 파일
└── 📄 설정 파일들
```

---

## 🎯 **개발 규칙**

### **코드 품질 규칙**

#### **TypeScript 패턴**
- **엄격한 타입 체크**: `strict: true` 설정
- **타입 우선 개발**: 새로운 타입 값 사용 전 정의 업데이트
- **인터페이스 분리**: 작고 명확한 인터페이스 설계

#### **React 컴포넌트 패턴**
- **함수형 컴포넌트**: Hooks 기반 개발
- **Props 인터페이스**: 명시적 타입 정의
- **컴포넌트 분리**: 단일 책임 원칙 적용

#### **상태 관리 패턴**
- **Zustand 스토어**: 도메인별 스토어 분리
- **불변성 유지**: immer 또는 스프레드 연산자 사용
- **선택적 구독**: 필요한 상태만 구독

### **스타일링 규칙**

#### **Tailwind CSS 패턴**
- **CSS 변수 활용**: 일관된 색상 팔레트
- **반응형 디자인**: 모바일 퍼스트 접근
- **컴포넌트 기반**: 재사용 가능한 클래스 조합

#### **디자인 시스템**
- **색상 팔레트**: primary, secondary, accent, neutral
- **타이포그래피**: NotoSansKR 폰트 사용
- **간격 시스템**: 4px 단위 기반

---

## 🛠️ **개발 환경**

### **Next.js 개발 서버 설정**
```bash
# package.json scripts
"dev": "next dev --turbopack -p 3005",
"build": "next build",
"start": "next start -p 3005"
```

### **빌드 및 배포 워크플로우**
```bash
# 개발 중
npm run dev     # 핫 리로드, 개발 모드

# 배포 전 테스트
npm run build   # 빌드 생성
npm run start   # 프로덕션 서버 테스트

# 코드 품질 검사
npm run lint    # 린트 체크
npx tsc --noEmit # 타입 체크
```

### **캐시 관리 전략**
```bash
# 정기 클리닝 (주 1회)
rm -rf .next node_modules/.cache
npm install

# 개발 중 캐시 문제 해결
pkill -f "next dev"
rm -rf .next node_modules/.cache
lsof -ti:3005 | xargs kill -9
npm run dev
```

### **브라우저 개발 설정**
- **Network 탭**: "Disable cache" 체크
- **Console 탭**: "Preserve log" 체크
- **Sources 탭**: "Pause on uncaught exceptions" 체크

### **Git 워크플로우**
```bash
# 커밋 전 체크리스트
npm run build          # 빌드 테스트
npx tsc --noEmit       # 타입 체크
npm run lint           # 린트 체크
git add .              # 변경사항 스테이징
git commit -m "feat: description"  # 커밋
git push               # 푸시
```

---

## 🚨 **오류 예방**

### **주요 오류 유형 및 해결책**

#### **1. 정적 파일 로딩 오류 (400 Bad Request)**
```bash
# 증상: GET http://localhost:3005/_next/static/chunks/xxx.js net::ERR_ABORTED 400
# 해결책:
pkill -f "next dev"
rm -rf .next node_modules/.cache
lsof -ti:3005 | xargs kill -9
npm run dev
```

#### **2. 무한 루프 오류**
```typescript
// 증상: Maximum update depth exceeded
// 원인: useEffect 의존성 배열에 함수 참조 포함
// 해결책: 함수 참조 제거
}, [isAnalyzing, isAudioOn, isVideoOn]); // onEmotionChange 제거
```

#### **3. AudioContext 오류**
```typescript
// 증상: Cannot close a closed AudioContext
// 해결책: 상태 확인 후 안전한 정리
if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
  try {
    audioContextRef.current.close();
  } catch (error) {
    console.warn('AudioContext already closed:', error);
  }
}
```

#### **4. Next.js 빌드 오류**
```bash
# 증상: Could not find a production build
# 해결책: 올바른 실행 순서
npm run build  # 1. 먼저 빌드
npm run start  # 2. 그 다음 프로덕션 서버
```

### **응급 상황 대응 체크리스트**
1. **브라우저 하드 리프레시** (Cmd+Shift+R)
2. **개발자 도구 콘솔 확인**
3. **서버 로그 확인**
4. **캐시 클리닝 실행**
5. **빌드 재실행**
6. **기능 테스트**

---

## 📚 **API 문서**

### **감정 분석 API**
```typescript
// 멀티모달 감정 분석
POST /api/emotion/analyze
{
  text?: string;
  audioFile?: File;
  imageFile?: File;
  sessionId?: string;
}

// 응답
{
  id: string;
  emotion: string;
  confidence: number;
  vadScore: { valence: number; arousal: number; dominance: number };
  cbtFeedback: CBTFeedback;
}
```

### **실시간 감정 분석 API**
```typescript
// 실시간 멀티모달 감정 분석
POST /api/emotion/analyze/realtime
{
  videoFrame: File;        // 실시간 비디오 프레임
  audioChunk: File;        // 실시간 오디오 청크
  sessionId: string;       // 상담 세션 ID
  timestamp: string        // 분석 요청 시간
}
```

### **채팅 API**
```typescript
// AI 채팅
POST /api/chat/send
{
  message: string;
  sessionId?: string;
}

// 응답
{
  id: string;
  message: string;
  timestamp: string;
  emotion?: string;
}
```

---

## 📊 **백엔드 연동 상태**

### **현재 상태**
- ❌ **백엔드 서버**: 미실행 (포트 3000)
- ❌ **실제 API 호출**: 없음 (모의 데이터 사용)
- ✅ **프론트엔드**: 백엔드 연동 준비 완료

### **필요한 백엔드 기능**
1. **실시간 멀티모달 감정 분석 API**
2. **상담 세션 관리 API**
3. **감정 히스토리 API**
4. **CBT 피드백 생성 API**

### **백엔드 개발 요청사항**
```bash
# 백엔드 서버 실행
cd ../bemore-backend
npm install
npm run start:dev  # 포트 3000에서 실행
```

---

## 🔧 **트러블슈팅**

### **자주 발생하는 문제**

#### **포트 충돌**
```bash
# 포트 3005가 이미 사용 중인 경우
lsof -ti:3005 | xargs kill -9
```

#### **빌드 실패**
```bash
# 캐시 클리닝 후 재빌드
rm -rf .next
npm run build
```

#### **타입 오류**
```bash
# 타입 체크 실행
npx tsc --noEmit
```

#### **환경 변수 오류**
```bash
# .env.local 파일 확인
cat .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### **성능 최적화**
- **번들 크기 분석**: `npm run build` 후 Route Size 확인
- **메모리 누수 확인**: React DevTools Profiler 사용
- **리렌더링 최적화**: React DevTools Components 탭 활용

---

## 🤝 **기여하기**

1. **Fork** the Project
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

## 📞 **연락처**

- **프로젝트 링크**: [https://github.com/BeMore-CapstoneDesign/bemoreFrontend](https://github.com/BeMore-CapstoneDesign/bemoreFrontend)
- **이슈 리포트**: [https://github.com/BeMore-CapstoneDesign/bemoreFrontend/issues](https://github.com/BeMore-CapstoneDesign/bemoreFrontend/issues)

---

**BeMore** - 더 나은 마음 건강을 위한 AI 기반 심리 케어 서비스 🧠💙