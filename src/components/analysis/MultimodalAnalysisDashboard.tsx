'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Activity, 
  TrendingUp, 
  Brain, 
  Target,
  Zap,
  BarChart3,
  Eye,
  Mic,
  FileText
} from 'lucide-react';
import { VADScore } from '../../types';
import RealTimeFacialAnalysis from './RealTimeFacialAnalysis';
import RealTimeVoiceAnalysis from './RealTimeVoiceAnalysis';

interface MultimodalData {
  type: 'facial' | 'voice' | 'text';
  vadScore: VADScore;
  confidence: number;
  timestamp: number;
}

interface MultimodalAnalysisDashboardProps {
  onIntegratedEmotionChange?: (vadScore: VADScore, confidence: number) => void;
}

export default function MultimodalAnalysisDashboard({ 
  onIntegratedEmotionChange 
}: MultimodalAnalysisDashboardProps) {
  const [multimodalData, setMultimodalData] = useState<MultimodalData[]>([]);
  const [integratedVAD, setIntegratedVAD] = useState<VADScore>({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
  const [integratedConfidence, setIntegratedConfidence] = useState(0);
  const [activeModalities, setActiveModalities] = useState<Set<string>>(new Set());
  const [analysisHistory, setAnalysisHistory] = useState<VADScore[]>([]);

  // 신뢰도 가중치 (각 모달리티별)
  const modalityWeights = {
    facial: 0.4,  // 표정 분석이 가장 신뢰도 높음
    voice: 0.35,  // 음성 분석
    text: 0.25    // 텍스트 분석
  };

  // 멀티모달 데이터 업데이트
  const updateMultimodalData = useCallback((type: 'facial' | 'voice' | 'text', vadScore: VADScore, confidence: number) => {
    const newData: MultimodalData = {
      type,
      vadScore,
      confidence,
      timestamp: Date.now()
    };

    setMultimodalData(prev => {
      const filtered = prev.filter(data => data.type !== type);
      return [...filtered, newData];
    });

    setActiveModalities(prev => new Set([...prev, type]));
  }, []);

  // 통합 VAD 점수 계산
  const calculateIntegratedVAD = useCallback((data: MultimodalData[]): { vadScore: VADScore; confidence: number } => {
    if (data.length === 0) {
      return { 
        vadScore: { valence: 0.5, arousal: 0.5, dominance: 0.5 }, 
        confidence: 0 
      };
    }

    let totalWeightedValence = 0;
    let totalWeightedArousal = 0;
    let totalWeightedDominance = 0;
    let totalWeight = 0;
    let totalConfidence = 0;

    data.forEach(item => {
      const weight = modalityWeights[item.type] * item.confidence;
      totalWeightedValence += item.vadScore.valence * weight;
      totalWeightedArousal += item.vadScore.arousal * weight;
      totalWeightedDominance += item.vadScore.dominance * weight;
      totalWeight += weight;
      totalConfidence += item.confidence;
    });

    if (totalWeight === 0) {
      return { 
        vadScore: { valence: 0.5, arousal: 0.5, dominance: 0.5 }, 
        confidence: 0 
      };
    }

    const integratedVAD: VADScore = {
      valence: totalWeightedValence / totalWeight,
      arousal: totalWeightedArousal / totalWeight,
      dominance: totalWeightedDominance / totalWeight
    };

    const averageConfidence = totalConfidence / data.length;

    return { vadScore: integratedVAD, confidence: averageConfidence };
  }, []);

  // 통합 점수 업데이트
  useEffect(() => {
    const { vadScore, confidence } = calculateIntegratedVAD(multimodalData);
    setIntegratedVAD(vadScore);
    setIntegratedConfidence(confidence);

    if (onIntegratedEmotionChange) {
      onIntegratedEmotionChange(vadScore, confidence);
    }

    // 분석 히스토리에 추가
    setAnalysisHistory(prev => [...prev.slice(-9), vadScore]);
  }, [multimodalData, calculateIntegratedVAD, onIntegratedEmotionChange]);

  // 감정 상태 평가
  const getEmotionStatus = () => {
    const { valence, arousal } = integratedVAD;
    
    if (valence > 0.7 && arousal > 0.6) return { status: 'excited', color: 'text-green-600', emoji: '😊' };
    if (valence > 0.6 && arousal < 0.4) return { status: 'calm', color: 'text-blue-600', emoji: '😌' };
    if (valence < 0.3 && arousal > 0.6) return { status: 'angry', color: 'text-red-600', emoji: '😠' };
    if (valence < 0.3 && arousal < 0.4) return { status: 'sad', color: 'text-gray-600', emoji: '😔' };
    return { status: 'neutral', color: 'text-gray-500', emoji: '😐' };
  };

  const emotionStatus = getEmotionStatus();

  // 활성 모달리티 개수
  const activeCount = activeModalities.size;

  return (
    <div className="space-y-6">
      {/* 통합 분석 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span>멀티모달 통합 분석</span>
            <div className="ml-auto flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Eye className={`w-4 h-4 ${activeModalities.has('facial') ? 'text-green-600' : 'text-gray-400'}`} />
                <Mic className={`w-4 h-4 ${activeModalities.has('voice') ? 'text-green-600' : 'text-gray-400'}`} />
                <FileText className={`w-4 h-4 ${activeModalities.has('text') ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <span className="text-sm text-gray-500">
                {activeCount}/3 모달리티 활성
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 통합 감정 상태 */}
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-lg">
              <div className="text-4xl mb-2">{emotionStatus.emoji}</div>
              <div className={`text-lg font-bold ${emotionStatus.color} capitalize`}>
                {emotionStatus.status}
              </div>
              <div className="text-sm text-gray-600">
                통합 신뢰도: {Math.round(integratedConfidence * 100)}%
              </div>
            </div>

            {/* 통합 VAD 점수 */}
            <div className="col-span-2 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>긍정성 (Valence)</span>
                  <span className="text-green-600 font-bold">
                    {Math.round(integratedVAD.valence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${integratedVAD.valence * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>각성도 (Arousal)</span>
                  <span className="text-blue-600 font-bold">
                    {Math.round(integratedVAD.arousal * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${integratedVAD.arousal * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>지배성 (Dominance)</span>
                  <span className="text-purple-600 font-bold">
                    {Math.round(integratedVAD.dominance * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${integratedVAD.dominance * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개별 모달리티 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 실시간 표정 분석 */}
        <RealTimeFacialAnalysis
          onEmotionChange={(vadScore, confidence) => 
            updateMultimodalData('facial', vadScore, confidence)
          }
          isActive={true}
        />

        {/* 실시간 음성 분석 */}
        <RealTimeVoiceAnalysis
          onEmotionChange={(vadScore, confidence) => 
            updateMultimodalData('voice', vadScore, confidence)
          }
          isActive={true}
        />
      </div>

      {/* 모달리티별 신뢰도 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <span>모달리티별 신뢰도</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(modalityWeights).map(([type, weight]) => {
              const data = multimodalData.find(d => d.type === type);
              const isActive = activeModalities.has(type);
              
              return (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {type === 'facial' && <Eye className="w-5 h-5 text-indigo-600" />}
                    {type === 'voice' && <Mic className="w-5 h-5 text-indigo-600" />}
                    {type === 'text' && <FileText className="w-5 h-5 text-indigo-600" />}
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {isActive ? Math.round((data?.confidence || 0) * 100) : 0}%
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    가중치: {Math.round(weight * 100)}%
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isActive ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${isActive ? (data?.confidence || 0) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 분석 히스토리 */}
      {analysisHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>감정 변화 추이</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end space-x-1">
              {analysisHistory.map((vad, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                  <div className="w-full bg-green-200 rounded-t" style={{ height: `${vad.valence * 100}%` }} />
                  <div className="w-full bg-blue-200 rounded-t" style={{ height: `${vad.arousal * 100}%` }} />
                  <div className="w-full bg-purple-200 rounded-t" style={{ height: `${vad.dominance * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>V</span>
              <span>A</span>
              <span>D</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 