import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { EmotionAnalysis, ChatMessage, UserProfile, EmotionState } from '../types';

interface AppState {
  // 사용자 정보
  user: UserProfile | null;
  isAuthenticated: boolean;
  
          // 현재 세션
        currentSession: {
          id: string | null;
          startTime: Date | null;
          endTime?: Date | null;
          emotionHistory: EmotionAnalysis[];
          chatHistory: ChatMessage[];
        };
  
  // UI 상태
  theme: 'light' | 'dark' | 'auto';
  currentEmotion: EmotionState;
  isLoading: boolean;
  globalError: string | null;
  
  // 액션들
  setUser: (user: UserProfile) => void;
  setAuthenticated: (status: boolean) => void;
  startSession: () => void;
  endSession: () => void;
  addEmotionAnalysis: (analysis: EmotionAnalysis) => void;
  addChatMessage: (message: ChatMessage) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setCurrentEmotion: (emotion: EmotionState) => void;
  setLoading: (loading: boolean) => void;
  setGlobalError: (message: string | null) => void;
  clearSession: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        user: null,
        isAuthenticated: false,
        currentSession: {
          id: null,
          startTime: null,
          emotionHistory: [],
          chatHistory: [],
        },
        theme: 'auto',
        currentEmotion: 'neutral',
        isLoading: false,
        globalError: null,

        // 액션들
        setUser: (user) => set({ user }),
        setAuthenticated: (status) => set({ isAuthenticated: status }),
        
        startSession: () => {
          const sessionId = `session_${Date.now()}`;
          set({
            currentSession: {
              id: sessionId,
              startTime: new Date(),
              emotionHistory: [],
              chatHistory: [],
            },
          });
        },
        
        endSession: () => {
          const { currentSession } = get();
          set({
            currentSession: {
              ...currentSession,
              endTime: new Date(),
            },
          });
        },
        
        addEmotionAnalysis: (analysis) => {
          const { currentSession } = get();
          set({
            currentSession: {
              ...currentSession,
              emotionHistory: [...currentSession.emotionHistory, analysis],
            },
            currentEmotion: analysis.emotion as EmotionState,
          });
        },
        
        addChatMessage: (message) => {
          const { currentSession } = get();
          set({
            currentSession: {
              ...currentSession,
              chatHistory: [...currentSession.chatHistory, message],
            },
          });
        },
        
        setTheme: (theme) => set({ theme }),
        setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
        setLoading: (loading) => set({ isLoading: loading }),
        setGlobalError: (message) => set({ globalError: message }),
        
        clearSession: () => {
          set({
            currentSession: {
              id: null,
              startTime: null,
              emotionHistory: [],
              chatHistory: [],
            },
          });
        },
      }),
      {
        name: 'bemore-storage',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
); 