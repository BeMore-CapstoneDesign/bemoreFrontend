import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EmotionAnalysis, ChatMessage, ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 인증 실패 시 로그아웃 처리
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 감정 분석 API
  async analyzeEmotion(data: {
    mediaType: 'image' | 'audio' | 'text';
    file?: File;
    textContent?: string;
  }): Promise<EmotionAnalysis> {
    const formData = new FormData();
    formData.append('mediaType', data.mediaType);
    
    if (data.file) {
      formData.append('file', data.file);
    }
    
    if (data.textContent) {
      formData.append('textContent', data.textContent);
    }

    const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
      '/emotion/analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || '감정 분석에 실패했습니다.');
    }

    return response.data.data!;
  }

  // Gemini 채팅 API
  async sendChatMessage(message: string, emotionContext?: EmotionAnalysis): Promise<ChatMessage> {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = await this.api.post('/chat/gemini', {
      message,
      emotionContext,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 메시지 전송에 실패했습니다.');
    }

    return response.data.data!;
  }

  // 히스토리 조회 API
  async getHistory(userId: string, limit = 50): Promise<EmotionAnalysis[]> {
    const response: AxiosResponse<ApiResponse<EmotionAnalysis[]>> = await this.api.get(
      `/history/${userId}?limit=${limit}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || '히스토리 조회에 실패했습니다.');
    }

    return response.data.data!;
  }

  // 사용자 프로필 조회
  async getUserProfile(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/user/profile');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '프로필 조회에 실패했습니다.');
    }

    return response.data.data!;
  }

  // PDF 리포트 생성
  async generateReport(sessionId: string): Promise<Blob> {
    const response = await this.api.get(`/report/${sessionId}`, {
      responseType: 'blob',
    });

    return response.data;
  }
}

export const apiService = new ApiService(); 