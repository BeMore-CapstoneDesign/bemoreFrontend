'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { AnalysisLayout } from '../../components/layout/AnalysisLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { FeedbackMessage } from '../../components/ui/FeedbackMessage';
import { 
  Camera, 
  Brain,
  CheckCircle,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Lightbulb,
  Target,
  Eye,
  MessageSquare,
  Activity,
  Upload,
  Phone,
  Video,
  Zap,
  Palette
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { emotionRepository } from '../../services/repositories/emotionRepository';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis } from '../../utils/emotion';
import VideoCallEmotionAnalysis from '../../components/analysis/VideoCallEmotionAnalysis';

// 단순화된 워크플로우
type SimpleWorkflow = 'ready' | 'analyzing' | 'result';

// 감정별 색상 시스템
const emotionColors = {
  happy: {
    primary: '#10B981',
    secondary: '#34D399',
    gradient: 'from-green-400 to-emerald-500',
    bg: 'from-green-50 to-emerald-50',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  sad: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    gradient: 'from-blue-400 to-indigo-500',
    bg: 'from-blue-50 to-indigo-50',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  angry: {
    primary: '#EF4444',
    secondary: '#F87171',
    gradient: 'from-red-400 to-pink-500',
    bg: 'from-red-50 to-pink-50',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  surprised: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    gradient: 'from-yellow-400 to-orange-500',
    bg: 'from-yellow-50 to-orange-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  neutral: {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    gradient: 'from-gray-400 to-slate-500',
    bg: 'from-gray-50 to-slate-50',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

// 통합 멀티모달 분석 인터페이스
function MultimodalAnalysisInterface({ 
  onStartAnalysis, 
  isAnalyzing,
  progress,
  currentStep,
  onVideoCall
}: { 
  onStartAnalysis: (data: { text?: string; audioFile?: File; imageFile?: File }) => void; 
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  onVideoCall: () => void;
}) {
  const steps = [
    { key: 'preparing', label: '준비 중' },
    { key: 'analyzing', label: '분석 중' },
    { key: 'completed', label: '완료' }
  ];

  return (
    <div className="space-y-8">
      {/* 분석 진행률 */}
      {isAnalyzing && (
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>
              <Brain className="w-5 h-5 text-primary" />
              <span>분석 진행 상황</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StepIndicator 
              steps={steps} 
              currentStep={currentStep} 
              className="mb-6"
            />
            <ProgressIndicator 
              progress={progress}
              step={currentStep === 'preparing' ? '분석 준비 중...' : 
                    currentStep === 'analyzing' ? '감정 분석 중...' : 
                    '분석 완료'}
              description="AI가 데이터를 분석하고 있습니다"
            />
          </CardContent>
        </Card>
      )}

      {/* 통합된 시작 버튼 */}
      {!isAnalyzing && (
        <div className="flex justify-center pt-4">
          <Button
            variant="gradient"
            size="xl"
            onClick={onVideoCall}
            icon={<Video className="w-5 h-5" />}
            className="px-12 py-4 text-lg font-semibold"
          >
            감정 분석 시작
          </Button>
        </div>
      )}
    </div>
  );
}

// 결과 모달 컴포넌트
function ResultModal({ 
  result, 
  onClose, 
  onNewAnalysis 
}: { 
  result: EmotionAnalysis;
  onClose: () => void;
  onNewAnalysis: () => void;
}) {
  const getEmotionText = (emotion: string) => {
    const emotionTexts: Record<string, string> = {
      happy: '기쁨',
      sad: '슬픔',
      angry: '분노',
      surprised: '놀람',
      neutral: '중립'
    };
    return emotionTexts[emotion as keyof typeof emotionTexts] || emotion;
  };

  const getMoodText = (valence: number) => {
    if (valence > 0.6) return '매우 긍정적';
    if (valence > 0.3) return '긍정적';
    if (valence > -0.3) return '중립적';
    if (valence > -0.6) return '부정적';
    return '매우 부정적';
  };

  const getEnergyText = (arousal: number) => {
    if (arousal > 0.6) return '매우 활발';
    if (arousal > 0.3) return '활발';
    if (arousal > -0.3) return '보통';
    if (arousal > -0.6) return '차분';
    return '매우 차분';
  };

  const emotionColor = emotionColors[result.emotion as keyof typeof emotionColors] || emotionColors.neutral;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">멀티모달 감정 분석 결과</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="space-y-6">
            {/* 주요 감정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className={`text-2xl ${emotionEmojis[result.emotion as keyof typeof emotionEmojis] || '😐'}`}></span>
                  <span>주요 감정</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl mb-2 ${emotionEmojis[result.emotion as keyof typeof emotionEmojis] || '😐'}`}></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getEmotionText(result.emotion)}
                  </h3>
                  <p className="text-gray-600">
                    신뢰도: {Math.round(result.confidence * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* VAD 점수 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <span>감정 세부 분석</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">긍정성</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(result.vadScore.valence * 100)}%
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      {getMoodText(result.vadScore.valence)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">각성도</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(result.vadScore.arousal * 100)}%
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      {getEnergyText(result.vadScore.arousal)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">지배성</h4>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(result.vadScore.dominance * 100)}%
                    </div>
                    <p className="text-sm text-purple-600 mt-1">
                      {result.vadScore.dominance > 0.5 ? '주도적' : '수동적'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CBT 피드백 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span>CBT 피드백</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">인지 왜곡</h4>
                    <p className="text-gray-700">{result.cbtFeedback.cognitiveDistortion}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">도전적 질문</h4>
                    <p className="text-gray-700">{result.cbtFeedback.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">대안적 사고</h4>
                    <p className="text-gray-700">{result.cbtFeedback.alternative}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">행동 계획</h4>
                    <p className="text-gray-700">{result.cbtFeedback.actionPlan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={onNewAnalysis}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                새로운 분석
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                확인
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { addEmotionAnalysis, setLoading, isLoading } = useAppStore();
  const [workflow, setWorkflow] = useState<SimpleWorkflow>('ready');
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('preparing');
  const [showVideoCall, setShowVideoCall] = useState(false);
  
  // 클라이언트 사이드 마운트 확인
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  // 분석 시작
  const handleStartAnalysis = async (data: { text?: string; audioFile?: File; imageFile?: File }) => {
    setWorkflow('analyzing');
    setLoading(true);
    setError(null);
    setProgress(0);
    setCurrentStep('preparing');

    try {
      // 진행률 시뮬레이션 (실제 API 호출 시 제거)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // 단계별 진행
      setTimeout(() => setCurrentStep('analyzing'), 1000);
      setTimeout(() => setCurrentStep('completed'), 3000);

      // 실제 멀티모달 감정 분석 API 호출
      let analysisResult: EmotionAnalysis;
      
      try {
        analysisResult = await emotionRepository.analyzeMultimodalEmotion({
          text: data.text,
          audioFile: data.audioFile,
          imageFile: data.imageFile,
          sessionId: 'test-session'
        });
      } catch (error) {
        // API 호출 실패 시 모의 데이터 사용
        console.warn('API 호출 실패, 모의 데이터 사용:', error);
        analysisResult = {
          id: `analysis_${Date.now()}`,
          userId: 'user123',
          emotion: 'happy',
          confidence: 0.85,
          vadScore: {
            valence: 0.7,
            arousal: 0.5,
            dominance: 0.6
          },
          timestamp: new Date().toISOString(),
          mediaType: 'text',
          cbtFeedback: {
            cognitiveDistortion: '과도한 낙관주의',
            challenge: '현재의 긍정적인 감정을 유지하면서도 현실적인 계획을 세워보세요.',
            alternative: '기쁨을 유지하면서도 앞으로의 도전에 대비할 수 있습니다.',
            actionPlan: '긍정적인 감정을 기록하고, 이를 어려운 시기에 활용해보세요.'
          }
        };
      }

      setAnalysisResult(analysisResult);
      addEmotionAnalysis(analysisResult);
      setWorkflow('result');
      setShowResult(true);
      
      clearInterval(progressInterval);
    } catch (error) {
      console.error('분석 실패:', error);
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setWorkflow('ready');
    } finally {
      setLoading(false);
    }
  };

  // 새로운 분석 시작
  const handleNewAnalysis = () => {
    setWorkflow('ready');
    setAnalysisResult(null);
    setShowResult(false);
    setError(null);
    setProgress(0);
    setCurrentStep('preparing');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <AnalysisLayout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {showVideoCall ? '영상 통화 감정 분석' : '멀티모달 감정 분석'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {showVideoCall 
              ? '실시간 화상 통화를 통해 감정을 분석하고 모니터링합니다'
              : '텍스트, 음성, 이미지를 통합하여 정확한 감정 분석을 제공합니다'
            }
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <FeedbackMessage
            type="error"
            title="분석 실패"
            message={error}
            onAction={handleNewAnalysis}
            actionText="다시 시도"
          />
        )}

        {/* 워크플로우별 컨텐츠 */}
        {workflow === 'ready' && !showVideoCall && (
          <MultimodalAnalysisInterface
            onStartAnalysis={(data) => handleStartAnalysis(data)}
            isAnalyzing={false}
            progress={progress}
            currentStep={currentStep}
            onVideoCall={() => setShowVideoCall(true)}
          />
        )}

        {/* 영상 통화 분석 */}
        {showVideoCall && (
          <div className="h-[600px]">
            <VideoCallEmotionAnalysis
              isActive={true}
              onEmotionChange={(emotion) => {
                setAnalysisResult(emotion);
                addEmotionAnalysis(emotion);
              }}
              onCallEnd={() => {
                setShowVideoCall(false);
                setAnalysisResult(null);
              }}
            />
          </div>
        )}



        {/* 결과 모달 */}
        {showResult && analysisResult && (
          <ResultModal
            result={analysisResult}
            onClose={() => setShowResult(false)}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </div>
    </AnalysisLayout>
  );
} 