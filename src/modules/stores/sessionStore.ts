import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserSession, EmotionAnalysis, ChatMessage } from '../../types';

interface SessionState {
  // 상태
  currentSession: UserSession | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  startSession: () => void;
  endSession: () => void;
  addEmotionAnalysis: (analysis: EmotionAnalysis) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 계산된 값
  getSessionDuration: () => number | null;
  getEmotionTrend: () => 'improving' | 'declining' | 'stable';
  getAverageValence: () => number;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        currentSession: null,
        isLoading: false,
        error: null,

        // 액션들
        startSession: () => {
          const sessionId = `session_${Date.now()}`;
          set({
            currentSession: {
              id: sessionId,
              userId: 'user_1', // TODO: 실제 사용자 ID
              startTime: new Date(),
              emotionHistory: [],
              chatHistory: [],
            },
            error: null,
          });
        },
        
        endSession: () => {
          const { currentSession } = get();
          if (currentSession) {
            set({
              currentSession: {
                ...currentSession,
                endTime: new Date(),
              },
            });
          }
        },
        
        addEmotionAnalysis: (analysis) => {
          const { currentSession } = get();
          if (currentSession) {
            set({
              currentSession: {
                ...currentSession,
                emotionHistory: [...currentSession.emotionHistory, analysis],
              },
            });
          }
        },
        
        addChatMessage: (message) => {
          const { currentSession } = get();
          if (currentSession) {
            set({
              currentSession: {
                ...currentSession,
                chatHistory: [...currentSession.chatHistory, message],
              },
            });
          }
        },
        
        clearSession: () => {
          set({
            currentSession: null,
            error: null,
          });
        },
        
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        
        // 계산된 값들
        getSessionDuration: () => {
          const { currentSession } = get();
          if (!currentSession?.startTime) return null;
          
          const endTime = currentSession.endTime || new Date();
          return endTime.getTime() - currentSession.startTime.getTime();
        },
        
        getEmotionTrend: () => {
          const { currentSession } = get();
          if (!currentSession || currentSession.emotionHistory.length < 2) {
            return 'stable';
          }
          
          const recent = currentSession.emotionHistory.slice(-5);
          const older = currentSession.emotionHistory.slice(-10, -5);
          
          if (older.length === 0) return 'stable';
          
          const recentAvg = recent.reduce((sum, item) => sum + item.vadScore.valence, 0) / recent.length;
          const olderAvg = older.reduce((sum, item) => sum + item.vadScore.valence, 0) / older.length;
          
          const change = recentAvg - olderAvg;
          
          if (change > 0.1) return 'improving';
          if (change < -0.1) return 'declining';
          return 'stable';
        },
        
        getAverageValence: () => {
          const { currentSession } = get();
          if (!currentSession || currentSession.emotionHistory.length === 0) {
            return 0;
          }
          
          const total = currentSession.emotionHistory.reduce(
            (sum, item) => sum + item.vadScore.valence, 
            0
          );
          return total / currentSession.emotionHistory.length;
        },
      }),
      {
        name: 'bemore-session-storage',
        partialize: (state) => ({
          currentSession: state.currentSession,
        }),
      }
    )
  )
); 