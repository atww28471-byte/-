import React, { useState } from 'react';
import { Header } from './components/Header';
import { PrayerTimes } from './components/PrayerTimes';
import { BottomNav } from './components/BottomNav';
import { DailyContent } from './components/DailyContent';
import { QuranTab } from './components/Quran/QuranTab';
import { AthkarTab } from './components/Athkar/AthkarTab';
import { ToolsTab } from './components/Tools/ToolsTab';
import { SettingsModal } from './components/SettingsModal';
import { RecentActivities } from './components/RecentActivities';
import { Tab, Surah, QuranProgress } from './types';
import { getSurahData } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [showSettings, setShowSettings] = useState(false);
  
  // Navigation State for Deep Linking
  const [targetSurah, setTargetSurah] = useState<Surah | null>(null);
  const [targetPage, setTargetPage] = useState<number | undefined>(undefined);
  const [targetAthkarCategory, setTargetAthkarCategory] = useState<string | null>(null);

  const handleQuickAction = async (tab: Tab, params?: any) => {
      if (tab === Tab.QURAN && params?.surah) {
          const surahData = await getSurahData(params.surah);
          if (surahData) {
              setTargetSurah(surahData);
              setTargetPage(undefined);
          }
      }
      if (tab === Tab.ATHKAR && params?.category) {
          setTargetAthkarCategory(params.category);
      }
      setActiveTab(tab);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-gold selection:text-primary overflow-x-hidden">
      
      <main className="max-w-md mx-auto min-h-screen relative pb-32">
        
        {/* Header Logic - Show only on Home */}
        <div className={activeTab === Tab.HOME ? 'block' : 'hidden'}>
           <Header onOpenSettings={() => setShowSettings(true)} />
        </div>
        
        {/* Home Tab */}
        <div className={`transition-all duration-500 ease-in-out ${activeTab === Tab.HOME ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
          
          <div className="flex flex-col gap-6 px-6 mt-4">
            
            {/* 1. Centered Welcome Text */}
            <div className="animate-fade-in-up delay-100 text-center">
              <h1 className="text-2xl font-serif font-bold text-white mb-0.5">
                السلام عليكم
              </h1>
              <p className="text-white/60 text-xs">
                طاب يومك بذكر الله
              </p>
            </div>

            {/* 2. Prayer Times (Compact with Date) */}
            <div className="animate-fade-in-up delay-200">
               <PrayerTimes />
            </div>

            {/* 3. Recent Activities Section */}
            <div className="animate-fade-in-up delay-300">
               <h3 className="text-white font-bold text-lg mb-4 px-1">
                 نشاطك الأخير
               </h3>
               
               {/* Scrollable Circular Row */}
               <RecentActivities 
                 onNavigate={handleQuickAction} 
               />
            </div>

            {/* 4. Daily Content (Large Rectangular Card) */}
            <div className="animate-fade-in-up delay-400 min-h-[220px]">
               <DailyContent />
            </div>

          </div>

        </div>

        {/* Quran Tab */}
        <div className={`min-h-[80vh] ${activeTab === Tab.QURAN ? 'block animate-fade-in' : 'hidden'}`}>
           <QuranTab 
             initialSurah={targetSurah} 
             initialPage={targetPage} 
           />
        </div>

        {/* Athkar Tab */}
        <div className={`min-h-[80vh] ${activeTab === Tab.ATHKAR ? 'block animate-fade-in' : 'hidden'}`}>
           <AthkarTab initialCategoryId={targetAthkarCategory} />
        </div>

        {/* Islamic Tools Tab */}
        <div className={`min-h-[80vh] ${activeTab === Tab.ISLAMIC ? 'block animate-fade-in' : 'hidden'}`}>
           <ToolsTab />
        </div>

      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Settings Modal */}
      {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default App;