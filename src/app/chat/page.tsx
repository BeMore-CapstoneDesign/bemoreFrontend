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
import { useAppStores } from '../../modules/stores';
import { apiService } from '../../services/api';
import { PDFService } from '../../services/pdfService';
import { geminiService } from '../../services/gemini';
import { ChatMessage, AnalysisReport } from '../../types';
import { emotionEmojis } from '../../utils/emotion';

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
      // PDF 생성 및 다운로드
      await PDFService.generateReportPDF(report, {});
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">대화 분석 리포트</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
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

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            닫기
          </Button>
          <Button
            onClick={handlePDFDownload}
            className="px-6"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF 저장
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { session, ui } = useAppStores();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
        id: 'welcome',
        role: 'assistant',
        content: `안녕하세요! 저는 BeMore의 AI 상담사입니다. 🌟

오늘 하루는 어떠셨나요? 어떤 감정을 느끼고 계신지 편하게 이야기해주세요.

저는 여러분의 감정을 이해하고 함께 탐색해드릴 수 있어요:
• 현재 감정 상태에 대한 공감과 이해
• CBT 기법을 통한 건강한 사고 패턴 전환
• 일상에서 실천할 수 있는 스트레스 관리법
• 긍정적이고 균형잡힌 관점으로의 변화

무엇이든 편하게 말씀해주세요. 여러분의 이야기를 듣고 있어요! 💙`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // 대화 분석 리포트 생성
  const generateAnalysisReport = async (): Promise<AnalysisReport> => {
    const sessionDuration = session.currentSession?.startTime 
      ? (new Date().getTime() - session.currentSession.startTime.getTime()) / 1000
      : 0;
    
    const totalMessages = messages.length;
    
    // 감정 변화 분석
    const emotionHistory = session.currentSession?.emotionHistory || [];
    const emotionTrend = emotionHistory.length > 1 
      ? emotionHistory[0].vadScore.valence < emotionHistory[emotionHistory.length - 1].vadScore.valence
        ? '개선됨'
        : '안정적'
      : '변화 없음';

    // AI를 통한 대화 분석
    const conversationText = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');

    try {
      // Gemini 서비스의 전용 분석 메서드 사용
      const analysisResponse = await geminiService.generateConversationAnalysis(conversationText);
      let parsedAnalysis;
      
      try {
        // JSON 응답 파싱 시도
        const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          // 파싱 실패 시 기본값 사용
          parsedAnalysis = {
            keyInsights: ['감정 표현이 활발했습니다', '스트레스 상황에 대한 대처가 필요합니다'],
            recommendations: ['정기적인 마음챙김 연습을 권장합니다', '일상에서 작은 감사 표현을 해보세요'],
            cbtTechniques: ['인지 재구성', '사고 기록']
          };
        }
      } catch {
        // 파싱 실패 시 기본값 사용
        parsedAnalysis = {
          keyInsights: ['감정 표현이 활발했습니다', '스트레스 상황에 대한 대처가 필요합니다'],
          recommendations: ['정기적인 마음챙김 연습을 권장합니다', '일상에서 작은 감사 표현을 해보세요'],
          cbtTechniques: ['인지 재구성', '사고 기록']
        };
      }

      return {
        sessionDuration,
        totalMessages,
        emotionTrend,
        keyInsights: parsedAnalysis.keyInsights || ['감정 표현이 활발했습니다'],
        recommendations: parsedAnalysis.recommendations || ['정기적인 마음챙김 연습을 권장합니다'],
        cbtTechniques: parsedAnalysis.cbtTechniques || ['인지 재구성']
      };
    } catch (error) {
      // 에러 시 기본 리포트 반환
      return {
        sessionDuration,
        totalMessages,
        emotionTrend,
        keyInsights: ['감정 표현이 활발했습니다', '스트레스 상황에 대한 대처가 필요합니다'],
        recommendations: ['정기적인 마음챙김 연습을 권장합니다', '일상에서 작은 감사 표현을 해보세요'],
        cbtTechniques: ['인지 재구성', '사고 기록']
      };
    }
  };

  // 채팅 종료 처리
  const handleEndChat = async () => {
    if (messages.length <= 1) {
      alert('대화 내용이 없습니다. 먼저 대화를 나눠보세요.');
      return;
    }

    ui.setLoading(true);
    
    try {
      const report = await generateAnalysisReport();
      setAnalysisReport(report);
      setShowReportModal(true);
      session.endSession();
    } catch (error) {
      console.error('리포트 생성 실패:', error);
      alert('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      ui.setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || ui.isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    ui.setLoading(true);

    try {
      // 최근 감정 분석 결과를 컨텍스트로 전달
      const recentEmotion = session.currentSession?.emotionHistory[session.currentSession.emotionHistory.length - 1];
      
      const response = await apiService.sendChatMessage(
        inputMessage, 
        recentEmotion
      );
      
      setMessages(prev => [...prev, response]);
      session.addChatMessage(response);
    } catch (error) {
      console.error('채팅 전송 실패:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      ui.setLoading(false);
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
    '오늘 마음이 많이 복잡해요 😔',
    '스트레스가 너무 쌓여서 힘들어요 😮‍💨',
    '화가 나는 일이 있어서 속상해요 😤',
    '불안한 마음이 들어서 걱정이에요 😰',
    '기쁜 일이 있어서 좋아요! 😊',
  ];

  return (
    <Layout>
      <div className="w-full">
        <div className="max-w-2xl mx-auto">
          <Card className="relative flex flex-col w-full min-h-[500px] shadow-xl rounded-2xl bg-white border border-gray-100">
            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50 rounded-t-2xl space-y-4">
              {messages.map((message, i) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md mb-2 whitespace-pre-wrap break-words text-base leading-relaxed transition-all
                      ${message.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-md ml-8'
                        : 'bg-white border border-gray-200 rounded-bl-md mr-8'}
                    `}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.role === 'user' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-violet-600" />
                      )}
                      <span className="text-xs opacity-60">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>{message.content}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-md">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-violet-600" />
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
            {/* 입력 & 빠른 제안 영역 - 카드 하단 완전 분리, 그림자+bg+border */}
            <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 shadow-lg rounded-b-2xl px-4 py-3 z-20">
              <div className="flex items-end gap-2 mb-3">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-base min-h-[44px] max-h-[120px] bg-gray-50"
                  rows={2}
                  disabled={ui.isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || ui.isLoading}
                  className="px-5 py-3 rounded-lg text-base font-semibold shadow-md"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-violet-100 text-gray-700 rounded-full border border-gray-200 shadow-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
                <button
                  onClick={handleEndChat}
                  disabled={ui.isLoading || messages.length <= 1}
                  className="px-4 py-2 text-sm bg-white hover:bg-red-50 text-red-600 rounded-full border border-red-200 shadow-sm transition-colors font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이제 대화를 종료하고 싶어요
                </button>
              </div>
            </div>
          </Card>
        </div>
        {/* 사이드바는 아래에만 표시 */}
        <div className="block w-full max-w-2xl mx-auto mt-6 space-y-6">
          {/* 현재 감정 상태 */}
          {session.currentSession && session.currentSession.emotionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>현재 감정</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {emotionEmojis[ui.currentEmotion as keyof typeof emotionEmojis] || '😐'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {ui.currentEmotion}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 세션 정보 */}
          {session.currentSession && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>세션 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">시작 시간:</span>
                    <span>{session.currentSession.startTime?.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">분석 횟수:</span>
                    <span>{session.currentSession.emotionHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">대화 수:</span>
                    <span>{session.currentSession.chatHistory.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 분석 리포트 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={analysisReport}
      />
    </Layout>
  );
} 