# BeMore Development Guide

## 📋 **목차**

- [🏗️ 프로젝트 개요](#️-프로젝트-개요)
- [🛠️ 개발 환경 설정](#️-개발-환경-설정)
- [🚨 오류 예방 가이드](#-오류-예방-가이드)
- [📚 상세 개발 규칙](#-상세-개발-규칙)

---

## 🏗️ **프로젝트 개요**

BeMore는 **AI 기반 감정 분석 & CBT 피드백 서비스**로, Next.js 15 + TypeScript + Tailwind CSS 기반의 현대적 웹 애플리케이션입니다.

### **핵심 기능**
- 🎥 **영상 상담 감정 분석**: 실시간 화상 상담 기반 감정 분석
- 🤖 **AI 채팅**: Gemini API 기반 AI 상담사
- 📊 **멀티모달 분석**: 텍스트, 음성, 이미지 통합 분석
- 📄 **PDF 리포트**: 한글 폰트 지원 리포트 생성

### **기술 스택**
- **Frontend**: Next.js 15 (App Router), TypeScript 5, Tailwind CSS 4
- **State Management**: Zustand 5
- **UI Components**: Custom components + Lucide React icons
- **API**: Axios + Repository pattern
- **Development**: Turbopack, ESLint, PostCSS

### **프로젝트 구조**
```
📁 bemore-frontend/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 analysis/           # 감정 분석 페이지
│   │   ├── 📁 history/            # 히스토리 페이지
│   │   ├── 📁 profile/            # 마이페이지
│   │   └── 📁 settings/           # 설정 페이지
│   ├── 📁 components/             # React 컴포넌트
│   │   ├── 📁 analysis/           # 감정 분석 컴포넌트
│   │   ├── 📁 layout/             # 레이아웃 컴포넌트
│   │   └── 📁 ui/                 # 공통 UI 컴포넌트
│   ├── 📁 hooks/                  # Custom Hooks
│   ├── 📁 modules/                # 상태 관리 (Zustand)
│   ├── 📁 services/               # API 서비스
│   ├── 📁 types/                  # TypeScript 타입 정의
│   └── 📁 utils/                  # 유틸리티 함수
├── 📁 .cursor/rules/              # 개발 규칙 (Cursor IDE)
├── 📁 public/                     # 정적 파일
└── 📄 설정 파일들
```

---

## 🛠️ **개발 환경 설정**

### **1. 필수 환경 변수**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=BeMore
NEXT_PUBLIC_ENV=development
```

### **2. 개발 서버 실행**
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev  # http://localhost:3005
```

### **3. 빌드 및 배포**
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

### **4. Next.js 개발 서버 설정**
```bash
# package.json scripts
"dev": "next dev --turbopack -p 3005",
"build": "next build",
"start": "next start -p 3005"
```

### **5. 포트 관리**
- **기본 포트**: 3005
- **포트 충돌 시**: `lsof -ti:3005 | xargs kill -9`
- **포트 변경 시**: `-p [PORT_NUMBER]`

### **6. 브라우저 개발 설정**
- **Network 탭**: "Disable cache" 체크
- **Console 탭**: "Preserve log" 체크
- **Sources 탭**: "Pause on uncaught exceptions" 체크

---

## 🚨 **오류 예방 가이드**

### **1. 정적 파일 로딩 오류 (400 Bad Request)**

**증상:**
```
GET http://localhost:3005/_next/static/chunks/app/analysis/page-xxx.js net::ERR_ABORTED 400 (Bad Request)
GET http://localhost:3005/_next/static/css/xxx.css net::ERR_ABORTED 400 (Bad Request)
```

**원인:**
- 캐시된 빌드 파일과 새로운 코드 간 불일치
- 정적 파일 해시 변경으로 인한 400 오류
- Turbopack 캐시 손상
- 브라우저 캐시와 서버 캐시 간 동기화 문제

**해결책:**
```bash
# 1. 개발 서버 완전 종료
pkill -f "next dev"

# 2. 캐시 완전 삭제
rm -rf .next node_modules/.cache

# 3. 포트 프로세스 정리
lsof -ti:3005 | xargs kill -9

# 4. 서버 재시작
npm run dev
```

**예방 규칙:**
- 코드 변경 후 즉시 브라우저 하드 리프레시 (Cmd+Shift+R)
- 정기적인 캐시 클리닝 (주 1회)
- 개발 중 브라우저 개발자 도구 열어두기

### **2. 무한 루프 오류 (Maximum update depth exceeded)**

**증상:**
```
Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

**원인:**
- useEffect 의존성 배열에 함수 참조 포함
- 상태 업데이트가 useEffect를 다시 트리거
- 무한 리렌더링 루프

**해결책:**
```typescript
// Before (무한 루프 발생)
}, [isAnalyzing, isAudioOn, isVideoOn, onEmotionChange]);

// After (무한 루프 해결)
}, [isAnalyzing, isAudioOn, isVideoOn]);
```

**예방 규칙:**
- useEffect 의존성 배열에 함수 참조 포함 금지
- useCallback으로 함수 메모이제이션
- 상태 업데이트 로직을 useEffect 외부로 분리
- 의존성 배열 최소화

### **3. AudioContext 오류 (Cannot close a closed AudioContext)**

**증상:**
```
Error: Cannot close a closed AudioContext.
```

**원인:**
- 이미 닫힌 AudioContext를 다시 닫으려고 시도
- 컴포넌트 언마운트 시 중복 정리 로직 실행

**해결책:**
```typescript
// Before (오류 발생)
if (audioContextRef.current) {
  audioContextRef.current.close();
}

