// AI 채팅 메시지 타입
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
  emotionContext?: any; // 감정 분석 결과 참조
}

// 사용자 세션 타입
export interface UserSession {
  id: string;
  userId: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  emotionHistory: any[]; // 감정 분석 히스토리
  chatHistory: ChatMessage[];
}

// 분석 리포트 타입
export interface AnalysisReport {
  sessionDuration: number;
  totalMessages: number;
  emotionTrend: string;
  keyInsights: string[];
  recommendations: string[];
  cbtTechniques: string[];
}

// 채팅 컨텍스트 타입
export interface ChatContext {
  recentEmotion?: any; // 최근 감정 분석 결과
  sessionHistory?: ChatMessage[];
  userProfile?: {
    name: string;
    preferences: unknown;
  };
}

// 채팅 통계 타입
export interface ChatStatistics {
  totalMessages: number;
  averageResponseTime: number;
  emotionDistribution: Record<string, number>;
  sessionDuration: number;
  userSatisfaction?: number;
}

// 세션 관리 타입
export interface SessionInfo {
  sessionId: string;
  userId: string;
  startTime: string;
  status: 'active' | 'ended' | 'paused';
  messageCount: number;
  lastActivity: string;
} 