// 스토어 통합 관리
export { useUserStore } from './userStore';
export { useSessionStore } from './sessionStore';
export { useUIStore } from './uiStore';

// 편의를 위한 통합 훅
import { useUserStore } from './userStore';
import { useSessionStore } from './sessionStore';
import { useUIStore } from './uiStore';

// 모든 스토어를 한 번에 사용할 수 있는 훅
export const useAppStores = () => {
  const user = useUserStore();
  const session = useSessionStore();
  const ui = useUIStore();
  
  return {
    user,
    session,
    ui,
    // 편의 메서드들
    isAuthenticated: user.isAuthenticated,
    currentUser: user.user,
    currentSession: session.currentSession,
    theme: ui.theme,
    isLoading: user.isLoading || session.isLoading || ui.isLoading,
  };
}; 