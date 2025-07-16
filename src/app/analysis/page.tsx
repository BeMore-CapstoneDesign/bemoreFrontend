'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Camera, 
  Brain,
  CheckCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Square,
  X,
  Lightbulb,
  Target,
  ArrowRight,
  Eye,
  Ear,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Heart,
  Zap as Lightning,
  Activity as Pulse
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis } from '../../utils/emotion';
import { apiService } from '../../services/api';

type AnalysisState = 'idle' | 'session_ready' | 'session_active' | 'analyzing' | 'completed' | 'error';

type AnalysisStep = 'preparing' | 'analyzing_text' | 'analyzing_voice' | 'analyzing_facial' | 'generating_feedback' | 'completed';

type SessionState = 'not_started' | 'active' | 'completed';

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

// 분석 단계 표시 컴포넌트
function AnalysisStepIndicator({ step }: { step: AnalysisStep }) {
  const steps = [
    { key: 'preparing', label: '분석 준비 중', icon: Brain },
    { key: 'analyzing_text', label: '텍스트 분석 중', icon: MessageSquare },
    { key: 'analyzing_voice', label: '음성 분석 중', icon: Volume2 },
    { key: 'analyzing_facial', label: '표정 분석 중', icon: Eye },
    { key: 'generating_feedback', label: '피드백 생성 중', icon: Lightbulb },
    { key: 'completed', label: '분석 완료', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const currentStep = steps[currentStepIndex];

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
      <div className="analysis-status rounded-full px-4 py-2 flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-white text-sm font-medium">{currentStep.label}</span>
        <currentStep.icon className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

// 실시간 멀티모달 분석 인터페이스
function MultimodalAnalysisInterface({ 
  onStartAnalysis, 
  onStopAnalysis, 
  isAnalyzing,
  analysisStep,
  autoStartMedia = false
}: { 
  onStartAnalysis: () => void;
  onStopAnalysis: () => void;
  isAnalyzing: boolean;
  analysisStep: AnalysisStep;
  autoStartMedia?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && autoStartMedia) {
      // 상담이 시작되면 자동으로 카메라와 마이크 켜기
      setIsCameraOn(true);
      setIsMicOn(true);
    }
  }, [isMounted, autoStartMedia]);

  useEffect(() => {
    if (isCameraOn && isMounted) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraOn, isMounted]);

  const startCamera = async () => {
    if (!isMounted) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
    }
  };

  const stopCamera = () => {
    if (!isMounted) return;
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleFullscreen = () => {
    if (!isMounted) return;
    
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* 메인 비디오 화면 */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video">
          {isMounted && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          

          
          {/* 실시간 분석 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
            {/* 분석 단계 표시 */}
            {isAnalyzing && <AnalysisStepIndicator step={analysisStep} />}
            
            {/* 상단 상태바 */}
            <div className="absolute top-2 left-2 right-2 top-status-bar opacity-90 hover:opacity-100 transition-opacity">
              {/* 왼쪽: 분석 상태 */}
              <div className={`status-indicators ${isAnalyzing ? 'realtime-analysis-indicator' : ''}`}>
                <div className={`status-indicator-item ${isAnalyzing ? 'active' : 'inactive'}`}>
                  <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-500 emotion-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-white text-xs font-medium">
                    {isAnalyzing ? '분석 중' : '대기 중'}
                  </span>
                  {isAnalyzing && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 오른쪽: 컨트롤 버튼들 */}
              <div className="status-indicators">
                {/* 카메라 상태 표시 */}
                <div className={`status-indicator-item ${isCameraOn ? 'active' : 'inactive'}`}>
                  <Camera className={`w-3 h-3 ${isCameraOn ? 'text-green-400' : 'text-red-400'}`} />
                  <span className="text-white text-xs">
                    {isCameraOn ? '카메라 켜짐' : '카메라 꺼짐'}
                  </span>
                </div>
                
                {/* 마이크 상태 표시 */}
                <div className={`status-indicator-item ${isMicOn ? 'active' : 'inactive'}`}>
                  {isMicOn ? (
                    <Volume2 className="w-3 h-3 text-green-400" />
                  ) : (
                    <VolumeX className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-white text-xs">
                    {isMicOn ? '마이크 켜짐' : '마이크 꺼짐'}
                  </span>
                </div>
                
                {/* 전체화면 버튼 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="status-indicator-item hover:bg-white/20"
                  title={isFullscreen ? '전체화면 종료' : '전체화면'}
                >
                  {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* 하단 컨트롤 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="control-button-group">
                {/* 카메라 컨트롤 */}
                <div className="control-item">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={`control-button ${isCameraOn ? 'camera-on active' : 'camera-off inactive'}`}
                    title={isCameraOn ? '카메라 끄기' : '카메라 켜기'}
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-xs">{isCameraOn ? '켜짐' : '꺼짐'}</span>
                  </Button>
                </div>
                
                {/* 마이크 컨트롤 */}
                <div className="control-item">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`control-button ${isMicOn ? 'mic-on active' : 'mic-off inactive'}`}
                    title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
                  >
                    {isMicOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    <span className="text-xs">{isMicOn ? '켜짐' : '꺼짐'}</span>
                  </Button>
                </div>
                
                {/* 분석 시작/중지 버튼 */}
                <div className="control-item">
                  {!isAnalyzing ? (
                    <Button
                      onClick={onStartAnalysis}
                      disabled={!isCameraOn || !isMicOn}
                      className={`control-button ${!isCameraOn || !isMicOn ? 'disabled' : 'start-analysis'}`}
                      title={!isCameraOn || !isMicOn ? '카메라와 마이크를 모두 켜주세요' : '감정 분석 시작'}
                    >
                      <Play className="w-6 h-6" />
                      <span className="text-xs">시작</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={onStopAnalysis}
                      className="control-button stop-analysis"
                      title="감정 분석 중지"
                    >
                      <Square className="w-6 h-6" />
                      <span className="text-xs">중지</span>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* 상태 안내 텍스트 */}
              <div className="mt-3 text-center">
                <div className="status-guide rounded-full px-4 py-2 inline-block">
                  <span className="text-white text-sm">
                    {!isCameraOn && !isMicOn && '카메라와 마이크를 켜주세요'}
                    {isCameraOn && !isMicOn && '마이크를 켜주세요'}
                    {!isCameraOn && isMicOn && '카메라를 켜주세요'}
                    {isCameraOn && isMicOn && !isAnalyzing && '분석을 시작할 준비가 되었습니다'}
                    {isAnalyzing && '감정 분석 중...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
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
  const colors = emotionColors[result.emotion as keyof typeof emotionColors] || emotionColors.neutral;
  const [showDetails, setShowDetails] = useState(false);
  
  const getEmotionText = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '기쁨';
      case 'sad': return '슬픔';
      case 'angry': return '분노';
      case 'surprised': return '놀람';
      case 'neutral': return '평온';
      default: return emotion;
    }
  };

  const getMoodText = (valence: number) => {
    if (valence > 0.7) return '매우 긍정적';
    if (valence > 0.5) return '긍정적';
    if (valence > 0.3) return '중립적';
    return '부정적';
  };

  const getEnergyText = (arousal: number) => {
    if (arousal > 0.7) return '매우 활발';
    if (arousal > 0.5) return '활발';
    if (arousal > 0.3) return '보통';
    return '차분';
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className={`bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto border-2 ${colors.border}`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center animate-pulse`}>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">감정 분석 완료</h3>
              <p className="text-gray-600">표정, 음성, 텍스트를 종합한 결과</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* 핵심 결과 */}
        <div className={`bg-gradient-to-r ${colors.bg} rounded-2xl p-6 mb-6 border ${colors.border} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} animate-pulse`} style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="text-center relative z-10">
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
              {emotionEmojis[result.emotion as keyof typeof emotionEmojis] || '😐'}
            </div>
            <h4 className={`text-3xl font-bold ${colors.text} mb-2`}>
              {getEmotionText(result.emotion)}
            </h4>
            <p className="text-gray-600 mb-4">
              {result.confidence > 0.8 ? '매우 확실한 분석' : result.confidence > 0.6 ? '확실한 분석' : '추정 분석'}
            </p>
            
            {/* 간단한 요약 */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/70 rounded-xl p-3">
                <div className="text-sm text-gray-600 mb-1">전반적 기분</div>
                <div className="text-lg font-bold text-green-800">{getMoodText(result.vadScore.valence)}</div>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <div className="text-sm text-gray-600 mb-1">에너지 레벨</div>
                <div className="text-lg font-bold text-blue-800">{getEnergyText(result.vadScore.arousal)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 정보 토글 */}
        <div className="mb-6">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="w-full flex items-center justify-between"
          >
            <span>상세 분석 결과 보기</span>
            <div className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Button>
        </div>

        {/* 상세 정보 (접을 수 있음) */}
        {showDetails && (
          <div className="space-y-6 mb-6">
            {/* VAD 점수 */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                상세 감정 분석 (VAD)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-green-500" />
                    <h5 className="font-semibold text-gray-900">긍정성</h5>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {Math.round(result.vadScore.valence * 100)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${result.vadScore.valence * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Pulse className="w-5 h-5 text-blue-500" />
                    <h5 className="font-semibold text-gray-900">각성도</h5>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {Math.round(result.vadScore.arousal * 100)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${result.vadScore.arousal * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightning className="w-5 h-5 text-purple-500" />
                    <h5 className="font-semibold text-gray-900">지배성</h5>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {Math.round(result.vadScore.dominance * 100)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${result.vadScore.dominance * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CBT 피드백 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mr-3">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                CBT 피드백
              </h4>
              <div className="space-y-4">
                <div className="group">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2 group-hover:bg-red-200 transition-colors">
                      <Target className="w-3 h-3 text-red-500" />
                    </div>
                    인지 왜곡 유형
                  </h5>
                  <p className="text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100 group-hover:bg-red-100 transition-colors">
                    {result.cbtFeedback.cognitiveDistortion}
                  </p>
                </div>
                
                <div className="group">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 group-hover:bg-blue-200 transition-colors">
                      <ArrowRight className="w-3 h-3 text-blue-500" />
                    </div>
                    도전적 질문
                  </h5>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100 group-hover:bg-blue-100 transition-colors">
                    {result.cbtFeedback.challenge}
                  </p>
                </div>
                
                <div className="group">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 group-hover:bg-green-200 transition-colors">
                      <Lightbulb className="w-3 h-3 text-green-500" />
                    </div>
                    대안적 사고
                  </h5>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100 group-hover:bg-green-100 transition-colors">
                    {result.cbtFeedback.alternative}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex space-x-4">
          <Button
            onClick={onNewAnalysis}
            className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            새로운 분석
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 hover:bg-gray-50"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

// 상담 세션 관리 컴포넌트
function SessionManager({ 
  sessionState, 
  onStartSession, 
  onEndSession,
  sessionDuration 
}: { 
  sessionState: SessionState;
  onStartSession: () => void;
  onEndSession: () => void;
  sessionDuration: number;
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">감정 분석 상담</h3>
            <p className="text-sm text-gray-600">실시간 멀티모달 감정 분석 세션</p>
          </div>
        </div>

        {sessionState === 'not_started' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">상담 안내</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 카메라와 마이크를 활성화해주세요</li>
                <li>• 편안한 상태에서 자연스럽게 대화하세요</li>
                <li>• 상담은 언제든지 종료할 수 있습니다</li>
                <li>• 분석 결과는 상담 종료 후 확인할 수 있습니다</li>
              </ul>
            </div>
            <Button
              onClick={onStartSession}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              상담 시작하기
            </Button>
          </div>
        )}

        {sessionState === 'active' && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-900">상담 진행 중</h4>
                  <p className="text-sm text-green-700">실시간 감정 분석이 진행되고 있습니다</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{formatDuration(sessionDuration)}</div>
                  <div className="text-xs text-green-500">경과 시간</div>
                </div>
              </div>
            </div>
            <Button
              onClick={onEndSession}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Square className="w-5 h-5 mr-2" />
              상담 종료하기
            </Button>
          </div>
        )}

        {sessionState === 'completed' && (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-purple-900">상담 완료</h4>
                  <p className="text-sm text-purple-700">총 상담 시간: {formatDuration(sessionDuration)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              상담 중 수집된 데이터를 바탕으로 감정 분석을 진행합니다...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { addEmotionAnalysis, setLoading, isLoading } = useAppStore();
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('preparing');
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 세션 관리 상태
  const [sessionState, setSessionState] = useState<SessionState>('not_started');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [sessionInterval, setSessionInterval] = useState<NodeJS.Timeout | null>(null);

  // 클라이언트 사이드 마운트 확인
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  // 세션 시간 업데이트
  useEffect(() => {
    if (sessionState === 'active' && sessionStartTime) {
      const interval = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
      setSessionInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [sessionState, sessionStartTime]);

  // 상담 시작
  const handleStartSession = () => {
    setSessionState('active');
    setSessionStartTime(Date.now());
    setSessionDuration(0);
    setAnalysisState('session_active');
    
    // 상담 시작 시 카메라와 마이크 권한 요청
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      }).then(() => {
        console.log('카메라와 마이크 권한이 허용되었습니다.');
      }).catch((error) => {
        console.error('카메라/마이크 권한 거부:', error);
      });
    }
  };

  // 상담 종료
  const handleEndSession = () => {
    setSessionState('completed');
    if (sessionInterval) {
      clearInterval(sessionInterval);
      setSessionInterval(null);
    }
    
    // 상담 종료 후 분석 시작
    handleStartAnalysis();
  };

  // 새로운 상담 시작
  const handleNewSession = () => {
    setSessionState('not_started');
    setSessionStartTime(null);
    setSessionDuration(0);
    setAnalysisState('idle');
    setAnalysisStep('preparing');
    setAnalysisResult(null);
    setShowResult(false);
    setError(null);
  };

  const handleStartAnalysis = async () => {
    try {
      setAnalysisState('analyzing');
      setLoading(true);
      setError(null);
      
      // 분석 단계별 진행 상황 시뮬레이션
      setAnalysisStep('preparing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalysisStep('analyzing_text');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysisStep('analyzing_voice');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisStep('analyzing_facial');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisStep('generating_feedback');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 다양한 감정 상태를 시뮬레이션하기 위한 텍스트 샘플들
      const textSamples = [
        {
          text: "오늘 정말 기분이 좋아요. 새로운 일을 시작하게 되어서 설레고 있어요.",
          expectedEmotion: "happy",
          expectedVAD: { valence: 0.8, arousal: 0.7, dominance: 0.6 }
        },
        {
          text: "요즘 스트레스가 많아서 힘들어요. 아무것도 하고 싶지 않아요.",
          expectedEmotion: "sad",
          expectedVAD: { valence: 0.2, arousal: 0.3, dominance: 0.4 }
        },
        {
          text: "화가 나서 참을 수가 없어요. 이런 상황이 계속되면 어떻게 해야 할지 모르겠어요.",
          expectedEmotion: "angry",
          expectedVAD: { valence: 0.1, arousal: 0.9, dominance: 0.3 }
        },
        {
          text: "갑자기 놀라운 일이 생겨서 당황스러워요. 어떻게 대처해야 할지 막막해요.",
          expectedEmotion: "surprised",
          expectedVAD: { valence: 0.4, arousal: 0.8, dominance: 0.2 }
        },
        {
          text: "평온한 상태예요. 차분하게 생각할 수 있어서 좋아요.",
          expectedEmotion: "neutral",
          expectedVAD: { valence: 0.6, arousal: 0.3, dominance: 0.7 }
        },
        {
          text: "자신감이 생겼어요. 이번에는 꼭 성공할 것 같아요.",
          expectedEmotion: "happy",
          expectedVAD: { valence: 0.9, arousal: 0.6, dominance: 0.8 }
        },
        {
          text: "걱정이 많아서 잠을 잘 못 자고 있어요. 미래가 불안해요.",
          expectedEmotion: "sad",
          expectedVAD: { valence: 0.3, arousal: 0.7, dominance: 0.2 }
        },
        {
          text: "기쁨과 설렘으로 가득해요. 오랫동안 기다려온 순간이에요.",
          expectedEmotion: "happy",
          expectedVAD: { valence: 0.9, arousal: 0.8, dominance: 0.7 }
        },
        {
          text: "조금 우울해요. 혼자 있고 싶어요.",
          expectedEmotion: "sad",
          expectedVAD: { valence: 0.2, arousal: 0.2, dominance: 0.3 }
        },
        {
          text: "열정이 넘쳐요. 새로운 도전을 시작하고 싶어요.",
          expectedEmotion: "happy",
          expectedVAD: { valence: 0.8, arousal: 0.9, dominance: 0.8 }
        }
      ];
      
      // 랜덤하게 텍스트 선택
      const selectedSample = textSamples[Math.floor(Math.random() * textSamples.length)];
      
      // 실제 감정 분석 API 호출
      const apiResponse: any = await apiService.analyzeMultimodalEmotion({
        text: selectedSample.text,
        sessionId: `session_${Date.now()}`
      });
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const result: EmotionAnalysis = {
        id: Date.now().toString(),
        userId: 'user123',
        emotion: apiResponse.emotion || 'neutral',
        confidence: apiResponse.confidence || 0.5,
        vadScore: {
          valence: apiResponse.vadScore?.valence || 0.5,
          arousal: apiResponse.vadScore?.arousal || 0.5,
          dominance: apiResponse.vadScore?.dominance || 0.5
        },
        cbtFeedback: generateCBTFeedback(apiResponse.emotion || 'neutral'),
        timestamp: new Date().toISOString(),
        mediaType: 'realtime',
        textContent: selectedSample.text
      };
      
      setAnalysisStep('completed');
      setAnalysisResult(result);
      addEmotionAnalysis(result);
      setAnalysisState('completed');
      setShowResult(true);
    } catch (error) {
      console.error('감정 분석 실패:', error);
      setError(error instanceof Error ? error.message : '감정 분석 중 오류가 발생했습니다.');
      setAnalysisState('error');
    } finally {
      setLoading(false);
    }
  };

  // 감정에 따른 CBT 피드백 생성 함수
  const generateCBTFeedback = (emotion: string) => {
    const feedbackMap = {
      happy: {
        cognitiveDistortion: '과도한 낙관주의',
        challenge: '현재의 긍정적인 감정을 유지하면서도 현실적인 계획을 세워보세요.',
        alternative: '기쁨을 유지하면서도 앞으로의 도전에 대비할 수 있습니다.',
        actionPlan: '긍정적인 감정을 기록하고, 이를 어려운 시기에 활용해보세요.'
      },
      sad: {
        cognitiveDistortion: '과도한 일반화',
        challenge: '이 상황이 모든 상황에 적용되는 것은 아닙니다. 구체적으로 어떤 부분이 다른가요?',
        alternative: '이번 경험은 특별한 경우이며, 앞으로 더 나은 결과를 얻을 수 있습니다.',
        actionPlan: '작은 성취를 축하하고, 긍정적인 경험을 기록해보세요.'
      },
      angry: {
        cognitiveDistortion: '개인화',
        challenge: '이 상황이 정말 당신을 겨냥한 것인가요? 다른 가능성은 없나요?',
        alternative: '상황을 객관적으로 바라보면 다른 해결책을 찾을 수 있습니다.',
        actionPlan: '깊은 호흡을 하고, 상황을 다시 생각해보는 시간을 가져보세요.'
      },
      surprised: {
        cognitiveDistortion: '재앙화',
        challenge: '최악의 상황이 정말 일어날 가능성은 얼마나 되나요?',
        alternative: '놀라운 상황도 새로운 기회가 될 수 있습니다.',
        actionPlan: '상황을 정리하고, 단계별로 대응 방안을 세워보세요.'
      },
      neutral: {
        cognitiveDistortion: '감정 무시',
        challenge: '현재 감정을 무시하고 있지는 않나요? 진짜 기분은 어떠신가요?',
        alternative: '평온함을 유지하면서도 내면의 감정을 인정할 수 있습니다.',
        actionPlan: '일기를 쓰거나 명상을 통해 내면의 감정을 탐색해보세요.'
      }
    };

    return feedbackMap[emotion as keyof typeof feedbackMap] || feedbackMap.neutral;
  };

  const handleStopAnalysis = () => {
    setAnalysisState('idle');
    setAnalysisStep('preparing');
    setLoading(false);
    setError(null);
  };

  const handleNewAnalysis = () => {
    setShowResult(false);
    setAnalysisResult(null);
    setAnalysisState('idle');
    setAnalysisStep('preparing');
    setError(null);
  };

  // 서버 사이드 렌더링 중에는 로딩 상태 표시
  if (!isMounted) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">실시간 감정 분석</h1>
            <p className="text-xl text-gray-600">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center relative">
          {/* 배경 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 rounded-3xl opacity-50" />
          
          <div className="relative z-10 py-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                실시간 감정 분석
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              웹캠과 마이크를 통해 실시간으로 표정, 음성, 텍스트를 종합하여 정확한 감정을 분석합니다
            </p>
            
            {/* 기능 하이라이트 */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>표정 인식</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Ear className="w-4 h-4 text-green-500" />
                <span>음성 분석</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>텍스트 변환</span>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-800 font-medium">분석 오류</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <Button 
              onClick={handleNewSession}
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              다시 시도
            </Button>
          </div>
        )}

        {/* 상담 세션 관리 */}
        {sessionState === 'not_started' && (
          <SessionManager
            sessionState={sessionState}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            sessionDuration={sessionDuration}
          />
        )}

        {/* 상담 진행 중 - 비디오 인터페이스 */}
        {sessionState === 'active' && (
          <div className="space-y-6">
            <SessionManager
              sessionState={sessionState}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              sessionDuration={sessionDuration}
            />
            
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 rounded-full border border-green-200">
                <Sparkles className="w-4 h-4 text-green-500" />
                <h2 className="text-xl font-bold text-gray-900">실시간 멀티모달 분석</h2>
              </div>
              <p className="text-gray-600 mt-2">자연스럽게 대화하시면 실시간으로 감정을 분석합니다</p>
            </div>
            
            <MultimodalAnalysisInterface
              onStartAnalysis={() => {}} // 상담 중에는 자동으로 분석 진행
              onStopAnalysis={() => {}}
              isAnalyzing={true}
              analysisStep="analyzing_text"
              autoStartMedia={true} // 상담 시작 시 자동으로 미디어 시작
            />
          </div>
        )}

        {/* 상담 완료 후 분석 중 */}
        {sessionState === 'completed' && analysisState === 'analyzing' && (
          <div className="space-y-6">
            <SessionManager
              sessionState={sessionState}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              sessionDuration={sessionDuration}
            />
            
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200">
                <Brain className="w-4 h-4 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">감정 분석 진행 중</h2>
              </div>
              <p className="text-gray-600 mt-2">상담 데이터를 분석하여 결과를 생성합니다</p>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">분석 중...</h3>
                    <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 결과 모달 */}
        {showResult && analysisResult && (
          <ResultModal
            result={analysisResult}
            onClose={() => setShowResult(false)}
            onNewAnalysis={handleNewSession}
          />
        )}
      </div>
    </Layout>
  );
} 