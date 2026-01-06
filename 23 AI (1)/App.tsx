
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Message, ChatSession, GeneratedImage, ThemeConfig, VoiceName } from './types';
import { PASTEL_COLORS, DARK_COLORS, UI_COLORS_FOR_DARK, UI_COLORS_FOR_PASTEL, VOICES } from './constants';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ThemePicker from './components/ThemePicker';
import MultiGenView from './components/Tools/MultiGenView';
import AdvancedGenView from './components/Tools/AdvancedGenView';
import BgRemovalView from './components/Tools/BgRemovalView';
import HistoryView from './components/Tools/HistoryView';
import AboutPage from './components/AboutPage';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('chat');
  const [theme, setTheme] = useState<ThemeConfig>({
    bgColor: DARK_COLORS[0],
    uiColor: UI_COLORS_FOR_DARK,
    isDark: true,
    textColor: '#FFFFFF',
    accentColor: '#3B82F6'
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICES[3].name);

  // Load state from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('23ai_theme');
    if (savedTheme) setTheme(JSON.parse(savedTheme));

    const savedChats = localStorage.getItem('23ai_chats');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChatHistory(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
    } else {
      // Initial chat
      const initialChat: ChatSession = {
        id: 'initial',
        title: 'New Chat',
        messages: [{
          id: 'welcome',
          role: 'assistant',
          content: "Hi.. my name is 23 AI. How can I help you today?",
          timestamp: Date.now()
        }],
        updatedAt: Date.now()
      };
      setChatHistory([initialChat]);
      setActiveChatId(initialChat.id);
    }

    const savedImages = localStorage.getItem('23ai_images');
    if (savedImages) setImageHistory(JSON.parse(savedImages));
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('23ai_theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('23ai_chats', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('23ai_images', JSON.stringify(imageHistory));
  }, [imageHistory]);

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        id: Date.now() + '-welcome',
        role: 'assistant',
        content: "Hi.. my name is 23 AI. How can I help you today?",
        timestamp: Date.now()
      }],
      updatedAt: Date.now()
    };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setView('chat');
    setIsSidebarOpen(false);
  };

  const handleSelectTheme = (color: string, isPastel: boolean) => {
    setTheme({
      bgColor: color,
      uiColor: isPastel ? UI_COLORS_FOR_PASTEL : UI_COLORS_FOR_DARK,
      isDark: !isPastel,
      textColor: isPastel ? '#000000' : '#FFFFFF',
      accentColor: isPastel ? color : '#FFFFFF'
    });
    setIsThemePickerOpen(false);
  };

  const activeChat = chatHistory.find(c => c.id === activeChatId);

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: theme.bgColor, color: theme.textColor }}
    >
      {/* Top Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-40 pointer-events-none">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-full shadow-lg transition-transform active:scale-95 pointer-events-auto"
          style={{ backgroundColor: theme.uiColor, color: theme.isDark ? '#000000' : '#FFFFFF' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <h1 className="text-xl font-bold tracking-tight opacity-80">23 AI</h1>

        <button 
          onClick={() => setIsThemePickerOpen(true)}
          className="p-2 rounded-full shadow-lg transition-transform active:scale-95 pointer-events-auto"
          style={{ backgroundColor: theme.uiColor, color: theme.isDark ? '#000000' : '#FFFFFF' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentView={view}
        setView={setView}
        onNewChat={handleNewChat}
        theme={theme}
      />

      <main className="flex-1 flex flex-col relative">
        {view === 'chat' && (
          <ChatWindow 
            theme={theme} 
            activeChat={activeChat} 
            setChatHistory={setChatHistory}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            onImageGenerated={(img) => setImageHistory(prev => [img, ...prev])}
          />
        )}
        {view === 'multi-gen' && (
          <MultiGenView 
            theme={theme} 
            onImagesGenerated={(imgs) => setImageHistory(prev => [...imgs, ...prev])} 
          />
        )}
        {view === 'advanced-gen' && (
          <AdvancedGenView 
            theme={theme} 
            onImageGenerated={(img) => setImageHistory(prev => [img, ...prev])} 
          />
        )}
        {view === 'bg-removal' && (
          <BgRemovalView theme={theme} />
        )}
        {view === 'history-images' && (
          <HistoryView type="images" data={imageHistory} theme={theme} />
        )}
        {view === 'history-chats' && (
          <HistoryView 
            type="chats" 
            data={chatHistory} 
            theme={theme} 
            onSelectChat={(id) => { setActiveChatId(id); setView('chat'); }} 
          />
        )}
        {view === 'about' && (
          <AboutPage theme={theme} />
        )}
      </main>

      {isThemePickerOpen && (
        <ThemePicker 
          onClose={() => setIsThemePickerOpen(false)} 
          onSelect={handleSelectTheme} 
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
