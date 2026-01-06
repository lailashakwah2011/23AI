
import React, { useState, useRef, useEffect } from 'react';
import { ThemeConfig, ChatSession, Message, VoiceName } from '../types';
import { chatWithAIStream, generateImage, generateSpeech } from '../services/geminiService';
import UploadMenu from './UploadMenu';
import VoiceSelector from './VoiceSelector';

interface ChatWindowProps {
  theme: ThemeConfig;
  activeChat?: ChatSession;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  onImageGenerated: (img: any) => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ theme, activeChat, setChatHistory, onImageGenerated, selectedVoice, setSelectedVoice }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async (text?: string, attachedImage?: string) => {
    const messageContent = text || input;
    if (!messageContent.trim() && !attachedImage) return;
    if (!activeChat) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      image: attachedImage
    };

    const updatedWithUser = [...activeChat.messages, userMsg];
    
    setChatHistory(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, messages: updatedWithUser, updatedAt: Date.now() } : c
    ));
    setInput('');
    setIsLoading(true);

    try {
      const isImageReq = !attachedImage && (messageContent.toLowerCase().includes('generate') || messageContent.toLowerCase().includes('create image'));

      if (isImageReq) {
        const imgUrl = await generateImage(messageContent);
        if (imgUrl) {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I've generated this image for you based on your prompt.",
            timestamp: Date.now(),
            image: imgUrl
          };
          onImageGenerated({ id: aiMsg.id, url: imgUrl, prompt: messageContent, timestamp: Date.now() });
          setChatHistory(prev => prev.map(c => 
            c.id === activeChat.id ? { ...c, messages: [...updatedWithUser, aiMsg], updatedAt: Date.now() } : c
          ));
        } else {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I'm sorry, I couldn't generate that image right now.",
            timestamp: Date.now()
          };
          setChatHistory(prev => prev.map(c => 
            c.id === activeChat.id ? { ...c, messages: [...updatedWithUser, aiMsg], updatedAt: Date.now() } : c
          ));
        }
        setIsLoading(false);
      } else {
        // Handle Streaming Text Response
        const aiMsgId = (Date.now() + 1).toString();
        const initialAiMsg: Message = {
          id: aiMsgId,
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        };

        setChatHistory(prev => prev.map(c => 
          c.id === activeChat.id ? { ...c, messages: [...updatedWithUser, initialAiMsg], updatedAt: Date.now() } : c
        ));

        setIsLoading(false); // Remove loading pulse once stream starts
        
        let fullContent = "";
        const stream = chatWithAIStream(messageContent);
        
        for await (const chunk of stream) {
          fullContent += chunk;
          setChatHistory(prev => prev.map(c => 
            c.id === activeChat.id ? {
              ...c,
              messages: c.messages.map(m => m.id === aiMsgId ? { ...m, content: fullContent } : m),
              updatedAt: Date.now()
            } : c
          ));
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) {
      currentSourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        currentSourceRef.current = source;
        
        source.onended = () => {
          setIsSpeaking(false);
          currentSourceRef.current = null;
        };
        
        source.start();
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setIsSpeaking(false);
      }
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsSpeaking(false);
    }
  };

  const handleUpload = (type: 'photo' | 'file' | 'camera') => {
    setIsUploadMenuOpen(false);
    const input = document.createElement('input');
    input.type = 'file';
    if (type === 'photo') input.accept = 'image/*';
    if (type === 'camera') {
      input.accept = 'image/*';
      input.capture = 'environment';
    }
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const base64 = re.target?.result as string;
          handleSend("I've uploaded an image.", base64);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `23ai_image_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full pt-16">
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth ${theme.isDark ? 'dark-scrollbar' : ''}`}
      >
        {activeChat?.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] sm:max-w-[70%] group relative`}>
              <div 
                className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'rounded-tr-none' 
                    : 'rounded-tl-none'
                }`}
                style={{ 
                  backgroundColor: msg.role === 'user' ? theme.uiColor : (theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                  color: msg.role === 'user' ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.textColor
                }}
              >
                {msg.image && (
                  <div className="mb-3 relative group/img">
                    <img src={msg.image} alt="User upload" className="rounded-lg max-h-80 w-auto object-contain bg-black/5" />
                    <button 
                      onClick={() => downloadImage(msg.image!)}
                      className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1l8 8 8-8v-1M12 12V3" /></svg>
                    </button>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                  {msg.role === 'assistant' && msg.content === '' && (
                    <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse align-middle" />
                  )}
                </div>
              </div>
              
              {msg.role === 'assistant' && msg.content !== '' && (
                <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => speakText(msg.content)}
                    className="p-1.5 rounded-full hover:bg-black/10"
                    title="Speak message"
                  >
                    {isSpeaking ? (
                      <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(msg.content)}
                    className="p-1.5 rounded-full hover:bg-black/10"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="p-4 rounded-2xl rounded-tl-none animate-pulse flex items-center gap-2"
              style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 max-w-5xl mx-auto w-full mb-4">
        <div 
          className="relative flex items-center rounded-2xl shadow-xl border border-white/10 transition-shadow focus-within:shadow-2xl"
          style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}
        >
          <button 
            onClick={() => setIsVoicePickerOpen(!isVoicePickerOpen)}
            className="p-3 opacity-60 hover:opacity-100 transition-opacity ml-1"
            title="Choose voice assistant"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>

          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to 23 AI..."
            className="flex-1 bg-transparent border-none focus:ring-0 py-4 px-2 outline-none"
            style={{ color: theme.textColor }}
          />

          <div className="flex items-center gap-1 pr-2">
            <button 
              onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
              className="p-3 opacity-60 hover:opacity-100 transition-opacity"
              title="Upload file or image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() && !isLoading}
              className="p-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: theme.uiColor, color: theme.isDark ? '#000000' : '#FFFFFF' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>

          {isVoicePickerOpen && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
               <VoiceSelector 
                  theme={theme} 
                  selected={selectedVoice} 
                  onSelect={(v) => { setSelectedVoice(v); setIsVoicePickerOpen(false); }} 
               />
            </div>
          )}
        </div>
      </div>

      <UploadMenu 
        isOpen={isUploadMenuOpen} 
        onClose={() => setIsUploadMenuOpen(false)} 
        onAction={handleUpload}
        theme={theme}
      />
    </div>
  );
};

export default ChatWindow;
