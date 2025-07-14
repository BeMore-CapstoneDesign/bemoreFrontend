# BeMore - AI 기반 감정 분석 & CBT 피드백 서비스

BeMore는 AI(Gemini) 기반으로 감정 분석, 인지행동치료(CBT) 피드백, 대화 리포트 PDF 생성까지 제공하는 현대적 심리 케어 프론트엔드 서비스입니다.

---

## ✨ 주요 기능

- **AI 채팅**
  - Gemini 기반 AI 상담사
  - 감정 분석, CBT 피드백, 맞춤형 대화
  - 최근 대화 맥락/감정 기반 응답
  - UX: 로딩 메시지(“AI 상담사가 답변을 준비하고 있어요…”), 대화 종료/리포트 등

- **PDF 리포트**
  - 한글 폰트 내장(jsPDF + NotoSansKR)
  - BeMore 브랜드 컬러(보라/파랑), 카드형 섹션, 따뜻한 메시지
  - 자동 줄바꿈, 가독성/여백/정렬 최적화
  - “BeMore는 여러분의 마음을 항상 응원합니다 💜” 등 브랜드 감성 강조

- **UI/UX**
  - 대화 종료 버튼(자연스러운 문장형, 감정 제안 버튼과 동일 디자인)
  - 리포트 생성 중 로딩 UI
  - 반응형, 접근성, 직관적 인터페이스

---

## 🛠️ 개발/운영 가이드

### 1. 한글 PDF 폰트 적용법

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

### 2. Gemini API 연동/쿼터 관리

- `.env.local`에 API 키/엔드포인트 설정
- 무료 쿼터 초과 시 Rate Limit 코드 참고, 유료 플랜 권장

### 3. 주요 기술 스택

- Next.js 15, TypeScript, TailwindCSS, Zustand, jsPDF, html2canvas, Lucide React, Gemini API

---

## ⚡️ 실행 방법

```bash
git clone https://github.com/BeMore-CapstoneDesign/bemoreFrontend.git
cd bemore-frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📄 기타

- **브랜드 컨셉**: 따뜻함, 신뢰감, 현대적 디자인, 긍정적 변화
- **PDF 리포트**: 브랜드 컬러, 카드형 레이아웃, 한글 폰트, 자동 줄바꿈, 따뜻한 메시지
- **AI 채팅**: 감정 분석, CBT 피드백, UX 로딩 메시지, 대화 종료/리포트

---

## 🙌 BeMore는 여러분의 마음을 항상 응원합니다!