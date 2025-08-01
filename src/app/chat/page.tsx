'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatLayout } from '../../components/layout/ChatLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FeedbackMessage } from '../../components/ui/FeedbackMessage';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
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
  Heart,
  MessageSquare,
  Home
} from 'lucide-react';
import { useAppStore } from '../../modules/store';
import { chatRepository } from '../../services/repositories/chatRepository';
import { emotionRepository } from '../../services/repositories/emotionRepository';
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

  const handlePDFDownload = async () => {
    if (!report) return;
    
    try {
      await PDFService.generateReportPDF(report, {});
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">대화 분석 리포트</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
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
                  <div className="text-lg font-semibold text-purple-800 mb-2">
                    {report.emotionTrend}
                  </div>
                  <p className="text-sm text-purple-700">
                    대화 중 감정 변화 추이
                  </p>
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
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 추천사항 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span>추천사항</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* CBT 기법 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span>추천 CBT 기법</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.cbtTechniques.map((technique, index) => (
                    <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-indigo-800">{technique}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={handlePDFDownload}
                className="flex-1"
                icon={<FileText className="w-4 h-4" />}
              >
                PDF 다운로드
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
                className="flex-1"
                icon={<Home className="w-4 h-4" />}
              >
                홈으로
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 분석 로딩 UI
function AnalysisLoadingUI() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">대화 분석 중</h3>
            <p className="text-gray-600">
              AI가 대화 내용을 분석하고 인사이트를 생성하고 있습니다
            </p>
          </div>
          <ProgressIndicator 
            progress={progress}
            step="분석 진행 중..."
            description="감정 변화와 주요 패턴을 분석하고 있습니다"
            showPercentage={true}
          />
        </div>
      </div>
    </div>
  );
}

// 메시지 시간 표시 컴포넌트
function MessageTime({ timestamp }: { timestamp: string }) {
  const [localTime, setLocalTime] = useState('');
  
  useEffect(() => {
    setLocalTime(new Date(timestamp).toLocaleTimeString());
  }, [timestamp]);
  
  return <span className="text-xs text-gray-500">{localTime}</span>;
}

// 고유 ID 생성 함수
function generateUniqueId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function ChatPage() {
  const router = useRouter();
  const { currentSession, setLoading, isLoading, endSession } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateUniqueId(),
      role: 'assistant',
      content: '안녕하세요! 저는 BeMore AI 상담사입니다. 오늘 어떤 이야기를 나누고 싶으신가요? 편안하게 말씀해주세요.',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 분석 리포트 생성 함수
  const generateAnalysisReport = async (): Promise<AnalysisReport> => {
    const sessionDuration = Math.floor((Date.now() - (currentSession?.startTime?.getTime() || Date.now())) / 1000);
    const totalMessages = messages.length;
    
    // 감정 변화 분석 (간단한 로직)
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    let emotionTrend = '안정적';
    if (userMessages.length > assistantMessages.length) {
      emotionTrend = '적극적';
    } else if (assistantMessages.length > userMessages.length * 1.5) {
      emotionTrend = '신중적';
    }

    // 주요 인사이트 생성
    const insights = [];
    if (userMessages.length > 5) {
      insights.push('대화가 활발하게 이루어졌습니다');
    }
    if (sessionDuration > 300) {
      insights.push('충분한 시간 동안 대화를 나누었습니다');
    }
    if (userMessages.some(msg => msg.content.length > 100)) {
      insights.push('상세한 설명을 통해 깊이 있는 소통이 있었습니다');
    }

    // 추천사항 생성
    const recommendations = [];
    if (emotionTrend === '적극적') {
      recommendations.push('적극적인 소통을 유지하세요');
      recommendations.push('일상에서 작은 성취감을 느낄 수 있는 활동을 해보세요');
    } else if (emotionTrend === '신중적') {
      recommendations.push('차분한 마음가짐을 유지하세요');
      recommendations.push('명상이나 호흡 운동을 시도해보세요');
    } else {
      recommendations.push('균형잡힌 생활을 유지하세요');
      recommendations.push('주변 사람들과의 소통을 늘려보세요');
    }

    // CBT 기법 추천
    const cbtTechniques = ['인지 재구성', '마음챙김 명상', '감사 일기', '행동 활성화'];

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
    
    setReportLoading(true);
    setLoading(true);
    
    try {
      const report = await generateAnalysisReport();
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
      const response = await chatRepository.sendChatMessage({
        message: inputMessage,
        sessionId: currentSession?.id,
        emotionContext: recentEmotion
      });

      const assistantMessage: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        emotionContext: recentEmotion
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      
      // 에러 시 기본 응답
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 홈으로 이동
  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <ChatLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI 상담사와 대화</h1>
            <p className="text-gray-600">자연스러운 대화를 통해 감정을 탐색해보세요</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleGoHome}
              size="sm"
              icon={<Home className="w-4 h-4" />}
            >
              홈으로
            </Button>
            <Button
              variant="outline"
              onClick={handleEndChat}
              size="sm"
              disabled={messages.length <= 1}
              icon={<X className="w-4 h-4" />}
            >
              대화 종료
            </Button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <MessageTime timestamp={message.timestamp} />
                      </div>
                      {message.role === 'user' && (
                        <UserIcon className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 타이핑 표시 */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-indigo-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="md"
                  icon={<Send className="w-4 h-4" />}
                >
                  전송
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 분석 로딩 UI */}
        {reportLoading && <AnalysisLoadingUI />}

        {/* 리포트 모달 */}
        {showReportModal && (
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            report={analysisReport}
          />
        )}
      </div>
    </ChatLayout>
  );
} 