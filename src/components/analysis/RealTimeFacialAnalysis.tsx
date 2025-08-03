'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Camera, Eye, Smile, Frown, Meh } from 'lucide-react';
import { VADScore } from '../../types';

interface RealTimeFacialAnalysisProps {
  onEmotionChange?: (vadScore: VADScore, confidence: number) => void;
  isActive?: boolean;
}

// MediaPipe Face Mesh 타입 정의
declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
    drawingUtils: any;
  }
}

export default function RealTimeFacialAnalysis({ 
  onEmotionChange, 
  isActive = false 
}: RealTimeFacialAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentVAD, setCurrentVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  // MediaPipe Face Mesh 초기화
  const initializeFaceMesh = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.FaceMesh) {
        faceMeshRef.current = new window.FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        faceMeshRef.current.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMeshRef.current.onResults(onResults);
        setIsModelLoaded(true);
      }
    } catch (err) {
      console.error('Face Mesh 초기화 실패:', err);
      setError('표정 분석 모델을 로드할 수 없습니다.');
    }
  }, []);

  // 카메라 초기화
  const initializeCamera = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.Camera && videoRef.current) {
        cameraRef.current = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current && isAnalyzing) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        await cameraRef.current.start();
      }
    } catch (err) {
      console.error('카메라 초기화 실패:', err);
      setError('카메라에 접근할 수 없습니다.');
    }
  }, [isAnalyzing]);

  // MediaPipe 결과 처리
  const onResults = useCallback((results: any) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const vadScore = calculateFacialVAD(landmarks);
      const confidenceScore = calculateConfidence(landmarks);
      
      setCurrentVAD(vadScore);
      setConfidence(confidenceScore);
      
      if (onEmotionChange) {
        onEmotionChange(vadScore, confidenceScore);
      }
    }
  }, [onEmotionChange]);

  // 얼굴 랜드마크에서 VAD 점수 계산
  const calculateFacialVAD = (landmarks: any[]): VADScore => {
    if (!landmarks || landmarks.length === 0) {
      return { valence: 0.5, arousal: 0.5, dominance: 0.5 };
    }

    // 주요 랜드마크 인덱스 (MediaPipe Face Mesh 기준)
    const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    const MOUTH = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318];
    const EYEBROWS = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];

    // 눈 크기 계산 (각성도)
    const leftEyeArea = calculateEyeArea(landmarks, LEFT_EYE);
    const rightEyeArea = calculateEyeArea(landmarks, RIGHT_EYE);
    const averageEyeArea = (leftEyeArea + rightEyeArea) / 2;
    
    // 입 크기 계산 (감정 표현)
    const mouthArea = calculateMouthArea(landmarks, MOUTH);
    
    // 눈썹 위치 계산 (감정 상태)
    const eyebrowHeight = calculateEyebrowHeight(landmarks, EYEBROWS);

    // VAD 점수 계산
    const valence = Math.max(0, Math.min(1, 0.5 + (mouthArea - 0.1) * 2)); // 입 크기 기반 긍정성
    const arousal = Math.max(0, Math.min(1, 0.3 + averageEyeArea * 1.5)); // 눈 크기 기반 각성도
    const dominance = Math.max(0, Math.min(1, 0.4 + eyebrowHeight * 1.2)); // 눈썹 위치 기반 지배성

    return { valence, arousal, dominance };
  };

  // 눈 영역 계산
  const calculateEyeArea = (landmarks: any[], eyeIndices: number[]): number => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    eyeIndices.forEach(index => {
      const point = landmarks[index];
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    
    return (maxX - minX) * (maxY - minY);
  };

  // 입 영역 계산
  const calculateMouthArea = (landmarks: any[], mouthIndices: number[]): number => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    mouthIndices.forEach(index => {
      const point = landmarks[index];
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    
    return (maxX - minX) * (maxY - minY);
  };

  // 눈썹 높이 계산
  const calculateEyebrowHeight = (landmarks: any[], eyebrowIndices: number[]): number => {
    const eyebrowY = eyebrowIndices.reduce((sum, index) => sum + landmarks[index].y, 0) / eyebrowIndices.length;
    return 1 - eyebrowY; // 높을수록 높은 값
  };

  // 신뢰도 계산
  const calculateConfidence = (landmarks: any[]): number => {
    if (!landmarks || landmarks.length === 0) return 0;
    
    // 랜드마크의 가시성 점수 계산
    const visibleLandmarks = landmarks.filter(point => point.visibility > 0.5).length;
    return Math.min(1, visibleLandmarks / landmarks.length);
  };

  // 분석 시작/중지
  const toggleAnalysis = async () => {
    if (!isAnalyzing) {
      setIsAnalyzing(true);
      if (!isModelLoaded) {
        await initializeFaceMesh();
      }
      if (!cameraRef.current) {
        await initializeCamera();
      }
    } else {
      setIsAnalyzing(false);
      if (cameraRef.current) {
        await cameraRef.current.stop();
      }
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (isActive) {
      initializeFaceMesh();
    }
  }, [isActive, initializeFaceMesh]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  // 감정 상태 평가
  const getEmotionStatus = () => {
    const { valence, arousal } = currentVAD;
    
    if (valence > 0.7 && arousal > 0.6) return { status: 'happy', icon: Smile, color: 'text-green-600' };
    if (valence < 0.3 && arousal > 0.6) return { status: 'angry', icon: Frown, color: 'text-red-600' };
    if (valence < 0.3 && arousal < 0.4) return { status: 'sad', icon: Frown, color: 'text-blue-600' };
    return { status: 'neutral', icon: Meh, color: 'text-gray-600' };
  };

  const emotionStatus = getEmotionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          <span>실시간 표정 분석</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 웹캠 영역 */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-gray-100 rounded-lg object-cover transform scale-x-[-1]"
              style={{ transform: 'scaleX(-1) !important' }}
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-64 rounded-lg pointer-events-none"
            />
            
            {/* 오버레이 정보 */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {isAnalyzing ? '분석 중...' : '대기 중'}
            </div>
            
            {error && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          {/* 컨트롤 */}
          <div className="flex justify-center">
            <div className="text-sm text-gray-500 text-center">
              카메라가 활성화되면 자동으로 분석이 시작됩니다
            </div>
          </div>

          {/* 실시간 VAD 점수 */}
          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <emotionStatus.icon className={`w-6 h-6 ${emotionStatus.color}`} />
                <span className="font-medium capitalize">{emotionStatus.status}</span>
                <span className="text-sm text-gray-500">신뢰도: {Math.round(confidence * 100)}%</span>
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