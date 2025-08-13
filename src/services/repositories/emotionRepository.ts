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
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const result = response.data.data!;
    return {
      ...result,
      emotion: result.primaryEmotion || result.emotion, // primaryEmotion을 emotion으로 매핑
      id: result.id || `analysis_${Date.now()}`,
      userId: result.userId || 'user123',
      timestamp: result.timestamp || new Date().toISOString(),
      mediaType: result.mediaType || 'text',
      cbtFeedback: result.cbtFeedback || {
        cognitiveDistortion: '감정 분석이 완료되었습니다',
        challenge: '현재 감정 상태를 객관적으로 바라보세요',
        alternative: '감정은 자연스러운 반응입니다',
        actionPlan: '정기적인 감정 체크를 권장합니다'
      }
    };
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
    // 텍스트만 있는 경우 JSON 형식으로 요청
    if (data.text && !data.audioFile && !data.imageFile) {
      const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
        '/emotion/analyze',
        {
          text: {
            content: data.text
          },
          context: '일상 대화',
          sessionId: data.sessionId || 'default-session'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || '멀티모달 감정 분석에 실패했습니다.');
      }
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const result = response.data.data!;
      return {
        ...result,
        emotion: result.primaryEmotion || result.emotion,
        id: result.id || `multimodal_${Date.now()}`,
        userId: result.userId || 'user123',
        timestamp: result.timestamp || new Date().toISOString(),
        mediaType: result.mediaType || 'multimodal',
        cbtFeedback: result.cbtFeedback || {
          cognitiveDistortion: '멀티모달 감정 분석이 완료되었습니다',
          challenge: '다양한 관점에서 감정을 바라보세요',
          alternative: '감정은 복합적인 현상입니다',
          actionPlan: '정기적인 감정 체크를 권장합니다'
        }
      };
    }
    
    // 파일이 포함된 경우 FormData 형식으로 요청
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
      '/emotion/analyze',
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
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const result = response.data.data!;
    return {
      ...result,
      emotion: result.primaryEmotion || result.emotion,
      id: result.id || `multimodal_${Date.now()}`,
      userId: result.userId || 'user123',
      timestamp: result.timestamp || new Date().toISOString(),
      mediaType: result.mediaType || 'multimodal',
      cbtFeedback: result.cbtFeedback || {
        cognitiveDistortion: '멀티모달 감정 분석이 완료되었습니다',
        challenge: '다양한 관점에서 감정을 바라보세요',
        alternative: '감정은 복합적인 현상입니다',
        actionPlan: '정기적인 감정 체크를 권장합니다'
      }
    };
  }

  // 실시간 감정 분석 (새로 추가)
  async analyzeRealtimeEmotion(data: {
    videoFrame?: File;
    audioChunk?: File;
    sessionId: string;
    timestamp: string;
  }): Promise<EmotionAnalysis> {
    const formData = new FormData();
    
    if (data.videoFrame) {
      this.validateImageFile(data.videoFrame);
      formData.append('videoFrame', data.videoFrame);
    }
    if (data.audioChunk) {
      this.validateAudioFile(data.audioChunk);
      formData.append('audioChunk', data.audioChunk);
    }
    
    formData.append('sessionId', data.sessionId);
    formData.append('timestamp', data.timestamp);
    
    const response: AxiosResponse<ApiResponse<EmotionAnalysis>> = await this.api.post(
      '/emotion/analyze/realtime',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 5000, // 실시간 요구사항
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '실시간 감정 분석에 실패했습니다.');
    }
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const result = response.data.data!;
    return {
      ...result,
      emotion: result.primaryEmotion || result.emotion,
      id: result.id || `realtime_${Date.now()}`,
      userId: result.userId || 'user123',
      timestamp: result.timestamp || new Date().toISOString(),
      mediaType: result.mediaType || 'realtime',
      cbtFeedback: result.cbtFeedback || {
        cognitiveDistortion: '실시간 감정 분석 중입니다',
        challenge: '현재 감정 상태를 관찰해보세요',
        alternative: '감정 변화는 자연스러운 과정입니다',
        actionPlan: '정기적인 감정 체크를 해보세요'
      }
    };
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