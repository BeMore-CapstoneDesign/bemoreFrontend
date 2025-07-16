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

  // 음성 감정 분석
  async analyzeVoiceEmotion(data: {
    audioFile: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    // 파일 유효성 검사
    this.validateAudioFile(data.audioFile);
    
    const formData = new FormData();
    formData.append('audio', data.audioFile);
    if (data.sessionId) formData.append('sessionId', data.sessionId);
    
    const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
      '/emotion/analyze/voice',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 음성 분석은 시간이 오래 걸릴 수 있음
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || '음성 감정 분석에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 얼굴 표정 분석
  async analyzeFacialEmotion(data: {
    imageFile: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    // 파일 유효성 검사
    this.validateImageFile(data.imageFile);
    
    const formData = new FormData();
    formData.append('image', data.imageFile);
    if (data.sessionId) formData.append('sessionId', data.sessionId);
    
    const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
      '/emotion/analyze/facial',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 이미지 분석은 상대적으로 빠름
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || '얼굴 표정 분석에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 멀티모달 감정 분석
  async analyzeMultimodalEmotion(data: {
    text?: string;
    audioFile?: File;
    imageFile?: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    const formData = new FormData();
    if (data.text) formData.append('text', data.text);
    if (data.audioFile) formData.append('audio', data.audioFile);
    if (data.imageFile) formData.append('image', data.imageFile);
    if (data.sessionId) formData.append('sessionId', data.sessionId);
    
    const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
      '/emotion/analyze/multimodal',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || '멀티모달 감정 분석에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 기존 analyzeEmotion 메서드 (하위 호환성 유지)
  async analyzeEmotion(data: {
    mediaType: 'text' | 'audio' | 'image';
    text?: string;
    audioFile?: File;
    imageFile?: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    // mediaType에 따라 적절한 엔드포인트 호출
    if (data.mediaType === 'audio') {
      return this.analyzeVoiceEmotion({
        audioFile: data.audioFile!,
        sessionId: data.sessionId
      });
    } else {
      // text, image는 멀티모달로 처리
      return this.analyzeMultimodalEmotion({
        text: data.text,
        imageFile: data.imageFile,
        sessionId: data.sessionId
      });
    }
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

  // 채팅 컨텍스트 조회
  async getChatContext(sessionId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/chat/context/${sessionId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 컨텍스트 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 채팅 히스토리 조회
  async getChatHistory(sessionId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/chat/history/${sessionId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '채팅 히스토리 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 감정 패턴 분석
  async getEmotionPatterns(sessionId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/emotion/patterns/${sessionId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '감정 패턴 분석에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 감정 분석 히스토리
  async getEmotionHistory(sessionId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/emotion/history/${sessionId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '감정 분석 히스토리 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // CBT 피드백 생성
  async generateCBTFeedback(data: {
    emotionAnalysis: any;
    sessionId?: string;
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/emotion/cbt/feedback', {
      emotionAnalysis: data.emotionAnalysis,
      sessionId: data.sessionId,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'CBT 피드백 생성에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 위험 신호 감지
  async assessRisk(data: {
    emotionAnalysis: any;
    sessionId?: string;
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/emotion/risk-assessment', {
      emotionAnalysis: data.emotionAnalysis,
      sessionId: data.sessionId,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || '위험 신호 감지에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 사용자 인증 등 기타 API 함수도 동일하게 추가 가능

  // API 연결 테스트
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.api.get('/test/db-connection');
      return response.status === 200;
    } catch (error) {
      console.error('API 연결 테스트 실패:', error);
      return false;
    }
  }

  // 데이터베이스 연결 테스트
  async testDatabaseConnection(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/test/db-connection');
    if (!response.data.success) {
      throw new Error(response.data.error || '데이터베이스 연결 테스트에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 사용자 목록 조회
  async getUsers(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/test/users');
    if (!response.data.success) {
      throw new Error(response.data.error || '사용자 목록 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 사용자 생성
  async createUser(data: { name: string; email: string }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/test/users', data);
    if (!response.data.success) {
      throw new Error(response.data.error || '사용자 생성에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 현재 API URL 확인
  getApiUrl(): string {
    return this.api.defaults.baseURL || '';
  }

  // 파일 유효성 검사 메서드들
  private validateImageFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF만 지원)');
    }

    if (file.size > maxSize) {
      throw new Error('이미지 파일 크기가 너무 큽니다. (최대 5MB)');
    }
  }

  private validateAudioFile(file: File): void {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 오디오 형식입니다. (WAV, MP3, M4A, OGG만 지원)');
    }

    if (file.size > maxSize) {
      throw new Error('오디오 파일 크기가 너무 큽니다. (최대 10MB)');
    }
  }
}

export const apiService = new ApiService(); 