// After (안전한 정리)
if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
  try {
    audioContextRef.current.close();
  } catch (error) {
    console.warn('AudioContext already closed:', error);
  }
}
```

**예방 규칙:**
- 리소스 상태 확인 후 정리
- try-catch로 예외 상황 처리
- 컴포넌트 언마운트 시 한 번만 정리 실행

### **4. TypeScript 타입 오류**

**증상:**
```
Type error: Type '"consultation"' is not assignable to type '...'
```

**원인:**
- 새로운 타입 값 추가 시 기존 타입 정의 미업데이트
- 타입 정의와 실제 사용 간 불일치

**해결책:**
```typescript
// 타입 정의 업데이트
mediaType: 'image' | 'audio' | 'text' | 'realtime' | 'consultation';
```

**예방 규칙:**
- 새로운 타입 값 사용 전 타입 정의 먼저 업데이트
- 타입 안전성 우선 원칙
- 정기적인 타입 체크 실행

### **5. 빌드 오류 (Module parse failed)**

**증상:**
```
Module parse failed: Identifier 'toggleAnalysis' has already been declared
```

**원인:**
- 함수 중복 선언
- 리팩토링 과정에서 기존 함수 미삭제

**해결책:**
- 중복 함수 완전 제거
- 함수명 충돌 확인
- 리팩토링 후 전체 빌드 테스트

**예방 규칙:**
- 리팩토링 시 기존 코드 완전 제거 확인
- 함수명 중복 검사
- 단계별 빌드 테스트

### **응급 상황 대응 체크리스트**

**오류 발생 시 즉시 실행할 단계:**
1. **브라우저 하드 리프레시** (Cmd+Shift+R)
2. **개발자 도구 콘솔 확인**
3. **서버 로그 확인**
4. **캐시 클리닝 실행**
5. **빌드 재실행**
6. **기능 테스트**

**문제 지속 시 추가 조치:**
1. **git 상태 확인** (변경사항 백업)
2. **node_modules 재설치**
3. **포트 충돌 확인**
4. **브라우저 캐시 완전 삭제**
5. **다른 브라우저에서 테스트**

---

## 📚 **상세 개발 규칙**

### **핵심 개발 원칙**

#### **1. 안전성 우선 (Safety First)**
- **절대 금지사항**: 프로덕션 환경에 직접 배포하는 코드 생성 금지
- **Guardrails**: 테스트 외에는 개발/프로덕션 환경에서 모의 데이터를 사용 금지
- **데이터 보호**: 실제 사용자 데이터나 민감한 정보를 코드에 포함시키지 말 것
- **보안 검증**: 사용자 입력 검증, SQL 인젝션 방지, XSS 방지 코드 필수 포함

#### **2. 점진적 접근 (Incremental Approach)**
- **작은 단위로 작업**: 한 번에 100줄 이상의 코드 변경 지양
- **단계별 구현**: 복잡한 기능은 3-5단계로 나누어 구현 계획 제시
- **확인 후 진행**: 각 단계마다 구현 내용 설명 후 승인받고 진행

#### **3. 코드 품질 우선**
- **우선순위**: 가독성 > 유지보수성 > 성능 > 간결성
- **DRY 원칙**: 코드 중복을 피하고 가능한 기존 기능을 재사용
- **단순성 우선**: 언제나 가장 간단한 솔루션 선택

### **코드 컨벤션**

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

#### **스타일링 규칙**
- **Tailwind CSS**: CSS 변수 활용한 일관된 색상 팔레트
- **반응형 디자인**: 모바일 퍼스트 접근
- **컴포넌트 기반**: 재사용 가능한 클래스 조합

### **캐시 관리 전략**

#### **정기 클리닝 스케줄**
```bash
# 일일 개발 시작 시
rm -rf .next

