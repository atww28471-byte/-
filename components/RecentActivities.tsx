import React, { useEffect, useState } from 'react';
import { BookOpen, Moon, Sun, Compass, Activity } from 'lucide-react';
import { fetchLastRead } from '../services/api';
import { QuranProgress, Tab } from '../types';

interface RecentActivitiesProps {
  onNavigate: (tab: Tab, params?: any) => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ onNavigate }) => {
  const [lastRead, setLastRead] = useState<QuranProgress | null>(null);
  
  useEffect(() => {
    fetchLastRead().then(setLastRead);
  }, []);

  const hour = new Date().getHours();
  const isMorning = hour < 12;

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1">
      
      {/* 1. Last Read (Real Activity) */}
      <ActivityItem 
        icon={<BookOpen size={24} />}
        label={lastRead ? `تابع: ${lastRead.surahName}` : "سورة الكهف"}
        onClick={() => onNavigate(Tab.QURAN, lastRead ? { surah: lastRead.surahNumber } : { surah: 18 })}
      />

      {/* 2. Athkar (Contextual Real Activity) */}
      <ActivityItem 
        icon={isMorning ? <Sun size={24} /> : <Moon size={24} />}
        label={isMorning ? "أذكار الصباح" : "أذكار المساء"}
        onClick={() => onNavigate(Tab.ATHKAR, { category: isMorning ? 'morning' : 'evening' })}
      />

      {/* 3. Qibla */}
      <ActivityItem 
        icon={<Compass size={24} />}
        label="القبلة"
        onClick={() => onNavigate(Tab.ISLAMIC)}
      />

      {/* 4. Tasbih */}
      <ActivityItem 
        icon={<Activity size={24} />}
        label="السبحة"
        onClick={() => onNavigate(Tab.ATHKAR)}
      />

       {/* 5. Sleep Athkar */}
       <ActivityItem 
        icon={<Moon size={24} />}
        label="أذكار النوم"
        onClick={() => onNavigate(Tab.ATHKAR, { category: 'sleep' })}
      />

    </div>
  );
};

const ActivityItem = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 min-w-[80px] group"
  >
    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 shadow-lg group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
      {icon}
    </div>
    <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors whitespace-nowrap">
      {label}
    </span>
  </button>
);
