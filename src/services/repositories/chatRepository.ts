import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ChatMessage, ApiResponse, AnalysisReport } from '../../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ChatRepository {
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

  // AI 채팅 메시지 전송
  async sendChatMessage(data: {
    message: string;
    sessionId?: string;
    emotionContext?: any;
  }): Promise<ChatMessage> {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = await this.api.post('/chat/send', {
      message: data.message,
      sessionId: data.sessionId,
      emotionContext: data.emotionContext,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 메시지 전송에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 채팅 히스토리 조회
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const response: AxiosResponse<ApiResponse<ChatMessage[]>> = await this.api.get(
      `/chat/history/${sessionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 히스토리 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 채팅 컨텍스트 조회
  async getChatContext(sessionId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/chat/context/${sessionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 컨텍스트 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 세션 히스토리 조회
  async getSessionHistory(userId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/session/history/${userId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '세션 히스토리 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 세션 리포트 생성
  async generateSessionReport(sessionId: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(
      `/session/report/${sessionId}`,
      {
        responseType: 'blob',
        timeout: 60000,
      }
    );
    
    return response.data;
  }

  // 세션 종료
  async endSession(sessionId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(
      `/session/end/${sessionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '세션 종료에 실패했습니다.');
    }
  }

  // 새 세션 시작
  async startSession(userId: string): Promise<{ sessionId: string }> {
    const response: AxiosResponse<ApiResponse<{ sessionId: string }>> = await this.api.post(
      '/session/start',
      { userId }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '세션 시작에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 메시지 삭제
  async deleteMessage(messageId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(
      `/chat/message/${messageId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '메시지 삭제에 실패했습니다.');
    }
  }

  // 채팅 세션 내보내기
  async exportChatSession(sessionId: string, format: 'pdf' | 'json' = 'pdf'): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(
      `/chat/export/${sessionId}`,
      {
        params: { format },
        responseType: 'blob',
        timeout: 60000,
      }
    );
    
    return response.data;
  }

  // 채팅 통계 조회
  async getChatStatistics(sessionId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/chat/statistics/${sessionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 통계 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 연결 테스트
  async testConnection(): Promise<boolean> {
    try {
      const response: AxiosResponse<ApiResponse<{ status: string }>> = await this.api.get('/health');
      return response.data.success && response.data.data?.status === 'ok';
    } catch (error) {
      console.error('채팅 서버 연결 테스트 실패:', error);
      return false;
    }
  }
}

export const chatRepository = new ChatRepository(); 