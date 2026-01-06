
import React from 'react';
import { ThemeConfig, GeneratedImage, ChatSession } from '../../types';

interface HistoryViewProps {
  type: 'images' | 'chats';
  data: any[];
  theme: ThemeConfig;
  onSelectChat?: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ type, data, theme, onSelectChat }) => {
  return (
    <div className="flex-1 flex flex-col p-6 pt-20 max-w-6xl mx-auto w-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{type === 'images' ? 'Image Library' : 'Chat History'}</h2>
        <p className="opacity-70">Browse your previous creations and conversations.</p>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-20">
          <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-xl font-semibold">No history found yet</p>
        </div>
      ) : type === 'images' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
          {(data as GeneratedImage[]).map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-black/5 transition-transform hover:scale-[1.02]">
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-white text-xs line-clamp-3 mb-2">{img.prompt}</p>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = img.url;
                    link.download = `23ai_${img.id}.png`;
                    link.click();
                  }}
                  className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 pb-20">
          {(data as ChatSession[]).map((chat) => (
            <button 
              key={chat.id}
              onClick={() => onSelectChat?.(chat.id)}
              className="w-full flex items-center justify-between p-6 rounded-2xl transition-all hover:translate-x-1 border border-white/5"
              style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <div className="flex flex-col items-start">
                <h3 className="font-bold text-lg mb-1">{chat.title}</h3>
                <p className="text-sm opacity-50">{chat.messages.length} messages • {new Date(chat.updatedAt).toLocaleDateString()}</p>
              </div>
              <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
