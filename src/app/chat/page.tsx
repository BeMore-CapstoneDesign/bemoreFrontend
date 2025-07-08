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
  Clock
} from 'lucide-react';
import { useAppStores } from '../../modules/stores';
import { apiService } from '../../services/api';
import { ChatMessage } from '../../types';
import { emotionEmojis } from '../../utils/emotion';

export default function ChatPage() {
  const { session, ui } = useAppStores();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
        content: `안녕하세요! 저는 BeMore의 AI 상담사입니다. 🤖

오늘 어떤 감정을 느끼고 계신가요? 편하게 이야기해주세요. 

저는 다음과 같은 도움을 드릴 수 있습니다:
• 감정 상태에 대한 이해와 공감
• CBT 기반 인지 재구성 도움
• 스트레스 관리 방법 제안
• 긍정적 사고 전환 가이드

무엇이든 편하게 말씀해주세요!`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

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
    '오늘 기분이 좋지 않아요',
    '스트레스가 많이 쌓였어요',
    '화가 나는 일이 있었어요',
    '불안한 마음이 들어요',
    '기쁜 일이 있었어요',
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI 채팅 상담</h1>
          <p className="text-xl text-gray-600">
            Gemini와 대화하며 감정을 탐색하고 CBT 피드백을 받아보세요
          </p>
        </div>

        {/* 채팅 인터페이스 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 채팅 영역 */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-violet-600" />
                  <span>AI 상담사와 대화</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* 메시지 영역 */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {message.role === 'user' ? (
                            <UserIcon className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4 text-violet-600" />
                          )}
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 p-3 rounded-lg">
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

                {/* 입력 영역 */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      rows={3}
                      disabled={ui.isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || ui.isLoading}
                      className="self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* 빠른 제안 */}
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
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
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
      </div>
    </Layout>
  );
} 