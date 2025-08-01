import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EmotionAnalysis, ApiResponse, VADScore } from '../../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class EmotionRepository {
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

  // 텍스트 감정 분석
  async analyzeTextEmotion(data: {
    text: string;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
    const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
      '/emotion/analyze/text',
      {
        text: data.text,
        sessionId: data.sessionId
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '텍스트 감정 분석에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 음성 감정 분석
  async analyzeVoiceEmotion(data: {
    audioFile: File;
    sessionId?: string;
  }): Promise<EmotionAnalysis> {
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
        timeout: 60000,
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
        timeout: 30000,
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
    if (data.audioFile) {
      this.validateAudioFile(data.audioFile);
      formData.append('audio', data.audioFile);
    }
    if (data.imageFile) {
      this.validateImageFile(data.imageFile);
      formData.append('image', data.imageFile);
    }
    if (data.sessionId) formData.append('sessionId', data.sessionId);
    
    const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
      '/emotion/analyze/multimodal',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 90000,
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '멀티모달 감정 분석에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 감정 히스토리 조회
  async getEmotionHistory(sessionId: string): Promise<EmotionAnalysis[]> {
    const response: AxiosResponse<ApiResponse<EmotionAnalysis[]>> = await this.api.get(
      `/emotion/history/${sessionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '감정 히스토리 조회에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 감정 패턴 분석
  async getEmotionPatterns(sessionId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/emotion/patterns/${sessionId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '감정 패턴 분석에 실패했습니다.');
    }
    return response.data.data!;
  }

  // CBT 피드백 생성
  async generateCBTFeedback(data: {
    emotionAnalysis: EmotionAnalysis;
    sessionId?: string;
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      '/emotion/cbt-feedback',
      {
        emotionAnalysis: data.emotionAnalysis,
        sessionId: data.sessionId
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'CBT 피드백 생성에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 위험도 평가
  async assessRisk(data: {
    emotionAnalysis: EmotionAnalysis;
    sessionId?: string;
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      '/emotion/risk-assessment',
      {
        emotionAnalysis: data.emotionAnalysis,
        sessionId: data.sessionId
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '위험도 평가에 실패했습니다.');
    }
    return response.data.data!;
  }

  // 파일 유효성 검사 메서드들
  private validateImageFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('이미지 파일 크기는 10MB 이하여야 합니다.');
    }
  }

  private validateAudioFile(file: File): void {
    if (!file.type.startsWith('audio/')) {
      throw new Error('오디오 파일만 업로드 가능합니다.');
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB
      throw new Error('오디오 파일 크기는 50MB 이하여야 합니다.');
    }
  }
}

export const emotionRepository = new EmotionRepository(); 