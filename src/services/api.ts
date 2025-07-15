import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EmotionAnalysis, ChatMessage, ApiResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // AI 채팅 (Gemini)
  async sendChatMessage(message: string, sessionId?: string, emotionContext?: any): Promise<ChatMessage> {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = await this.api.post('/chat/gemini', {
      message,
      sessionId,
      emotionContext,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 메시지 전송에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 멀티모달 감정 분석
  async analyzeEmotion(data: {
    mediaType: 'text' | 'audio' | 'image';
    text?: string;
    audioFile?: File;
    imageFile?: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    const formData = new FormData();
    formData.append('mediaType', data.mediaType);
    if (data.text) formData.append('text', data.text);
    if (data.audioFile) formData.append('audio', data.audioFile);
    if (data.imageFile) formData.append('image', data.imageFile);
    if (data.sessionId) formData.append('sessionId', data.sessionId);
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

  // 세션 히스토리 조회
  async getSessionHistory(userId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/history/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '세션 히스토리 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // PDF 리포트 생성
  async generateSessionReport(sessionId: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.post(
      `/history/session/${sessionId}/pdf`,
      {},
      { responseType: 'blob' }
    );
    return response.data;
  }

  // 사용자 인증 등 기타 API 함수도 동일하게 추가 가능
}

export const apiService = new ApiService(); 