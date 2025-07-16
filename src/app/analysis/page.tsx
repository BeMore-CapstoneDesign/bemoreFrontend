'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Camera, 
  Mic, 
  FileText, 
  Brain,
  Activity,
  CheckCircle,
  Sparkles,
  Zap,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  Square,
  X,
  BarChart3,
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
  Meh
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { apiService } from '../../services/api';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis, getConfidenceColor } from '../../utils/emotion';

type AnalysisState = 'idle' | 'analyzing' | 'completed' | 'error';

// 실시간 멀티모달 분석 인터페이스
function MultimodalAnalysisInterface({ 
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
  
  // 실시간 분석 데이터
  const [facialEmotion, setFacialEmotion] = useState<string>('neutral');
  const [voiceTone, setVoiceTone] = useState<string>('neutral');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [vadScore, setVadScore] = useState({ valence: 0.5, arousal: 0.5, dominance: 0.5 });

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 실시간 분석 시뮬레이션
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        // 표정 분석 시뮬레이션
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
        setFacialEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
        
        // 음성 톤 분석 시뮬레이션
        const tones = ['excited', 'calm', 'stressed', 'confident', 'neutral'];
        setVoiceTone(tones[Math.floor(Math.random() * tones.length)]);
        
        // 신뢰도 업데이트
        setConfidence(Math.random() * 0.3 + 0.7);
        
        // VAD 점수 업데이트
        setVadScore({
          valence: Math.random(),
          arousal: Math.random(),
          dominance: Math.random()
        });
        
        // 텍스트 변환 시뮬레이션
        const sampleTexts = [
          "오늘 정말 기분이 좋아요",
          "조금 스트레스가 있어요",
          "자신감이 생겼어요",
          "걱정이 많아요",
          "평온한 상태예요"
        ];
        setTranscribedText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy': return <Smile className="w-6 h-6 text-green-500" />;
      case 'sad': return <Frown className="w-6 h-6 text-blue-500" />;
      case 'angry': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'surprised': return <Sparkles className="w-6 h-6 text-yellow-500" />;
      default: return <Meh className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 메인 비디오 화면 */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* 실시간 분석 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
            {/* 상단 상태바 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-white text-sm font-medium">
                  {isAnalyzing ? '실시간 분석 중...' : '대기 중'}
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
                
                {!isAnalyzing ? (
                  <Button
                    onClick={onStartAnalysis}
                    disabled={!isCameraOn || !isMicOn}
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
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center animate-pulse">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-medium">실시간 멀티모달 분석 중...</p>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 실시간 분석 결과 대시보드 */}
      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 표정 분석 */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">표정 분석</h3>
              </div>
              <div className="flex items-center space-x-2">
                {getEmotionIcon(facialEmotion)}
                <span className="font-medium text-blue-800 capitalize">{facialEmotion}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-blue-600 mb-1">
                  <span>신뢰도</span>
                  <span>{Math.round(confidence * 100)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 음성 분석 */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Ear className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">음성 분석</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 capitalize">{voiceTone}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-green-600 mb-1">
                  <span>높낮이</span>
                  <span>{Math.round(vadScore.arousal * 100)}%</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${vadScore.arousal * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 텍스트 변환 */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">텍스트 변환</h3>
              </div>
              <div className="text-sm text-purple-800 font-medium">
                "{transcribedText}"
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-purple-600 mb-1">
                  <span>긍정성</span>
                  <span>{Math.round(vadScore.valence * 100)}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-1">
                  <div 
                    className="bg-purple-500 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${vadScore.valence * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 통합 VAD 점수 */}
      {isAnalyzing && (
        <Card className="bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-indigo-900">통합 감정 분석 (VAD)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-indigo-700">긍정성 (Valence)</span>
                  <span className="font-medium text-indigo-900">{Math.round(vadScore.valence * 100)}%</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${vadScore.valence * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-indigo-700">각성도 (Arousal)</span>
                  <span className="font-medium text-indigo-900">{Math.round(vadScore.arousal * 100)}%</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${vadScore.arousal * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-indigo-700">지배성 (Dominance)</span>
                  <span className="font-medium text-indigo-900">{Math.round(vadScore.dominance * 100)}%</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${vadScore.dominance * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <h3 className="text-2xl font-bold text-gray-900">멀티모달 분석 완료</h3>
              <p className="text-gray-600">표정, 음성, 텍스트를 종합한 감정 분석 결과</p>
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
              통합 신뢰도: {Math.round(result.confidence * 100)}%
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
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleStartAnalysis = async () => {
    setAnalysisState('analyzing');
    setLoading(true);
    
    // 실제 분석 로직은 여기에 구현
    // 임시로 10초 후 완료 시뮬레이션
    setTimeout(() => {
      const mockResult: EmotionAnalysis = {
        id: Date.now().toString(),
        userId: 'user123',
        emotion: 'happy',
        confidence: 0.92,
        vadScore: {
          valence: 0.8,
          arousal: 0.6,
          dominance: 0.7
        },
        cbtFeedback: {
          cognitiveDistortion: '과도한 일반화',
          challenge: '이 상황이 모든 상황에 적용되는 것은 아닙니다. 구체적으로 어떤 부분이 다른가요?',
          alternative: '이번 경험은 특별한 경우이며, 앞으로 더 나은 결과를 얻을 수 있습니다.',
          actionPlan: '긍정적인 경험을 기록하고, 작은 성취를 축하하는 습관을 만들어보세요.'
        },
        timestamp: new Date().toISOString(),
        mediaType: 'image'
      };
      
      setAnalysisResult(mockResult);
      addEmotionAnalysis(mockResult);
      setAnalysisState('completed');
      setLoading(false);
      setShowResult(true);
    }, 10000);
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">멀티모달 감정 분석</h1>
          <p className="text-xl text-gray-600">
            실시간으로 표정, 음성, 텍스트를 종합하여 정확한 감정을 분석합니다
          </p>
        </div>

        {/* 분석 인터페이스 */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">실시간 멀티모달 분석</h2>
            <p className="text-gray-600">웹캠과 마이크를 활성화하고 분석을 시작해보세요</p>
          </div>
          
          <MultimodalAnalysisInterface
            onStartAnalysis={handleStartAnalysis}
            onStopAnalysis={handleStopAnalysis}
            isAnalyzing={analysisState === 'analyzing' || isLoading}
          />
        </div>

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