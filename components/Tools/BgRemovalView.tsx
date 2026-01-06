
import React, { useState } from 'react';
import { ThemeConfig } from '../../types';
import { removeBackground } from '../../services/geminiService';

interface BgRemovalViewProps {
  theme: ThemeConfig;
}

const BgRemovalView: React.FC<BgRemovalViewProps> = ({ theme }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        setImage(re.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const processed = await removeBackground(image);
      setResult(processed);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pt-20 max-w-4xl mx-auto w-full overflow-y-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Background Remover</h2>
        <p className="opacity-70">Automatically isolate subjects from their background.</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {!image ? (
          <label className="w-full max-w-md aspect-video border-2 border-dashed border-current opacity-30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:opacity-50 transition-opacity">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span className="font-semibold text-lg">Click to Upload Image</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-center opacity-70">Original</h3>
              <div className="rounded-3xl overflow-hidden shadow-xl bg-black/5 aspect-square">
                <img src={image} className="w-full h-full object-contain" />
              </div>
              <button 
                onClick={() => setImage(null)}
                className="w-full py-3 rounded-xl border border-current opacity-50 hover:opacity-100 transition-opacity font-semibold"
              >
                Change Image
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-center opacity-70">Result</h3>
              <div className="rounded-3xl overflow-hidden shadow-xl bg-black/10 aspect-square flex items-center justify-center relative">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-medium animate-pulse">Removing Background...</p>
                  </div>
                ) : result ? (
                  <img src={result} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-8 opacity-40 italic">
                    Ready to process
                  </div>
                )}
              </div>
              {result && (
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result;
                    link.download = `removed_bg_${Date.now()}.png`;
                    link.click();
                  }}
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.uiColor, color: theme.isDark ? '#000000' : '#FFFFFF' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1l8 8 8-8v-1M12 12V3" /></svg>
                  Download Result
                </button>
              )}
              {!result && !isLoading && (
                <button 
                  onClick={handleRemove}
                  className="w-full py-3 rounded-xl font-bold"
                  style={{ backgroundColor: theme.uiColor, color: theme.isDark ? '#000000' : '#FFFFFF' }}
                >
                  Remove Background
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BgRemovalView;
