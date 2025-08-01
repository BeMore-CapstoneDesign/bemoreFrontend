// 공통 타입들을 재export
export * from './emotion';
export * from './chat';

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
  timestamp?: string;
}

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