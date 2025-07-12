'use client';

import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Palette,
  Save,
  LogOut,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppStore } from '../../modules/store';

export default function SettingsPage() {
  const { user, setUser, setTheme, theme, setAuthenticated } = useAppStore();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'data' | 'appearance'>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 폼 상태
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    emotionAlerts: false,
  });
  
  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    shareAnalytics: false,
    deleteAfterDays: 365,
  });

  const tabs = [
    { id: 'account', name: '계정', icon: User },
    { id: 'security', name: '보안', icon: Shield },
    { id: 'notifications', name: '알림', icon: Bell },
    { id: 'data', name: '데이터', icon: Database },
    { id: 'appearance', name: '외관', icon: Palette },
  ];

  const handleProfileSave = () => {
    if (user) {
      const updatedUser = {
        ...user,
        ...profileForm,
      };
      setUser(updatedUser);
      alert('프로필이 업데이트되었습니다.');
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    
    alert('비밀번호가 변경되었습니다.');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleLogout = () => {
    setAuthenticated(false);
    // 로그아웃 로직 추가
  };

  const handleDeleteAccount = () => {
    if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 계정 삭제 로직
      setAuthenticated(false);
    }
  };

  const renderAccountTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로필 이미지 URL
            </label>
            <input
              type="url"
              value={profileForm.avatar}
              onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <Button onClick={handleProfileSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            프로필 저장
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <Button onClick={handlePasswordChange} className="w-full">
            비밀번호 변경
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>보안 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium">2단계 인증</div>
              <div className="text-sm text-gray-600">계정 보안을 강화하세요</div>
            </div>
            <Button variant="outline">설정</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium">로그인 세션</div>
              <div className="text-sm text-gray-600">현재 활성 세션 관리</div>
            </div>
            <Button variant="outline">관리</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium">API 키</div>
              <div className="text-sm text-gray-600">외부 서비스 연동 키 관리</div>
            </div>
            <Button variant="outline">관리</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">이메일 알림</div>
              <div className="text-sm text-gray-600">중요한 업데이트를 이메일로 받기</div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">푸시 알림</div>
              <div className="text-sm text-gray-600">실시간 알림 받기</div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">주간 리포트</div>
              <div className="text-sm text-gray-600">주간 감정 분석 리포트 받기</div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.weeklyReports}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">감정 알림</div>
              <div className="text-sm text-gray-600">특정 감정 상태 감지 시 알림</div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emotionAlerts}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, emotionAlerts: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>데이터 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">자동 백업</div>
              <div className="text-sm text-gray-600">데이터를 자동으로 백업합니다</div>
            </div>
            <input
              type="checkbox"
              checked={dataSettings.autoBackup}
              onChange={(e) => setDataSettings({ ...dataSettings, autoBackup: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">분석 데이터 공유</div>
              <div className="text-sm text-gray-600">익명화된 데이터를 연구 목적으로 공유</div>
            </div>
            <input
              type="checkbox"
              checked={dataSettings.shareAnalytics}
              onChange={(e) => setDataSettings({ ...dataSettings, shareAnalytics: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              데이터 보관 기간
            </label>
            <select
              value={dataSettings.deleteAfterDays}
              onChange={(e) => setDataSettings({ ...dataSettings, deleteAfterDays: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={30}>30일</option>
              <option value={90}>90일</option>
              <option value={365}>1년</option>
              <option value={0}>영구 보관</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="outline" className="flex-1">
              데이터 내보내기
            </Button>
            <Button variant="outline" className="flex-1">
              데이터 가져오기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>외관 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테마
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: '라이트', icon: '☀️' },
                { value: 'dark', label: '다크', icon: '🌙' },
                { value: 'auto', label: '자동', icon: '🔄' },
              ].map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'auto')}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    theme === themeOption.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{themeOption.icon}</div>
                  <div className="text-sm font-medium">{themeOption.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'data':
        return renderDataTab();
      case 'appearance':
        return renderAppearanceTab();
      default:
        return renderAccountTab();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">설정</h1>
          <p className="text-xl text-gray-600">
            계정, 보안, 알림 등 다양한 설정을 관리하세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'account' | 'security' | 'notifications' | 'data' | 'appearance')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        {renderTabContent()}

        {/* 계정 관리 */}
        <Card>
          <CardHeader>
            <CardTitle>계정 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleLogout} className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
              <Button variant="danger" onClick={handleDeleteAccount} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                계정 삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 