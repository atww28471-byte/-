import React, { useState, useEffect } from 'react';
import { SurahList } from './SurahList';
import { SurahReader } from './SurahReader';
import { Surah } from '../../types';

interface QuranTabProps {
  initialSurah?: Surah | null;
  initialPage?: number;
}

export const QuranTab: React.FC<QuranTabProps> = ({ initialSurah, initialPage }) => {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  useEffect(() => {
    if (initialSurah) {
      setSelectedSurah(initialSurah);
    }
  }, [initialSurah]);

  if (selectedSurah) {
    return (
        <SurahReader 
            surah={selectedSurah} 
            initialPage={initialPage}
            onBack={() => setSelectedSurah(null)} 
        />
    );
  }

  return <SurahList onSelectSurah={setSelectedSurah} />;
};