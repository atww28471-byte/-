import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { fetchDailyAthkarStats } from '../services/api';
import { AthkarStats } from '../types';
import { SubhaIcon } from './CustomIcons';

interface AthkarSectionProps {
  onOpenAthkar?: () => void;
}

export const AthkarSection: React.FC<AthkarSectionProps> = ({ onOpenAthkar }) => {
  const [stats, setStats] = useState<AthkarStats | null>(null);

  useEffect(() => {
    // Fetch initial stats
    fetchDailyAthkarStats().then(setStats);
    
    // Add listener for storage changes (to update when user completes athkar)
    const handleStorageChange = () => {
        fetchDailyAthkarStats().then(setStats);
    };
    
    // We can also poll purely for this demo, or rely on Tab switching to refresh
    const interval = setInterval(handleStorageChange, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="w-full h-full">
      <div 
        onClick={onOpenAthkar}
        className="glass-panel rounded-[2.5rem] p-5 flex items-center justify-between transition-all duration-300 active:scale-[0.98] cursor-pointer group h-full"
      >
        
        <div className="flex items-center gap-5">
             {/* Progress Ring */}
             <div className="relative w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                  <circle 
                    cx="28" cy="28" r="24" 
                    stroke="#10b981" /* Emerald 500 */
                    strokeWidth="4" 
                    fill="none" 
                    strokeDasharray="150" 
                    strokeDashoffset={150 - (150 * percentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                  <SubhaIcon size={20} strokeWidth={1.5} />
                </div>
             </div>

             <div>
               <h3 className="text-lg font-serif font-bold text-white">{stats.category}</h3>
               <div className="flex items-center gap-1 mt-1">
                   <span className="text-xs font-bold text-emerald-400">{stats.completed}</span>
                   <span className="text-[10px] text-white/40">/ {stats.total} منجز</span>
               </div>
             </div>
        </div>

        <div className="w-10 h-10 flex items-center justify-center text-white/30 group-hover:text-white transition-colors">
             <ArrowLeft size={20} />
        </div>

      </div>
    </div>
  );
};