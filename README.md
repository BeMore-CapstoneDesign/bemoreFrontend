# BeMore - AI 기반 감정 분석 & CBT 피드백 서비스

BeMore는 **Flask 백엔드 + Gemini API** 기반으로 멀티모달 감정 분석, 인지행동치료(CBT) 피드백, 대화 리포트 PDF 생성까지 제공하는 현대적 심리 케어 서비스입니다.

---

## 🏗️ **아키텍처 개요**

### **Flask 백엔드 중심 구조**
```
📁 Flask Backend (Python)
├── 🎤 Whisper (음성 → 텍스트)
├── 🎭 MediaPipe (표정 인식)
├── 📊 VAD 분석 (음성 톤)
├── 🧠 감정 벡터 계산
└── 🤖 Gemini API 통합

📁 Next.js Frontend (TypeScript)
├── 🎨 UI/UX 컴포넌트
├── 📱 반응형 디자인
├── 🗃️ Zustand 상태 관리
└── 📡 Flask API 통신
```

### **데이터 플로우**
```
사용자 입력 → Flask 백엔드 → AI 모듈 → Gemini API → 응답 → 프론트엔드
     ↓
[텍스트/음성/표정] → [전처리] → [VAD 분석] → [CBT 피드백] → [UI 업데이트]
```

---

## ✨ 주요 기능

- **멀티모달 감정 분석**
  - 텍스트, 음성, 표정 통합 분석
  - VAD(Valence, Arousal, Dominance) 기반 감정 벡터
  - Flask 백엔드에서 AI 모듈 처리

- **AI 채팅**
  - Gemini 기반 AI 상담사
  - 감정 분석, CBT 피드백, 맞춤형 대화
  - 최근 대화 맥락/감정 기반 응답
  - UX: 로딩 메시지("AI 상담사가 답변을 준비하고 있어요…"), 대화 종료/리포트 등

- **PDF 리포트**
  - 한글 폰트 내장(jsPDF + NotoSansKR)
  - BeMore 브랜드 컬러(보라/파랑), 카드형 섹션, 따뜻한 메시지
  - 자동 줄바꿈, 가독성/여백/정렬 최적화
  - "BeMore는 여러분의 마음을 항상 응원합니다 💜" 등 브랜드 감성 강조

- **UI/UX**
  - 대화 종료 버튼(자연스러운 문장형, 감정 제안 버튼과 동일 디자인)
  - 리포트 생성 중 로딩 UI
  - 반응형, 접근성, 직관적 인터페이스

---

## 🛠️ 개발/운영 가이드

### 1. 환경 설정

#### **프론트엔드 환경 변수**
```bash
# .env.local
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key  # 백엔드에서 사용
```

#### **백엔드 환경 변수**
```bash
# Flask 백엔드 .env
GEMINI_API_KEY=your_gemini_api_key
FLASK_SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url
```

### 2. Flask 백엔드 실행
```bash
# 백엔드 디렉토리에서
pip install -r requirements.txt
python app.py
```

### 3. 프론트엔드 실행
```bash
npm install
npm run dev
```

### 4. 한글 PDF 폰트 적용법

- `src/assets/fonts/`에 NotoSansKR ttf 파일과 base64 변환 JS 파일(`NotoSansKR-VariableFont-normal.js`) 필요
- 변환 스크립트 예시:
  ```js
  // ttf2js.js
  const fs = require('fs');
  const ttf = fs.readFileSync('src/assets/fonts/NotoSansKR-VariableFont_wght.ttf');
  const base64 = ttf.toString('base64');
  const js = `export default "${base64}";\n`;
  fs.writeFileSync('src/assets/fonts/NotoSansKR-VariableFont-normal.js', js);
  ```
- 타입스크립트 모듈 선언:
  ```ts
  // src/assets/fonts/typings.d.ts
  declare module '*.js' {
    const value: string;
    export default value;
  }
  ```

### 5. 주요 기술 스택

#### **프론트엔드**
- Next.js 15, TypeScript, TailwindCSS
- Zustand (상태 관리)
- jsPDF, html2canvas (PDF 생성)
- Lucide React (아이콘)

#### **백엔드**
- Flask (Python)
- Whisper (음성 인식)
- MediaPipe (표정 인식)
- Gemini API (AI 응답)

---

## ⚡️ 실행 방법

```bash
# 1. 백엔드 실행
cd backend
pip install -r requirements.txt
python app.py

# 2. 프론트엔드 실행 (새 터미널)
cd frontend
npm install
npm run dev
```

---

## 📄 기타

- **브랜드 컨셉**: 따뜻함, 신뢰감, 현대적 디자인, 긍정적 변화
- **PDF 리포트**: 브랜드 컬러, 카드형 레이아웃, 한글 폰트, 자동 줄바꿈, 따뜻한 메시지
- **AI 채팅**: 감정 분석, CBT 피드백, UX 로딩 메시지, 대화 종료/리포트
- **아키텍처**: Flask 백엔드 중심, 멀티모달 처리, 실시간 분석

---

## 🙌 BeMore는 여러분의 마음을 항상 응원합니다!