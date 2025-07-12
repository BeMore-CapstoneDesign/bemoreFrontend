import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../utils/cn';
import { 
  Home, 
  BarChart3, 
  MessageCircle, 
  History, 
  Settings,
  User
} from 'lucide-react';
import { useAppStore } from '../../modules/store';

const navigationItems = [
  { name: '홈', href: '/', icon: Home },
  { name: '분석', href: '/analysis', icon: BarChart3 },
  { name: 'AI 채팅', href: '/chat', icon: MessageCircle },
  { name: '히스토리', href: '/history', icon: History },
  { name: '설정', href: '/settings', icon: Settings },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAppStore();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BeMore</span>
            </Link>
          </div>

          {/* 메인 네비게이션 */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name}
                </span>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>로그인</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium',
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}; 