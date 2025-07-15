declare namespace NodeJS {
  interface ProcessEnv {
    // API 관련
    NEXT_PUBLIC_API_URL: string;
    
    // 앱 정보
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_VERSION: string;
    
    // 환경 설정
    NEXT_PUBLIC_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_SUPPRESS_REACT_WARNINGS: string;
    
    // 기타 Next.js 기본 환경 변수들
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 