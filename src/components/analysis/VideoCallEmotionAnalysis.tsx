'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ActionButton } from '../ui/ActionButton';
import { 
  Camera, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Settings,
  MessageSquare,
  Brain,
  Activity
} from 'lucide-react';
import { VADScore, EmotionAnalysis } from '../../types';
import { emotionEmojis } from '../../utils/emotion';

interface VideoCallEmotionAnalysisProps {
  onEmotionChange?: (emotion: EmotionAnalysis) => void;
  onCallEnd?: () => void;
  isActive?: boolean;
}

export default function VideoCallEmotionAnalysis({ 
  onEmotionChange, 
  onCallEnd,
  isActive = false 
}: VideoCallEmotionAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // 상태 관리
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // 사용자 친화적인 상태 관리
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'analyzing' | 'paused' | 'ended'>('connecting');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // 실시간 분석 상태
  const [facialVAD, setFacialVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [voiceVAD, setVoiceVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [confidence, setConfidence] = useState(0);

  // 감정 변화 추이를 위한 상태 추가
  const [emotionHistory, setEmotionHistory] = useState<Array<{timestamp: number; emotion: string; valence: number}>>([]);
  const [showEmotionChart, setShowEmotionChart] = useState(false);

  // 부드러운 전환을 위한 상태 추가
  const [displayedVAD, setDisplayedVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [displayedConfidence, setDisplayedConfidence] = useState(0);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 감정 통계 계산 함수
  const getEmotionStats = () => {
    if (emotionHistory.length === 0) return null;
    
    const emotionCounts = emotionHistory.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
    )[0];
    
    const averageValence = emotionHistory.reduce((sum, entry) => sum + entry.valence, 0) / emotionHistory.length;
    
    return {
      mostFrequentEmotion,
      averageValence,
      totalSamples: emotionHistory.length
    };
  };

  const emotionStats = getEmotionStats();

  const animationFrameRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 녹화 타이머 시작
  const startRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  // 녹화 타이머 정지
  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 미디어 스트림 초기화
  const initializeMediaStream = useCallback(async () => {
    try {
      setCallStatus('connecting');
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setStream(mediaStream);
      setPermissionGranted(true);
      setCallStatus('connected');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // 오디오 분석 초기화
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(mediaStream);
      microphoneRef.current.connect(analyserRef.current);

      return true;
    } catch (err) {
      console.error('미디어 스트림 초기화 실패:', err);
      setError('카메라나 마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
      setCallStatus('ended');
      return false;
    }
  }, []);

  // 실시간 감정 분석
  const analyzeEmotion = useCallback(() => {
    if (!isAnalyzing) return;

    let currentVoiceVAD: VADScore = { valence: 0.5, arousal: 0.5, dominance: 0.5 };
    let currentFacialVAD: VADScore = { valence: 0.5, arousal: 0.5, dominance: 0.5 };

    // 음성 분석
    if (analyserRef.current && isAudioOn) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDataArray = new Uint8Array(bufferLength);

      analyserRef.current.getByteFrequencyData(dataArray);
      analyserRef.current.getByteTimeDomainData(timeDataArray);

      const volumeLevel = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
      const pitchValue = calculatePitch(timeDataArray);
      const rateValue = calculateSpeechRate(timeDataArray);

      currentVoiceVAD = calculateVoiceVAD(volumeLevel, pitchValue, rateValue);
    }

    // 표정 분석 (간단한 시뮬레이션)
    if (isVideoOn) {
      currentFacialVAD = calculateFacialVAD();
    }

    // 통합 VAD 점수 계산
    const integratedVAD = calculateIntegratedVAD(currentFacialVAD, currentVoiceVAD);
    const emotion = vadToEmotion(integratedVAD);
    const confidenceScore = calculateConfidence(currentFacialVAD, currentVoiceVAD);

    const emotionAnalysis: EmotionAnalysis = {
      id: `realtime_${Date.now()}`,
      userId: 'user123',
      timestamp: new Date().toISOString(),
      vadScore: integratedVAD,
      emotion,
      confidence: confidenceScore,
      mediaType: 'realtime',
      cbtFeedback: {
        cognitiveDistortion: '실시간 분석 중',
        challenge: '현재 감정 상태를 관찰해보세요',
        alternative: '감정 변화를 자연스럽게 받아들이세요',
        actionPlan: '정기적인 감정 체크를 해보세요'
      }
    };

    // 상태 업데이트를 한 번에 처리
    setVoiceVAD(currentVoiceVAD);
    setFacialVAD(currentFacialVAD);
    setCurrentEmotion(emotionAnalysis);
    setConfidence(confidenceScore);

    if (onEmotionChange) {
      onEmotionChange(emotionAnalysis);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeEmotion);
  }, [isAnalyzing, isAudioOn, isVideoOn, onEmotionChange]);

  // 피치 계산
  const calculatePitch = (timeData: Uint8Array): number => {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < timeData.length; i++) {
      const value = (timeData[i] - 128) / 128;
      sum += Math.abs(value);
      count++;
    }
    
    return count > 0 ? sum / count : 0;
  };

  // 음성 속도 계산
  const calculateSpeechRate = (timeData: Uint8Array): number => {
    let zeroCrossings = 0;
    
    for (let i = 1; i < timeData.length; i++) {
      const prev = (timeData[i - 1] - 128) / 128;
      const curr = (timeData[i] - 128) / 128;
      
      if ((prev < 0 && curr >= 0) || (prev >= 0 && curr < 0)) {
        zeroCrossings++;
      }
    }
    
    return zeroCrossings / timeData.length;
  };

  // 음성 VAD 계산
  const calculateVoiceVAD = (volume: number, pitch: number, rate: number): VADScore => {
    return {
      valence: Math.min(1, Math.max(0, 0.5 + (pitch - 0.5) * 0.3)),
      arousal: Math.min(1, Math.max(0, volume * 0.8 + rate * 0.2)),
      dominance: Math.min(1, Math.max(0, 0.5 + (volume - 0.5) * 0.4))
    };
  };

  // 표정 VAD 계산 (시뮬레이션)
  const calculateFacialVAD = (): VADScore => {
    // 실제로는 MediaPipe Face Mesh를 사용해야 함
    return {
      valence: 0.5 + (Math.random() - 0.5) * 0.2,
      arousal: 0.5 + (Math.random() - 0.5) * 0.2,
      dominance: 0.5 + (Math.random() - 0.5) * 0.2
    };
  };

  // 통합 VAD 계산
  const calculateIntegratedVAD = (facial: VADScore, voice: VADScore): VADScore => {
    return {
      valence: (facial.valence * 0.6 + voice.valence * 0.4),
      arousal: (facial.arousal * 0.4 + voice.arousal * 0.6),
      dominance: (facial.dominance * 0.5 + voice.dominance * 0.5)
    };
  };

  // VAD를 감정으로 변환
  const vadToEmotion = (vad: VADScore): string => {
    const { valence, arousal, dominance } = vad;
    
    if (valence > 0.7 && arousal > 0.7) return 'excited';
    if (valence > 0.7 && arousal < 0.3) return 'calm';
    if (valence > 0.6) return 'happy';
    if (valence < 0.4 && arousal > 0.7) return 'angry';
    if (valence < 0.4 && arousal < 0.3) return 'sad';
    if (dominance < 0.4 && arousal > 0.6) return 'anxious';
    
    return 'neutral';
  };

  // 신뢰도 계산
  const calculateConfidence = (facial: VADScore, voice: VADScore): number => {
    const facialConfidence = 0.8; // 실제로는 얼굴 인식 신뢰도
    const voiceConfidence = 0.7; // 실제로는 음성 품질 신뢰도
    return (facialConfidence * 0.6 + voiceConfidence * 0.4);
  };



  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (isActive) {
      initializeMediaStream();
    }
  }, [isActive, initializeMediaStream]);

  // 분석 루프 시작/중지
  useEffect(() => {
    if (isAnalyzing) {
      const runAnalysis = () => {
        let currentVoiceVAD: VADScore = { valence: 0.5, arousal: 0.5, dominance: 0.5 };
        let currentFacialVAD: VADScore = { valence: 0.5, arousal: 0.5, dominance: 0.5 };

        // 음성 분석
        if (analyserRef.current && isAudioOn) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const timeDataArray = new Uint8Array(bufferLength);

          analyserRef.current.getByteFrequencyData(dataArray);
          analyserRef.current.getByteTimeDomainData(timeDataArray);

          const volumeLevel = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
          const pitchValue = calculatePitch(timeDataArray);
          const rateValue = calculateSpeechRate(timeDataArray);

          currentVoiceVAD = calculateVoiceVAD(volumeLevel, pitchValue, rateValue);
        }

        // 표정 분석 (간단한 시뮬레이션)
        if (isVideoOn) {
          currentFacialVAD = calculateFacialVAD();
        }

        // 통합 VAD 점수 계산
        const integratedVAD = calculateIntegratedVAD(currentFacialVAD, currentVoiceVAD);
        const emotion = vadToEmotion(integratedVAD);
        const confidenceScore = calculateConfidence(currentFacialVAD, currentVoiceVAD);

        // 부드러운 전환을 위한 보간
        setDisplayedVAD(prev => ({
          valence: prev.valence * 0.7 + integratedVAD.valence * 0.3,
          arousal: prev.arousal * 0.7 + integratedVAD.arousal * 0.3,
          dominance: prev.dominance * 0.7 + integratedVAD.dominance * 0.3
        }));

        setDisplayedConfidence(prev => prev * 0.7 + confidenceScore * 0.3);

        const emotionAnalysis: EmotionAnalysis = {
          id: `realtime_${Date.now()}`,
          userId: 'user123',
          timestamp: new Date().toISOString(),
          vadScore: integratedVAD,
          emotion,
          confidence: confidenceScore,
          mediaType: 'realtime',
          cbtFeedback: {
            cognitiveDistortion: '실시간 분석 중',
            challenge: '현재 감정 상태를 관찰해보세요',
            alternative: '감정 변화를 자연스럽게 받아들이세요',
            actionPlan: '정기적인 감정 체크를 해보세요'
          }
        };

        setCurrentEmotion(emotionAnalysis);
        setConfidence(confidenceScore);

        // 감정 히스토리에 추가 (최근 20개만 유지)
        setEmotionHistory(prev => {
          const newHistory = [...prev, {
            timestamp: Date.now(),
            emotion,
            valence: integratedVAD.valence
          }];
          return newHistory.slice(-20); // 최근 20개만 유지
        });

        if (onEmotionChange) {
          onEmotionChange(emotionAnalysis);
        }
      };

      // 2초마다 분석 실행 (부드러운 전환을 위해)
      analysisIntervalRef.current = setInterval(runAnalysis, 2000);
      
      // 초기 분석 실행
      runAnalysis();
    } else {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [isAnalyzing, isAudioOn, isVideoOn]);

  // 분석 토글
  const toggleAnalysis = useCallback(() => {
    if (!permissionGranted) {
      setError('먼저 카메라와 마이크 권한을 허용해주세요.');
      return;
    }

    setIsAnalyzing(prev => {
      const newState = !prev;
      if (newState) {
        setCallStatus('analyzing');
        startRecordingTimer();
        setShowGuide(false);
      } else {
        setCallStatus('paused');
        stopRecordingTimer();
      }
      return newState;
    });
  }, [permissionGranted, startRecordingTimer, stopRecordingTimer]);

  // 비디오 토글
  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  }, [stream, isVideoOn]);

  // 오디오 토글
  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  }, [stream, isAudioOn]);

  // 상담 종료
  const endCall = useCallback(() => {
    setCallStatus('ended');
    stopRecordingTimer();
    setIsAnalyzing(false);
    
    // 상담 종료 후 분석 결과 생성
    if (currentEmotion && onEmotionChange) {
      const finalAnalysis: EmotionAnalysis = {
        ...currentEmotion,
        id: `consultation_${Date.now()}`,
        timestamp: new Date().toISOString(),
        mediaType: 'consultation',
        cbtFeedback: {
          cognitiveDistortion: '상담을 통해 감정 상태를 확인했습니다',
          challenge: '현재 감정 상태를 객관적으로 바라보세요',
          alternative: '감정 변화는 자연스러운 과정입니다',
          actionPlan: '정기적인 감정 체크와 상담을 권장합니다'
        }
      };
      onEmotionChange(finalAnalysis);
    }
    
    if (onCallEnd) {
      onCallEnd();
    }
  }, [onCallEnd, stopRecordingTimer, currentEmotion, onEmotionChange]);

  // 컴포넌트 마운트 시 미디어 스트림 초기화
  useEffect(() => {
    if (isActive) {
      initializeMediaStream();
    }
  }, [isActive, initializeMediaStream]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopRecordingTimer();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.warn('AudioContext already closed:', error);
        }
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [stream, stopRecordingTimer]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* 비디오 영역 */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform scale-x-[-1]"
          style={{ transform: 'scaleX(-1) !important' }}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        
        {/* 상태 표시 오버레이 */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              callStatus === 'connected' ? 'bg-green-400' :
              callStatus === 'analyzing' ? 'bg-red-400 animate-pulse' :
              callStatus === 'paused' ? 'bg-orange-400' :
              'bg-gray-400'
            }`} />
            <div className="text-sm font-medium">
              {callStatus === 'connecting' && '연결 중...'}
              {callStatus === 'connected' && '연결됨'}
              {callStatus === 'analyzing' && '분석 중'}
              {callStatus === 'paused' && '일시정지'}
              {callStatus === 'ended' && '종료됨'}
            </div>
          </div>
          {isAnalyzing && (
            <div className="mt-2 text-xs text-gray-300">
              녹화 시간: {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* 현재 감정 표시 - 개선된 버전 */}
        {currentEmotion && isAnalyzing && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white px-4 py-3 rounded-xl backdrop-blur-sm min-w-[280px]">
            <div className="space-y-3">
              {/* 메인 감정 표시 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{emotionEmojis[currentEmotion.emotion as keyof typeof emotionEmojis] || '😐'}</span>
                  <div>
                    <div className="font-semibold text-lg">
                      {currentEmotion.emotion === 'happy' ? '기쁨' : 
                       currentEmotion.emotion === 'sad' ? '슬픔' :
                       currentEmotion.emotion === 'angry' ? '분노' :
                       currentEmotion.emotion === 'anxious' ? '불안' :
                       currentEmotion.emotion === 'excited' ? '흥분' :
                       currentEmotion.emotion === 'calm' ? '평온' :
                       currentEmotion.emotion === 'surprised' ? '놀람' :
                       currentEmotion.emotion === 'neutral' ? '중립' : '감정 분석 중'}
                    </div>
                    <div className="text-xs text-gray-300">
                      신뢰도: {Math.round(displayedConfidence * 100)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-300">실시간</div>
                  <div className="text-xs text-green-400">●</div>
                </div>
              </div>

              {/* VAD 점수 표시 */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-300">감정 세부 분석</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-500 bg-opacity-20 rounded p-2">
                    <div className="font-medium text-blue-300">긍정성</div>
                    <div className="text-lg font-bold">{Math.round(displayedVAD.valence * 100)}%</div>
                    <div className="w-full bg-blue-500 bg-opacity-30 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-400 h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${displayedVAD.valence * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-red-500 bg-opacity-20 rounded p-2">
                    <div className="font-medium text-red-300">각성도</div>
                    <div className="text-lg font-bold">{Math.round(displayedVAD.arousal * 100)}%</div>
                    <div className="w-full bg-red-500 bg-opacity-30 rounded-full h-1 mt-1">
                      <div 
                        className="bg-red-400 h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${displayedVAD.arousal * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-purple-500 bg-opacity-20 rounded p-2">
                    <div className="font-medium text-purple-300">지배성</div>
                    <div className="text-lg font-bold">{Math.round(displayedVAD.dominance * 100)}%</div>
                    <div className="w-full bg-purple-500 bg-opacity-30 rounded-full h-1 mt-1">
                      <div 
                        className="bg-purple-400 h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${displayedVAD.dominance * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 감정 강도 및 상태 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">감정 강도</span>
                  <span className="text-xs font-medium">
                    {displayedVAD.valence > 0.7 ? '매우 높음' :
                     displayedVAD.valence > 0.5 ? '높음' :
                     displayedVAD.valence > 0.3 ? '보통' : '낮음'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">에너지 레벨</span>
                  <span className="text-xs font-medium">
                    {displayedVAD.arousal > 0.7 ? '매우 활발' :
                     displayedVAD.arousal > 0.5 ? '활발' :
                     displayedVAD.arousal > 0.3 ? '보통' : '차분'}
                  </span>
                </div>
              </div>

              {/* 실시간 피드백 */}
              <div className="bg-white bg-opacity-10 rounded p-2">
                <div className="text-xs text-gray-300 mb-1">실시간 피드백</div>
                <div className="text-xs">
                  {currentEmotion.emotion === 'happy' && displayedVAD.valence > 0.7 ? 
                    '매우 긍정적인 감정이 감지되었습니다! 😊' :
                   currentEmotion.emotion === 'sad' && displayedVAD.valence < 0.3 ? 
                    '슬픈 감정이 감지되었습니다. 괜찮으세요? 😔' :
                   currentEmotion.emotion === 'angry' && displayedVAD.arousal > 0.7 ? 
                    '분노한 감정이 감지되었습니다. 심호흡을 해보세요 😤' :
                   currentEmotion.emotion === 'anxious' && displayedVAD.arousal > 0.6 ? 
                    '불안한 감정이 감지되었습니다. 편안히 호흡해보세요 😰' :
                   currentEmotion.emotion === 'calm' && displayedVAD.arousal < 0.4 ? 
                    '평온한 상태입니다. 좋은 감정을 유지하세요 😌' :
                   currentEmotion.emotion === 'excited' && displayedVAD.arousal > 0.6 ? 
                    '흥미진진한 감정이 감지되었습니다! 🎉' :
                   currentEmotion.emotion === 'surprised' ? 
                    '놀란 감정이 감지되었습니다! 😲' :
                    '감정을 분석하고 있습니다...'}
                </div>
              </div>

              {/* 감정 변화 추이 차트 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">감정 변화 추이</span>
                  <button
                    onClick={() => setShowEmotionChart(!showEmotionChart)}
                    className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {showEmotionChart ? '숨기기' : '보기'}
                  </button>
                </div>
                {showEmotionChart && emotionHistory.length > 0 && (
                  <div className="bg-white bg-opacity-5 rounded p-2">
                    <div className="h-16 flex items-end justify-between space-x-1">
                      {emotionHistory.slice(-10).map((entry, index) => {
                        const height = Math.max(4, entry.valence * 60); // 최소 4px, 최대 60px
                        const color = entry.valence > 0.7 ? 'bg-green-400' : 
                                     entry.valence > 0.5 ? 'bg-yellow-400' : 
                                     entry.valence > 0.3 ? 'bg-orange-400' : 'bg-red-400';
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className={`w-full ${color} rounded-t transition-all duration-300`}
                              style={{ height: `${height}px` }}
                            />
                            <div className="text-[8px] text-gray-400 mt-1">
                              {emotionEmojis[entry.emotion as keyof typeof emotionEmojis] || '😐'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[8px] text-gray-400 text-center mt-1">
                      최근 10초간 감정 변화
                    </div>
                  </div>
                )}
              </div>

              {/* 감정 통계 정보 */}
              {emotionStats && emotionHistory.length > 5 && (
                <div className="bg-white bg-opacity-5 rounded p-2">
                  <div className="text-xs text-gray-300 mb-2">분석 통계</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">주요 감정:</span>
                      <span className="font-medium">
                        {emotionStats.mostFrequentEmotion === 'happy' ? '기쁨' : 
                         emotionStats.mostFrequentEmotion === 'sad' ? '슬픔' :
                         emotionStats.mostFrequentEmotion === 'angry' ? '분노' :
                         emotionStats.mostFrequentEmotion === 'anxious' ? '불안' :
                         emotionStats.mostFrequentEmotion === 'excited' ? '흥분' :
                         emotionStats.mostFrequentEmotion === 'calm' ? '평온' :
                         emotionStats.mostFrequentEmotion === 'surprised' ? '놀람' :
                         emotionStats.mostFrequentEmotion === 'neutral' ? '중립' : '분석 중'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">평균 긍정성:</span>
                      <span className="font-medium">
                        {emotionStats.averageValence > 0.7 ? '매우 높음' :
                         emotionStats.averageValence > 0.5 ? '높음' :
                         emotionStats.averageValence > 0.3 ? '보통' : '낮음'}
                        {' '}({Math.round(emotionStats.averageValence * 100)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">분석 샘플:</span>
                      <span className="font-medium">{emotionStats.totalSamples}개</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 사용자 가이드 */}
        {showGuide && callStatus === 'connected' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white px-6 py-4 rounded-xl backdrop-blur-sm max-w-md text-center">
            <div className="space-y-3">
              <div className="text-lg font-semibold">🎥 영상 상담 감정 분석</div>
              <div className="text-sm text-gray-300 space-y-2">
                <p>• 카메라와 마이크가 활성화되었습니다</p>
                <p>• "알겠습니다" 버튼을 클릭하면 바로 감정 분석이 시작됩니다</p>
                <p>• 분석 중에는 실시간으로 감정이 표시됩니다</p>
                <p>• 언제든지 "상담 종료"할 수 있습니다</p>
              </div>
              <button
                onClick={() => {
                  setShowGuide(false);
                  // 바로 분석 시작
                  if (permissionGranted) {
                    setIsAnalyzing(true);
                    setCallStatus('analyzing');
                    startRecordingTimer();
                  }
                }}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
              >
                알겠습니다
              </button>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-6 py-4 rounded-xl max-w-md text-center backdrop-blur-sm">
            <div className="space-y-2">
              <div className="text-lg font-semibold">⚠️ 오류 발생</div>
              <div className="text-sm">{error}</div>
              <button
                onClick={() => setError(null)}
                className="mt-3 px-4 py-2 bg-white text-red-500 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}



        {/* 컨트롤 바 */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-full px-8 py-4 backdrop-blur-sm">
          <div className="flex items-center space-x-4">


            {/* 비디오 토글 */}
            <ActionButton
              variant={isVideoOn ? 'secondary' : 'danger'}
              size="sm"
              onClick={toggleVideo}
              className="flex flex-col items-center space-y-1"
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span className="text-xs">{isVideoOn ? '카메라 끄기' : '카메라 켜기'}</span>
            </ActionButton>

            {/* 오디오 토글 */}
            <ActionButton
              variant={isAudioOn ? 'secondary' : 'danger'}
              size="sm"
              onClick={toggleAudio}
              className="flex flex-col items-center space-y-1"
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="text-xs">{isAudioOn ? '마이크 끄기' : '마이크 켜기'}</span>
            </ActionButton>

            {/* 상담 종료 - 상담 시작 후에만 표시 */}
            {isAnalyzing && (
              <ActionButton
                variant="danger"
                size="sm"
                onClick={endCall}
                className="flex flex-col items-center space-y-1"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="text-xs">상담 종료</span>
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 