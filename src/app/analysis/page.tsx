'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
  Meh,
  Heart,
  Zap as Lightning,
  Waves,
  Palette,
  Music,
  Activity as Pulse,
  Upload,
  Image,
  FileAudio,
  FileText as FileTextIcon,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { apiService } from '../../services/api';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis, getConfidenceColor } from '../../utils/emotion';

type AnalysisState = 'idle' | 'analyzing' | 'completed' | 'error';
type AnalysisMode = 'realtime' | 'file-upload';

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

// 감정 파동 효과 컴포넌트
function EmotionWaveEffect({ emotion, isActive }: { emotion: string; isActive: boolean }) {
  const colors = emotionColors[emotion as keyof typeof emotionColors] || emotionColors.neutral;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {isActive && (
        <>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.gradient} opacity-20 animate-ping`} style={{ animationDuration: '2s' }} />
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.gradient} opacity-15 animate-ping`} style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.gradient} opacity-10 animate-ping`} style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </>
      )}
    </div>
  );
}

// 인터랙티브 감정 차트 컴포넌트
function EmotionChart({ vadScore, emotion }: { vadScore: { valence: number; arousal: number; dominance: number }; emotion: string }) {
  const colors = emotionColors[emotion as keyof typeof emotionColors] || emotionColors.neutral;
  
  return (
    <div className="relative">
      {/* 3D 감정 공간 시각화 */}
      <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* 감정 포인트 */}
            <div 
              className={`absolute w-4 h-4 rounded-full bg-gradient-to-r ${colors.gradient} shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse`}
              style={{
                left: `${vadScore.valence * 100}%`,
                top: `${(1 - vadScore.arousal) * 100}%`,
                zIndex: Math.round(vadScore.dominance * 10)
              }}
            />
            
            {/* 축 라벨 */}
            <div className="absolute -bottom-6 left-0 text-xs text-gray-600">부정적</div>
            <div className="absolute -bottom-6 right-0 text-xs text-gray-600">긍정적</div>
            <div className="absolute -left-6 top-0 text-xs text-gray-600 transform -rotate-90">낮은 각성</div>
            <div className="absolute -right-6 top-0 text-xs text-gray-600 transform rotate-90">높은 각성</div>
          </div>
        </div>
        
        {/* 그리드 라인 */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border border-gray-300" />
          ))}
        </div>
      </div>
      
      {/* 실시간 수치 표시 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className={`text-lg font-bold ${colors.text}`}>
            {Math.round(vadScore.valence * 100)}
          </div>
          <div className="text-xs text-gray-600">긍정성</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${colors.text}`}>
            {Math.round(vadScore.arousal * 100)}
          </div>
          <div className="text-xs text-gray-600">각성도</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${colors.text}`}>
            {Math.round(vadScore.dominance * 100)}
          </div>
          <div className="text-xs text-gray-600">지배성</div>
        </div>
      </div>
    </div>
  );
}

// 파일 업로드 분석 컴포넌트
function FileUploadAnalysis({ 
  onAnalysisComplete 
}: { 
  onAnalysisComplete: (result: EmotionAnalysis) => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<{
    image?: File;
    audio?: File;
    text?: string;
  }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: 'image' | 'audio') => {
    setError('');
    if (type === 'image') {
      setSelectedFiles(prev => ({ ...prev, image: file }));
    } else {
      setSelectedFiles(prev => ({ ...prev, audio: file }));
    }
  };

  const handleTextInput = (text: string) => {
    setSelectedFiles(prev => ({ ...prev, text }));
  };

  const handleAnalysis = async () => {
    if (!selectedFiles.image && !selectedFiles.audio && !selectedFiles.text) {
      setError('분석할 파일이나 텍스트를 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      let result: EmotionAnalysis;

      if (selectedFiles.image && selectedFiles.audio) {
        // 멀티모달 분석
        result = await apiService.analyzeMultimodalEmotion({
          imageFile: selectedFiles.image,
          audioFile: selectedFiles.audio,
          text: selectedFiles.text
        });
      } else if (selectedFiles.image) {
        // 얼굴 표정 분석
        result = await apiService.analyzeFacialEmotion({
          imageFile: selectedFiles.image
        });
      } else if (selectedFiles.audio) {
        // 음성 분석
        result = await apiService.analyzeVoiceEmotion({
          audioFile: selectedFiles.audio
        });
      } else if (selectedFiles.text) {
        // 텍스트 분석
        result = await apiService.analyzeMultimodalEmotion({
          text: selectedFiles.text
        });
      } else {
        throw new Error('분석할 데이터가 없습니다.');
      }

      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file, 'image');
      } else if (file.type.startsWith('audio/')) {
        handleFileSelect(file, 'audio');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 파일 업로드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 이미지 업로드 */}
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                <Image className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">이미지 분석</h3>
              <p className="text-sm text-gray-600 mb-4">얼굴 표정을 분석합니다</p>
              
              {selectedFiles.image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(selectedFiles.image)} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFiles(prev => ({ ...prev, image: undefined }))}
                      className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedFiles.image.name} ({formatFileSize(selectedFiles.image.size)})
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  이미지 선택
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'image')}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* 음성 업로드 */}
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                <FileAudio className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">음성 분석</h3>
              <p className="text-sm text-gray-600 mb-4">음성 톤을 분석합니다</p>
              
              {selectedFiles.audio ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileAudio className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{selectedFiles.audio.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatFileSize(selectedFiles.audio.size)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFiles(prev => ({ ...prev, audio: undefined }))}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    제거
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  음성 선택
                </Button>
              )}
              
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'audio')}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* 텍스트 입력 */}
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                <FileTextIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">텍스트 분석</h3>
              <p className="text-sm text-gray-600 mb-4">텍스트 내용을 분석합니다</p>
              
              <textarea
                placeholder="분석할 텍스트를 입력하세요..."
                value={selectedFiles.text || ''}
                onChange={(e) => handleTextInput(e.target.value)}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          파일을 여기에 드래그하거나 위에서 선택하세요
        </p>
        <p className="text-sm text-gray-500">
          지원 형식: 이미지 (JPG, PNG, GIF), 음성 (WAV, MP3, M4A, OGG)
        </p>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* 분석 버튼 */}
      <div className="text-center">
        <Button
          onClick={handleAnalysis}
          disabled={isAnalyzing || (!selectedFiles.image && !selectedFiles.audio && !selectedFiles.text)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              분석 중...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              감정 분석 시작
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

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
  const [isMounted, setIsMounted] = useState(false);
  
  // 실시간 분석 데이터
  const [facialEmotion, setFacialEmotion] = useState<string>('neutral');
  const [voiceTone, setVoiceTone] = useState<string>('neutral');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [vadScore, setVadScore] = useState({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [emotionHistory, setEmotionHistory] = useState<Array<{ emotion: string; timestamp: number }>>([]);

  // 클라이언트 사이드 마운트 확인
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

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

  // 실시간 분석 시뮬레이션
  useEffect(() => {
    if (isAnalyzing && isMounted) {
      const interval = setInterval(() => {
        // 표정 분석 시뮬레이션
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setFacialEmotion(newEmotion);
        
        // 감정 히스토리 업데이트
        setEmotionHistory(prev => [...prev.slice(-9), { emotion: newEmotion, timestamp: Date.now() }]);
        
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
  }, [isAnalyzing, isMounted]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy': return <Smile className="w-6 h-6 text-green-500" />;
      case 'sad': return <Frown className="w-6 h-6 text-blue-500" />;
      case 'angry': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'surprised': return <Sparkles className="w-6 h-6 text-yellow-500" />;
      default: return <Meh className="w-6 h-6 text-gray-500" />;
    }
  };

  const currentColors = emotionColors[facialEmotion as keyof typeof emotionColors] || emotionColors.neutral;

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
          
          {/* 감정 파동 효과 */}
          <EmotionWaveEffect emotion={facialEmotion} isActive={isAnalyzing} />
          
          {/* 실시간 분석 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
            {/* 상단 상태바 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className={`flex items-center space-x-2 glass-effect rounded-full px-3 py-1 ${isAnalyzing ? 'realtime-indicator' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-500 emotion-pulse' : 'bg-gray-400'}`}></div>
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

                      {/* 실시간 감정 표시 */}
          {isAnalyzing && (
            <div className="absolute top-20 left-4 glass-effect rounded-xl p-3 emotion-transition">
              <div className="flex items-center space-x-2">
                <div className="emotion-pulse">
                  {getEmotionIcon(facialEmotion)}
                </div>
                <div>
                  <div className="text-white font-medium capitalize">{facialEmotion}</div>
                  <div className="text-xs text-gray-300">신뢰도: {Math.round(confidence * 100)}%</div>
                </div>
              </div>
            </div>
          )}

            {/* 하단 컨트롤 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 glass-effect rounded-full px-6 py-3 hover-lift">
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center emotion-pulse">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-medium breathing">실시간 멀티모달 분석 중...</p>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 실시간 분석 결과 대시보드 */}
      {isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 실시간 감정 차트 */}
          <Card className={`bg-gradient-to-br ${currentColors.bg} ${currentColors.border} hover-lift`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentColors.gradient} flex items-center justify-center emotion-glow`}>
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <h3 className={`font-bold text-lg ${currentColors.text}`}>실시간 감정 분석</h3>
              </div>
              
              <EmotionChart vadScore={vadScore} emotion={facialEmotion} />
              
              {/* 감정 히스토리 */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">감정 변화</h4>
                <div className="flex space-x-1">
                  {emotionHistory.map((item, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${emotionColors[item.emotion as keyof typeof emotionColors]?.primary ? `bg-${emotionColors[item.emotion as keyof typeof emotionColors]?.primary}` : 'bg-gray-400'}`}
                      style={{ backgroundColor: emotionColors[item.emotion as keyof typeof emotionColors]?.primary }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 오른쪽: 멀티모달 데이터 */}
          <div className="space-y-4">
            {/* 표정 분석 */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
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
                                  <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full vad-bar" 
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                </div>
              </CardContent>
            </Card>

            {/* 음성 분석 */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    <Ear className="w-4 h-4 text-white" />
                  </div>
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
                                  <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full vad-bar" 
                    style={{ width: `${vadScore.arousal * 100}%` }}
                  />
                </div>
                </div>
              </CardContent>
            </Card>

            {/* 텍스트 변환 */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">텍스트 변환</h3>
                </div>
                <div className="text-sm text-purple-800 font-medium bg-white/50 p-2 rounded-lg">
                  "{transcribedText}"
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-purple-600 mb-1">
                    <span>긍정성</span>
                    <span>{Math.round(vadScore.valence * 100)}%</span>
                  </div>
                                  <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full vad-bar" 
                    style={{ width: `${vadScore.valence * 100}%` }}
                  />
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

              {/* 통합 VAD 점수 */}
        {isAnalyzing && (
          <Card className={`bg-gradient-to-r ${currentColors.bg} ${currentColors.border} hover-lift`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentColors.gradient} flex items-center justify-center emotion-glow`}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${currentColors.text}`}>통합 감정 분석 (VAD)</h3>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">긍정성 (Valence)</span>
                  <span className="font-medium text-gray-900">{Math.round(vadScore.valence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full vad-bar" 
                    style={{ width: `${vadScore.valence * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">각성도 (Arousal)</span>
                  <span className="font-medium text-gray-900">{Math.round(vadScore.arousal * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full vad-bar" 
                    style={{ width: `${vadScore.arousal * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">지배성 (Dominance)</span>
                  <span className="font-medium text-gray-900">{Math.round(vadScore.dominance * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full vad-bar" 
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
  const colors = emotionColors[result.emotion as keyof typeof emotionColors] || emotionColors.neutral;
  
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
              <h3 className="text-2xl font-bold text-gray-900">멀티모달 분석 완료</h3>
              <p className="text-gray-600">표정, 음성, 텍스트를 종합한 감정 분석 결과</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* 감정 요약 */}
        <div className={`bg-gradient-to-r ${colors.bg} rounded-2xl p-6 mb-6 border ${colors.border} relative overflow-hidden`}>
          {/* 배경 애니메이션 효과 */}
          <div className="absolute inset-0 opacity-10">
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} animate-pulse`} style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="text-center relative z-10">
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
              {emotionEmojis[result.emotion as keyof typeof emotionEmojis] || '😐'}
            </div>
            <h4 className={`text-2xl font-bold ${colors.text} mb-2 capitalize`}>
              {result.emotion}
            </h4>
            <p className="text-gray-600">
              통합 신뢰도: {Math.round(result.confidence * 100)}%
            </p>
            
            {/* 신뢰도 시각화 */}
            <div className="mt-4">
              <div className="w-full bg-white/50 rounded-full h-3">
                <div 
                  className={`bg-gradient-to-r ${colors.gradient} h-3 rounded-full transition-all duration-1000`} 
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* VAD 점수 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow group">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-green-500" />
              <h5 className="font-semibold text-gray-900">긍정성</h5>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
              {Math.round(result.vadScore.valence * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${result.vadScore.valence * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow group">
            <div className="flex items-center space-x-2 mb-2">
              <Pulse className="w-5 h-5 text-blue-500" />
              <h5 className="font-semibold text-gray-900">각성도</h5>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
              {Math.round(result.vadScore.arousal * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${result.vadScore.arousal * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow group">
            <div className="flex items-center space-x-2 mb-2">
              <Lightning className="w-5 h-5 text-purple-500" />
              <h5 className="font-semibold text-gray-900">지배성</h5>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">
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

        {/* CBT 피드백 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 hover:shadow-lg transition-shadow">
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

export default function AnalysisPage() {
  const { addEmotionAnalysis, setLoading, isLoading } = useAppStore();
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('file-upload');

  // 클라이언트 사이드 마운트 확인
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleFileAnalysisComplete = (result: EmotionAnalysis) => {
    setAnalysisResult(result);
    addEmotionAnalysis(result);
    setAnalysisState('completed');
    setShowResult(true);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">멀티모달 감정 분석</h1>
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
                멀티모달 감정 분석
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              실시간으로 표정, 음성, 텍스트를 종합하여 정확한 감정을 분석합니다
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

        {/* 분석 모드 선택 */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAnalysisMode('file-upload')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                analysisMode === 'file-upload'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>파일 업로드 분석</span>
              </div>
            </button>
            <button
              onClick={() => setAnalysisMode('realtime')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                analysisMode === 'realtime'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>실시간 분석</span>
              </div>
            </button>
          </div>
        </div>

        {/* 분석 인터페이스 */}
        <div className="space-y-6">
          {analysisMode === 'file-upload' ? (
            <>
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full border border-purple-200">
                  <Upload className="w-4 h-4 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-900">파일 업로드 분석</h2>
                </div>
                <p className="text-gray-600 mt-2">이미지, 음성, 텍스트 파일을 업로드하여 감정을 분석합니다</p>
              </div>
              
              <FileUploadAnalysis onAnalysisComplete={handleFileAnalysisComplete} />
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h2 className="text-xl font-bold text-gray-900">실시간 멀티모달 분석</h2>
                </div>
                <p className="text-gray-600 mt-2">웹캠과 마이크를 활성화하고 분석을 시작해보세요</p>
              </div>
              
              <MultimodalAnalysisInterface
                onStartAnalysis={handleStartAnalysis}
                onStopAnalysis={handleStopAnalysis}
                isAnalyzing={analysisState === 'analyzing' || isLoading}
              />
            </>
          )}
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