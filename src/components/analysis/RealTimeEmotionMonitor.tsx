'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  Heart,
  Brain,
  Eye
} from 'lucide-react';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis, emotionColors } from '../../utils/emotion';

interface RealTimeEmotionMonitorProps {
  currentEmotion?: EmotionAnalysis;
  recentEmotions: EmotionAnalysis[];
  onEmotionChange?: (emotion: EmotionAnalysis) => void;
}

export default function RealTimeEmotionMonitor({
  currentEmotion,
  recentEmotions,
  onEmotionChange
}: RealTimeEmotionMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertLevel, setAlertLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 클라이언트 사이드에서 초기화
  useEffect(() => {
    setLastUpdate(new Date());
  }, []);

  // 감정 변화 감지
  useEffect(() => {
    if (!currentEmotion || recentEmotions.length < 2) return;

    const currentValence = currentEmotion.vadScore.valence;
    const previousEmotion = recentEmotions[recentEmotions.length - 2];
    const previousValence = previousEmotion.vadScore.valence;
    const change = Math.abs(currentValence - previousValence);

    // 알림 레벨 설정
    if (change > 0.3) {
      setAlertLevel('high');
    } else if (change > 0.2) {
      setAlertLevel('medium');
    } else if (change > 0.1) {
      setAlertLevel('low');
    } else {
      setAlertLevel(null);
    }
  }, [currentEmotion, recentEmotions]);

  // 모니터링 시작/중지
  const toggleMonitoring = () => {
    if (isMonitoring) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsMonitoring(false);
    } else {
      setIsMonitoring(true);
      intervalRef.current = setInterval(() => {
        setLastUpdate(new Date());
      }, 1000);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 감정 상태 평가
  const getEmotionStatus = () => {
    if (!currentEmotion) return { status: 'neutral', message: '감정 데이터가 없습니다', color: 'text-gray-500' };

    const { valence, arousal, dominance } = currentEmotion.vadScore;
    
    if (valence > 0.7 && arousal < 0.5) {
      return { status: 'excellent', message: '매우 좋은 감정 상태입니다!', color: 'text-green-600' };
    } else if (valence > 0.5) {
      return { status: 'good', message: '양호한 감정 상태입니다', color: 'text-blue-600' };
    } else if (valence < 0.3) {
      return { status: 'warning', message: '주의가 필요한 감정 상태입니다', color: 'text-yellow-600' };
    } else {
      return { status: 'caution', message: '감정 관리가 필요할 수 있습니다', color: 'text-red-600' };
    }
  };

  const emotionStatus = getEmotionStatus();

  return (
    <div className="space-y-4">
      {/* 실시간 상태 카드 */}
      <Card className={`border-2 ${
        alertLevel === 'high' ? 'border-red-500 bg-red-50' :
        alertLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' :
        alertLevel === 'low' ? 'border-blue-500 bg-blue-50' :
        'border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className={`w-5 h-5 ${
                isMonitoring ? 'text-green-600 animate-pulse' : 'text-gray-400'
              }`} />
              <span>실시간 감정 모니터링</span>
            </div>
            <Button
              variant={isMonitoring ? 'outline' : 'primary'}
              className={isMonitoring ? 'text-red-600 border-red-600 hover:bg-red-600 hover:text-white' : ''}
              size="sm"
              onClick={toggleMonitoring}
            >
              {isMonitoring ? '모니터링 중지' : '모니터링 시작'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 현재 감정 */}
            <div className="text-center">
              <div className="text-4xl mb-2">
                {currentEmotion ? emotionEmojis[currentEmotion.emotion as keyof typeof emotionEmojis] : '😐'}
              </div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {currentEmotion?.emotion || '감정 없음'}
              </div>
              <div className="text-sm text-gray-600">현재 감정</div>
            </div>

            {/* 감정 상태 */}
            <div className="text-center">
              <div className={`text-2xl mb-2 ${emotionStatus.color}`}>
                {emotionStatus.status === 'excellent' ? <CheckCircle className="w-8 h-8 mx-auto" /> :
                 emotionStatus.status === 'good' ? <Heart className="w-8 h-8 mx-auto" /> :
                 emotionStatus.status === 'warning' ? <AlertTriangle className="w-8 h-8 mx-auto" /> :
                 <Brain className="w-8 h-8 mx-auto" />}
              </div>
              <div className={`text-sm font-medium ${emotionStatus.color}`}>
                {emotionStatus.message}
              </div>
            </div>

            {/* 마지막 업데이트 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
              </div>
              <div className="text-sm text-gray-600">마지막 업데이트</div>
            </div>
          </div>

          {/* 알림 표시 */}
          {alertLevel && (
            <div className={`mt-4 p-3 rounded-lg ${
              alertLevel === 'high' ? 'bg-red-100 border border-red-300' :
              alertLevel === 'medium' ? 'bg-yellow-100 border border-yellow-300' :
              'bg-blue-100 border border-blue-300'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-5 h-5 ${
                  alertLevel === 'high' ? 'text-red-600' :
                  alertLevel === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <span className={`font-medium ${
                  alertLevel === 'high' ? 'text-red-800' :
                  alertLevel === 'medium' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {alertLevel === 'high' ? '높은 감정 변화 감지' :
                   alertLevel === 'medium' ? '중간 감정 변화 감지' :
                   '낮은 감정 변화 감지'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VAD 실시간 게이지 */}
      {currentEmotion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <span>실시간 VAD 점수</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Valence (긍정성) */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">긍정성 (Valence)</span>
                  <span className="text-green-600 font-bold">
                    {Math.round(currentEmotion.vadScore.valence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${currentEmotion.vadScore.valence * 100}%` }}
                  />
                </div>
              </div>

              {/* Arousal (각성도) */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">각성도 (Arousal)</span>
                  <span className="text-blue-600 font-bold">
                    {Math.round(currentEmotion.vadScore.arousal * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${currentEmotion.vadScore.arousal * 100}%` }}
                  />
                </div>
              </div>

              {/* Dominance (지배성) */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">지배성 (Dominance)</span>
                  <span className="text-purple-600 font-bold">
                    {Math.round(currentEmotion.vadScore.dominance * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${currentEmotion.vadScore.dominance * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 최근 감정 변화 */}
      {recentEmotions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>최근 감정 변화</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {recentEmotions.slice(-5).map((emotion, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 min-w-[80px] ${
                    index === recentEmotions.length - 1 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {emotionEmojis[emotion.emotion as keyof typeof emotionEmojis] || '😐'}
                  </div>
                  <div className="text-xs font-medium text-gray-900 capitalize">
                    {emotion.emotion}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(emotion.vadScore.valence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 