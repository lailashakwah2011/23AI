
import React from 'react';
import { ThemeConfig } from '../types';

interface AboutPageProps {
  theme: ThemeConfig;
}

const AboutPage: React.FC<AboutPageProps> = ({ theme }) => {
  return (
    <div className="flex-1 flex flex-col p-6 pt-24 max-w-4xl mx-auto w-full overflow-y-auto">
      <div 
        className="space-y-8 leading-relaxed mb-20" 
        style={{ fontSize: '22px' }}
      >
        <h1 className="text-5xl font-black mb-12" style={{ color: theme.uiColor }}>Welcome to 23 AI...</h1>
        
        <p>
          23 AI is an AI tool that helps users chat, get information and create images.
        </p>
        
        <p>
          Trying to make professional images using AI has always been a problem because of the long prompts I had to write and the long time I had to wait for them to be done.
        </p>

        <p>
          23 AI solves these problems by providing easier ways to create images which leads you to write shorter prompts and finish your work faster.
        </p>

        <p>
          Also it provides a smart chatbot to search information and a voice assistant.
        </p>

        <div className="pt-12 mt-12 border-t border-white/10 opacity-80 italic">
          <p>This tool was created on January 3, 2026 by Laila Mssaad.</p>
          <p className="mt-4 font-bold">Hope you enjoy using our AI tool.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
