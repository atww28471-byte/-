import React from 'react';
import { Tab } from '../types';
import { MosqueIcon, QuranIcon, SubhaIcon, CalendarIcon } from './CustomIcons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center">
      {/* Floating Dock - Dark Frosted */}
      <div className="bg-primary-light/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-full py-3 px-6 flex items-center gap-6">
        
        <NavIcon 
          isActive={activeTab === Tab.HOME} 
          onClick={() => setActiveTab(Tab.HOME)}
          icon={<MosqueIcon size={24} />}
          isMain
        />

        <NavIcon 
          isActive={activeTab === Tab.QURAN} 
          onClick={() => setActiveTab(Tab.QURAN)}
          icon={<QuranIcon size={24} />}
          label="القرآن"
        />

        <NavIcon 
          isActive={activeTab === Tab.ATHKAR} 
          onClick={() => setActiveTab(Tab.ATHKAR)}
          icon={<SubhaIcon size={24} />}
          label="الأذكار"
        />

        <NavIcon 
          isActive={activeTab === Tab.ISLAMIC} 
          onClick={() => setActiveTab(Tab.ISLAMIC)}
          icon={<CalendarIcon size={24} />}
          label="إسلاميات"
        />

      </div>
    </div>
  );
};

const NavIcon = ({ isActive, onClick, icon, isMain, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, isMain?: boolean, label?: string }) => {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center transition-all duration-300 group ${isActive ? '-translate-y-1' : ''}`}
    >
      <div className={`
        flex items-center justify-center rounded-full transition-all duration-300
        ${isMain 
            ? (isActive ? 'w-14 h-14 bg-brand-gold text-primary shadow-lg shadow-brand-gold/20' : 'w-12 h-12 bg-white/10 text-white/50') 
            : (isActive ? 'w-10 h-10 text-brand-gold' : 'w-10 h-10 text-emerald-200/30 group-hover:text-white/60')
        }
      `}>
         {React.cloneElement(icon as React.ReactElement<any>, { 
           strokeWidth: isActive ? 2 : 1.5,
           size: isMain ? 26 : 22
         })}
      </div>
      
      {/* Dot Indicator */}
      {isActive && !isMain && (
        <span className="absolute -bottom-2 w-1 h-1 bg-brand-gold rounded-full shadow-gold-glow"></span>
      )}
    </button>
  )
}