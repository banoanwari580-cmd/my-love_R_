/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FacebookHeader } from './components/dashboard/FacebookHeader';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { MusicPlayer } from './components/music/MusicPlayer';
import { FloatingHearts } from './components/common/FloatingHearts';
import { HomeView } from './views/HomeView';
import { ProfileView } from './views/ProfileView';
import { ChatView } from './views/ChatView';
import { StoriesView } from './views/StoriesView';
import { StagesView } from './views/StagesView';
import { GamesView } from './views/GamesView';
import { LettersView } from './views/LettersView';
import { MemoriesView } from './views/MemoriesView';
import { SettingsView } from './views/SettingsView';
import { BackHeader } from './components/common/BackHeader';
import { LoginView } from './components/auth/LoginView';
import { store } from './services/store';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(store.getIsAuthenticated());
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchFilter, setSearchFilter] = useState('');
  const [directSection, setDirectSection] = useState<
    'stages' | 'games' | 'letters' | 'memories' | 'settings' | null
  >(null);

  useEffect(() => {
    return store.subscribe(() => {
      setIsAuthenticated(store.getIsAuthenticated());
    });
  }, []);

  const handleBackToMain = () => {
    setDirectSection(null);
  };

  // If not authenticated, show strict Login Screen
  if (!isAuthenticated) {
    return <LoginView onSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    // If a sub-module is active
    if (directSection === 'stages') {
      return (
        <div className="min-h-screen pb-36">
          <BackHeader title="۳۰ مرحله دلدادگی" subtitle="مسیر فتح قله عشق مشترک" onBack={handleBackToMain} />
          <main className="max-w-md mx-auto p-4">
            <StagesView />
          </main>
        </div>
      );
    }

    if (directSection === 'games') {
      return (
        <div className="min-h-screen pb-36">
          <BackHeader title="۶ بازی عاشقانه" subtitle="سرگرمی و پیوند عمیق دونفره" onBack={handleBackToMain} />
          <main className="max-w-md mx-auto p-4">
            <GamesView />
          </main>
        </div>
      );
    }

    if (directSection === 'letters') {
      return (
        <div className="min-h-screen pb-36">
          <BackHeader title="نامه‌های عاشقانه" subtitle="صندوقچه نامه‌های سر به مهر" onBack={handleBackToMain} />
          <main className="max-w-md mx-auto p-4">
            <LettersView />
          </main>
        </div>
      );
    }

    if (directSection === 'memories') {
      return (
        <div className="min-h-screen pb-36">
          <BackHeader title="آلبوم خاطرات مشترک" subtitle="گنجینه عکس‌ها و فیلم‌های ماندگار" onBack={handleBackToMain} />
          <main className="max-w-md mx-auto p-4">
            <MemoriesView />
          </main>
        </div>
      );
    }

    if (directSection === 'settings') {
      return (
        <div className="min-h-screen pb-36">
          <BackHeader title="تنظیمات اختصاصی" subtitle="پروفایل و حریم خصوصی" onBack={handleBackToMain} />
          <main className="max-w-md mx-auto p-4">
            <SettingsView onSignOut={() => store.logout()} />
          </main>
        </div>
      );
    }

    // Facebook-style Bottom Nav 5 Primary Tabs
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            searchFilter={searchFilter}
            onOpenStoryViewer={() => setActiveTab('stories')}
            onOpenStages={() => setDirectSection('stages')}
            onOpenGames={() => setDirectSection('games')}
            onOpenLetters={() => setDirectSection('letters')}
            onOpenMemories={() => setDirectSection('memories')}
          />
        );
      case 'stories':
        return (
          <div className="pb-36 max-w-md mx-auto p-3">
            <StoriesView />
          </div>
        );
      case 'messages':
        return <ChatView />;
      case 'memories':
        return (
          <div className="pb-36 max-w-md mx-auto p-4">
            <MemoriesView />
          </div>
        );
      case 'profile':
        return <ProfileView />;
      default:
        return (
          <HomeView
            searchFilter={searchFilter}
            onOpenStoryViewer={() => setActiveTab('stories')}
            onOpenStages={() => setDirectSection('stages')}
            onOpenGames={() => setDirectSection('games')}
            onOpenLetters={() => setDirectSection('letters')}
            onOpenMemories={() => setDirectSection('memories')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0213] text-rose-100 flex flex-col relative font-['Vazirmatn',sans-serif]">
      {/* Background Floating Hearts */}
      <FloatingHearts />

      {/* Facebook-style Top Navigation Header */}
      {!directSection && (
        <FacebookHeader
          onOpenSettings={() => setDirectSection('settings')}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenChat={() => setActiveTab('messages')}
          onSearch={(q) => setSearchFilter(q)}
        />
      )}

      {/* Dynamic Main Viewport */}
      <main className="flex-1 w-full relative z-10">
        {renderContent()}
      </main>

      {/* Persistent Audio Player */}
      <MusicPlayer />

      {/* Facebook-style Bottom Navigation Bar */}
      {!directSection && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setDirectSection(null);
            setActiveTab(tab);
          }}
        />
      )}
    </div>
  );
}
