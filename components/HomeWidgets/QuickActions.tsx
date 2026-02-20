import React from 'react';
import { Compass, BookOpen, HeartHandshake, Moon } from 'lucide-react';
import { Tab } from '../../types';

interface QuickActionsProps {
  onNavigate: (tab: Tab, params?: any) => void;
  onOpenMood: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate, onOpenMood }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <ActionButton 
        icon={<BookOpen size={24} />} 
        label="الكهف" 
        onClick={() => onNavigate(Tab.QURAN, { surah: 18 })}
        color="text-emerald-400"
        bg="bg-emerald-400/10"
      />
      <ActionButton 
        icon={<HeartHandshake size={24} />} 
        label="مشاعري" 
        onClick={onOpenMood}
        color="text-rose-400"
        bg="bg-rose-400/10"
      />
      <ActionButton 
        icon={<Compass size={24} />} 
        label="القبلة" 
        onClick={() => onNavigate(Tab.ISLAMIC)}
        color="text-blue-400"
        bg="bg-blue-400/10"
      />
      <ActionButton 
        icon={<Moon size={24} />} 
        label="المساء" 
        onClick={() => onNavigate(Tab.ATHKAR, { category: 'evening' })}
        color="text-indigo-400"
        bg="bg-indigo-400/10"
      />
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, color, bg }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 group"
  >
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${bg} ${color} border border-white/5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">
      {label}
    </span>
  </button>
);
