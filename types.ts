
export type AppView = 'chat' | 'multi-gen' | 'advanced-gen' | 'bg-removal' | 'history-images' | 'history-chats' | 'about';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
  attachments?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  metadata?: any;
}

export interface ThemeConfig {
  bgColor: string;
  uiColor: string;
  isDark: boolean;
  textColor: string;
  accentColor: string;
}

export enum VoiceName {
  Puck = 'Puck', // Male
  Charon = 'Charon', // Male
  Fenrir = 'Fenrir', // Male
  Kore = 'Kore', // Female
  Zephyr = 'Zephyr', // Female
  Aoede = 'Aoede' // Female
}
