'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Activity, 
  TrendingUp, 
  Eye, 
  Brain, 
  Heart, 
  Target,
  BarChart3,
  PieChart,
  Radar
} from 'lucide-react';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis } from '../../utils/emotion';
import dynamic from 'next/dynamic';
const Charts = dynamic(() => import('./AdvancedEmotionCharts'), { ssr: false, loading: () => <div className="text-center text-gray-500 py-6">차트 로딩 중...</div> });

// 클라이언트에서만 안전하게 시간 포맷
function SafeTimeDisplay({ timestamp }: { timestamp?: string }) {
  const [localTime, setLocalTime] = useState('');
  
  React.useEffect(() => {
    if (timestamp) {
      setLocalTime(new Date(timestamp).toLocaleTimeString());
    } else {
      setLocalTime('-');
    }
  }, [timestamp]);
  
  return <span>{localTime}</span>;
}

// 클라이언트에서만 안전하게 날짜 포맷
function SafeDateDisplay({ timestamp }: { timestamp?: string }) {
  const [localDate, setLocalDate] = useState('');
  
  React.useEffect(() => {
    if (timestamp) {
      setLocalDate(new Date(timestamp).toLocaleDateString());
    } else {
      setLocalDate('-');
    }
  }, [timestamp]);
  
  return <span>{localDate}</span>;
}

interface AdvancedEmotionDashboardProps {
  emotionHistory: EmotionAnalysis[];
  currentEmotion?: EmotionAnalysis;
  onEmotionSelect?: (emotion: EmotionAnalysis) => void;
}

const emotionColors: Record<string, string> = {
  happy: '#10B981',
  sad: '#3B82F6',
  angry: '#EF4444',
  anxious: '#F59E0B',
  neutral: '#6B7280',
  excited: '#8B5CF6',
  calm: '#06B6D4'
};

