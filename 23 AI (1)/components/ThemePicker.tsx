
import React from 'react';
import { PASTEL_COLORS, DARK_COLORS } from '../constants';
import { ThemeConfig } from '../types';

interface ThemePickerProps {
  onClose: () => void;
  onSelect: (color: string, isPastel: boolean) => void;
  theme: ThemeConfig;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ onClose, onSelect, theme }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md" 
        onClick={onClose} 
      />
      <div 
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        style={{ backgroundColor: theme.bgColor, color: theme.textColor }}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold">Customize UI</h3>
          <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Pastel Themes (Light)</h4>
            <div className="grid grid-cols-5 gap-4">
              {PASTEL_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onSelect(color, true)}
                  className="w-full aspect-square rounded-full border-2 border-white/20 shadow-sm transition-transform hover:scale-110 active:scale-90"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Dark Themes (Deep)</h4>
            <div className="grid grid-cols-5 gap-4">
              {DARK_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onSelect(color, false)}
                  className="w-full aspect-square rounded-full border-2 border-white/20 shadow-sm transition-transform hover:scale-110 active:scale-90"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ThemePicker;
