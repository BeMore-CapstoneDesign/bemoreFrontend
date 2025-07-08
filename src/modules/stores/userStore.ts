import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserProfile } from '../../types';

interface UserState {
  // 상태
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setUser: (user: UserProfile | null) => void;
  setAuthenticated: (status: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // 액션들
        setUser: (user) => set({ user }),
        setAuthenticated: (status) => set({ isAuthenticated: status }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: API 호출
            const mockUser: UserProfile = {
              id: 'user_1',
              name: '테스트 사용자',
              email,
              preferences: {
                theme: 'auto',
                notifications: true,
                language: 'ko',
              },
            };
            
            set({ 
              user: mockUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: '로그인에 실패했습니다.', 
              isLoading: false 
            });
            throw error;
          }
        },
        
        logout: () => {
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });
          localStorage.removeItem('auth-token');
        },
        
        updateProfile: async (updates) => {
          const { user } = get();
          if (!user) return;
          
          set({ isLoading: true, error: null });
          try {
            const updatedUser = { ...user, ...updates };
            // TODO: API 호출
            set({ user: updatedUser, isLoading: false });
          } catch (error) {
            set({ 
              error: '프로필 업데이트에 실패했습니다.', 
              isLoading: false 
            });
            throw error;
          }
        },
        
        clearError: () => set({ error: null }),
      }),
      {
        name: 'bemore-user-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
); 