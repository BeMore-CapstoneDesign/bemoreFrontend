'use client';

import React from 'react';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  BarChart3, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Smile,
  Activity
} from 'lucide-react';
import { useAppStores } from '../modules/stores';
import { emotionEmojis, getEmotionAdvice } from '../utils/emotion';
import { withErrorBoundary } from '../components/hoc/withErrorBoundary';
import { withLoading } from '../components/hoc/withLoading';
import { EmotionAnalysis } from '../types';

function HomePage() {
  const { session, ui, currentUser } = useAppStores();
  
  // 오늘의 감정 요약 데이터 (실제로는 API에서 가져올 예정)
  const todayEmotion = {
    primary: ui.currentEmotion,
    count: session.currentSession?.emotionHistory.length || 0,
    averageValence: session.getAverageValence(),
    trend: session.getEmotionTrend(),
  };

  const quickActions = [
    {
      title: '감정 분석',
      description: '표정, 음성, 텍스트로 감정을 분석해보세요',
      icon: BarChart3,
      href: '/analysis',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'AI 채팅',
      description: 'Gemini와 대화하며 감정을 탐색해보세요',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-violet-500 to-violet-600',
    },
    {
      title: '히스토리',
      description: '지난 감정 변화를 확인해보세요',
      icon: TrendingUp,
      href: '/history',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            안녕하세요, {currentUser?.name || '사용자'}님! 👋
          </h1>
          <p className="text-xl text-gray-600">
            오늘도 당신의 감정을 더 깊이 이해해보세요
          </p>
        </div>

        {/* 오늘의 감정 요약 */}
        <Card>
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
                <div className="text-4xl mb-2">{emotionEmojis[todayEmotion.primary]}</div>
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
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
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

        {/* 빠른 액션 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">빠른 시작</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="text-center p-6">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        {session.currentSession && session.currentSession.emotionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>최근 활동</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.currentSession.emotionHistory.slice(-3).reverse().map((analysis: EmotionAnalysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {emotionEmojis[analysis.emotion as keyof typeof emotionEmojis] || '😐'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {analysis.emotion}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(analysis.timestamp).toLocaleTimeString()}
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
            <h2 className="text-2xl font-bold mb-4">
              지금 바로 감정 분석을 시작해보세요
            </h2>
            <p className="text-indigo-100 mb-6">
              AI 기술을 활용한 정확한 감정 분석과 CBT 피드백을 받아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analysis">
                <Button variant="secondary" size="lg">
                  분석 시작하기
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50">
                  AI 채팅 시작
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
              </div>
      </Layout>
    );
  }

// 고차 컴포넌트로 감싸기
export default withErrorBoundary(withLoading(HomePage));
