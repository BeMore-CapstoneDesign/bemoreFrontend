'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '../components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { 
  BarChart3, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Smile,
  Activity,
  Sparkles,
  Heart,
  Target,
  Clock,
  Brain,
  Bot
} from 'lucide-react';
import { useAppStore } from '../modules/store';
import { emotionEmojis, getEmotionAdvice } from '../utils/emotion';
import { EmotionAnalysis } from '../types';

// 클라이언트에서만 안전하게 시간 포맷
function SafeTimeDisplay({ timestamp }: { timestamp: string }) {
  const [localTime, setLocalTime] = useState('');
  
  useEffect(() => {
    setLocalTime(new Date(timestamp).toLocaleTimeString());
  }, [timestamp]);
  
  return <span>{localTime}</span>;
}

export default function HomePage() {
  const { currentSession, currentEmotion, user } = useAppStore();
  const [showWelcome, setShowWelcome] = useState(true);
  
  // 오늘의 감정 요약 데이터
  const todayEmotion = {
    primary: currentEmotion?.emotion || 'neutral',
    count: currentSession?.emotionHistory.length || 0,
    averageValence: currentSession?.emotionHistory.length > 0 
      ? currentSession.emotionHistory.reduce((sum, item) => sum + item.vadScore.valence, 0) / currentSession.emotionHistory.length
      : 0,
    trend: currentSession?.emotionHistory.length > 1 
      ? currentSession.emotionHistory[0].vadScore.valence < currentSession.emotionHistory[currentSession.emotionHistory.length - 1].vadScore.valence
        ? '개선됨'
        : '안정적'
      : '변화 없음'
  };

  const quickActions = [
    {
      title: '감정 분석',
      description: '텍스트, 음성, 표정을 분석하여 감정 상태를 진단합니다',
      icon: Brain,
      href: '/analysis',
      color: 'from-indigo-500 to-indigo-600',
      gradient: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      features: ['텍스트 분석', '음성 분석', '표정 분석', 'CBT 피드백']
    },
    {
      title: 'AI 상담사',
      description: 'AI와 대화하며 감정을 탐색하고 상담을 받습니다',
      icon: Bot,
      href: '/chat',
      color: 'from-violet-500 to-violet-600',
      gradient: 'from-violet-50 to-violet-100',
      border: 'border-violet-200',
      features: ['대화형 상담', '감정 탐색', '상담 리포트', 'PDF 다운로드']
    },
    {
      title: '히스토리',
      description: '지난 감정 변화와 상담 기록을 확인합니다',
      icon: TrendingUp,
      href: '/history',
      color: 'from-cyan-500 to-cyan-600',
      gradient: 'from-cyan-50 to-cyan-100',
      border: 'border-cyan-200',
      features: ['감정 변화 그래프', '상담 기록', '진행 상황 추적']
    },
  ];

  // 환영 메시지 자동 숨김
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 환영 메시지 */}
          {showWelcome && (
            <FeedbackMessage
              type="info"
              title="BeMore에 오신 것을 환영합니다! 👋"
              message="AI 기반 감정 분석과 CBT 피드백으로 더 나은 마음 건강을 경험해보세요."
              onClose={() => setShowWelcome(false)}
              className="animate-fade-in"
            />
          )}

          {/* 헤더 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              안녕하세요, {user?.name || '사용자'}님! 👋
            </h1>
            <p className="text-xl text-gray-600">
              오늘도 당신의 감정을 더 깊이 이해해보세요
            </p>
          </div>

          {/* 오늘의 감정 요약 */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>오늘의 감정 요약</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 주요 감정 */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{emotionEmojis[todayEmotion.primary as keyof typeof emotionEmojis] || '😐'}</div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {todayEmotion.primary}
                  </div>
                  <div className="text-sm text-gray-600">주요 감정</div>
                </div>

                {/* 분석 횟수 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {todayEmotion.count}
                  </div>
                  <div className="text-sm text-gray-600">오늘 분석 횟수</div>
                </div>

                {/* 평균 긍정성 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(todayEmotion.averageValence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">평균 긍정성</div>
                </div>
              </div>

              {/* 감정 조언 */}
              <div className="mt-6 p-4 bg-white/70 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Smile className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-indigo-900 mb-1">오늘의 조언</div>
                    <div className="text-sm text-indigo-700">
                      {getEmotionAdvice(todayEmotion.primary)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 서비스 소개 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">서비스 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 ${action.border} bg-gradient-to-br ${action.gradient}`}>
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 mb-4 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {action.description}
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {action.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* 최근 분석 결과 */}
          {currentSession?.emotionHistory && currentSession.emotionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>최근 분석 결과</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentSession.emotionHistory.slice(0, 3).map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {emotionEmojis[analysis.emotion as keyof typeof emotionEmojis] || '😐'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {analysis.emotion}
                          </div>
                          <div className="text-sm text-gray-600">
                            <SafeTimeDisplay timestamp={analysis.timestamp} />
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        신뢰도: {Math.round(analysis.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA 섹션 */}
          <Card className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <CardContent className="text-center p-8">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  지금 바로 시작해보세요
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  AI와 함께 감정을 탐색하고 더 나은 마음 건강을 경험하세요
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => window.location.href = '/analysis'}
                    className="bg-white text-indigo-600 hover:bg-gray-100"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    감정 분석 시작
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => window.location.href = '/chat'}
                    className="bg-white text-indigo-600 hover:bg-gray-100"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    AI 상담 시작
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 기능 하이라이트 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">정확한 감정 분석</h3>
              <p className="text-sm text-gray-600">
                AI가 표정, 음성, 텍스트를 종합하여 정확한 감정을 분석합니다
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">CBT 피드백</h3>
              <p className="text-sm text-gray-600">
                인지행동치료 기법을 바탕으로 한 맞춤형 피드백을 제공합니다
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 상담</h3>
              <p className="text-sm text-gray-600">
                언제든지 AI 상담사와 대화하며 감정을 탐색할 수 있습니다
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
