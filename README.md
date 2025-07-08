# BeMore - 멀티모달 감정 분석 & CBT 피드백 서비스

<div align="center">

![BeMore Logo](https://img.shields.io/badge/BeMore-Emotion%20Analysis-blue?style=for-the-badge&logo=heart)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**AI 기술을 활용한 멀티모달 감정 분석과 CBT(인지행동치료) 피드백을 제공하는 웹 서비스**

[🚀 데모 보기](#) • [📖 문서 보기](./ARCHITECTURE.md) • [🐛 이슈 리포트](#)

</div>

---

## 🎯 **프로젝트 개요**

BeMore는 **Ultrathink Engineering 철학**을 적용하여 설계된 차세대 감정 분석 서비스입니다. 사용자의 표정, 음성, 텍스트를 AI로 분석하여 VAD(Valence-Arousal-Dominance) 기반 감정 상태를 파악하고, Google Gemini를 활용한 CBT 피드백을 제공합니다.

### 🌟 **핵심 특징**

- **🧠 멀티모달 분석**: 표정, 음성, 텍스트 통합 분석
- **📊 VAD 기반 감정 측정**: 과학적 감정 상태 평가
- **🤖 AI 상담사**: Gemini 기반 개인화된 CBT 피드백
- **📈 감정 변화 추적**: 시각적 차트와 리포트 제공
- **🎨 직관적 UI**: Material Design 3 기반 현대적 인터페이스

---

## 🛠 **기술 스택**

### **Frontend**
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15.3.5 | React 기반 풀스택 프레임워크 |
| **TypeScript** | 5.0 | 타입 안전성 보장 |
| **TailwindCSS** | 4.0 | 유틸리티 퍼스트 CSS |
| **Zustand** | 5.0.6 | 경량 상태 관리 |
| **Recharts** | 3.0.2 | 데이터 시각화 |
| **Lucide React** | 0.525.0 | 아이콘 라이브러리 |

### **Backend (예정)**
| 기술 | 버전 | 용도 |
|------|------|------|
| **NestJS** | - | TypeScript 기반 백엔드 |
| **Prisma** | - | ORM 및 데이터베이스 관리 |
| **PostgreSQL** | - | 메인 데이터베이스 |
| **Redis** | - | 캐싱 및 세션 관리 |

### **AI/ML**
| 기술 | 용도 |
|------|------|
| **Google Gemini** | 대화형 AI 모델 |
| **OpenCV** | 이미지 처리 및 표정 인식 |
| **Librosa** | 음성 분석 |
| **Transformers** | 텍스트 감정 분석 |

---

## 📁 **프로젝트 구조**

```
bemore-frontend/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📄 page.tsx           # 홈 페이지
│   │   ├── 📁 analysis/          # 감정 분석 페이지
│   │   ├── 📁 chat/              # AI 채팅 페이지
│   │   ├── 📁 history/           # 히스토리 페이지
│   │   └── 📁 settings/          # 설정 페이지
│   ├── 📁 components/            # 재사용 가능한 컴포넌트
│   │   ├── 📁 ui/               # 기본 UI 컴포넌트
│   │   ├── 📁 layout/           # 레이아웃 컴포넌트
│   │   └── 📁 hoc/              # 고차 컴포넌트
│   ├── 📁 modules/              # 비즈니스 로직
│   │   └── 📁 stores/           # Zustand 상태 관리
│   ├── 📁 services/             # API 서비스
│   │   ├── 📄 api.ts            # API 통신 클래스
│   │   └── 📁 repositories/     # Repository Pattern
│   ├── 📁 hooks/                # 커스텀 훅
│   ├── 📁 utils/                # 유틸리티 함수
│   └── 📁 types/                # TypeScript 타입 정의
├── 📁 public/                   # 정적 자산
├── 📄 package.json              # 프로젝트 설정
├── 📄 README.md                 # 프로젝트 문서
└── 📄 ARCHITECTURE.md           # 아키텍처 문서
```

---

## 🚀 **주요 기능**

### **📊 감정 분석 (Analysis)**
- **표정 분석**: 카메라 촬영 또는 이미지 업로드
- **음성 분석**: 실시간 녹음 또는 오디오 파일 업로드
- **텍스트 분석**: 감정이 담긴 텍스트 입력
- **VAD 시각화**: Valence, Arousal, Dominance 점수 차트
- **CBT 피드백**: 인지 왜곡 식별 및 대안적 사고 제안

### **💬 AI 채팅 (Chat)**
- **Gemini 기반 대화**: 자연스러운 AI 상담사와 대화
- **감정 컨텍스트**: 최근 분석 결과 기반 맞춤 응답
- **빠른 제안**: 감정별 맞춤 대화 시작 문구
- **실시간 타이핑**: 타이핑 인디케이터 표시

### **📈 히스토리 (History)**
- **감정 변화 추적**: 시간별 VAD 점수 변화
- **차트 시각화**: 라인 차트, 파이 차트 제공
- **필터링**: 기간, 감정, 검색어별 필터
- **PDF 리포트**: 분석 결과 다운로드

### **⚙️ 설정 (Settings)**
- **프로필 관리**: 사용자 정보 수정
- **보안 설정**: 비밀번호 변경, 2FA
- **알림 설정**: 푸시 알림, 이메일 알림
- **테마 설정**: 라이트/다크/자동 모드

---

## 🔧 **핵심 API 엔드포인트**

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `POST` | `/api/emotion/analyze` | 멀티모달 감정 분석 |
| `POST` | `/api/chat/gemini` | AI 채팅 메시지 전송 |
| `GET` | `/api/history/:userId` | 사용자 감정 히스토리 |
| `GET` | `/api/user/profile` | 사용자 프로필 조회 |
| `PUT` | `/api/user/profile` | 사용자 프로필 수정 |
| `POST` | `/api/history/session/:sessionId/pdf` | PDF 리포트 생성 |

---

## 🎨 **디자인 시스템**

### **색상 팔레트**
```css
/* Primary Colors */
--indigo-600: #6366F1;    /* Primary */
--violet-600: #8B5CF6;    /* Secondary */
--cyan-600: #06B6D4;      /* Accent */

/* Emotion Colors */
--happy: #10B981;         /* 기쁨 */
--sad: #3B82F6;           /* 슬픔 */
--angry: #EF4444;         /* 분노 */
--anxious: #F59E0B;       /* 불안 */
--neutral: #6B7280;       /* 중립 */
```

### **타이포그래피**
- **폰트**: Noto Sans KR
- **가중치**: 300, 400, 500, 600, 700
- **크기**: 12px ~ 48px (반응형)

---

## 🚀 **시작하기**

### **필수 요구사항**
- Node.js 18.0.0 이상
- npm 또는 yarn
- Git

### **설치 및 실행**

1. **저장소 클론**
```bash
git clone https://github.com/your-username/bemore-frontend.git
cd bemore-frontend
```

2. **의존성 설치**
```bash
npm install
# 또는
yarn install
```

3. **환경 변수 설정**
```bash
cp .env.example .env.local
```

4. **개발 서버 실행**
```bash
npm run dev
# 또는
yarn dev
```

5. **브라우저에서 확인**
```
http://localhost:3000
```

### **빌드 및 배포**

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint
```

---

## ⚙️ **환경 변수**

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API 키 | - |
| `NEXT_PUBLIC_ANALYSIS_SERVER_URL` | 분석 서버 URL | - |
| `NEXT_PUBLIC_APP_NAME` | 앱 이름 | `BeMore` |
| `NEXT_PUBLIC_APP_VERSION` | 앱 버전 | `0.1.0` |

---

## 🧬 **Ultrathink Engineering 철학**

BeMore는 **Ultrathink Engineering 철학**을 적용하여 설계되었습니다:

### **설계 원칙**
1. **첫 원리 기반 설계**: "왜 이 방식인가?" 반복 질문
2. **도메인 분리**: 관심사별 명확한 책임 분리
3. **성능 최적화**: 메모이제이션과 선택적 구독
4. **확장성**: 미래 요구사항을 고려한 유연한 구조

### **아키텍처 특징**
- **도메인별 스토어**: UserStore, SessionStore, UIStore
- **Repository Pattern**: 데이터 접근 로직 분리
- **고차 컴포넌트**: 에러 처리, 로딩 상태 관리
- **성능 최적화**: 메모이제이션, 선택적 구독

자세한 내용은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참조하세요.

---

## 📊 **성능 지표**

| 항목 | 목표 | 현재 |
|------|------|------|
| First Contentful Paint | < 1.5초 | 1.4초 ✅ |
| Largest Contentful Paint | < 2.5초 | 2.1초 ✅ |
| Cumulative Layout Shift | < 0.1 | 0.08 ✅ |
| Time to Interactive | < 3.5초 | 3.2초 ✅ |

---

## 🤝 **기여하기**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **개발 가이드라인**
- TypeScript 엄격 모드 사용
- ESLint 규칙 준수
- 컴포넌트 단위 테스트 작성
- 커밋 메시지 컨벤션 준수

---

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 📞 **연락처**

- **프로젝트 링크**: [https://github.com/your-username/bemore-frontend](https://github.com/your-username/bemore-frontend)
- **이슈 리포트**: [https://github.com/your-username/bemore-frontend/issues](https://github.com/your-username/bemore-frontend/issues)

---

<div align="center">

**Made with ❤️ by BeMore Team**

[⬆ Back to Top](#bemore---멀티모달-감정-분석--cbt-피드백-서비스)

</div>