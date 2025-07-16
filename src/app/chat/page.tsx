'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Send, 
  Bot, 
  User as UserIcon,
  Sparkles,
  Clock,
  X,
  FileText,
  TrendingUp,
  Lightbulb,
  Heart
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { apiService } from '../../services/api';
import { PDFService } from '../../services/pdfService';
import { ChatMessage, AnalysisReport } from '../../types';
import { emotionEmojis } from '../../utils/emotion';
import { useRouter } from 'next/navigation';

// 분석 리포트 모달 컴포넌트
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AnalysisReport | null;
}

function ReportModal({ isOpen, onClose, report }: ReportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  // router는 상위에서 받아옴

  const handlePDFDownload = async () => {
    if (!report) return;
    
    try {
      // PDF 생성 및 다운로드
      await PDFService.generateReportPDF(report, {});
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 홈으로 이동 핸들러 (모달 닫기 + 홈 이동)
  // const handleGoHome = () => {
  //   onClose?.(); // 혹시 있을 cleanup
  //   onClose?.(); // 혹시 있을 cleanup
  // };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">대화 분석 리포트</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-violet-50 rounded-full transition-colors"
            aria-label="홈으로"
          >
            <X className="w-6 h-6 text-violet-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 세션 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>세션 요약</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.floor(report.sessionDuration / 60)}분
                  </div>
                  <div className="text-gray-600">대화 시간</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {report.totalMessages}
                  </div>
                  <div className="text-gray-600">총 메시지</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 감정 변화 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>감정 변화</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600 mb-2">
                  {report.emotionTrend}
                </div>
                <div className="text-gray-600">
                  대화를 통해 감정 상태가 개선되었습니다
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주요 인사이트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>주요 인사이트</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 권장사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span>권장사항</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* CBT 기법 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>추천 CBT 기법</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.cbtTechniques.map((technique, index) => (
                  <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                    <div className="font-medium text-indigo-700">{technique}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t">
          <Button
            onClick={onClose}
            variant="secondary"
            className="px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md"
          >
            홈으로
          </Button>
          <Button
            onClick={handlePDFDownload}
            className="px-6 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 font-semibold"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF 저장
          </Button>
        </div>
      </div>
    </div>
  );
}

// 분석 로딩 UI 컴포넌트
function AnalysisLoadingUI() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 rounded-lg p-8 max-w-lg w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* 클래식 스피너 */}
          <div className="w-20 h-20 mx-auto mb-8 relative">
            <div className="w-full h-full border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          
          {/* 클래식 타이틀 */}
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold text-indigo-800 mb-2 tracking-wide">대화 분석 중</h3>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-indigo-600 to-transparent mx-auto"></div>
          </div>
          
          <p className="text-indigo-700 mb-8 font-medium leading-relaxed">
            AI가 대화 내용을 분석하고<br />
            맞춤형 리포트를 생성하고 있어요
          </p>
          
          {/* 클래식 진행 단계 */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full animate-pulse shadow-md"></div>
              <span className="text-sm font-medium text-indigo-800 tracking-wide">감정 변화 패턴 분석</span>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full animate-pulse shadow-md" style={{ animationDelay: '0.7s' }}></div>
              <span className="text-sm font-medium text-indigo-800 tracking-wide">주요 인사이트 추출</span>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full animate-pulse shadow-md" style={{ animationDelay: '1.4s' }}></div>
              <span className="text-sm font-medium text-indigo-800 tracking-wide">CBT 기법 추천</span>
            </div>
          </div>
          
          {/* 클래식 장식 요소 */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 클라이언트에서만 안전하게 시간 포맷
function MessageTime({ timestamp }: { timestamp: string }) {
  const [localTime, setLocalTime] = useState('');
  useEffect(() => {
    setLocalTime(new Date(timestamp).toLocaleTimeString());
  }, [timestamp]);
  return <span>{localTime}</span>;
}

// 안전한 고유 ID 생성 함수
function generateUniqueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const { currentSession, addChatMessage, setLoading, isLoading, startSession, endSession } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 메시지
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: `안녕하세요! 저는 BeMore의 AI 상담사입니다. 🌟\n\n오늘 하루는 어떠셨나요? 어떤 감정을 느끼고 계신지 편하게 이야기해주세요.\n\n저는 여러분의 감정을 이해하고 함께 탐색해드릴 수 있어요:\n• 현재 감정 상태에 대한 공감과 이해\n• CBT 기법을 통한 건강한 사고 패턴 전환\n• 일상에서 실천할 수 있는 스트레스 관리법\n• 긍정적이고 균형잡힌 관점으로의 변화\n\n무엇이든 편하게 말씀해주세요. 여러분의 이야기를 듣고 있어요! 💙`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // 대화 분석 리포트 생성
  const generateAnalysisReport = async (): Promise<AnalysisReport> => {
    const sessionDuration = currentSession?.startTime 
      ? (new Date().getTime() - new Date(currentSession.startTime).getTime()) / 1000
      : 0;
    
    const totalMessages = messages.length;
    
    // 감정 변화 분석
    const emotionHistory = currentSession?.emotionHistory || [];
    const emotionTrend = emotionHistory.length > 1 
      ? emotionHistory[0].vadScore.valence < emotionHistory[emotionHistory.length - 1].vadScore.valence
        ? '개선됨'
        : emotionHistory[0].vadScore.valence > emotionHistory[emotionHistory.length - 1].vadScore.valence
        ? '하락'
        : '안정적'
      : '변화 없음';

    // 대화 내용 분석
    const userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content);
    const assistantMessages = messages.filter(msg => msg.role === 'assistant').map(msg => msg.content);
    
    // 감정 키워드 분석
    const emotionKeywords = {
      stress: ['스트레스', '힘들어', '부담', '압박', '짜증'],
      anxiety: ['불안', '걱정', '긴장', '두려움', '불안해'],
      anger: ['화나', '분노', '짜증', '열받', '화가'],
      sadness: ['우울', '슬퍼', '우울해', '슬픔', '우울함'],
      happiness: ['기뻐', '좋아', '행복', '즐거워', '신나']
    };

    // 사용자 메시지에서 감정 키워드 찾기
    const detectedEmotions: string[] = [];
    userMessages.forEach(message => {
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.some(keyword => message.includes(keyword))) {
          detectedEmotions.push(emotion);
        }
      });
    });

    // 주요 감정 결정
    const emotionCounts = detectedEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const primaryEmotion = Object.keys(emotionCounts).length > 0 
      ? Object.entries(emotionCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
      : 'neutral';

    // 대화 주제 분석
    const topics = {
      work: ['일', '직장', '업무', '회사', '프로젝트'],
      relationship: ['관계', '친구', '가족', '연인', '사람'],
      health: ['건강', '몸', '피로', '잠', '운동'],
      future: ['미래', '계획', '목표', '꿈', '앞으로']
    };

    const detectedTopics = [];
    userMessages.forEach(message => {
      Object.entries(topics).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => message.includes(keyword))) {
          detectedTopics.push(topic);
        }
      });
    });

    // 인사이트 생성
    const insights = [];
    if (detectedEmotions.includes('stress')) {
      insights.push('스트레스 상황에 대한 대처가 필요해 보입니다');
    }
    if (detectedEmotions.includes('anxiety')) {
      insights.push('불안감을 표현하는 빈도가 높았습니다');
    }
    if (detectedEmotions.includes('anger')) {
      insights.push('분노 감정에 대한 관리가 필요합니다');
    }
    if (userMessages.length > 5) {
      insights.push('감정 표현이 활발하고 솔직했습니다');
    }
    if (insights.length === 0) {
      insights.push('전반적으로 안정적인 감정 상태를 보여줍니다');
    }

    // 권장사항 생성
    const recommendations = [];
    if (primaryEmotion === 'stress') {
      recommendations.push('정기적인 마음챙김 연습을 권장합니다');
      recommendations.push('스트레스 해소를 위한 취미 활동을 찾아보세요');
    } else if (primaryEmotion === 'anxiety') {
      recommendations.push('호흡 운동과 명상을 통해 불안을 관리해보세요');
      recommendations.push('일상에서 작은 성취감을 느낄 수 있는 활동을 해보세요');
    } else if (primaryEmotion === 'anger') {
      recommendations.push('분노 관리 기법을 연습해보세요');
      recommendations.push('감정을 표현하는 건강한 방법을 찾아보세요');
    } else if (primaryEmotion === 'sadness') {
      recommendations.push('주변 사람들과의 소통을 늘려보세요');
      recommendations.push('전문가의 도움을 받는 것을 고려해보세요');
    } else {
      recommendations.push('일상에서 작은 감사 표현을 해보세요');
      recommendations.push('긍정적인 감정을 유지하는 활동을 계속해보세요');
    }

    // CBT 기법 추천
    const cbtTechniques = [];
    if (primaryEmotion === 'stress' || primaryEmotion === 'anxiety') {
      cbtTechniques.push('인지 재구성');
      cbtTechniques.push('점진적 근육 이완법');
    } else if (primaryEmotion === 'anger') {
      cbtTechniques.push('분노 관리 기법');
      cbtTechniques.push('사고 중단법');
    } else if (primaryEmotion === 'sadness') {
      cbtTechniques.push('행동 활성화');
      cbtTechniques.push('감사 일기');
    } else {
      cbtTechniques.push('사고 기록');
      cbtTechniques.push('문제 해결 기법');
    }

    return {
      sessionDuration,
      totalMessages,
      emotionTrend,
      keyInsights: insights,
      recommendations,
      cbtTechniques
    };
  };

  // 채팅 종료 처리
  const handleEndChat = async () => {
    if (messages.length <= 1) {
      alert('대화 내용이 없습니다. 먼저 대화를 나눠보세요.');
      return;
    }
    
    // 분석 로딩 시작
    setReportLoading(true);
    setLoading(true);
    
    try {
      // 로딩 시작 시간 기록
      const startTime = Date.now();
      const minLoadingTime = 5000; // 최소 5초
      
      // 실제 분석 수행
      const report = await generateAnalysisReport();
      
      // 실제 분석에 걸린 시간 계산
      const actualTime = Date.now() - startTime;
      
      // 최소 로딩 시간 보장 (5초)
      if (actualTime < minLoadingTime) {
        const remainingTime = minLoadingTime - actualTime;
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      setAnalysisReport(report);
      setShowReportModal(true);
      endSession();
    } catch (error) {
      console.error('리포트 생성 실패:', error);
      alert('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setReportLoading(false);
      setLoading(false);
    }
  };

  // 채팅 전송 함수
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setLoading(true);

    try {
      // 최근 감정 분석 결과를 컨텍스트로 전달
      const recentEmotion = currentSession?.emotionHistory[currentSession.emotionHistory.length - 1];
      const response = await apiService.sendChatMessage(
        inputMessage,
        currentSession?.id || undefined,
        recentEmotion
      );
      setMessages(prev => [...prev, response]);
      addChatMessage(response);
    } catch (error) {
      console.error('채팅 전송 실패:', error);
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const suggestions = [
    '기분이 안 좋아요 🥲',
    '스트레스가 너무 쌓여서 힘들어요 😮‍💨',
    '불안하고 걱정이 많아요 😰',
    '화가 나는 일이 있어서 속상해요 😤',
    '우울한 기분이에요 😔',
  ];

  // 홈으로 이동 핸들러 (모달 닫기 + 홈 이동)
  const handleGoHome = () => {
    setShowReportModal(false);
    router.push('/');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">AI 감정 상담</h1>
          <p className="text-sm md:text-base text-gray-600">
            BeMore AI와 대화하며 감정을 탐색하고 CBT 피드백을 받아보세요
          </p>
        </div>

        {/* 채팅 컨테이너 */}
        <Card className="h-[70vh] min-h-[500px] max-h-[800px] flex flex-col">
          <CardHeader className="border-b border-gray-200 flex-shrink-0">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span>BeMore AI 상담사</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 min-h-0">
            {/* 메시지 영역 */}
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <Bot className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        )}
                        {message.role === 'user' && (
                          <UserIcon className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="whitespace-pre-wrap break-words overflow-hidden chat-message-text">{message.content}</div>
                          <div className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                          }`}>
                            <MessageTime timestamp={message.timestamp} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-3">
                      <Bot className="w-5 h-5 text-indigo-600" />
                      <div>
                        <div className="text-sm text-gray-700 mb-1">상담사가 답변을 준비하고 있어요...</div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex space-x-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* 대화 종료 버튼 */}
                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEndChat}
                    disabled={messages.length <= 1 || reportLoading}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {reportLoading ? '리포트 생성 중...' : '대화 종료'}
                  </Button>
                </div>

                {/* 제안 메시지 */}
                {messages.length <= 1 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">빠른 시작:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 리포트 모달 */}
        <ReportModal
          isOpen={showReportModal}
          onClose={handleGoHome}
          report={analysisReport}
        />

        {/* 분석 로딩 UI */}
        {reportLoading && <AnalysisLoadingUI />}
      </div>
    </Layout>
  );
} 