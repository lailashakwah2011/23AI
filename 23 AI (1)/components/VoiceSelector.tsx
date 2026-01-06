
import React from 'react';
import { ThemeConfig } from '../types';
import { VOICES } from '../constants';

interface VoiceSelectorProps {
  theme: ThemeConfig;
  selected: string;
  onSelect: (v: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ theme, selected, onSelect }) => {
  return (
    <div 
      className="w-64 rounded-2xl shadow-2xl p-4 overflow-hidden"
      style={{ backgroundColor: theme.bgColor, border: `1px solid ${theme.uiColor}33` }}
    >
      <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50 px-2">Voice Assistant</h4>
      <div className="space-y-1">
        {VOICES.map((v) => (
          <button
            key={v.name}
            onClick={() => onSelect(v.name)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${selected === v.name ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${v.gender === 'Male' ? 'bg-blue-400' : 'bg-pink-400'}`} />
              <span className="text-sm font-medium">{v.label}</span>
            </div>
            {selected === v.name && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelector;
