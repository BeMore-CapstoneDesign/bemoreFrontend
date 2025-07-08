// 감정 분석 결과 타입
export interface EmotionAnalysis {
  id: string;
  userId: string;
  timestamp: Date;
  vadScore: {
    valence: number; // 긍정성 (0-1)
    arousal: number; // 각성도 (0-1)
    dominance: number; // 지배성 (0-1)
  };
  emotion: string; // 주요 감정 (기쁨, 슬픔, 분노, 불안 등)
  confidence: number; // 분석 신뢰도 (0-1)
  mediaType: 'image' | 'audio' | 'text';
  mediaUrl?: string;
  textContent?: string;
  cbtFeedback: CBTFeedback;
}

// CBT 피드백 타입
export interface CBTFeedback {
  cognitiveDistortion: string; // 인지 왜곡 유형
  challenge: string; // 도전적 질문
  alternative: string; // 대안적 사고
  actionPlan: string; // 행동 계획
}

// AI 채팅 메시지 타입
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotionContext?: EmotionAnalysis;
}

// 사용자 세션 타입
export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  emotionHistory: EmotionAnalysis[];
  chatHistory: ChatMessage[];
}

// 사용자 프로필 타입
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: 'ko' | 'en';
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 감정 상태 타입
export type EmotionState = 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral' | 'excited' | 'calm';

// 테마 타입
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
} 