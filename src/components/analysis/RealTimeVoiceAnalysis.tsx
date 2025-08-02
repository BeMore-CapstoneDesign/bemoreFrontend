'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { VADScore } from '../../types';

interface RealTimeVoiceAnalysisProps {
  onEmotionChange?: (vadScore: VADScore, confidence: number) => void;
  isActive?: boolean;
}

export default function RealTimeVoiceAnalysis({ 
  onEmotionChange, 
  isActive = false 
}: RealTimeVoiceAnalysisProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentVAD, setCurrentVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [speechRate, setSpeechRate] = useState(0);

  const animationFrameRef = useRef<number | null>(null);

  // 오디오 컨텍스트 초기화
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      return true;
    } catch (err) {
      console.error('오디오 컨텍스트 초기화 실패:', err);
      setError('마이크에 접근할 수 없습니다.');
      return false;
    }
  }, []);

  // 음성 분석
  const analyzeVoice = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    analyserRef.current.getByteFrequencyData(dataArray);
    analyserRef.current.getByteTimeDomainData(timeDataArray);

    // 볼륨 계산
    const volumeLevel = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    setVolume(volumeLevel / 255);

    // 피치 계산 (기본적인 방법)
    const pitchValue = calculatePitch(timeDataArray);
    setPitch(pitchValue);

    // 음성 속도 계산 (기본적인 방법)
    const rateValue = calculateSpeechRate(timeDataArray);
    setSpeechRate(rateValue);

    // VAD 점수 계산
    const vadScore = calculateVoiceVAD(volumeLevel, pitchValue, rateValue);
    const confidenceScore = calculateVoiceConfidence(volumeLevel, pitchValue);

    setCurrentVAD(vadScore);
    setConfidence(confidenceScore);

    if (onEmotionChange) {
      onEmotionChange(vadScore, confidenceScore);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeVoice);
  }, [isRecording, onEmotionChange]);

  // 피치 계산 (기본적인 방법)
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

  // 음성 속도 계산 (기본적인 방법)
  const calculateSpeechRate = (timeData: Uint8Array): number => {
    let zeroCrossings = 0;
    
    for (let i = 1; i < timeData.length; i++) {
      const prev = (timeData[i - 1] - 128) / 128;
      const curr = (timeData[i] - 128) / 128;
      
      if ((prev < 0 && curr >= 0) || (prev >= 0 && curr < 0)) {
        zeroCrossings++;
      }
    }
    
    return Math.min(1, zeroCrossings / timeData.length * 10);
  };

  // 음성에서 VAD 점수 계산
  const calculateVoiceVAD = (volume: number, pitch: number, rate: number): VADScore => {
    // 볼륨을 0-1 범위로 정규화
    const normalizedVolume = Math.min(1, volume / 255);
    
    // Valence (긍정성): 피치와 볼륨 기반
    const valence = Math.max(0, Math.min(1, 
      0.5 + (pitch - 0.3) * 1.5 + (normalizedVolume - 0.3) * 0.8
    ));
    
    // Arousal (각성도): 볼륨과 음성 속도 기반
    const arousal = Math.max(0, Math.min(1, 
      0.3 + normalizedVolume * 1.2 + rate * 0.8
    ));
    
    // Dominance (지배성): 피치와 음성 속도 기반
    const dominance = Math.max(0, Math.min(1, 
      0.4 + pitch * 1.1 + rate * 0.6
    ));

    return { valence, arousal, dominance };
  };

  // 음성 신뢰도 계산
  const calculateVoiceConfidence = (volume: number, pitch: number): number => {
    const normalizedVolume = Math.min(1, volume / 255);
    
    // 볼륨이 너무 낮으면 신뢰도 낮음
    if (normalizedVolume < 0.1) return 0;
    
    // 볼륨과 피치의 안정성 기반 신뢰도
    const volumeConfidence = Math.min(1, normalizedVolume * 2);
    const pitchConfidence = Math.min(1, pitch * 1.5);
    
    return (volumeConfidence + pitchConfidence) / 2;
  };

  // 녹음 시작/중지
  const toggleRecording = async () => {
    if (!isRecording) {
      const success = await initializeAudioContext();
      if (success) {
        setIsRecording(true);
        setError(null);
        analyzeVoice();
      }
    } else {
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 감정 상태 평가
  const getEmotionStatus = () => {
    const { valence, arousal } = currentVAD;
    
    if (valence > 0.7 && arousal > 0.6) return { status: 'excited', color: 'text-green-600' };
    if (valence > 0.6 && arousal < 0.4) return { status: 'calm', color: 'text-blue-600' };
    if (valence < 0.3 && arousal > 0.6) return { status: 'angry', color: 'text-red-600' };
    if (valence < 0.3 && arousal < 0.4) return { status: 'sad', color: 'text-gray-600' };
    return { status: 'neutral', color: 'text-gray-500' };
  };

  const emotionStatus = getEmotionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-indigo-600" />
          <span>실시간 음성 분석</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 음성 시각화 */}
          <div className="relative h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-8 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-12 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-6 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-10 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-3 h-8 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              <div className="text-gray-500 flex items-center space-x-2">
                <VolumeX className="w-8 h-8" />
                <span>음성 대기 중</span>
              </div>
            )}
            
            {error && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          {/* 컨트롤 */}
          <div className="flex justify-center">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? 'outline' : 'primary'}
              className={`px-6 ${isRecording ? 'text-red-600 border-red-600 hover:bg-red-600 hover:text-white' : ''}`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  녹음 중지
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  녹음 시작
                </>
              )}
            </Button>
          </div>

          {/* 실시간 음성 정보 */}
          {isRecording && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Volume2 className="w-5 h-5 text-indigo-600" />
                <span className="font-medium capitalize">{emotionStatus.status}</span>
                <span className="text-sm text-gray-500">신뢰도: {Math.round(confidence * 100)}%</span>
              </div>

              {/* 음성 특성 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">볼륨</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {Math.round(volume * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">피치</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {Math.round(pitch * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">속도</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {Math.round(speechRate * 100)}%
                  </div>
                </div>
              </div>

              {/* VAD 게이지 */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>긍정성 (Valence)</span>
                    <span className="text-green-600 font-bold">
                      {Math.round(currentVAD.valence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${currentVAD.valence * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>각성도 (Arousal)</span>
                    <span className="text-blue-600 font-bold">
                      {Math.round(currentVAD.arousal * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${currentVAD.arousal * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>지배성 (Dominance)</span>
                    <span className="text-purple-600 font-bold">
                      {Math.round(currentVAD.dominance * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${currentVAD.dominance * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 