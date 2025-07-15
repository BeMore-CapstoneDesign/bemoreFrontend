'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Target,
  Lightbulb,
  Clock,
  Calendar,
  Zap,
  Heart,
  Brain,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis, emotionColors } from '../../utils/emotion';

interface AdvancedEmotionDashboardProps {
  emotionHistory: EmotionAnalysis[];
  currentEmotion?: EmotionAnalysis;
  onEmotionSelect?: (emotion: EmotionAnalysis) => void;
}

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
    
    return emotionHistory.filter(item => 
      now.getTime() - new Date(item.timestamp).getTime() < periods[selectedPeriod]
    );
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
      stats.emotions[item.emotion] = (stats.emotions[item.emotion] || 0) + 1;
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
      time: new Date(item.timestamp).toLocaleTimeString(),
      date: new Date(item.timestamp).toLocaleDateString(),
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
              <Zap className={`w-5 h-5 ${
                emotionStats.trend === 'improving' ? 'text-green-600' :
                emotionStats.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`} />
              <div>
                <p className="text-sm text-gray-600">감정 트렌드</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emotionStats.trend === 'improving' ? '↗' : 
                   emotionStats.trend === 'declining' ? '↘' : '→'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAD 점수 변화 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>VAD 점수 변화</span>
              </div>
              <div className="flex space-x-1">
                {(['line', 'area', 'radar'] as const).map(type => (
                  <Button
                    key={type}
                    variant={selectedChart === type ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedChart(type)}
                  >
                    {type === 'line' ? '선' : type === 'area' ? '영역' : '레이더'}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {selectedChart === 'radar' ? (
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="VAD 점수"
                    dataKey="A"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              ) : selectedChart === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="valence" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="arousal" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="dominance" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="valence" stroke="#10B981" name="긍정성" strokeWidth={2} />
                  <Line type="monotone" dataKey="arousal" stroke="#3B82F6" name="각성도" strokeWidth={2} />
                  <Line type="monotone" dataKey="dominance" stroke="#8B5CF6" name="지배성" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 감정 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              <span>감정 분포</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CBT 추천 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span>CBT 추천</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cbtRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cbtRecommendations.map((rec, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <rec.icon className={`w-5 h-5 ${rec.color}`} />
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">현재 감정 상태가 양호합니다! 계속해서 긍정적인 마음을 유지하세요.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 기록 */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>상세 기록</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredData.slice().reverse().map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentEmotion?.id === item.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onEmotionSelect?.(item)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {emotionEmojis[item.emotion as keyof typeof emotionEmojis] || '😐'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {item.emotion}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      신뢰도: {Math.round(item.confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      V: {Math.round(item.vadScore.valence * 100)}% | 
                      A: {Math.round(item.vadScore.arousal * 100)}% | 
                      D: {Math.round(item.vadScore.dominance * 100)}%
                    </div>
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