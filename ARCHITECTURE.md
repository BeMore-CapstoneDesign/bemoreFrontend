# BeMore 프로젝트 아키텍처 문서

## 🧬 **Ultrathink Engineering 철학 적용**

### **설계 원칙**
1. **첫 원리 기반 설계**: "왜 이 방식인가?"를 반복 질문하며 근본적 재구성
2. **도메인 분리**: 관심사별 명확한 책임 분리
3. **성능 최적화**: 메모이제이션과 선택적 구독으로 불필요한 리렌더링 방지
4. **확장성**: 미래 요구사항을 고려한 유연한 구조

## 🏗 **아키텍처 개요**

### **레이어 구조**
```
┌─────────────────────────────────────┐
│           Presentation Layer        │ ← Pages, Components
├─────────────────────────────────────┤
│           Business Logic Layer      │ ← Hooks, Services
├─────────────────────────────────────┤
│           Data Access Layer         │ ← Repositories, API
├─────────────────────────────────────┤
│           State Management Layer    │ ← Zustand Stores
└─────────────────────────────────────┘
```

## 🔄 **Flask 백엔드 + Gemini API 통합 구조**

### **역할 분담**

#### **Flask 백엔드 (Python)**
```
📁 Flask Backend
├── 📁 AI/ML 모듈
│   ├── 🎤 Whisper (음성 → 텍스트)
│   ├── 🎭 MediaPipe (표정 인식)
│   ├── 📊 VAD 분석 (음성 톤)
│   └── 🧠 감정 벡터 계산
├── 📁 API Gateway
│   ├── 🔐 인증/인가
│   ├── 📝 로깅/모니터링
│   ├── ⚡ Rate Limiting
│   └── 🔄 Caching
└── 📁 Gemini Integration
    ├── 🤖 프롬프트 엔지니어링
    ├── 📊 응답 파싱/검증
    └── 🔄 에러 처리/재시도
```

#### **Next.js 프론트엔드**
```
📁 Next.js Frontend
├── 📁 UI/UX
│   ├── 🎨 컴포넌트
│   ├── 📱 반응형 디자인
│   └── ♿ 접근성
├── 📁 상태 관리
│   ├── 🗃️ Zustand 스토어
│   └── 🔄 실시간 업데이트
└── 📁 API 통신
    ├── 📡 HTTP 클라이언트
    └── 🔄 WebSocket (실시간)
```

## 🎯 **도메인 분리 아키텍처**

### **감정 분석 도메인**
```
📁 Emotion Domain
├── 📁 Types
│   ├── emotion.ts (감정 분석 관련 타입)
│   └── index.ts (재export)
├── 📁 Services
│   └── repositories/emotionRepository.ts
├── 📁 Components
│   ├── analysis/ (감정 분석 UI)
│   └── ui/ (공통 UI)
└── 📁 Pages
    └── analysis/page.tsx
```

### **채팅 도메인**
```
📁 Chat Domain
├── 📁 Types
│   ├── chat.ts (채팅 관련 타입)
│   └── index.ts (재export)
├── 📁 Services
│   └── repositories/chatRepository.ts
├── 📁 Components
│   ├── chat/ (채팅 UI)
│   └── ui/ (공통 UI)
└── 📁 Pages
    └── chat/page.tsx
```

### **데이터 플로우**

#### **1. 멀티모달 입력 처리**
```
사용자 입력 → Flask 백엔드 → AI 모듈 → Gemini API → 응답 → 프론트엔드
     ↓
[텍스트/음성/표정] → [전처리] → [VAD 분석] → [CBT 피드백] → [UI 업데이트]
```

#### **2. 감정 분석 파이프라인**
```
1. 음성 입력 → Whisper → 텍스트 변환
2. 표정 입력 → MediaPipe → 표정 벡터
3. 텍스트 입력 → BERT → 감정 벡터
4. 통합 분석 → VAD 계산 → Gemini API → CBT 피드백
```

#### **3. 실시간 채팅**
```
사용자 메시지 → Flask API → Gemini API → 응답 → 프론트엔드
     ↓              ↓           ↓         ↓
[텍스트] → [컨텍스트 추가] → [CBT 응답] → [UI 업데이트]
```

### **API 엔드포인트 설계**

