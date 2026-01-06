
import React from 'react';
import { ThemeConfig } from '../types';

interface UploadMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (type: 'photo' | 'file' | 'camera') => void;
  theme: ThemeConfig;
}

const UploadMenu: React.FC<UploadMenuProps> = ({ isOpen, onClose, onAction, theme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose} />
      <div 
        className="relative w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-4 space-y-2 pointer-events-auto animate-in slide-in-from-bottom duration-300"
        style={{ backgroundColor: theme.bgColor, border: `1px solid ${theme.uiColor}33` }}
      >
        <button 
          onClick={() => onAction('photo')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-white/10"
          style={{ color: theme.textColor }}
        >
          <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="font-semibold text-lg">Upload Photo</span>
        </button>

        <button 
          onClick={() => onAction('file')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-white/10"
          style={{ color: theme.textColor }}
        >
          <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <span className="font-semibold text-lg">Upload File</span>
        </button>

        <button 
          onClick={() => onAction('camera')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-white/10"
          style={{ color: theme.textColor }}
        >
          <div className="p-3 rounded-full bg-rose-500/20 text-rose-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <span className="font-semibold text-lg">Take Photo</span>
        </button>
      </div>
    </div>
  );
};

export default UploadMenu;
