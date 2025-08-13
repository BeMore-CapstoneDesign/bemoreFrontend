'use client';

import React from 'react';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function ChatPlaceholderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>AI 채팅 (준비 중)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              채팅 기능이 곧 제공됩니다. 현재는 기능 준비 중이며, 업데이트와 함께 안내드리겠습니다.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


