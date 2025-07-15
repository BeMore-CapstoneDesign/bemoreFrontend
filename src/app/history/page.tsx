'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  History, 
  Download, 
  TrendingUp,
  BarChart3,
  FileText,
  Search
} from 'lucide-react';
import { useAppStores } from '../../modules/stores';
import { apiService } from '../../services/api';
import { EmotionAnalysis } from '../../types';
import { emotionEmojis, calculateEmotionTrend } from '../../utils/emotion';
import AdvancedEmotionDashboard from '../../components/analysis/AdvancedEmotionDashboard';
import RealTimeEmotionMonitor from '../../components/analysis/RealTimeEmotionMonitor';
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
} from 'recharts';

export default function HistoryPage() {
  const { user, ui } = useAppStores();
  const [history, setHistory] = useState<EmotionAnalysis[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<EmotionAnalysis[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [selectedEmotionDetail, setSelectedEmotionDetail] = useState<EmotionAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<'basic' | 'advanced' | 'realtime'>('basic');

  const loadHistory = useCallback(async () => {
    if (!user.user?.id) return;
    
    ui.setLoading(true);
    try {
      const data = await apiService.getSessionHistory(user.user.id);
      setHistory(data);
    } catch (error) {
      console.error('히스토리 로드 실패:', error);
    } finally {
      ui.setLoading(false);
    }
  }, [user.user?.id, ui]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filterHistory = useCallback(() => {
    let filtered = [...history];

    // 기간 필터
    const now = new Date();
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.timestamp) >= weekAgo);
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.timestamp) >= monthAgo);
    }

    // 감정 필터
    if (selectedEmotion !== 'all') {
      filtered = filtered.filter(item => item.emotion === selectedEmotion);
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.emotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cbtFeedback.cognitiveDistortion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  }, [history, selectedPeriod, selectedEmotion, searchTerm]);

  useEffect(() => {
    filterHistory();
  }, [filterHistory]);

  const downloadReport = async () => {
    if (!user.user?.id) return;
    
    try {
      const blob = await apiService.generateSessionReport('current-session');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bemore-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('리포트 다운로드 실패:', error);
      alert('리포트 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 차트 데이터 준비
  const chartData = filteredHistory.map((item: EmotionAnalysis) => ({
    date: new Date(item.timestamp).toLocaleDateString(),
    valence: Math.round(item.vadScore.valence * 100),
    arousal: Math.round(item.vadScore.arousal * 100),
    dominance: Math.round(item.vadScore.dominance * 100),
    emotion: item.emotion,
  }));

  const emotionCounts = filteredHistory.reduce((acc, item) => {
    acc[item.emotion] = (acc[item.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(emotionCounts).map(([emotion, count]) => ({
    name: emotion,
    value: count,
  }));

  const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#6B7280', '#8B5CF6', '#06B6D4'];

  const trend = calculateEmotionTrend(filteredHistory);

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">감정 히스토리</h1>
          <p className="text-xl text-gray-600">
            지난 감정 변화를 확인하고 인사이트를 얻어보세요
          </p>
          
          {/* 뷰 모드 선택 */}
          <div className="flex justify-center space-x-2 mt-4">
            {(['basic', 'advanced', 'realtime'] as const).map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode)}
              >
                {mode === 'basic' ? '기본' : mode === 'advanced' ? '고급' : '실시간'}
              </Button>
            ))}
          </div>
        </div>

        {/* 뷰 모드에 따른 렌더링 */}
        {viewMode === 'basic' && (
          <>
            {/* 필터 및 검색 */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* 기간 필터 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기간
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'all')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="week">최근 1주일</option>
                      <option value="month">최근 1개월</option>
                      <option value="all">전체</option>
                    </select>
                  </div>

                  {/* 감정 필터 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      감정
                    </label>
                    <select
                      value={selectedEmotion}
                      onChange={(e) => setSelectedEmotion(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">전체 감정</option>
                      <option value="happy">기쁨</option>
                      <option value="sad">슬픔</option>
                      <option value="angry">분노</option>
                      <option value="anxious">불안</option>
                      <option value="neutral">중립</option>
                      <option value="excited">신남</option>
                      <option value="calm">차분함</option>
                    </select>
                  </div>

                  {/* 검색 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      검색
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="감정이나 내용 검색..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* 리포트 다운로드 */}
                  <div className="flex items-end">
                    <Button onClick={downloadReport} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      PDF 리포트
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 고급 분석 대시보드 */}
        {viewMode === 'advanced' && (
          <AdvancedEmotionDashboard
            emotionHistory={filteredHistory}
            currentEmotion={selectedEmotionDetail || undefined}
            onEmotionSelect={setSelectedEmotionDetail}
          />
        )}

        {/* 실시간 모니터링 */}
        {viewMode === 'realtime' && (
          <RealTimeEmotionMonitor
            currentEmotion={filteredHistory[filteredHistory.length - 1]}
            recentEmotions={filteredHistory.slice(-10)}
            onEmotionChange={setSelectedEmotionDetail}
          />
        )}

        {/* 기본 뷰에서만 통계 요약과 차트 표시 */}
        {viewMode === 'basic' && (
          <>
            {/* 통계 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {filteredHistory.length}
                  </div>
                  <div className="text-sm text-gray-600">총 분석 횟수</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {filteredHistory.length > 0 
                      ? Math.round(filteredHistory.reduce((sum, item) => sum + item.vadScore.valence, 0) / filteredHistory.length * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600">평균 긍정성</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Object.keys(emotionCounts).length}
                  </div>
                  <div className="text-sm text-gray-600">감정 다양성</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    trend.trend === 'improving' ? 'text-green-600' : 
                    trend.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.trend === 'improving' ? '↗' : 
                     trend.trend === 'declining' ? '↘' : '→'}
                  </div>
                  <div className="text-sm text-gray-600">감정 추세</div>
                </CardContent>
              </Card>
            </div>

            {/* 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* VAD 점수 변화 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span>VAD 점수 변화</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="valence" stroke="#10B981" name="긍정성" />
                      <Line type="monotone" dataKey="arousal" stroke="#3B82F6" name="각성도" />
                      <Line type="monotone" dataKey="dominance" stroke="#8B5CF6" name="지배성" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 감정 분포 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
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
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* 기본 뷰에서만 상세 기록 표시 */}
        {viewMode === 'basic' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>상세 기록</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>아직 분석 기록이 없습니다.</p>
                  <p className="text-sm">감정 분석을 시작해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {emotionEmojis[item.emotion as keyof typeof emotionEmojis] || '😐'}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{item.emotion}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">신뢰도</div>
                          <div className="font-medium">{Math.round(item.confidence * 100)}%</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">긍정성</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${item.vadScore.valence * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(item.vadScore.valence * 100)}%
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">각성도</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${item.vadScore.arousal * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(item.vadScore.arousal * 100)}%
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">지배성</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${item.vadScore.dominance * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(item.vadScore.dominance * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 mb-1">CBT 피드백</div>
                        <div className="text-sm text-gray-700">
                          {item.cbtFeedback.cognitiveDistortion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 