import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EmotionAnalysis, ChatMessage, ApiResponse } from '../types';
import { geminiService } from './gemini';

class ApiService {
  private api: AxiosInstance;
  private isMockMode: boolean;

  constructor() {
    this.isMockMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;
    
    if (this.isMockMode) {
      // API 키 테스트
      geminiService.testAPIKey();
    }
    
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

  // Mock 응답 생성
  private createMockResponse<T>(data: T, delay = 1000): Promise<AxiosResponse<ApiResponse<T>>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            data,
            message: 'Mock response',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });
      }, delay);
    });
  }

  // 감정 분석 API
  async analyzeEmotion(data: {
    mediaType: 'image' | 'audio' | 'text';
    file?: File;
    textContent?: string;
  }): Promise<EmotionAnalysis> {
    if (this.isMockMode) {
      const mockEmotion: EmotionAnalysis = {
        id: Date.now().toString(),
        userId: 'user123',
        emotion: 'neutral',
        confidence: 0.85,
        timestamp: new Date(),
        mediaType: data.mediaType,
        vadScore: {
          valence: 0.5,
          arousal: 0.3,
          dominance: 0.4,
        },
        cbtFeedback: {
          cognitiveDistortion: 'all-or-nothing thinking',
          challenge: '이 상황을 다른 관점에서 바라볼 수 있을까요?',
          alternative: '완벽하지 않아도 괜찮습니다. 작은 진전도 의미가 있습니다.',
          actionPlan: '하루에 한 가지씩 작은 목표를 세워보세요.',
        },
      };
      
      return this.createMockResponse(mockEmotion).then(response => response.data.data!);
    }

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
    if (this.isMockMode) {
      // 실제 Gemini API 사용 (Mock 모드에서도)
      try {
        const geminiResponse = await geminiService.generateChatResponse(message, emotionContext);
        
        const chatMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: geminiResponse,
          timestamp: new Date(),
        };
        
        return this.createMockResponse(chatMessage, 1000).then(response => response.data.data!);
      } catch (error) {
        // 에러 로그 제거
        
        const fallbackResponses = [
          '네, 말씀해주세요. 어떤 감정을 느끼고 계신지 더 자세히 들려주세요.',
          '그런 감정을 느끼시는 것은 자연스러운 일입니다. 함께 이 감정을 탐색해보겠습니다.',
          'CBT 관점에서 보면, 이런 생각 패턴을 인식하는 것이 첫 번째 단계입니다.',
          '현재 상황을 다른 관점에서 바라보는 방법을 함께 찾아보겠습니다.',
          '스트레스 관리에 도움이 될 수 있는 몇 가지 기법을 제안드릴게요.',
          '감정은 우리에게 중요한 신호를 보내는 메신저입니다. 이 감정이 무엇을 말하려는지 들어보세요.',
          '긍정적 사고로 전환하는 방법을 함께 연습해보겠습니다.',
          '이런 상황에서 마음챙김 기법을 활용해보는 것은 어떨까요?',
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        const mockChatMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: randomResponse,
          timestamp: new Date(),
        };
        
        return this.createMockResponse(mockChatMessage, 1500).then(response => response.data.data!);
      }
    }

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
    if (this.isMockMode) {
      const mockHistory: EmotionAnalysis[] = [
        {
          id: '1',
          userId: 'user123',
          emotion: 'happy',
          confidence: 0.9,
          timestamp: new Date(Date.now() - 86400000), // 1일 전
          mediaType: 'text',
          vadScore: {
            valence: 0.8,
            arousal: 0.7,
            dominance: 0.6,
          },
          cbtFeedback: {
            cognitiveDistortion: 'positive thinking',
            challenge: '이 긍정적인 감정을 어떻게 더 잘 활용할 수 있을까요?',
            alternative: '긍정적인 감정을 잘 활용하고 계시네요.',
            actionPlan: '감사 연습과 긍정적 사고를 계속 유지해보세요.',
          },
        },
        {
          id: '2',
          userId: 'user123',
          emotion: 'sad',
          confidence: 0.85,
          timestamp: new Date(Date.now() - 172800000), // 2일 전
          mediaType: 'text',
          vadScore: {
            valence: 0.2,
            arousal: 0.4,
            dominance: 0.3,
          },
          cbtFeedback: {
            cognitiveDistortion: 'catastrophizing',
            challenge: '이 감정이 영구적일 것 같다고 생각하시나요?',
            alternative: '이 감정은 일시적이며, 시간이 지나면 나아질 것입니다.',
            actionPlan: '인지 재구성과 자기 동정 기법을 활용해보세요.',
          },
        },
      ];
      
      return this.createMockResponse(mockHistory).then(response => response.data.data!);
    }

    const response: AxiosResponse<ApiResponse<EmotionAnalysis[]>> = await this.api.get(
      `/history/${userId}?limit=${limit}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || '히스토리 조회에 실패했습니다.');
    }

    return response.data.data!;
  }

  // 사용자 프로필 조회
  async getUserProfile(): Promise<unknown> {
    if (this.isMockMode) {
      const mockProfile = {
        id: 'user123',
        name: '사용자',
        email: 'user@example.com',
        createdAt: new Date(),
      };
      
      return this.createMockResponse(mockProfile).then(response => response.data.data!);
    }

    const response: AxiosResponse<ApiResponse<unknown>> = await this.api.get('/user/profile');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '프로필 조회에 실패했습니다.');
    }

    return response.data.data!;
  }

  // PDF 리포트 생성
  async generateReport(sessionId: string): Promise<Blob> {
    if (this.isMockMode) {
      // Mock PDF blob 생성
      const mockPdfContent = 'Mock PDF content';
      const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
      
      return new Promise((resolve) => {
        setTimeout(() => resolve(blob), 2000);
      });
    }

    const response = await this.api.get(`/report/${sessionId}`, {
      responseType: 'blob',
    });

    return response.data;
  }
}

export const apiService = new ApiService(); 