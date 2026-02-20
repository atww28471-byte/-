
import React, { useEffect, useState, useRef } from 'react';
import { Surah, Reciter, Ayah } from '../../types';
import { fetchSurahDetails, getQuranPageUrl, saveLastRead, getReciters, getAyahAudioUrl, getSurahsOnPage, getSurahStartPage } from '../../services/api';
import { ArrowRight, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Play, Pause, Volume2, Headphones, ListMusic, AlertTriangle, Settings2, Moon, Sun, Smartphone, Maximize, X, Type, Settings, ChevronDown } from 'lucide-react';
import { getSettings, toggleWakeLock, saveSettings } from '../../services/settings';

interface SurahReaderProps {
  surah: Surah;
  initialPage?: number;
  onBack: () => void;
}

export const SurahReader: React.FC<SurahReaderProps> = ({ surah, initialPage, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Settings State
  const [settings, setSettings] = useState(getSettings());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(getReciters()[0]);
  const [showReciters, setShowReciters] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  // Audio Content State
  const [pageSurahs, setPageSurahs] = useState<{number: number, name: string}[]>([]);
  const [currentAudioSurah, setCurrentAudioSurah] = useState<{number: number, name: string} | null>(null);
  const [surahAyahs, setSurahAyahs] = useState<Ayah[]>([]); // Store all Ayahs of current audio surah
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null); // The specific Ayah playing
  const [showSurahSelector, setShowSurahSelector] = useState(false);
  const [surahToast, setSurahToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const isAutoAdvancing = useRef(false);

  // --- Initialize ---
  useEffect(() => {
    setSettings(getSettings());
    if (getSettings().keepScreenOn) {
        toggleWakeLock(true);
    }
    setLoading(true);
    
    if (initialPage) {
        setCurrentPage(initialPage);
        setLoading(false);
    } else {
        fetchSurahDetails(surah.number).then(data => {
            if (data && data.ayahs.length > 0) {
                const startPage = data.ayahs[0].page;
                setCurrentPage(startPage);
            }
            setLoading(false);
        });
    }

    const handleSettingsChange = () => setSettings(getSettings());
    window.addEventListener('settings-changed', handleSettingsChange);
    return () => window.removeEventListener('settings-changed', handleSettingsChange);
  }, [surah.number, initialPage]);

  // --- Page Change Logic ---
  useEffect(() => {
    if (!loading) {
      saveLastRead({
        surahName: surah.name,
        surahNumber: surah.number,
        ayahNumber: 1, 
        juz: 1, 
        page: currentPage
      });

      const surahsOnThisPage = getSurahsOnPage(currentPage);
      setPageSurahs(surahsOnThisPage);

      if (surahsOnThisPage.length > 0) {
        // Determine which Surah should be "Active" for audio context
        const stillOnPage = currentAudioSurah && surahsOnThisPage.find(s => s.number === currentAudioSurah.number);
        
        let targetSurah = currentAudioSurah;

        if (!stillOnPage && surahsOnThisPage[0]) {
           const newSurah = surahsOnThisPage[0];
           if (currentAudioSurah && currentAudioSurah.number !== newSurah.number) {
              setSurahToast(newSurah.name);
              setTimeout(() => setSurahToast(null), 2000);
           }
           targetSurah = newSurah;
           setCurrentAudioSurah(newSurah);
        } else if (!currentAudioSurah) {
           targetSurah = surahsOnThisPage[0];
           setCurrentAudioSurah(surahsOnThisPage[0]);
        }

        // IMPORTANT: When page changes, if we are NOT playing, we reset the currentAyah
        // to the first ayah of this page so that when user hits Play, it starts correctly.
        // We only fetch if targetSurah matches currentAyah's surah to avoid loop or unnecessary fetches.
        if (targetSurah && !isPlaying) {
            // Logic handled in the fetchAyahs effect mostly
        }
      }
    }
    setImgLoading(true);
    setImgError(false);
  }, [currentPage, loading]);

  // --- Fetch Ayahs when Audio Surah Changes ---
  useEffect(() => {
      if (currentAudioSurah) {
          // If we already have the ayahs for this surah, don't re-fetch
          if (surahAyahs.length > 0 && surahAyahs[0].page === undefined) {
              // Safety check, ensure full data
          } else if (surahAyahs.length > 0 && surahAyahs[0].text && surahAyahs[0].numberInSurah === 1) {
             // Check if it matches the current surah number from metadata (not stored in Ayah object directly usually in this context)
             // We'll just fetch to be safe as it is fast text data
          }
          
          fetchSurahDetails(currentAudioSurah.number).then(data => {
              if (data) {
                  setSurahAyahs(data.ayahs);
                  // Prepare first Ayah for this Page
                  const firstOnPage = data.ayahs.find(a => a.page === currentPage);
                  if (firstOnPage) {
                      setCurrentAyah(firstOnPage);
                  } else {
                      setCurrentAyah(data.ayahs[0]);
                  }
              }
          });
      }
  }, [currentAudioSurah]);

  // --- Update Active Ayah when Page Changes (if stopped) ---
  useEffect(() => {
      if (!isPlaying && surahAyahs.length > 0) {
          const firstOnPage = surahAyahs.find(a => a.page === currentPage);
          if (firstOnPage) {
              setCurrentAyah(firstOnPage);
          }
      }
  }, [currentPage, surahAyahs, isPlaying]);


  useEffect(() => {
    // Reset play state if reciter changes
    if (isPlaying) {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
    }
  }, [selectedReciter]); 

  // --- Helpers ---
  const updateReaderSetting = (key: any, value: any) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      saveSettings(newSettings);
  };

  // --- Audio Handlers ---
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    // If we have error, try to reload/reset
    if (audioError) {
        setAudioError(false);
        audioRef.current.load();
    }

    if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
    } else {
        // If currentAyah is null, ensure we set it to start of page
        if (!currentAyah && surahAyahs.length > 0) {
             const start = surahAyahs.find(a => a.page === currentPage) || surahAyahs[0];
             setCurrentAyah(start);
             // React state update is async, audio src needs to update. 
             // We rely on the Audio element's auto-play logic or effect here?
             // Actually, useEffect will trigger on currentAyah change.
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch(error => {
                    console.warn("Playback failed safely:", error.message);
                    setIsPlaying(false);
                });
        }
    }
  };

  const handleAudioEnded = () => {
      if (settings.autoAdvance && currentAyah && surahAyahs.length > 0) {
          const currentIndex = surahAyahs.findIndex(a => a.number === currentAyah.number);
          const nextAyah = surahAyahs[currentIndex + 1];

          if (nextAyah) {
              isAutoAdvancing.current = true; // Guard against onPause
              setCurrentAyah(nextAyah);
              // Check if next Ayah is on a new page
              if (nextAyah.page !== currentPage) {
                  setCurrentPage(nextAyah.page);
              }
              // The Audio element src will update, and we need to play it.
              // We use a small timeout or rely on 'autoPlay' attribute which behaves inconsistently in React dynamic src.
              // Best approach: Use an effect on currentAyah.
          } else {
              // End of Surah
              setIsPlaying(false);
              // Option: Go to next Surah? (Complex, keeping it simple for now)
          }
      } else {
          setIsPlaying(false);
      }
  };

  // Effect to auto-play when currentAyah changes IF we were playing
  useEffect(() => {
      if (isPlaying && audioRef.current) {
          audioRef.current.load();
          const p = audioRef.current.play();
          if (p) p.catch(e => console.log("Auto-advance play error"));
      }
      // Reset guard after effect runs
      isAutoAdvancing.current = false;
  }, [currentAyah]);

  // --- Navigation ---
  const goToNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage(p => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      window.scrollTo(0, 0);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const sensitivityMap = [80, 50, 20];
    const minSwipeDistance = sensitivityMap[settings.swipeSensitivity] || 50;
    
    if (distance > minSwipeDistance) goToNextPage();
    else if (distance < -minSwipeDistance) goToPrevPage();
  };

  const toggleControls = () => setShowControls(!showControls);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-primary z-[100] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const reciters = getReciters();

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col h-full overflow-hidden select-none transition-colors duration-500 ${settings.mushafDarkMode ? 'bg-[#121212]' : 'bg-[#fdfbf6]'}`}>
      
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-30 p-4 pt-10 bg-gradient-to-b ${settings.mushafDarkMode ? 'from-black/90' : 'from-primary/90'} to-transparent flex items-center justify-between transition-all duration-300 ${showControls && settings.showTopBar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
          >
            <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={() => pageSurahs.length > 1 && setShowSurahSelector(true)}
            className="flex-1 flex flex-col items-center mx-4 active:scale-95 transition-transform"
          >
             <div className="flex items-center gap-2">
                 <span className="text-white font-serif font-bold text-lg leading-none drop-shadow-md">
                    {currentAudioSurah ? currentAudioSurah.name : surah.name}
                 </span>
                 {pageSurahs.length > 1 && <ChevronDown size={16} className="text-white/70" />}
             </div>
             {pageSurahs.length > 1 && (
                 <span className="text-[10px] text-emerald-300 flex items-center gap-1 mt-1 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <ListMusic size={10} />
                    {pageSurahs.length} سور في الصفحة
                 </span>
             )}
          </button>

          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
          >
            <Settings size={20} />
          </button>
      </div>

      {/* Main Image Area */}
      <div 
        className={`flex-1 relative flex items-center justify-center transition-colors duration-500 ${settings.mushafDarkMode ? 'bg-[#121212]' : 'bg-[#fdfbf6]'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={toggleControls}
      >
         
         {settings.tapNavigation && (
             <>
                 <div className="absolute right-0 top-0 bottom-0 w-[20%] z-20 active:bg-black/5 transition-colors" onClick={(e) => { e.stopPropagation(); goToPrevPage(); }}></div>
                 <div className="absolute left-0 top-0 bottom-0 w-[20%] z-20 active:bg-black/5 transition-colors" onClick={(e) => { e.stopPropagation(); goToNextPage(); }}></div>
             </>
         )}

         {/* Ayah Audio Element */}
         {currentAudioSurah && currentAyah && (
             <audio 
                ref={audioRef} 
                src={getAyahAudioUrl(selectedReciter.id, currentAudioSurah.number, currentAyah.numberInSurah)}
                onEnded={handleAudioEnded} 
                onPlay={() => { setIsPlaying(true); setAudioError(false); }}
                onError={() => { console.warn("Audio error"); setAudioError(true); setIsPlaying(false); }} 
                preload="auto"
             />
         )}

         {imgLoading && !imgError && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center z-0 ${settings.mushafDarkMode ? 'bg-black' : 'bg-[#fdfbf6]'}`}>
               <div className="w-8 h-8 border-2 border-emerald-800/20 border-t-emerald-800 rounded-full animate-spin mb-4"></div>
               <span className="text-emerald-800/50 font-serif text-sm">جاري تحميل المصحف...</span>
            </div>
         )}

         {imgError && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fdfbf6] z-10 p-4 text-center">
                <AlertCircle className="text-red-500 mb-2" size={40} />
                <p className="text-emerald-950 mb-2 font-bold text-lg">تعذر تحميل الصفحة</p>
                <button 
                    onClick={(e) => { e.stopPropagation(); setImgError(false); setImgLoading(true); const src = getQuranPageUrl(currentPage); setCurrentPage(currentPage); }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-800 text-white rounded-full shadow-lg active:scale-95 transition-transform"
                >
                    <RefreshCw size={18} />
                    <span>إعادة المحاولة</span>
                </button>
             </div>
         )}

         {surahToast && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-6 py-4 rounded-3xl z-30 animate-fade-in flex flex-col items-center shadow-2xl border border-white/10 pointer-events-none">
                 <span className="text-emerald-400 text-xs font-bold mb-1">تم الانتقال إلى</span>
                 <span className="text-white text-2xl font-serif font-bold">{surahToast}</span>
             </div>
         )}

         <div className="w-full h-full overflow-y-auto no-scrollbar flex items-center justify-center p-0 pb-48 pt-20">
            {!imgError && (
                <div className={`transition-all duration-300 ${settings.showPageBorders ? 'p-2 sm:p-4 border-l border-r border-black/5' : ''}`}>
                    <img 
                        key={currentPage} 
                        src={getQuranPageUrl(currentPage)}
                        alt={`Page ${currentPage}`}
                        className={`
                            w-full h-auto max-w-full md:max-w-xl transition-all duration-500
                            ${imgLoading ? 'opacity-0' : 'opacity-100'}
                            ${settings.mushafDarkMode ? 'filter invert-[0.9] hue-rotate-180 brightness-90 contrast-125' : ''}
                        `}
                        style={{ mixBlendMode: settings.mushafDarkMode ? 'screen' : 'multiply' }}
                        onLoad={() => setImgLoading(false)}
                        onError={() => { setImgLoading(false); setImgError(true); }}
                    />
                </div>
            )}
         </div>
      </div>

      {/* Internal Settings Modal (Bottom Sheet Style) */}
      {showSettingsModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={() => setShowSettingsModal(false)}>
              <div className="bg-[#1a201d] rounded-t-[2rem] border-t border-white/10 p-6 pb-12 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-serif font-bold text-xl">إعدادات المصحف</h3>
                      <button onClick={() => setShowSettingsModal(false)} className="text-white/50 hover:text-white p-2"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-4">
                      {/* Theme Toggle */}
                      <div className="bg-white/5 rounded-2xl p-1 flex">
                          <button 
                            onClick={() => updateReaderSetting('mushafDarkMode', false)} 
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${!settings.mushafDarkMode ? 'bg-white text-black shadow-lg' : 'text-white/50'}`}
                          >
                              <Sun size={18} /> فاتح
                          </button>
                          <button 
                            onClick={() => updateReaderSetting('mushafDarkMode', true)} 
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${settings.mushafDarkMode ? 'bg-gray-800 text-white shadow-lg' : 'text-white/50'}`}
                          >
                              <Moon size={18} /> داكن
                          </button>
                      </div>

                      {/* Toggles List */}
                      <div className="bg-white/5 rounded-2xl overflow-hidden">
                          <SettingsToggle 
                             label="إطار الصفحة" 
                             checked={settings.showPageBorders} 
                             onChange={(v) => updateReaderSetting('showPageBorders', v)} 
                             icon={<Maximize size={16} />}
                          />
                          <SettingsToggle 
                             label="منع إغلاق الشاشة" 
                             checked={settings.keepScreenOn} 
                             onChange={(v) => updateReaderSetting('keepScreenOn', v)} 
                             icon={<Smartphone size={16} />}
                          />
                          <SettingsToggle 
                             label="التنقل باللمس" 
                             checked={settings.tapNavigation} 
                             onChange={(v) => updateReaderSetting('tapNavigation', v)} 
                             icon={<Smartphone size={16} />}
                             isLast
                          />
                      </div>
                      
                      {/* Audio Auto Advance */}
                      <div className="bg-white/5 rounded-2xl overflow-hidden p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <Volume2 size={18} className="text-brand-gold" />
                              <span className="text-white font-medium text-sm">الانتقال التلقائي مع التلاوة</span>
                          </div>
                          <div 
                              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${settings.autoAdvance ? 'bg-brand-gold' : 'bg-white/10'}`}
                              onClick={() => updateReaderSetting('autoAdvance', !settings.autoAdvance)}
                          >
                              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${settings.autoAdvance ? 'left-1' : 'right-1'}`}></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-30 pb-8 pt-12 bg-gradient-to-t ${settings.mushafDarkMode ? 'from-black via-black/80' : 'from-primary via-primary/80'} to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
         <div className="px-6 flex flex-col gap-4">
            
            <div onClick={(e) => e.stopPropagation()} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-lg relative">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowReciters(true)}
                            className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 border border-white/20 overflow-hidden relative shadow-lg active:scale-95 transition-transform"
                        >
                             <img src={selectedReciter.image} alt={selectedReciter.name} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Settings2 size={14} className="text-white" />
                             </div>
                        </button>
                        
                        <div onClick={() => pageSurahs.length > 1 && setShowSurahSelector(true)} className="cursor-pointer">
                            <div className="text-white text-sm font-bold font-serif flex items-center gap-1">
                                {currentAudioSurah?.name}
                                {pageSurahs.length > 1 && <ListMusic size={12} className="text-brand-gold animate-pulse" />}
                            </div>
                            <div className="text-emerald-400 text-[10px] flex items-center gap-1">
                                {audioError ? (
                                    <span className="text-red-400 flex items-center gap-1">
                                        <AlertTriangle size={10} /> غير متاح
                                    </span>
                                ) : (
                                    <>
                                        <Volume2 size={10} />
                                        {selectedReciter.name}
                                        {currentAyah && <span className="text-white/50 mx-1">- آية {currentAyah.numberInSurah}</span>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        id="play-button"
                        onClick={togglePlay}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-gold-glow active:scale-95 transition-transform ${audioError ? 'bg-red-500/80 text-white' : 'bg-brand-gold text-primary'}`}
                        disabled={audioError && !currentAudioSurah}
                    >
                        {audioError ? <RefreshCw size={18} /> : (isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />)}
                    </button>
                </div>
                
                <div className="mt-3 px-1">
                    <div className="relative w-full h-6 flex items-center">
                        <input 
                            type="range" 
                            min="1" 
                            max="604" 
                            value={currentPage}
                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                            className="absolute z-20 w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-gold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-gold-glow hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1 px-1">
                        <span>1</span>
                        <span className="text-emerald-400 font-bold">الصفحة {currentPage}</span>
                        <span>604</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {showReciters && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={() => setShowReciters(false)}>
            <div className="bg-[#1a201d] rounded-t-3xl border-t border-white/10 max-h-[70vh] flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-serif text-lg font-bold">اختر القارئ</h3>
                    <button onClick={() => setShowReciters(false)} className="text-white/50 hover:text-white p-2">إغلاق</button>
                </div>
                
                <div className="overflow-y-auto p-4 grid grid-cols-2 gap-3 pb-8 custom-scrollbar">
                    {reciters.map(reciter => (
                        <button 
                            key={reciter.id}
                            onClick={() => {
                                setSelectedReciter(reciter);
                                setShowReciters(false);
                            }}
                            className={`flex flex-col items-center p-3 rounded-2xl border transition-all active:scale-[0.98] ${selectedReciter.id === reciter.id ? 'bg-brand-gold/10 border-brand-gold' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                        >
                            <div className={`w-20 h-20 rounded-full mb-2 overflow-hidden border-2 shadow-lg relative bg-gradient-to-b from-gray-300 to-gray-500 ${selectedReciter.id === reciter.id ? 'border-brand-gold' : 'border-white/10'}`}>
                                <img src={reciter.image} alt={reciter.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`font-serif text-sm font-bold ${selectedReciter.id === reciter.id ? 'text-brand-gold' : 'text-white'}`}>{reciter.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {showSurahSelector && (
            <div className="absolute inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in p-6" onClick={() => setShowSurahSelector(false)}>
                <div className="bg-[#1a201d] w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="text-white font-serif font-bold">اختر السورة للتلاوة</h3>
                        <button onClick={() => setShowSurahSelector(false)}><X size={20} className="text-white/50" /></button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {pageSurahs.map(s => (
                            <button
                                key={s.number}
                                onClick={() => {
                                    setCurrentAudioSurah(s);
                                    setShowSurahSelector(false);
                                    setIsPlaying(false); // Reset play state
                                }}
                                className={`w-full text-right px-5 py-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors
                                    ${currentAudioSurah?.number === s.number ? 'bg-brand-gold/10 text-brand-gold' : 'text-white'}
                                `}
                            >
                                <span className="font-serif text-lg">{s.name}</span>
                                {currentAudioSurah?.number === s.number && <Volume2 size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
      )}

    </div>
  );
};

const SettingsToggle: React.FC<{label: string, checked: boolean, onChange: (v: boolean) => void, icon: React.ReactNode, isLast?: boolean}> = ({ label, checked, onChange, icon, isLast }) => (
    <div 
        onClick={() => onChange(!checked)}
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors ${!isLast ? 'border-b border-white/5' : ''}`}
    >
        <div className="flex items-center gap-3">
            <span className="text-white/50">{icon}</span>
            <span className="text-white text-sm font-medium">{label}</span>
        </div>
        <div className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-emerald-600' : 'bg-white/10'}`}>
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-1' : 'right-1'}`}></div>
        </div>
    </div>
);
