import { ChatMessage, EmotionAnalysis } from '../../types';
import { apiService } from '../api';

export interface ChatContext {
  recentEmotion?: EmotionAnalysis;
  sessionHistory?: ChatMessage[];
  userProfile?: {
    name: string;
    preferences: unknown;
  };
}

export interface ChatRepository {
  sendMessage: (message: string, context?: ChatContext) => Promise<ChatMessage>;
  getHistory: (userId: string, limit?: number) => Promise<ChatMessage[]>;
  getSessionHistory: (sessionId: string) => Promise<ChatMessage[]>;
  getSuggestions: (emotion: string) => Promise<string[]>;
  clearHistory: (userId: string) => Promise<void>;
}

export class ChatRepositoryImpl implements ChatRepository {
  async sendMessage(message: string, context?: ChatContext): Promise<ChatMessage> {
    try {
      return await apiService.sendChatMessage(message, context?.recentEmotion);
    } catch (error) {
      console.error('채팅 메시지 전송 실패:', error);
      throw new Error('메시지 전송 중 오류가 발생했습니다.');
    }
  }

  async getHistory(userId: string, _limit: number = 50): Promise<ChatMessage[]> {
    try {
      // TODO: 채팅 히스토리 API 구현
      return [];
    } catch (error) {
      console.error('채팅 히스토리 조회 실패:', error);
      throw new Error('채팅 히스토리 조회 중 오류가 발생했습니다.');
    }
  }

  async getSessionHistory(_sessionId: string): Promise<ChatMessage[]> {
    try {
      // TODO: 세션별 채팅 히스토리 API 구현
      return [];
    } catch (error) {
      console.error('세션 채팅 히스토리 조회 실패:', error);
      throw new Error('세션 채팅 히스토리 조회 중 오류가 발생했습니다.');
    }
  }

  async getSuggestions(emotion: string): Promise<string[]> {
    try {
      // 감정별 맞춤 제안 메시지
      const suggestions = {
        happy: [
          '오늘 기분이 정말 좋으시네요!',
          '무엇이 그렇게 기쁘신가요?',
          '이 기분을 오래 유지하고 싶으시겠어요?',
        ],
        sad: [
          '마음이 많이 아프시겠어요',
          '무엇이 그렇게 슬프신가요?',
          '함께 이야기해보면 어떨까요?',
        ],
        angry: [
          '화가 많이 나시는군요',
          '무엇이 그렇게 화나게 만드나요?',
          '화를 내는 것도 자연스러운 감정이에요',
        ],
        anxious: [
          '불안한 마음이 드시는군요',
          '무엇이 걱정되시나요?',
          '차분히 호흡을 가다듬어보세요',
        ],
        neutral: [
          '오늘 하루는 어떠셨나요?',
          '특별한 일이 있었나요?',
          '감정을 표현해보고 싶으신가요?',
        ],
      };
      
      return suggestions[emotion as keyof typeof suggestions] || suggestions.neutral;
    } catch (error) {
      console.error('제안 메시지 조회 실패:', error);
      return [];
    }
  }

  async clearHistory(userId: string): Promise<void> {
    try {
      // TODO: 채팅 히스토리 삭제 API 구현
      console.log('채팅 히스토리 삭제:', userId);
    } catch (error) {
      console.error('채팅 히스토리 삭제 실패:', error);
      throw new Error('채팅 히스토리 삭제 중 오류가 발생했습니다.');
    }
  }
}

// 싱글톤 인스턴스
export const chatRepository = new ChatRepositoryImpl(); 