# 주간 정기 클리닝
rm -rf .next node_modules/.cache
npm install

# 월간 전체 클리닝
rm -rf .next node_modules package-lock.json
npm install
```

#### **개발 중 캐시 문제 해결**
```bash
# 즉시 실행 스크립트
pkill -f "next dev"
sleep 2
rm -rf .next node_modules/.cache
lsof -ti:3005 | xargs kill -9
npm run dev
```

### **Git 워크플로우**

#### **커밋 규칙**
```bash
# Conventional Commits 형식
<type>(<scope>): <subject>

# 타입 종류
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

#### **브랜치 전략**
- `main`: 프로덕션 준비 코드
- `develop`: 개발 중인 기능
- `feature/*`: 개별 기능 개발
- `hotfix/*`: 긴급 수정

#### **커밋 전 체크리스트**
```bash
# 1. 빌드 테스트
npm run build

# 2. 타입 체크
npx tsc --noEmit

# 3. 린트 체크
npm run lint

# 4. 커밋
git add .
git commit -m "feat: description"
git push
```

### **성능 최적화**

#### **번들 크기 관리**
- **정기 분석**: `npm run build` 후 Route Size 확인
- **코드 분할**: 동적 import 활용
- **이미지 최적화**: Next.js Image 컴포넌트 사용

#### **메모리 관리**
- **메모리 누수 방지**: useEffect cleanup 함수 활용
- **불필요한 리렌더링 방지**: React.memo, useMemo, useCallback 활용
- **상태 최적화**: Zustand 선택적 구독 활용

#### **개발 중 성능 체크**
```bash
# 번들 크기 분석
npm run build
# 결과 확인: Route (app) Size

# 개발 서버 성능
npm run dev
# 컴파일 시간 모니터링
```

### **테스트 전략**

#### **단위 테스트**
- **컴포넌트 테스트**: React Testing Library
- **유틸리티 테스트**: Jest
- **타입 테스트**: TypeScript 컴파일러

#### **통합 테스트**
- **API 테스트**: 실제 API 엔드포인트 테스트
- **E2E 테스트**: Playwright 또는 Cypress
- **성능 테스트**: Lighthouse CI

### **오류 추적 및 디버깅**

#### **오류 로깅 설정**
```typescript
// 개발 환경 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// 오류 경계 설정
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
}
```

#### **디버깅 도구**
- React DevTools
- Redux DevTools (상태 관리 시)
- Network 탭 (API 디버깅)
- Console 탭 (로직 디버깅)

### **환경 변수 관리**

#### **환경 변수 설정**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BeMore
```

#### **환경별 설정**
- `.env.local`: 로컬 개발
- `.env.development`: 개발 서버
- `.env.production`: 프로덕션

### **의존성 관리**

#### **패키지 업데이트 전략**
```bash
# 보안 업데이트 확인
npm audit

# 의존성 업데이트
npm update

# 메이저 버전 업데이트 시
npm install package@latest
```

#### **의존성 충돌 해결**
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리닝
npm cache clean --force
```

### **배포 전 체크리스트**

- [ ] 빌드 성공 (`npm run build`)
- [ ] 타입 체크 통과 (`npx tsc --noEmit`)
- [ ] 린트 오류 없음 (`npm run lint`)
- [ ] 기능 테스트 완료
- [ ] 성능 최적화 확인
- [ ] 환경 변수 설정 완료
- [ ] 보안 검증 완료

---

## 🎯 **개발 워크플로우**

### **개발 워크플로우 규칙**

#### **코드 변경 전:**
- 현재 상태 백업 (git commit)
- 타입 정의 먼저 업데이트
- 의존성 배열 검토

#### **코드 변경 중:**
- 작은 단위로 변경
- 각 단계마다 빌드 테스트
- 브라우저에서 즉시 확인

#### **코드 변경 후:**
- 전체 빌드 실행
- 브라우저 하드 리프레시
- 기능 테스트

### **모니터링 및 디버깅**

#### **오류 로그 모니터링**
- 브라우저 콘솔 오류 주기적 확인
- 서버 로그 모니터링
- 빌드 오류 즉시 해결

#### **성능 모니터링**
- 무한 루프 감지
- 메모리 누수 확인
- 리렌더링 최적화

#### **사용자 경험 모니터링**
- UI 깨짐 현상 확인
- 기능 동작 검증
- 반응성 테스트

---

이 가이드를 준수하면 안정적이고 효율적인 개발이 가능합니다. 🚀 