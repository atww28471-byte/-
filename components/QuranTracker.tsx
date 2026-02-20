import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { fetchLastRead } from '../services/api';
import { QuranProgress } from '../types';

interface QuranTrackerProps {
  onContinue?: (progress: QuranProgress) => void;
}

export const QuranTracker: React.FC<QuranTrackerProps> = ({ onContinue }) => {
  const [progress, setProgress] = useState<QuranProgress | null>(null);

  useEffect(() => {
    fetchLastRead().then(setProgress);
  }, []);

  if (!progress) return null;

  return (
    <div className="w-full h-full">
      <div 
        onClick={() => onContinue && onContinue(progress)}
        className="glass-panel rounded-[2.5rem] p-1 transition-all duration-300 active:scale-[0.98] cursor-pointer group h-full"
      >
         <div className="bg-gradient-to-br from-white/5 to-transparent rounded-[2.3rem] p-5 border border-white/5 flex items-center justify-between">
            
            <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green to-primary-light flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={24} strokeWidth={1.5} />
                </div>

                <div>
                    <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wide block mb-1">أكمل وردك</span>
                    <h3 className="text-xl font-serif font-bold text-white mb-1">{progress.surahName}</h3>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded">صفحة {progress.page}</span>
                    </div>
                </div>
            </div>

            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-brand-green group-hover:text-white transition-all">
                <ArrowLeft size={20} />
            </div>

         </div>
      </div>
    </div>
  );
};