// 감정 분석 결과 타입
export interface EmotionAnalysis {
  id?: string;
  userId?: string;
  timestamp?: string; // ISO string
  vadScore: {
    valence: number; // 긍정성 (0-1)
    arousal: number; // 각성도 (0-1)
    dominance: number; // 지배성 (0-1)
  };
  emotion?: string; // 주요 감정 (기쁨, 슬픔, 분노, 불안 등)
  primaryEmotion?: string; // 백엔드 응답 필드
  confidence: number; // 분석 신뢰도 (0-1)
  mediaType?: 'image' | 'audio' | 'text' | 'realtime' | 'consultation' | 'multimodal';
  mediaUrl?: string;
  textContent?: string;
  cbtFeedback?: CBTFeedback;
  // 백엔드 추가 필드
  keywords?: string[];
  intensity?: string;
  textLength?: number;
}

// CBT 피드백 타입
export interface CBTFeedback {
  cognitiveDistortion: string; // 인지 왜곡 유형
  challenge: string; // 도전적 질문
  alternative: string; // 대안적 사고
  actionPlan: string; // 행동 계획
}

// VAD 점수 타입
export interface VADScore {
  valence: number; // 긍정성 (0-1)
  arousal: number; // 각성도 (0-1)
  dominance: number; // 지배성 (0-1)
}

// 감정 상태 타입
export type EmotionState = 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral' | 'excited' | 'calm' | 'surprised';

// 감정 분석 요청 타입
export interface EmotionAnalysisRequest {
  text?: string;
  audioFile?: File;
  imageFile?: File;
  sessionId?: string;
  mediaType: 'text' | 'audio' | 'image' | 'multimodal';
}

// 감정 패턴 분석 결과 타입
export interface EmotionPattern {
  dominantEmotion: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  triggers: string[];
  recommendations: string[];
}

// 위험도 평가 결과 타입
export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
  emergencyContacts?: string[];
} 