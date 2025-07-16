'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Camera, 
  Mic, 
  FileText, 
  Upload, 
  X,
  BarChart3,
  Lightbulb,
  Target,
  ArrowRight,
  Brain,
  Activity,
  CheckCircle,
  Sparkles,
  Zap,
  Phone,
  PhoneOff,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { apiService } from '../../services/api';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis, getConfidenceColor } from '../../utils/emotion';

type AnalysisMode = 'video' | 'audio' | 'text' | 'file';
type AnalysisState = 'idle' | 'analyzing' | 'completed' | 'error';

// 클로바노트 스타일 로딩 컴포넌트
function ClovaNoteLoadingUI({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const steps = [
      { name: '데이터 수집 중...', duration: 1500 },
      { name: 'AI 모델 로딩 중...', duration: 2000 },
      { name: '감정 분석 중...', duration: 2500 },
      { name: '패턴 인식 중...', duration: 2000 },
      { name: 'CBT 피드백 생성 중...', duration: 1800 },
      { name: '결과 정리 중...', duration: 1200 }
    ];

    let currentIndex = 0;
    const startTime = Date.now();
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      if (currentIndex < steps.length) {
        setCurrentStep(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  const steps = [
    { name: '데이터 수집 중...', icon: Activity, color: 'text-blue-500' },
    { name: 'AI 모델 로딩 중...', icon: Brain, color: 'text-purple-500' },
    { name: '감정 분석 중...', icon: BarChart3, color: 'text-green-500' },
    { name: '패턴 인식 중...', icon: Sparkles, color: 'text-yellow-500' },
    { name: 'CBT 피드백 생성 중...', icon: Lightbulb, color: 'text-orange-500' },
    { name: '결과 정리 중...', icon: CheckCircle, color: 'text-indigo-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* 클로바노트 스타일 헤더 */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">감정 분석 중</h3>
          <p className="text-gray-600">AI가 당신의 감정을 깊이 있게 분석하고 있습니다</p>
        </div>

        {/* 진행 단계 */}
        <div className="space-y-3 mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-500 ${
                isActive ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200' : 
                isCompleted ? 'bg-green-50 border border-green-200' : 
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-r from-green-500 to-blue-500 scale-110' : 
                  isCompleted ? 'bg-green-500' : 
                  'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <StepIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <span className={`font-medium text-sm ${
                    isActive ? 'text-green-900' : 
                    isCompleted ? 'text-green-800' : 
                    'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {isActive && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>전체 진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 클로바노트 스타일 팁 */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">분석 팁</span>
          </div>
          <p className="text-xs text-green-700">
            정확한 분석을 위해 자연스러운 표정과 음성을 유지해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

// 영상통화 스타일 카메라 인터페이스
function VideoCallInterface({ 
  onStartAnalysis, 
  onStopAnalysis, 
  isAnalyzing 
}: { 
  onStartAnalysis: () => void;
  onStopAnalysis: () => void;
  isAnalyzing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraOn]);

  const startCamera = async () => {
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
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* 비디오 화면 */}
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* 오버레이 UI */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
          {/* 상단 상태바 */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-white text-sm font-medium">
                {isAnalyzing ? '분석 중...' : '대기 중'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 하단 컨트롤 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`rounded-full p-3 ${isCameraOn ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              >
                {isCameraOn ? <Camera className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`rounded-full p-3 ${isMicOn ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              >
                {isMicOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={captureImage}
                className="rounded-full p-3 bg-blue-500 text-white"
              >
                <Camera className="w-5 h-5" />
              </Button>
              
              {!isAnalyzing ? (
                <Button
                  onClick={onStartAnalysis}
                  disabled={!isCameraOn}
                  className="rounded-full p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                >
                  <Play className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={onStopAnalysis}
                  className="rounded-full p-3 bg-red-500 text-white hover:bg-red-600"
                >
                  <Square className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 분석 중 오버레이 */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center animate-pulse">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium">실시간 감정 분석 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* 캡처된 이미지 */}
      {capturedImage && (
        <div className="absolute top-4 right-4 w-32 h-24 bg-white rounded-lg overflow-hidden shadow-lg">
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCapturedImage(null)}
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">분석 완료</h3>
              <p className="text-gray-600">AI가 당신의 감정을 분석했습니다</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* 감정 요약 */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {emotionEmojis[result.emotion as keyof typeof emotionEmojis] || '😐'}
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
              {result.emotion}
            </h4>
            <p className="text-gray-600">
              신뢰도: {Math.round(result.confidence * 100)}%
            </p>
          </div>
        </div>

        {/* VAD 점수 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">긍정성</h5>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Math.round(result.vadScore.valence * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${result.vadScore.valence * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">각성도</h5>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Math.round(result.vadScore.arousal * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${result.vadScore.arousal * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">지배성</h5>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {Math.round(result.vadScore.dominance * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${result.vadScore.dominance * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* CBT 피드백 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            CBT 피드백
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2 text-red-500" />
                인지 왜곡 유형
              </h5>
              <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                {result.cbtFeedback.cognitiveDistortion}
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                도전적 질문
              </h5>
              <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                {result.cbtFeedback.challenge}
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-green-500" />
                대안적 사고
              </h5>
              <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                {result.cbtFeedback.alternative}
              </p>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-4">
          <Button
            onClick={onNewAnalysis}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            새로운 분석
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { addEmotionAnalysis, setLoading, isLoading } = useAppStore();
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('video');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleStartAnalysis = async () => {
    setAnalysisState('analyzing');
    setLoading(true);
    
    // 실제 분석 로직은 여기에 구현
    // 임시로 5초 후 완료 시뮬레이션
    setTimeout(() => {
             const mockResult: EmotionAnalysis = {
         id: Date.now().toString(),
         userId: 'user123',
         emotion: 'neutral',
         confidence: 0.85,
         vadScore: {
           valence: 0.6,
           arousal: 0.4,
           dominance: 0.5
         },
         cbtFeedback: {
           cognitiveDistortion: '이분법적 사고',
           challenge: '이 상황에서 다른 관점은 무엇일까요?',
           alternative: '완벽하지 않아도 충분히 좋은 결과입니다.',
           actionPlan: '작은 성취를 인정하고 자신을 격려해보세요.'
         },
         timestamp: new Date().toISOString(),
         mediaType: 'image'
       };
      
      setAnalysisResult(mockResult);
      addEmotionAnalysis(mockResult);
      setAnalysisState('completed');
      setLoading(false);
      setShowResult(true);
    }, 5000);
  };

  const handleStopAnalysis = () => {
    setAnalysisState('idle');
    setLoading(false);
  };

  const handleNewAnalysis = () => {
    setShowResult(false);
    setAnalysisResult(null);
    setAnalysisState('idle');
  };

  const analysisModes = [
    {
      mode: 'video' as AnalysisMode,
      title: '영상 분석',
      description: '웹캠을 통한 실시간 표정 분석',
      icon: Camera,
      color: 'from-blue-500 to-purple-600',
      featured: true
    },
    {
      mode: 'audio' as AnalysisMode,
      title: '음성 분석',
      description: '음성 파일 업로드 또는 녹음',
      icon: Mic,
      color: 'from-green-500 to-teal-600'
    },
    {
      mode: 'text' as AnalysisMode,
      title: '텍스트 분석',
      description: '감정을 담은 텍스트 입력',
      icon: FileText,
      color: 'from-purple-500 to-pink-600'
    },
    {
      mode: 'file' as AnalysisMode,
      title: '파일 분석',
      description: '이미지 또는 오디오 파일 업로드',
      icon: Upload,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">감정 분석</h1>
          <p className="text-xl text-gray-600">
            AI 기술로 당신의 감정을 정확하게 분석하고 CBT 피드백을 제공합니다
          </p>
        </div>

        {analysisState === 'idle' && (
          <>
            {/* 분석 모드 선택 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">분석 방법 선택</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisModes.map((mode) => (
                  <Card
                    key={mode.mode}
                    className={`hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                      mode.featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    }`}
                    onClick={() => setAnalysisMode(mode.mode)}
                  >
                    <CardContent className="text-center p-8">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${mode.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <mode.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {mode.title}
                        {mode.featured && (
                          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            추천
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 text-lg">
                        {mode.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 영상 분석 인터페이스 */}
            {analysisMode === 'video' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">실시간 영상 분석</h2>
                  <p className="text-gray-600">웹캠을 활성화하고 분석을 시작해보세요</p>
                </div>
                
                                 <VideoCallInterface
                   onStartAnalysis={handleStartAnalysis}
                   onStopAnalysis={handleStopAnalysis}
                   isAnalyzing={analysisState === 'analyzing' || isLoading}
                 />
              </div>
            )}

            {/* 다른 분석 모드들 */}
            {analysisMode !== 'video' && (
              <div className="text-center py-12">
                                 <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                   {(() => {
                     const mode = analysisModes.find(m => m.mode === analysisMode);
                     const Icon = mode?.icon;
                     return Icon ? <Icon className="w-12 h-12 text-gray-400" /> : null;
                   })()}
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
                   {analysisModes.find(m => m.mode === analysisMode)?.title || '분석'}
                 </h3>
                 <p className="text-gray-600 mb-6">
                   {analysisModes.find(m => m.mode === analysisMode)?.description || '분석을 시작합니다'}
                 </p>
                <Button
                  onClick={handleStartAnalysis}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                >
                  분석 시작하기
                </Button>
              </div>
            )}
          </>
        )}

        {/* 클로바노트 스타일 로딩 */}
        {analysisState === 'analyzing' && (
          <ClovaNoteLoadingUI onComplete={() => setAnalysisState('completed')} />
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
    </Layout>
  );
} 