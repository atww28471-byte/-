import React, { useState } from 'react';
import { getDailyContent } from '../services/api';
import { QuranIcon, AyahEndSymbol } from './CustomIcons';
import { BookOpen, MessageCircle, Heart } from 'lucide-react';

interface DailyContentProps {
  compact?: boolean;
}

export const DailyContent: React.FC<DailyContentProps> = ({ compact = false }) => {
  const content = getDailyContent();
  const [activeTab, setActiveTab] = useState<'verse' | 'hadith' | 'dhikr'>('verse');

  const activeContent = activeTab === 'verse' ? content.verse : (activeTab === 'hadith' ? content.hadith : content.dhikr);

  return (
    <div className="w-full h-full">
      <div className={`glass-panel rounded-[2rem] relative overflow-hidden group flex flex-col justify-between h-full ${compact ? 'p-4' : 'p-6'}`}>
        
        {/* Background Accent */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[60px] rounded-full transition-colors duration-500 
          ${activeTab === 'verse' ? 'bg-brand-green/20' : activeTab === 'hadith' ? 'bg-brand-gold/20' : 'bg-blue-500/20'}
        `}></div>

        <div className="relative z-10 flex flex-col h-full">
            {/* Header / Tabs */}
            <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-6'}`}>
               <div className="flex gap-1 bg-black/20 p-1 rounded-full">
                  <TabButton 
                    active={activeTab === 'verse'} 
                    onClick={() => setActiveTab('verse')} 
                    icon={<QuranIcon size={compact ? 12 : 16} />}
                    label={compact ? undefined : "آية"}
                    compact={compact}
                  />
                  <TabButton 
                    active={activeTab === 'hadith'} 
                    onClick={() => setActiveTab('hadith')} 
                    icon={<BookOpen size={compact ? 12 : 14} />}
                    label={compact ? undefined : "حديث"}
                    compact={compact}
                  />
                   <TabButton 
                    active={activeTab === 'dhikr'} 
                    onClick={() => setActiveTab('dhikr')} 
                    icon={<Heart size={compact ? 12 : 14} />}
                    label={compact ? undefined : "ذكر"}
                    compact={compact}
                  />
               </div>
            </div>

            {/* Content */}
            <div className="animate-fade-in text-center flex-grow flex flex-col justify-center">
              <p className={`font-mushaf text-white leading-[2.0] drop-shadow-sm px-1 line-clamp-3 ${activeTab === 'verse' ? (compact ? 'text-lg' : 'text-2xl') : (compact ? 'text-sm font-serif' : 'text-xl font-serif')}`}>
                  {activeContent.text} 
                  {activeTab === 'verse' && <AyahEndSymbol number={Number(activeContent.source.split('-')[1] || 0)} className={compact ? "text-sm" : "text-lg"} />}
              </p>

              <div className={`flex justify-center ${compact ? 'mt-2' : 'mt-6'}`}>
                  <span className="text-[10px] text-emerald-300/80 font-bold bg-white/5 px-2 py-0.5 rounded-lg">
                      {activeContent.source}
                  </span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, compact }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center gap-2 rounded-full transition-all ${compact ? 'w-7 h-7' : 'px-3 py-1.5'} ${active ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
  >
    {icon}
    {label && <span className="text-[10px] font-bold">{label}</span>}
  </button>
);