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

## 📦 **도메인별 스토어 설계**

### **1. UserStore (사용자 도메인)**
```typescript
interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}
```

**설계 근거**:
- 사용자 인증과 프로필 관리는 독립적인 도메인
- 인증 상태는 앱 전체에서 필요하지만 자주 변경되지 않음
- 선택적 구독으로 성능 최적화

### **2. SessionStore (세션 도메인)**
```typescript
interface SessionState {
  currentSession: UserSession | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  startSession: () => void;
  endSession: () => void;
  addEmotionAnalysis: (analysis: EmotionAnalysis) => void;
  addChatMessage: (message: ChatMessage) => void;
  
  // 계산된 값
  getSessionDuration: () => number | null;
  getEmotionTrend: () => 'improving' | 'declining' | 'stable';
  getAverageValence: () => number;
}
```

**설계 근거**:
- 감정 분석과 채팅은 하나의 세션으로 연결
- 계산된 값들을 스토어 내부에서 처리하여 성능 최적화
- 세션별 데이터 격리로 보안성 향상

### **3. UIStore (UI 도메인)**
```typescript
interface UIState {
  theme: Theme;
  currentEmotion: EmotionState;
  isLoading: boolean;
  sidebarOpen: boolean;
  modalOpen: boolean;
  activeModal: string | null;
  
  // 계산된 값
  getEffectiveTheme: () => 'light' | 'dark';
  getEmotionColor: () => string;
}
```

**설계 근거**:
- UI 상태는 자주 변경되지만 비즈니스 로직과 분리
- 테마와 감정 색상은 계산된 값으로 처리
- 모달과 사이드바 상태를 중앙 관리

## 🔧 **Repository Pattern 적용**

### **EmotionRepository**
```typescript
interface EmotionRepository {
  analyze: (data: AnalysisData) => Promise<EmotionAnalysis>;
  getHistory: (userId: string, limit?: number) => Promise<EmotionAnalysis[]>;
  getSessionHistory: (sessionId: string) => Promise<EmotionAnalysis[]>;
  deleteAnalysis: (analysisId: string) => Promise<void>;
  exportReport: (sessionId: string) => Promise<Blob>;
}
```

**설계 근거**:
- 데이터 접근 로직을 비즈니스 로직과 분리
- 인터페이스 기반 설계로 테스트 용이성 향상
- 에러 처리를 중앙화하여 일관성 보장

### **ChatRepository**
```typescript
interface ChatRepository {
  sendMessage: (message: string, context?: ChatContext) => Promise<ChatMessage>;
  getHistory: (userId: string, limit?: number) => Promise<ChatMessage[]>;
  getSuggestions: (emotion: string) => Promise<string[]>;
  clearHistory: (userId: string) => Promise<void>;
}
```

**설계 근거**:
- 채팅 컨텍스트를 통한 개인화된 응답
- 감정별 제안 메시지로 UX 향상
- 히스토리 관리 기능 분리

## 🎯 **고차 컴포넌트 패턴**

### **withErrorBoundary**
```typescript
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
)
```

**설계 근거**:
- 에러 처리를 컴포넌트와 분리
- 재사용 가능한 에러 바운더리
- 커스텀 에러 UI 지원

### **withLoading**
```typescript
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
)
```

**설계 근거**:
- 로딩 상태를 전역적으로 관리
- 컴포넌트별 커스텀 로딩 UI
- 성능 최적화를 위한 지연 로딩

## ⚡ **성능 최적화 전략**

### **1. 메모이제이션 훅**
```typescript
export function useMemoizedValue<T>(value: T, deps: any[]): T
export function useMemoizedCallback<T>(callback: T, deps: any[]): T
export function useConditionalMemo<T>(factory: () => T, condition: boolean, deps: any[]): T | undefined
```

**최적화 근거**:
- 깊은 비교로 불필요한 리렌더링 방지
- 조건부 메모이제이션으로 메모리 효율성 향상
- 복잡한 계산 결과 캐싱

### **2. 선택적 스토어 구독**
```typescript
// 전체 스토어 구독 (비효율적)
const { user, session, ui } = useAppStores();

// 선택적 구독 (효율적)
const user = useUserStore();
const session = useSessionStore();
const ui = useUIStore();
```

**최적화 근거**:
- 필요한 상태만 구독하여 리렌더링 최소화
- 도메인별 스토어 분리로 성능 향상
- 메모리 사용량 최적화

## 🔄 **상태 관리 플로우**

### **감정 분석 플로우**
```
1. 사용자 입력 → AnalysisPage
2. UIStore.setLoading(true)
3. EmotionRepository.analyze()
4. SessionStore.addEmotionAnalysis()
5. UIStore.setCurrentEmotion()
6. UIStore.setLoading(false)
```

### **채팅 플로우**
```
1. 사용자 메시지 → ChatPage
2. UIStore.setLoading(true)
3. ChatRepository.sendMessage()
4. SessionStore.addChatMessage()
5. UIStore.setLoading(false)
```

## 🧪 **테스트 전략**

### **단위 테스트**
- Repository 인터페이스 모킹
- 스토어 액션 테스트
- 유틸리티 함수 테스트

### **통합 테스트**
- 컴포넌트와 스토어 연동 테스트
- API 통신 테스트
- 에러 처리 테스트

### **E2E 테스트**
- 사용자 시나리오 테스트
- 성능 테스트
- 접근성 테스트

## 📈 **성능 메트릭**

### **목표 지표**
- First Contentful Paint: < 1.5초
- Largest Contentful Paint: < 2.5초
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5초

### **모니터링 포인트**
- 스토어 업데이트 빈도
- 컴포넌트 리렌더링 횟수
- API 응답 시간
- 메모리 사용량

## 🔮 **미래 확장 계획**

### **단기 (1-3개월)**
- 실시간 채팅 (WebSocket)
- 오프라인 지원 (Service Worker)
- 푸시 알림

### **중기 (3-6개월)**
- 다국어 지원
- 다크 모드 완성
- 성능 최적화

### **장기 (6개월+)**
- PWA 지원
- AI 모델 개선
- 커뮤니티 기능

## 📚 **참고 자료**

- [Zustand 공식 문서](https://github.com/pmndrs/zustand)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/) 