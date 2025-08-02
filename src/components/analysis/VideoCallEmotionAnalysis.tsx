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
  Maximize2,
  Minimize2,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // 실시간 분석 상태
  const [facialVAD, setFacialVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [voiceVAD, setVoiceVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [confidence, setConfidence] = useState(0);

  const animationFrameRef = useRef<number | null>(null);

  // 미디어 스트림 초기화
  const initializeMediaStream = useCallback(async () => {
    try {
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
      setError('카메라나 마이크에 접근할 수 없습니다.');
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

  // 분석 시작/중지
  const toggleAnalysis = useCallback(() => {
    setIsAnalyzing(prev => !prev);
  }, []);

  // 비디오 토글
  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  }, [stream]);

  // 오디오 토글
  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  }, [stream]);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 통화 종료
  const endCall = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (onCallEnd) {
      onCallEnd();
    }
  }, [stream, onCallEnd]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (isActive) {
      initializeMediaStream();
    }
  }, [isActive, initializeMediaStream]);

  // 분석 루프 시작/중지
  useEffect(() => {
    let isActive = isAnalyzing;
    
    if (isActive) {
      const runAnalysis = () => {
        if (!isActive) return;
        
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

        setCurrentEmotion(emotionAnalysis);
        setConfidence(confidenceScore);

        if (onEmotionChange) {
          onEmotionChange(emotionAnalysis);
        }

        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(runAnalysis);
        }
      };

      runAnalysis();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, isAudioOn, isVideoOn, onEmotionChange]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
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
    };
  }, [stream]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* 비디오 영역 */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        
        {/* 오버레이 정보 */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">
              {isAnalyzing ? '실시간 분석 중' : '대기 중'}
            </span>
          </div>
        </div>

        {/* 현재 감정 표시 */}
        {currentEmotion && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{emotionEmojis[currentEmotion.emotion as keyof typeof emotionEmojis] || '😐'}</span>
              <div className="text-sm">
                <div>신뢰도: {Math.round(confidence * 100)}%</div>
                <div className="text-xs text-gray-300">
                  V: {Math.round(currentEmotion.vadScore.valence * 100)}% 
                  A: {Math.round(currentEmotion.vadScore.arousal * 100)}% 
                  D: {Math.round(currentEmotion.vadScore.dominance * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* 컨트롤 바 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-6 py-3">
          <div className="flex items-center space-x-4">
            {/* 분석 토글 */}
            <ActionButton
              variant={isAnalyzing ? 'danger' : 'primary'}
              size="sm"
              onClick={toggleAnalysis}
            >
              <Brain className="w-4 h-4" />
            </ActionButton>

            {/* 비디오 토글 */}
            <ActionButton
              variant={isVideoOn ? 'secondary' : 'danger'}
              size="sm"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </ActionButton>

            {/* 오디오 토글 */}
            <ActionButton
              variant={isAudioOn ? 'secondary' : 'danger'}
              size="sm"
              onClick={toggleAudio}
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </ActionButton>

            {/* 전체화면 토글 */}
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </ActionButton>

            {/* 통화 종료 */}
            <ActionButton
              variant="danger"
              size="sm"
              onClick={endCall}
            >
              <PhoneOff className="w-4 h-4" />
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
} 