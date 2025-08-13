// Deprecated: 기존 도메인 스토어 대체. 신규 코드는 `useAppStore`를 직접 사용하세요.
import { useAppStore } from '../store';

export const useUIStore = () => {
  const theme = useAppStore(s => s.theme);
  const isLoading = useAppStore(s => s.isLoading);
  const setTheme = useAppStore(s => s.setTheme);
  return { theme, isLoading, setTheme };
};

export const useSessionStore = () => {
  const currentSession = useAppStore(s => s.currentSession);
  const startSession = useAppStore(s => s.startSession);
  const endSession = useAppStore(s => s.endSession);
  const addEmotionAnalysis = useAppStore(s => s.addEmotionAnalysis);
  const addChatMessage = useAppStore(s => s.addChatMessage);
  return { currentSession, startSession, endSession, addEmotionAnalysis, addChatMessage };
};

export const useUserStore = () => {
  const user = useAppStore(s => s.user);
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const setUser = useAppStore(s => s.setUser);
  const setAuthenticated = useAppStore(s => s.setAuthenticated);
  return { user, isAuthenticated, setUser, setAuthenticated };
};

// 통합 훅 (하위 호환)
export const useAppStores = () => {
  const user = useUserStore();
  const session = useSessionStore();
  const ui = useUIStore();
  return {
    user,
    session,
    ui,
    isAuthenticated: user.isAuthenticated,
    currentUser: user.user,
    currentSession: session.currentSession,
    theme: ui.theme,
    isLoading: ui.isLoading,
  };
};