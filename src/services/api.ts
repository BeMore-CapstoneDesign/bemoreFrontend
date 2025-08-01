import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { emotionRepository } from './repositories/emotionRepository';
import { chatRepository } from './repositories/chatRepository';
import { EmotionAnalysis, ChatMessage, ApiResponse, UserProfile } from '../types';

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

  // ===== 감정 분석 관련 (EmotionRepository 위임) =====
  
  // 텍스트 감정 분석
  async analyzeTextEmotion(data: {
    text: string;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    return emotionRepository.analyzeTextEmotion(data);
  }

  // 음성 감정 분석
  async analyzeVoiceEmotion(data: {
    audioFile: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    return emotionRepository.analyzeVoiceEmotion(data);
  }

  // 얼굴 표정 분석
  async analyzeFacialEmotion(data: {
    imageFile: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    return emotionRepository.analyzeFacialEmotion(data);
  }

  // 멀티모달 감정 분석
  async analyzeMultimodalEmotion(data: {
    text?: string;
    audioFile?: File;
    imageFile?: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    return emotionRepository.analyzeMultimodalEmotion(data);
  }

  // 감정 히스토리 조회
  async getEmotionHistory(sessionId: string): Promise<EmotionAnalysis[]> {
    return emotionRepository.getEmotionHistory(sessionId);
  }

  // 감정 패턴 분석
  async getEmotionPatterns(sessionId: string): Promise<any> {
    return emotionRepository.getEmotionPatterns(sessionId);
  }

  // CBT 피드백 생성
  async generateCBTFeedback(data: {
    emotionAnalysis: EmotionAnalysis;
    sessionId?: string;
  }): Promise<any> {
    return emotionRepository.generateCBTFeedback(data);
  }

  // 위험도 평가
  async assessRisk(data: {
    emotionAnalysis: EmotionAnalysis;
    sessionId?: string;
  }): Promise<any> {
    return emotionRepository.assessRisk(data);
  }

  // ===== 채팅 관련 (ChatRepository 위임) =====

  // AI 채팅 메시지 전송
  async sendChatMessage(message: string, sessionId?: string, emotionContext?: any): Promise<ChatMessage> {
    return chatRepository.sendChatMessage({ message, sessionId, emotionContext });
  }

  // 채팅 히스토리 조회
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return chatRepository.getChatHistory(sessionId);
  }

  // 채팅 컨텍스트 조회
  async getChatContext(sessionId: string): Promise<any> {
    return chatRepository.getChatContext(sessionId);
  }

  // 세션 히스토리 조회
  async getSessionHistory(userId: string): Promise<any> {
    return chatRepository.getSessionHistory(userId);
  }

  // 세션 리포트 생성
  async generateSessionReport(sessionId: string): Promise<Blob> {
    return chatRepository.generateSessionReport(sessionId);
  }

  // 세션 종료
  async endSession(sessionId: string): Promise<void> {
    return chatRepository.endSession(sessionId);
  }

  // 새 세션 시작
  async startSession(userId: string): Promise<{ sessionId: string }> {
    return chatRepository.startSession(userId);
  }

  // 메시지 삭제
  async deleteMessage(messageId: string): Promise<void> {
    return chatRepository.deleteMessage(messageId);
  }

  // 채팅 세션 내보내기
  async exportChatSession(sessionId: string, format: 'pdf' | 'json' = 'pdf'): Promise<Blob> {
    return chatRepository.exportChatSession(sessionId, format);
  }

  // 채팅 통계 조회
  async getChatStatistics(sessionId: string): Promise<any> {
    return chatRepository.getChatStatistics(sessionId);
  }

  // ===== 사용자 관리 =====

  // 사용자 목록 조회
  async getUsers(): Promise<UserProfile[]> {
    const response: AxiosResponse<ApiResponse<UserProfile[]>> = await this.api.get('/users');
    if (!response.data.success) {
      throw new Error(response.data.error || '사용자 목록 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 사용자 생성
  async createUser(data: { name: string; email: string }): Promise<UserProfile> {
    const response: AxiosResponse<ApiResponse<UserProfile>> = await this.api.post('/users', data);
    if (!response.data.success) {
      throw new Error(response.data.error || '사용자 생성에 실패했습니다.');
    }
    return response.data.data!;
  }

  // ===== 시스템 관리 =====

  // 연결 테스트
  async testConnection(): Promise<boolean> {
    try {
      const response: AxiosResponse<ApiResponse<{ status: string }>> = await this.api.get('/health');
      return response.data.success && response.data.data?.status === 'ok';
    } catch (error) {
      console.error('서버 연결 테스트 실패:', error);
      return false;
    }
  }

  // 데이터베이스 연결 테스트
  async testDatabaseConnection(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/health/database');
    if (!response.data.success) {
      throw new Error(response.data.error || '데이터베이스 연결 테스트에 실패했습니다.');
    }
    return response.data.data!;
  }

  // API URL 반환
  getApiUrl(): string {
    return API_URL;
  }

  // ===== 레거시 호환성 (점진적 제거 예정) =====

  // 기존 analyzeEmotion 메서드 (하위 호환성)
  async analyzeEmotion(data: {
    mediaType: 'text' | 'audio' | 'image';
    text?: string;
    audioFile?: File;
    imageFile?: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    switch (data.mediaType) {
      case 'text':
        if (!data.text) throw new Error('텍스트가 필요합니다.');
        return this.analyzeTextEmotion({ text: data.text, sessionId: data.sessionId });
      case 'audio':
        if (!data.audioFile) throw new Error('오디오 파일이 필요합니다.');
        return this.analyzeVoiceEmotion({ audioFile: data.audioFile, sessionId: data.sessionId });
      case 'image':
        if (!data.imageFile) throw new Error('이미지 파일이 필요합니다.');
        return this.analyzeFacialEmotion({ imageFile: data.imageFile, sessionId: data.sessionId });
      default:
        throw new Error('지원하지 않는 미디어 타입입니다.');
    }
  }
}

export const apiService = new ApiService(); 