import { EmotionState, EmotionAnalysis } from '../types';

// 감정 상태에 따른 색상 매핑
export const emotionColors: Record<EmotionState, string> = {
  happy: '#10B981', // green
  sad: '#3B82F6',   // blue
  angry: '#EF4444', // red
  anxious: '#F59E0B', // amber
  neutral: '#6B7280', // gray
  excited: '#8B5CF6', // violet
  calm: '#06B6D4',  // cyan
};

// 감정 상태에 따른 이모지 매핑
export const emotionEmojis: Record<EmotionState, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  neutral: '😐',
  excited: '🤩',
  calm: '😌',
  surprised: '😲',
};

// VAD 점수를 감정 상태로 변환
export function vadToEmotion(vad: { valence: number; arousal: number; dominance: number }): EmotionState {
  const { valence, arousal, dominance } = vad;
  
  // 높은 긍정성 + 높은 각성도 = 기쁨
  if (valence > 0.7 && arousal > 0.7) return 'excited';
  
  // 높은 긍정성 + 낮은 각성도 = 차분함
  if (valence > 0.7 && arousal < 0.3) return 'calm';
  
  // 높은 긍정성 = 기쁨
  if (valence > 0.6) return 'happy';
  
  // 낮은 긍정성 + 높은 각성도 = 분노
  if (valence < 0.4 && arousal > 0.7) return 'angry';
  
  // 낮은 긍정성 + 낮은 각성도 = 슬픔
  if (valence < 0.4 && arousal < 0.3) return 'sad';
  
  // 낮은 지배성 + 높은 각성도 = 불안
  if (dominance < 0.4 && arousal > 0.6) return 'anxious';
  
  return 'neutral';
}

// 감정 상태에 따른 배경 그라데이션 생성
export function getEmotionGradient(emotion: EmotionState): string {
  const colors = {
    happy: 'from-green-400 to-emerald-500',
    sad: 'from-blue-400 to-indigo-500',
    angry: 'from-red-400 to-rose-500',
    anxious: 'from-amber-400 to-orange-500',
    neutral: 'from-gray-400 to-slate-500',
    excited: 'from-violet-400 to-purple-500',
    calm: 'from-cyan-400 to-blue-500',
  };
  
  return colors[emotion];
}

// 감정 분석 결과의 신뢰도에 따른 색상
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

// 감정 변화 추이 계산
export function calculateEmotionTrend(history: EmotionAnalysis[]): {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
} {
  if (history.length < 2) return { trend: 'stable', change: 0 };
  
  const recent = history.slice(-5); // 최근 5개
  const older = history.slice(-10, -5); // 그 이전 5개
  
  if (older.length === 0) return { trend: 'stable', change: 0 };
  
  const recentAvg = recent.reduce((sum, item) => sum + item.vadScore.valence, 0) / recent.length;
  const olderAvg = older.reduce((sum, item) => sum + item.vadScore.valence, 0) / older.length;
  
  const change = recentAvg - olderAvg;
  
  if (change > 0.1) return { trend: 'improving', change };
  if (change < -0.1) return { trend: 'declining', change };
  return { trend: 'stable', change };
}

// 감정 상태에 따른 조언 생성
export function getEmotionAdvice(emotion: EmotionState): string {
  const advice = {
    happy: '좋은 기분을 유지하고 있네요! 이 기분을 오래 간직하세요.',
    sad: '슬픈 감정을 느끼고 계시는군요. 충분히 쉬고 자신을 돌봐주세요.',
    angry: '화가 나는 상황이 있으셨군요. 심호흡을 하고 잠시 멈춰보세요.',
    anxious: '불안한 마음이 드시는군요. 현재에 집중하고 한 번에 하나씩 해결해보세요.',
    neutral: '평온한 상태를 유지하고 계시네요. 이 균형을 잘 지켜보세요.',
    excited: '신나는 일이 있으셨군요! 이 에너지를 긍정적으로 활용해보세요.',
    calm: '차분하고 평온한 상태네요. 이 마음의 평화를 소중히 여기세요.',
  };
  
  return advice[emotion];
} 