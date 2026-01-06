
import React, { useState } from 'react';
import { ThemeConfig } from '../../types';
import { generateImage } from '../../services/geminiService';
import { ASPECT_RATIOS } from '../../constants';

interface AdvancedGenViewProps {
  theme: ThemeConfig;
  onImageGenerated: (img: any) => void;
}

const AdvancedGenView: React.FC<AdvancedGenViewProps> = ({ theme, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [colors, setColors] = useState<string[]>(['#FF0000', '#00FF00', '#0000FF']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const url = await generateImage(prompt, { aspectRatio, colors });
      if (url) {
        setResult(url);
        onImageGenerated({ id: Date.now().toString(), url, prompt, timestamp: Date.now() });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pt-20 max-w-4xl mx-auto w-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Advanced Image Generation</h2>
        <p className="opacity-70">Customize aspect ratio and primary color influence.</p>
      </div>

      <div className="space-y-8 mb-10">
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider mb-2 opacity-60">Prompt</label>
          <textarea 
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your vision in detail..."
            className="w-full p-4 rounded-2xl outline-none border-none shadow-inner resize-none"
            style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.textColor }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Aspect Ratio</label>
          <div className="flex flex-wrap gap-3">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${aspectRatio === ratio ? 'ring-2 ring-current' : 'opacity-60 hover:opacity-100'}`}
                style={{ backgroundColor: aspectRatio === ratio ? theme.uiColor : 'transparent', color: aspectRatio === ratio ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.textColor }}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Primary Colors (3)</label>
          <div className="flex gap-4">
            {colors.map((c, i) => (
              <input 
                key={i}
                type="color"
                value={c}
                onChange={(e) => {
                  const newColors = [...colors];
                  newColors[i] = e.target.value;
                  setColors(newColors);
                }}
                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
              />
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          style={{ backgroundColor: theme.uiColor, color: theme.isDark ? '#000000' : '#FFFFFF' }}
        >
          {isLoading ? 'Processing...' : 'Generate Masterpiece'}
        </button>
      </div>

      {result && (
        <div className="pb-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="group relative rounded-3xl overflow-hidden shadow-2xl bg-black/10">
             <img src={result} alt="Generated result" className="w-full h-auto object-contain" />
             <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = result;
                link.download = `advanced_gen_${Date.now()}.png`;
                link.click();
              }}
              className="absolute bottom-6 right-6 p-4 bg-white text-black rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1l8 8 8-8v-1M12 12V3" /></svg>
              Save to Gallery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedGenView;
