'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Navigation } from '../../components/layout/Navigation';
import { 
  User, 
  Calendar, 
  BarChart3, 
  MessageCircle,
  Settings,
  Edit,
  Camera,
  Save,
  X
} from 'lucide-react';
import { useAppStore } from '../../modules/store';

export default function ProfilePage() {
  const { user } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '사용자');

  // 임시 사용자 데이터
  const userData = {
    name: isEditing ? editedName : (user?.name || '사용자'),
    email: user?.email || 'user@example.com',
    joinDate: '2024년 1월',
    totalAnalyses: 42,
    totalChats: 128,
    profileImage: null
  };

  const handleSaveName = () => {
    // 실제로는 API 호출로 사용자 정보 업데이트
    setIsEditing(false);
    // 여기서 user store 업데이트 로직 추가
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '사용자');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 헤더 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              마이페이지
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              개인 정보와 활동 내역을 확인하고 관리하세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 프로필 정보 */}
            <div className="lg:col-span-1">
              <Card variant="elevated" hover>
                <CardHeader>
                  <CardTitle>
                    <User className="w-5 h-5 text-primary" />
                    <span>프로필 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 프로필 이미지 */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">
                          {userData.name.charAt(0)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-0 right-0"
                        icon={<Camera className="w-4 h-4" />}
                      >
                        변경
                      </Button>
                    </div>
                  </div>

                  {/* 사용자 정보 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이름
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setEditedName(e.target.value)}
                          disabled={!isEditing}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {isEditing ? (
                          <div className="flex space-x-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSaveName}
                              icon={<Save className="w-4 h-4" />}
                            >
                              저장
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              icon={<X className="w-4 h-4" />}
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            icon={<Edit className="w-4 h-4" />}
                          >
                            수정
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        가입일
                      </label>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{userData.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 활동 통계 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 통계 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="elevated" hover>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">총 감정 분석</p>
                        <p className="text-2xl font-bold text-gray-900">{userData.totalAnalyses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated" hover>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">총 AI 채팅</p>
                        <p className="text-2xl font-bold text-gray-900">{userData.totalChats}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 최근 활동 */}
              <Card variant="elevated" hover>
                <CardHeader>
                  <CardTitle>
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>최근 활동</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">감정 분석 완료</p>
                          <p className="text-sm text-gray-600">멀티모달 분석</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2시간 전</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-medium text-gray-900">AI 채팅 세션</p>
                          <p className="text-sm text-gray-600">감정 상담 대화</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1일 전</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">영상 통화 분석</p>
                          <p className="text-sm text-gray-600">실시간 감정 모니터링</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">3일 전</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 빠른 액션 */}
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>
                    <Settings className="w-5 h-5 text-primary" />
                    <span>빠른 액션</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/analysis">
                      <Button
                        variant="outline"
                        className="h-16 flex-col space-y-2 w-full"
                        icon={<BarChart3 className="w-6 h-6" />}
                      >
                        <span>새로운 분석</span>
                        <span className="text-xs text-gray-500">감정 분석 시작</span>
                      </Button>
                    </Link>

                    <Link href="/chat">
                      <Button
                        variant="outline"
                        className="h-16 flex-col space-y-2 w-full"
                        icon={<MessageCircle className="w-6 h-6" />}
                      >
                        <span>AI 채팅</span>
                        <span className="text-xs text-gray-500">대화 시작</span>
                      </Button>
                    </Link>

                    <Link href="/settings">
                      <Button
                        variant="outline"
                        className="h-16 flex-col space-y-2 w-full"
                        icon={<Settings className="w-6 h-6" />}
                      >
                        <span>설정</span>
                        <span className="text-xs text-gray-500">환경 설정</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 