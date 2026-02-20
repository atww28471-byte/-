
import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { getDailyContent } from '../services/api';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const [greeting, setGreeting] = useState('');
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    // 1. Time-based Greeting
    const hour = new Date().getHours();
    let greet = "السلام عليكم";
    if (hour >= 4 && hour < 12) greet = "صباح الخير";
    else if (hour >= 12 && hour < 17) greet = "طاب يومك";
    else greet = "مساء الخير";
    setGreeting(greet);

    // 2. Daily Spiritual Snippet
    const content = getDailyContent();
    // We prioritize the Verse for the header as it's usually the most visually iconic in Uthmani script
    // If the verse is too long, we could fallback to Dhikr, but for now we trust the curation.
    setDailyQuote(content.verse.text);
  }, []);

  return (
    <header className="flex justify-between items-center pt-12 pb-2 px-6">
      
      {/* Settings Button */}
      <button 
        onClick={onOpenSettings}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
      >
        <Settings size={20} strokeWidth={1.5} />
      </button>

      {/* Logo */}
      <div className="relative w-20 h-20 flex items-center justify-center">
         <img 
            src="https://i.ibb.co/MxFwCgqh/Whats-App-Image-2026-02-15-at-6-41-39-AM-removebg-preview.png" 
            alt="Logo" 
            className="w-full h-full object-contain drop-shadow-lg filter brightness-0 invert opacity-90"
          />
      </div>
    </header>
  );
};
