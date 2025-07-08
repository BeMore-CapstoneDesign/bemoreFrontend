# BeMore - 멀티모달 감정 분석 & CBT 피드백 서비스

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/BeMore-CapstoneDesign/bemoreFrontend)

> **BeMore**는 AI 기반 멀티모달 감정 분석과 CBT(인지행동치료) 피드백을 제공하는 웹 서비스입니다. 표정, 음성, 텍스트를 통해 감정을 분석하고, 맞춤형 피드백과 시각화 리포트를 제공합니다.

---

## 📂 폴더 구조

```
bemore-frontend/
├── public/                   # 정적 자산 (이미지, 아이콘 등)
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # 홈 페이지
│   │   ├── analysis/        # 감정 분석 페이지
│   │   ├── chat/            # AI 채팅 페이지
│   │   ├── history/         # 히스토리 페이지
│   │   └── settings/        # 설정 페이지
│   ├── components/          # 재사용 UI 컴포넌트
│   │   ├── ui/              # 기본 UI 컴포넌트
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   └── hoc/             # 고차 컴포넌트
│   ├── modules/             # 비즈니스 로직
│   │   └── stores/          # Zustand 상태 관리
│   ├── services/            # API 서비스 및 레포지토리
│   ├── hooks/               # 커스텀 React 훅
│   ├── utils/               # 유틸리티 함수
│   └── types/               # TypeScript 타입 정의
├── .env.example             # 환경 변수 예시
├── package.json             # 프로젝트 설정
├── README.md                # 프로젝트 문서
└── ARCHITECTURE.md          # 아키텍처 문서
```

---

## 🚀 주요 기능

### 📊 감정 분석 (Analysis)
- 표정 분석: 카메라 촬영 또는 이미지 업로드
- 음성 분석: 실시간 녹음 또는 오디오 파일 업로드
- 텍스트 분석: 감정이 담긴 텍스트 입력
- VAD 시각화: Valence, Arousal, Dominance 차트
- CBT 피드백: 인지 왜곡 탐지 및 대안 제시

### 💬 AI 채팅 (Chat)
- Gemini 기반 AI 상담
- 최근 감정 분석 결과 기반 맞춤 응답
- 감정별 빠른 제안 문구
- 실시간 타이핑 인디케이터

### 📈 히스토리 (History)
- 감정 변화 추적 및 시각화(라인/파이 차트)
- 기간/감정/검색어별 필터링
- PDF 리포트 다운로드

### ⚙️ 설정 (Settings)
- 프로필 관리
- 보안(비밀번호, 2FA)
- 알림 설정
- 테마(라이트/다크/자동)

---

## 🔗 주요 API 엔드포인트

| 메서드 | 엔드포인트                                 | 설명                 |
| ------ | ---------------------------------------- | -------------------- |
| POST   | `/api/emotion/analyze`                   | 멀티모달 감정 분석   |
| POST   | `/api/chat/gemini`                       | AI 채팅 메시지 전송  |
| GET    | `/api/history/:userId`                   | 사용자 감정 히스토리 |
| GET    | `/api/user/profile`                      | 사용자 프로필 조회   |
| PUT    | `/api/user/profile`                      | 사용자 프로필 수정   |
| POST   | `/api/history/session/:sessionId/pdf`    | PDF 리포트 생성      |

---

## 🛠️ 기술 스택

- **Next.js 15** (React 프레임워크)
- **TypeScript** (타입 안전성)
- **TailwindCSS** (유틸리티 CSS)
- **Zustand** (상태 관리)
- **Recharts** (데이터 시각화)
- **Lucide React** (아이콘)
- **Axios** (API 요청)

---

## ⚡ 시작하기

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Git

### 설치 및 실행

```bash
git clone https://github.com/BeMore-CapstoneDesign/bemoreFrontend.git
cd bemore-frontend
npm install # 또는 yarn install
cp .env.example .env.local
```

### 개발 서버 실행

```bash
npm run dev # 또는 yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드 & 린트

```bash
npm run build
npm run start
npm run lint
```

---

## ⚙️ 환경 변수

| 변수명                          | 설명                | 기본값                      |
| ------------------------------- | ------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL`           | 백엔드 API URL      | `http://localhost:3001/api` |
| `NEXT_PUBLIC_GEMINI_API_KEY`    | Google Gemini API 키| -                           |
| `NEXT_PUBLIC_ANALYSIS_SERVER_URL`| 분석 서버 URL       | -                           |
| `NEXT_PUBLIC_APP_NAME`          | 앱 이름             | `BeMore`                    |
| `NEXT_PUBLIC_APP_VERSION`       | 앱 버전             | `0.1.0`                     |

---

## 🧬 Ultrathink Engineering 철학
- 첫 원리 기반 설계: "왜 이 방식인가?"를 항상 질문
- 도메인 분리: 모듈별 명확한 책임
- 성능 최적화: 메모이제이션, 선택적 상태 구독
- 확장성: 레포지토리 패턴, 모듈형 아키텍처

자세한 내용은 [ARCHITECTURE.md](./ARCHITECTURE.md) 참고

---

## 🤝 기여 방법
1. 저장소 Fork
2. 브랜치 생성 (`git checkout -b feature/기능명`)
3. 커밋 (`git commit -m '기능 추가'`)
4. 브랜치 Push (`git push origin feature/기능명`)
5. Pull Request 생성

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 참고

---

## 📬 연락처
- **저장소**: [github.com/BeMore-CapstoneDesign/bemoreFrontend](https://github.com/BeMore-CapstoneDesign/bemoreFrontend)
- **이슈**: [github.com/BeMore-CapstoneDesign/bemoreFrontend/issues](https://github.com/BeMore-CapstoneDesign/bemoreFrontend/issues)

---

<div align="center">
BeMore Team이 ❤️와 함께 만듦
</div>