export default function AdvancedEmotionDashboard({ 
  emotionHistory, 
  currentEmotion,
  onEmotionSelect 
}: AdvancedEmotionDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedChart, setSelectedChart] = useState<'line' | 'radar' | 'area'>('line');

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    const now = new Date();
    const periods = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    return emotionHistory.filter(item => {
      if (!item.timestamp) return false;
      return now.getTime() - new Date(item.timestamp).getTime() < periods[selectedPeriod];
    });
  }, [emotionHistory, selectedPeriod]);

  // 감정 통계
  const emotionStats = useMemo(() => {
    const stats = {
      total: filteredData.length,
      emotions: {} as Record<string, number>,
      averageValence: 0,
      averageArousal: 0,
      averageDominance: 0,
      mostFrequent: '',
      trend: 'stable' as 'improving' | 'declining' | 'stable'
    };

    if (filteredData.length === 0) return stats;

    // 감정별 카운트
    filteredData.forEach(item => {
      const key = item.emotion ?? 'unknown';
      stats.emotions[key] = (stats.emotions[key] || 0) + 1;
    });

    // 평균 VAD 점수
    const totalVAD = filteredData.reduce((acc, item) => ({
      valence: acc.valence + item.vadScore.valence,
      arousal: acc.arousal + item.vadScore.arousal,
      dominance: acc.dominance + item.vadScore.dominance
    }), { valence: 0, arousal: 0, dominance: 0 });

    stats.averageValence = totalVAD.valence / filteredData.length;
    stats.averageArousal = totalVAD.arousal / filteredData.length;
    stats.averageDominance = totalVAD.dominance / filteredData.length;

    // 가장 빈번한 감정
    stats.mostFrequent = Object.entries(stats.emotions)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // 트렌드 계산
    if (filteredData.length >= 2) {
      const recent = filteredData.slice(-5);
      const older = filteredData.slice(0, 5);
      const recentAvg = recent.reduce((sum, item) => sum + item.vadScore.valence, 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + item.vadScore.valence, 0) / older.length;
      
      if (recentAvg > olderAvg + 0.1) stats.trend = 'improving';
      else if (recentAvg < olderAvg - 0.1) stats.trend = 'declining';
    }

    return stats;
  }, [filteredData]);

  // 차트 데이터
  const chartData = useMemo(() => {
    return filteredData.map((item, index) => ({
      time: item.timestamp, // 원본 timestamp 저장
      date: item.timestamp, // 원본 timestamp 저장
      valence: Math.round(item.vadScore.valence * 100),
      arousal: Math.round(item.vadScore.arousal * 100),
      dominance: Math.round(item.vadScore.dominance * 100),
      emotion: item.emotion,
      confidence: Math.round(item.confidence * 100),
      index
    }));
  }, [filteredData]);

  // 감정 분포 데이터
  const pieData = useMemo(() => {
    return Object.entries(emotionStats.emotions).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: emotionColors[emotion as keyof typeof emotionColors] || '#6B7280'
    }));
  }, [emotionStats.emotions]);

  // VAD 레이더 차트 데이터
  const radarData = useMemo(() => [
    {
      subject: '긍정성',
      A: Math.round(emotionStats.averageValence * 100),
      fullMark: 100,
    },
    {
      subject: '각성도',
      A: Math.round(emotionStats.averageArousal * 100),
      fullMark: 100,
    },
    {
      subject: '지배성',
      A: Math.round(emotionStats.averageDominance * 100),
      fullMark: 100,
    },
  ], [emotionStats]);

  // CBT 추천
  const cbtRecommendations = useMemo(() => {
    const recommendations = [];
    
    if (emotionStats.averageValence < 0.4) {
      recommendations.push({
        title: '긍정적 사고 전환',
        description: '부정적 사고를 객관적으로 재구성해보세요',
        icon: Brain,
        color: 'text-green-600'
      });
    }
    
    if (emotionStats.averageArousal > 0.7) {
      recommendations.push({
        title: '이완 기법',
        description: '심호흡과 근육 이완으로 스트레스를 줄여보세요',
        icon: Heart,
        color: 'text-blue-600'
      });
    }
    
    if (emotionStats.trend === 'declining') {
      recommendations.push({
        title: '행동 활성화',
        description: '작은 목표부터 시작하여 성취감을 느껴보세요',
        icon: Target,
        color: 'text-purple-600'
      });
    }

    return recommendations;
  }, [emotionStats]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">고급 감정 분석</h2>
          <p className="text-gray-600">상세한 감정 패턴과 CBT 추천을 확인하세요</p>
        </div>
        
        <div className="flex space-x-2">
          {(['day', 'week', 'month'] as const).map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'day' ? '일' : period === 'week' ? '주' : '월'}
            </Button>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">총 분석</p>
                <p className="text-2xl font-bold text-gray-900">{emotionStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">평균 긍정성</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(emotionStats.averageValence * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">주요 감정</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {emotionStats.mostFrequent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">트렌드</p>
                <p className={`text-2xl font-bold ${
                  emotionStats.trend === 'improving' ? 'text-green-600' :
                  emotionStats.trend === 'declining' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {emotionStats.trend === 'improving' ? '개선' :
                   emotionStats.trend === 'declining' ? '하락' : '안정'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 선택 */}
      <div className="flex justify-center space-x-2">
        {(['line', 'radar', 'area'] as const).map(chartType => (
          <Button
            key={chartType}
            variant={selectedChart === chartType ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart(chartType)}
          >
            <React.Fragment>
              {chartType === 'line' ? <BarChart3 className="w-4 h-4 mr-2" /> :
               chartType === 'radar' ? <Radar className="w-4 h-4 mr-2" /> :
               <PieChart className="w-4 h-4 mr-2" />}
              {chartType === 'line' ? '선형' : chartType === 'radar' ? '레이더' : '영역'}
            </React.Fragment>
          </Button>
        ))}
      </div>

      {/* 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>감정 변화 추이</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* @ts-ignore */}
          <Charts.TrendChart selectedChart={selectedChart} chartData={chartData} radarData={radarData} />
        </CardContent>
      </Card>

      {/* 감정 분포 파이 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-pink-600" />
              <span>감정 분포</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* @ts-ignore */}
            <Charts.EmotionPie data={pieData} />
          </CardContent>
        </Card>

        {/* CBT 추천 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>CBT 추천</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cbtRecommendations.length > 0 ? (
                cbtRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <rec.icon className={`w-5 h-5 ${rec.color} mt-0.5`} />
                    <div>
                      <div className="font-medium text-gray-900">{rec.title}</div>
                      <div className="text-sm text-gray-600">{rec.description}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>현재 감정 상태가 양호합니다!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 감정 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>상세 감정 기록</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredData.slice(-10).reverse().map((emotion, index) => (
              <div 
                key={emotion.id} 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentEmotion?.id === emotion.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => onEmotionSelect?.(emotion)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {emotionEmojis[emotion.emotion as keyof typeof emotionEmojis] || '😐'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {emotion.emotion}
                    </div>
                    <div className="text-sm text-gray-600">
                      <SafeTimeDisplay timestamp={emotion.timestamp} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    VAD: {Math.round(emotion.vadScore.valence * 100)}/{Math.round(emotion.vadScore.arousal * 100)}/{Math.round(emotion.vadScore.dominance * 100)}
                  </div>
                  <div className="text-xs text-gray-500">
                    신뢰도: {Math.round(emotion.confidence * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 