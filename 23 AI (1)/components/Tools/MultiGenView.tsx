
import React, { useState } from 'react';
import { ThemeConfig } from '../../types';
import { generateImage } from '../../services/geminiService';

interface MultiGenViewProps {
  theme: ThemeConfig;
  onImagesGenerated: (imgs: any[]) => void;
}

const STYLES = ['Photorealistic', 'Digital Art', 'Oil Painting', 'Cyberpunk'];

const MultiGenView: React.FC<MultiGenViewProps> = ({ theme, onImagesGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setImages([]);

    try {
      const results = await Promise.all(
        STYLES.map(style => generateImage(`${prompt} in ${style} style`))
      );
      
      const validImages = results.filter(img => img !== null) as string[];
      setImages(validImages);
      
      const newImgs = validImages.map((url, i) => ({
        id: `multi-${Date.now()}-${i}`,
        url,
        prompt: `${prompt} (${STYLES[i]})`,
        timestamp: Date.now()
      }));
      onImagesGenerated(newImgs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pt-20 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Multiple Image Generation</h2>
        <p className="opacity-70">Generate 4 variations of your prompt in different artistic styles.</p>
      </div>

      <div className="flex gap-4 mb-10">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a descriptive prompt..."
          className="flex-1 p-4 rounded-2xl outline-none border-none shadow-inner"
          style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.textColor }}
        />
        <button 
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: theme.uiColor, color: theme.isDark ? '#000000' : '#FFFFFF' }}
        >
          {isLoading ? 'Generating...' : 'Create 4 Images'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 overflow-y-auto pb-20">
        {isLoading && !images.length ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-3xl animate-pulse bg-current opacity-10"></div>
          ))
        ) : (
          images.map((img, i) => (
            <div key={i} className="group relative rounded-3xl overflow-hidden shadow-2xl bg-black/5">
              <img src={img} alt={`Variation ${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-bold text-lg">{STYLES[i]}</p>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = img;
                    link.download = `variation_${STYLES[i]}.png`;
                    link.click();
                  }}
                  className="absolute bottom-4 right-4 p-3 bg-white text-black rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1l8 8 8-8v-1M12 12V3" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MultiGenView;