#### **Flask 백엔드 API**
```python
# 감정 분석
POST /api/v1/emotion/analyze
{
  "mediaType": "text|audio|image",
  "content": "base64_encoded_data",
  "sessionId": "uuid"
}

# 채팅
POST /api/v1/chat/send
{
  "message": "사용자 메시지",
  "sessionId": "uuid",
  "emotionContext": {...}
}

# 세션 관리
GET /api/v1/session/{sessionId}/history
POST /api/v1/session/{sessionId}/end
GET /api/v1/session/{sessionId}/report
```

#### **응답 구조**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  vadScore: {
    valence: number;
    arousal: number;
    dominance: number;
  };
  cbtFeedback: CBTFeedback;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotionContext?: EmotionAnalysis;
}
```

## 🔧 **서비스 레이어 분리**

### **Repository Pattern 적용**
```typescript
// 감정 분석 리포지토리
class EmotionRepository {
  async analyzeTextEmotion(data: { text: string; sessionId?: string }): Promise<EmotionAnalysis>
  async analyzeVoiceEmotion(data: { audioFile: File; sessionId?: string }): Promise<EmotionAnalysis>
  async analyzeFacialEmotion(data: { imageFile: File; sessionId?: string }): Promise<EmotionAnalysis>
  async analyzeMultimodalEmotion(data: { text?: string; audioFile?: File; imageFile?: File; sessionId?: string }): Promise<EmotionAnalysis>
  async getEmotionHistory(sessionId: string): Promise<EmotionAnalysis[]>
  async getEmotionPatterns(sessionId: string): Promise<any>
  async generateCBTFeedback(data: { emotionAnalysis: EmotionAnalysis; sessionId?: string }): Promise<any>
  async assessRisk(data: { emotionAnalysis: EmotionAnalysis; sessionId?: string }): Promise<any>
}

// 채팅 리포지토리
class ChatRepository {
  async sendChatMessage(data: { message: string; sessionId?: string; emotionContext?: any }): Promise<ChatMessage>
  async getChatHistory(sessionId: string): Promise<ChatMessage[]>
  async getChatContext(sessionId: string): Promise<any>
  async getSessionHistory(userId: string): Promise<any>
  async generateSessionReport(sessionId: string): Promise<Blob>
  async endSession(sessionId: string): Promise<void>
  async startSession(userId: string): Promise<{ sessionId: string }>
  async deleteMessage(messageId: string): Promise<void>
  async exportChatSession(sessionId: string, format: 'pdf' | 'json'): Promise<Blob>
  async getChatStatistics(sessionId: string): Promise<any>
}
```

### **API 서비스 (Facade Pattern)**
```typescript
class ApiService {
  // 감정 분석 관련 (EmotionRepository 위임)
  async analyzeTextEmotion(data): Promise<EmotionAnalysis>
  async analyzeVoiceEmotion(data): Promise<EmotionAnalysis>
  async analyzeFacialEmotion(data): Promise<EmotionAnalysis>
  async analyzeMultimodalEmotion(data): Promise<EmotionAnalysis>
  
  // 채팅 관련 (ChatRepository 위임)
  async sendChatMessage(message, sessionId?, emotionContext?): Promise<ChatMessage>
  async getChatHistory(sessionId): Promise<ChatMessage[]>
  async getSessionHistory(userId): Promise<any>
  
  // 사용자 관리
  async getUsers(): Promise<UserProfile[]>
  async createUser(data): Promise<UserProfile>
  
  // 시스템 관리
  async testConnection(): Promise<boolean>
  async testDatabaseConnection(): Promise<any>
}
```

## 📊 **상태 관리 구조**

### **Zustand 스토어 분리**
```typescript
// 감정 분석 스토어
interface EmotionStore {
  emotionHistory: EmotionAnalysis[];
  currentAnalysis: EmotionAnalysis | null;
  isLoading: boolean;
  error: string | null;
  
  addEmotionAnalysis: (analysis: EmotionAnalysis) => void;
  setCurrentAnalysis: (analysis: EmotionAnalysis | null) => void;
  clearEmotionHistory: () => void;
}

// 채팅 스토어
interface ChatStore {
  messages: ChatMessage[];
  currentSession: UserSession | null;
  isTyping: boolean;
  error: string | null;
  
