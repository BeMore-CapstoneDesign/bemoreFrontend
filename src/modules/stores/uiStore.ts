import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { EmotionState } from '../../types';

type Theme = 'light' | 'dark' | 'auto';

interface UIState {
  // 상태
  theme: Theme;
  currentEmotion: EmotionState;
  isLoading: boolean;
  sidebarOpen: boolean;
  modalOpen: boolean;
  activeModal: string | null;
  
  // 액션
  setTheme: (theme: Theme) => void;
  setCurrentEmotion: (emotion: EmotionState) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setModalOpen: (open: boolean, modalType?: string) => void;
  toggleSidebar: () => void;
  closeModal: () => void;
  
  // 계산된 값
  getEffectiveTheme: () => 'light' | 'dark';
  getEmotionColor: () => string;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        theme: 'auto',
        currentEmotion: 'neutral',
        isLoading: false,
        sidebarOpen: false,
        modalOpen: false,
        activeModal: null,

        // 액션들
        setTheme: (theme) => set({ theme }),
        setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
        setLoading: (loading) => set({ isLoading: loading }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setModalOpen: (open, modalType) => set({ 
          modalOpen: open, 
          activeModal: open ? modalType || null : null 
        }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        closeModal: () => set({ modalOpen: false, activeModal: null }),
        
        // 계산된 값들
        getEffectiveTheme: () => {
          const { theme } = get();
          if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          return theme;
        },
        
        getEmotionColor: () => {
          const { currentEmotion } = get();
          const emotionColors = {
            happy: '#10B981',
            sad: '#3B82F6',
            angry: '#EF4444',
            anxious: '#F59E0B',
            neutral: '#6B7280',
            excited: '#8B5CF6',
            calm: '#06B6D4',
          };
          return emotionColors[currentEmotion];
        },
      }),
      {
        name: 'bemore-ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          currentEmotion: state.currentEmotion,
        }),
      }
    )
  )
); 