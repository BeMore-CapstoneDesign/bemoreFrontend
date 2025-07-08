import { EmotionAnalysis } from '../../types';
import { apiService } from '../api';

export interface AnalysisData {
  mediaType: 'image' | 'audio' | 'text';
  file?: File;
  textContent?: string;
}

export interface EmotionRepository {
  analyze: (data: AnalysisData) => Promise<EmotionAnalysis>;
  getHistory: (userId: string, limit?: number) => Promise<EmotionAnalysis[]>;
  getSessionHistory: (sessionId: string) => Promise<EmotionAnalysis[]>;
  deleteAnalysis: (analysisId: string) => Promise<void>;
  exportReport: (sessionId: string) => Promise<Blob>;
}

export class EmotionRepositoryImpl implements EmotionRepository {
  async analyze(data: AnalysisData): Promise<EmotionAnalysis> {
    try {
      return await apiService.analyzeEmotion(data);
    } catch (error) {
      console.error('감정 분석 실패:', error);
      throw new Error('감정 분석 중 오류가 발생했습니다.');
    }
  }

  async getHistory(userId: string, limit: number = 50): Promise<EmotionAnalysis[]> {
    try {
      return await apiService.getHistory(userId, limit);
    } catch (error) {
      console.error('히스토리 조회 실패:', error);
      throw new Error('히스토리 조회 중 오류가 발생했습니다.');
    }
  }

  async getSessionHistory(sessionId: string): Promise<EmotionAnalysis[]> {
    try {
      // TODO: 세션별 히스토리 API 구현
      return await apiService.getHistory('user_1', 100);
    } catch (error) {
      console.error('세션 히스토리 조회 실패:', error);
      throw new Error('세션 히스토리 조회 중 오류가 발생했습니다.');
    }
  }

  async deleteAnalysis(analysisId: string): Promise<void> {
    try {
      // TODO: 삭제 API 구현
      console.log('분석 결과 삭제:', analysisId);
    } catch (error) {
      console.error('분석 결과 삭제 실패:', error);
      throw new Error('분석 결과 삭제 중 오류가 발생했습니다.');
    }
  }

  async exportReport(sessionId: string): Promise<Blob> {
    try {
      return await apiService.generateReport(sessionId);
    } catch (error) {
      console.error('리포트 생성 실패:', error);
      throw new Error('리포트 생성 중 오류가 발생했습니다.');
    }
  }
}

// 싱글톤 인스턴스
export const emotionRepository = new EmotionRepositoryImpl(); 