import React, { useEffect, useState } from 'react';
import { fetchSurahs } from '../../services/api';
import { Surah } from '../../types';
import { Search } from 'lucide-react';

interface SurahListProps {
  onSelectSurah: (surah: Surah) => void;
}

export const SurahList: React.FC<SurahListProps> = ({ onSelectSurah }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSurahs().then(data => {
      setSurahs(data);
      setLoading(false);
    });
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(searchTerm) || 
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 pb-24 animate-fade-in pt-4">
      
      {/* Search */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="ابحث عن سورة..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-11 pl-4 text-sm font-sans text-white placeholder-white/30 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-4 top-4 text-white/30" size={20} />
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
          ))
        ) : (
          filteredSurahs.map((surah) => (
            <div 
              key={surah.number}
              onClick={() => onSelectSurah(surah)}
              className="flex items-center p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/10 cursor-pointer transition-all active:scale-[0.98]"
            >
              {/* Number */}
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold font-sans text-emerald-400/60 ml-4">
                 {surah.number}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-xl font-serif text-white leading-none mb-1">{surah.name}</h3>
                <span className="text-xs text-white/40 font-sans">{surah.englishName}</span>
              </div>

              {/* Meta */}
              <div className="text-right">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 text-emerald-300/70`}>
                    {surah.numberOfAyahs} آيات
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};