  addMessage: (message: ChatMessage) => void;
  setCurrentSession: (session: UserSession | null) => void;
  clearMessages: () => void;
}

// UI 스토어
interface UIStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modalOpen: boolean;
  
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setModalOpen: (open: boolean) => void;
}
```

## 🚀 **성능 최적화**

### **메모이제이션 전략**
```typescript
// 컴포넌트 메모이제이션
const MemoizedEmotionChart = React.memo(EmotionChart);
const MemoizedChatMessage = React.memo(ChatMessage);

// 계산 메모이제이션
const useMemoizedEmotionTrend = (emotionHistory: EmotionAnalysis[]) => {
  return useMemo(() => {
    return calculateEmotionTrend(emotionHistory);
  }, [emotionHistory]);
};

// 콜백 메모이제이션
const handleSendMessage = useCallback(async (message: string) => {
  // 메시지 전송 로직
}, [sessionId, emotionContext]);
```

### **선택적 구독**
```typescript
// 필요한 상태만 구독
const emotionHistory = useAppStore(state => state.emotionHistory);
const currentAnalysis = useAppStore(state => state.currentAnalysis);

// 불필요한 리렌더링 방지
const { addEmotionAnalysis } = useAppStore(state => ({
  addEmotionAnalysis: state.addEmotionAnalysis
}));
```

## 🔒 **보안 및 에러 처리**

### **API 에러 처리**
```typescript
// 통합 에러 처리
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 에러 바운더리
const withErrorBoundary = (Component: React.ComponentType) => {
  return class ErrorBoundary extends React.Component {
    // 에러 처리 로직
  };
};
```

### **데이터 검증**
```typescript
// Zod 스키마 검증
const EmotionAnalysisSchema = z.object({
  id: z.string(),
  userId: z.string(),
  emotion: z.string(),
  confidence: z.number().min(0).max(1),
  vadScore: z.object({
    valence: z.number().min(0).max(1),
    arousal: z.number().min(0).max(1),
    dominance: z.number().min(0).max(1),
  }),
  timestamp: z.string().datetime(),
  mediaType: z.enum(['text', 'audio', 'image', 'realtime']),
  cbtFeedback: CBTFeedbackSchema,
});
```

## 📈 **확장성 고려사항**

### **마이크로서비스 전환 준비**
```
현재: Monolithic API Service
├── EmotionRepository
├── ChatRepository
└── UserRepository

미래: Microservices
├── Emotion Service
├── Chat Service
├── User Service
└── API Gateway
```

### **데이터베이스 분리**
```
현재: Single Database
├── emotions table
├── chat_messages table
├── sessions table
└── users table

미래: Database per Service
├── Emotion DB
├── Chat DB
├── User DB
└── Analytics DB
```

## 🧪 **테스트 전략**

### **단위 테스트**
```typescript
// Repository 테스트
describe('EmotionRepository', () => {
  it('should analyze text emotion correctly', async () => {
    const result = await emotionRepository.analyzeTextEmotion({
      text: '오늘 정말 기분이 좋아요',
      sessionId: 'test-session'
    });
    
    expect(result.emotion).toBe('happy');
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});
```

### **통합 테스트**
```typescript
// API 통합 테스트
describe('Emotion Analysis API', () => {
  it('should process multimodal emotion analysis', async () => {
    const response = await request(app)
      .post('/api/emotion/analyze/multimodal')
      .attach('audio', 'test-audio.wav')
      .field('text', '오늘 정말 기분이 좋아요');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 📋 **구현 우선순위**

### **Phase 1: 기본 분리 (완료)**
- [x] Repository Pattern 적용
- [x] 타입 정의 분리
- [x] API 서비스 리팩토링
- [x] 컴포넌트 업데이트

### **Phase 2: 고급 기능 (진행 중)**
- [ ] 실시간 감정 분석
- [ ] 멀티모달 통합
- [ ] CBT 피드백 시스템
- [ ] 세션 관리

### **Phase 3: 최적화 (예정)**
- [ ] 성능 최적화
- [ ] 캐싱 전략
- [ ] 에러 처리 개선
- [ ] 테스트 커버리지

### **Phase 4: 확장 (미래)**
- [ ] 마이크로서비스 전환
- [ ] 데이터베이스 분리
- [ ] 실시간 알림
- [ ] 모바일 앱 