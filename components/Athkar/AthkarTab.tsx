import React, { useState, useEffect } from 'react';
import { ATHKAR_DATA, ADIYAH_DATA, RAMADAN_CATEGORY } from '../../data/athkar';
import { AthkarCategory, ThikrItem } from '../../types';
import { Sun, Moon, Star, ArrowRight, RotateCcw, Check, Search, Plane, Utensils, HeartPulse, CloudRain, BookOpen, MapPin, Volume2, Copy, Compass, ChevronRight } from 'lucide-react';
import { SubhaIcon, MosqueIcon, KaabaIcon, CompassIcon } from '../CustomIcons';
import { saveAthkarProgress, getAthkarProgress } from '../../services/api';

enum ViewState {
    MAIN = 'main',
    ATHKAR_LIST = 'athkar_list',
    ADIYAH_LIST = 'adiyah_list',
    MASBAHA = 'masbaha',
    QIBLA = 'qibla',
    CATEGORY_DETAIL = 'category_detail'
}

interface AthkarTabProps {
    initialCategoryId?: string | null;
}

export const AthkarTab: React.FC<AthkarTabProps> = ({ initialCategoryId }) => {
  const [view, setView] = useState<ViewState>(ViewState.MAIN);
  const [selectedCategory, setSelectedCategory] = useState<AthkarCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAthkarData, setActiveAthkarData] = useState<AthkarCategory[]>(ATHKAR_DATA);

  // Check for Ramadan and handle Deep Linking
  useEffect(() => {
    // 1. Determine Ramadan Status
    const today = new Date();
    // Using Intl.DateTimeFormat to get Hijri Month Index
    // 'u-ca-islamic-umalqura' returns month numeric 1-12. Ramadan is 9.
    const hijriMonth = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(today);
    
    // NOTE: For testing purposes or logic strictness:
    // If the output is "9" or "09", it is Ramadan.
    const isRamadan = hijriMonth === '9' || hijriMonth === '09';

    // 2. Prepare Data List
    let baseData = [...ATHKAR_DATA];
    if (isRamadan) {
        // Prepend Ramadan Category if it's Ramadan
        baseData = [RAMADAN_CATEGORY, ...ATHKAR_DATA];
    }
    setActiveAthkarData(baseData);

    // 3. Handle Deep Link
    if (initialCategoryId) {
        const allCategories = [...baseData, ...ADIYAH_DATA];
        // Special check for ramadan if deep linked but not added yet (edge case)
        if (initialCategoryId === 'ramadan_special' && !isRamadan) {
            allCategories.push(RAMADAN_CATEGORY);
        }

        const category = allCategories.find(c => c.id === initialCategoryId);
        if (category) {
            setSelectedCategory(category);
            setView(ViewState.CATEGORY_DETAIL);
        }
    }
  }, [initialCategoryId]);

  // Main Navigation Handler
  const navigateTo = (v: ViewState) => setView(v);

  // Render Based on View State
  if (view === ViewState.CATEGORY_DETAIL && selectedCategory) {
      return <AthkarDetail category={selectedCategory} onBack={() => setView(selectedCategory.id === 'quranic' || selectedCategory.id === 'prophetic' || selectedCategory.id === 'istighfar' || selectedCategory.id === 'rizq' || selectedCategory.id === 'parents' || selectedCategory.id === 'distress' ? ViewState.ADIYAH_LIST : ViewState.ATHKAR_LIST)} />;
  }

  if (view === ViewState.MASBAHA) {
      return <Masbaha onBack={() => setView(ViewState.MAIN)} />;
  }

  if (view === ViewState.QIBLA) {
      return <QiblaFinder onBack={() => setView(ViewState.MAIN)} />;
  }

  // --- Main Dashboard ---
  if (view === ViewState.MAIN) {
      return (
        <div className="px-6 pt-10 pb-28 animate-fade-in min-h-screen">
            <h2 className="text-3xl font-serif font-bold text-white mb-2">الأذكار والدعاء</h2>
            <p className="text-emerald-200/50 font-sans text-sm mb-8">حصن المسلم والقبلة والمسبحة</p>

            {/* Top Big Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                    onClick={() => setView(ViewState.ATHKAR_LIST)}
                    className="bg-gradient-to-br from-emerald-800 to-emerald-900 border border-white/10 rounded-3xl p-6 h-40 flex flex-col justify-between items-start relative overflow-hidden group active:scale-[0.98] transition-transform"
                >
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-serif font-bold text-white block">الأذكار</span>
                        <span className="text-xs text-white/50">أذكار الصباح والمساء</span>
                    </div>
                </button>

                <button 
                    onClick={() => setView(ViewState.ADIYAH_LIST)}
                    className="bg-gradient-to-br from-brand-goldDim to-brand-gold border border-white/10 rounded-3xl p-6 h-40 flex flex-col justify-between items-start relative overflow-hidden group active:scale-[0.98] transition-transform"
                >
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center text-white">
                        <MosqueIcon size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-serif font-bold text-white block">الأدعية</span>
                        <span className="text-xs text-white/70">أدعية قرآنية ونبوية</span>
                    </div>
                </button>
            </div>

            {/* Utilities Row */}
            <h3 className="text-white font-bold mb-4 px-2">أدوات إسلامية</h3>
            <div className="grid grid-cols-2 gap-4">
                 <button 
                    onClick={() => setView(ViewState.MASBAHA)}
                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
                 >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <SubhaIcon size={22} />
                    </div>
                    <div className="text-right">
                        <span className="block font-bold text-white text-sm">المسبحة</span>
                        <span className="text-[10px] text-white/40">عداد التسبيح</span>
                    </div>
                 </button>

                 <button 
                    onClick={() => setView(ViewState.QIBLA)}
                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
                 >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <CompassIcon size={22} />
                    </div>
                    <div className="text-right">
                        <span className="block font-bold text-white text-sm">القبلة</span>
                        <span className="text-[10px] text-white/40">اتجاه الكعبة</span>
                    </div>
                 </button>
            </div>
        </div>
      );
  }

  // --- Lists View (Athkar or Adiyah) ---
  const isAthkar = view === ViewState.ATHKAR_LIST;
  const data = isAthkar ? activeAthkarData : ADIYAH_DATA;
  const title = isAthkar ? "أقسام الأذكار" : "أقسام الأدعية";

  const filtered = data.filter(cat => cat.title.includes(searchTerm) || cat.items.some(i => i.text.includes(searchTerm)));

  return (
    <div className="px-6 pt-10 pb-28 animate-fade-in min-h-screen flex flex-col">
       {/* Header */}
       <div className="flex items-center gap-4 mb-6">
           <button onClick={() => setView(ViewState.MAIN)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/20 active:scale-95">
               <ArrowRight size={20} />
           </button>
           <h2 className="text-2xl font-serif font-bold text-white">{title}</h2>
       </div>

       {/* Search */}
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="بحث..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-10 pl-4 text-sm font-sans text-white placeholder-white/30 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-3 text-white/30" size={18} />
        </div>

       <div className="grid grid-cols-1 gap-3">
          {filtered.map(cat => (
             <button 
                key={cat.id}
                onClick={() => { setSelectedCategory(cat); setView(ViewState.CATEGORY_DETAIL); }}
                className={`p-4 rounded-2xl flex items-center justify-between group active:bg-white/10 transition-colors border ${cat.id === 'ramadan_special' ? 'bg-brand-gold/10 border-brand-gold/30' : 'bg-white/5 border-white/5'}`}
             >
                 <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${cat.id === 'ramadan_special' ? 'bg-brand-gold text-primary' : 'bg-gradient-to-br from-emerald-900 to-primary text-emerald-400 group-hover:text-white'}`}>
                        {getCategoryIcon(cat.iconName)}
                     </div>
                     <div className="text-right">
                         <span className={`block font-bold text-lg font-serif ${cat.id === 'ramadan_special' ? 'text-brand-gold' : 'text-white'}`}>{cat.title}</span>
                         <span className="text-xs text-white/40">{cat.items.length} عنصر</span>
                     </div>
                 </div>
                 <ChevronRight size={20} className={`rotate-180 ${cat.id === 'ramadan_special' ? 'text-brand-gold' : 'text-white/20'}`} />
             </button>
          ))}
       </div>
    </div>
  );
};

// --- Helper Functions ---
const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'sun': return <Sun size={24} strokeWidth={1.5} />;
      case 'moon': return <Moon size={24} strokeWidth={1.5} />;
      case 'star': return <Star size={24} strokeWidth={1.5} />;
      case 'prayer': return <MosqueIcon size={24} strokeWidth={1.5} />;
      case 'travel': return <Plane size={24} strokeWidth={1.5} />;
      case 'food': return <Utensils size={24} strokeWidth={1.5} />;
      case 'illness': return <HeartPulse size={24} strokeWidth={1.5} />;
      case 'nature': return <CloudRain size={24} strokeWidth={1.5} />;
      case 'hajj': return <MapPin size={24} strokeWidth={1.5} />;
      case 'general': return <BookOpen size={24} strokeWidth={1.5} />;
      default: return <SubhaIcon size={24} />;
    }
};

// --- Components (Masbaha, Qibla, Detail) ---

const Masbaha: React.FC<{onBack: () => void}> = ({onBack}) => {
    const [count, setCount] = useState(0);

    const increment = () => {
        setCount(c => c + 1);
        if (navigator.vibrate) navigator.vibrate(40);
    }

    return (
        <div className="fixed inset-0 bg-primary z-50 flex flex-col">
            <div className="p-6 pt-10 flex items-center justify-between">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><ArrowRight /></button>
                <h2 className="text-xl font-serif font-bold text-white">المسبحة الإلكترونية</h2>
                <div className="w-10"></div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="mb-10 text-center">
                    <span className="text-8xl font-mono text-white font-bold tracking-tighter drop-shadow-2xl">{count}</span>
                    <p className="text-emerald-400/60 mt-2 text-sm">تسبيحة</p>
                </div>

                <button 
                    onClick={increment}
                    className="w-64 h-64 rounded-full bg-gradient-to-b from-brand-green to-primary-light border-8 border-white/5 shadow-2xl flex items-center justify-center active:scale-95 transition-all relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
                    <div className="w-56 h-56 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                        <SubhaIcon size={64} className="text-white/80" />
                    </div>
                </button>

                <button onClick={() => setCount(0)} className="mt-12 flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                    <RotateCcw size={16} />
                    <span>تصفير العداد</span>
                </button>
            </div>
        </div>
    )
}

const QiblaFinder: React.FC<{onBack: () => void}> = ({onBack}) => {
    // Note: Full Qibla implementation requires DeviceOrientationEvent logic.
    // For this environment, we will provide a UI placeholder that would connect to real logic.
    
    return (
        <div className="fixed inset-0 bg-primary z-50 flex flex-col">
             <div className="p-6 pt-10 flex items-center justify-between">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><ArrowRight /></button>
                <h2 className="text-xl font-serif font-bold text-white">القبلة</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="relative w-64 h-64 mb-8">
                     {/* Compass Base */}
                     <div className="absolute inset-0 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center">
                         <div className="absolute top-2 text-white/50 text-xs font-bold">N</div>
                         <div className="absolute bottom-2 text-white/50 text-xs font-bold">S</div>
                         <div className="absolute left-2 text-white/50 text-xs font-bold">W</div>
                         <div className="absolute right-2 text-white/50 text-xs font-bold">E</div>
                     </div>
                     
                     {/* Needle (Static Representation for now) */}
                     <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                         <div className="w-2 h-32 bg-gradient-to-t from-transparent to-brand-gold rounded-full transform -rotate-45 origin-bottom-center relative" style={{ transform: 'rotate(-25deg)' }}>
                             <div className="absolute -top-4 -left-3">
                                 <KaabaIcon size={32} className="text-brand-gold drop-shadow-glow" />
                             </div>
                         </div>
                     </div>
                </div>

                <h3 className="text-white font-bold text-lg mb-2">تحديد القبلة</h3>
                <p className="text-white/50 text-sm max-w-xs">
                    يرجى تفعيل خدمة الموقع والسماح باستخدام البوصلة للحصول على اتجاه دقيق للكعبة المشرفة.
                </p>
                <button className="mt-8 px-8 py-3 bg-emerald-700 rounded-full text-white font-bold shadow-lg">
                    معايرة البوصلة
                </button>
            </div>
        </div>
    )
}

// Reuse existing ThikrCard but remove audio
const AthkarDetail: React.FC<{category: AthkarCategory, onBack: () => void}> = ({ category, onBack }) => {
  return (
    <div className="fixed inset-0 bg-primary z-50 flex flex-col overflow-hidden">
      <div className="bg-primary-light/50 backdrop-blur-md border-b border-white/5 pt-12 pb-4 px-6 flex items-center gap-4 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors active:scale-95">
          <ArrowRight size={20} />
        </button>
        <h2 className="text-xl font-serif font-bold text-white">{category.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32 no-scrollbar">
        {category.items.map((item) => (
          <ThikrCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const ThikrCard: React.FC<{item: ThikrItem}> = ({ item }) => {
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const progress = getAthkarProgress();
    const savedCount = progress[item.id] || 0;
    setCount(savedCount);
    if (savedCount >= item.count) {
        setIsCompleted(true);
    }
  }, [item.id, item.count]);

  const handlePress = () => {
    if (isCompleted) return;
    if (navigator.vibrate) navigator.vibrate(50);
    
    const newCount = count + 1;
    setCount(newCount);
    
    // Save to persistence
    saveAthkarProgress(item.id, newCount);

    if (newCount >= item.count) {
        setIsCompleted(true);
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  };

  const handleReset = (e: React.MouseEvent) => { 
      e.stopPropagation(); 
      setCount(0); 
      setIsCompleted(false);
      saveAthkarProgress(item.id, 0); 
  };
  
  const handleCopy = (e: React.MouseEvent) => { e.stopPropagation(); navigator.clipboard.writeText(item.text); };
  const progress = Math.min((count / item.count) * 100, 100);

  return (
    <div onClick={handlePress} className={`relative bg-white/5 rounded-3xl p-5 border transition-all duration-300 cursor-pointer select-none overflow-hidden group ${isCompleted ? 'border-brand-gold/40 ring-1 ring-brand-gold/20 bg-brand-gold/5' : 'border-white/5 active:scale-[0.99]'}`}>
      <div className="absolute bottom-0 left-0 h-1 bg-brand-green/50 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <div className="flex gap-2">
                 <button onClick={handleCopy} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors"><Copy size={14} /></button>
                 {/* Removed Audio Button */}
             </div>
             {item.reference && <span className="text-[10px] text-emerald-200/50 bg-emerald-900/20 px-2 py-1 rounded-md">{item.reference}</span>}
          </div>
          <p className="text-lg font-serif text-white/90 leading-[2.2] mb-6 text-center" dir="rtl">{item.text}</p>
          <div className="flex items-center justify-between mt-2">
             <button onClick={handleReset} className="p-2 text-white/20 hover:text-white/50 transition-colors"><RotateCcw size={16} /></button>
             <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-brand-gold text-primary shadow-gold-glow scale-110' : 'bg-white/10 text-emerald-300'}`}>
                {!isCompleted && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="28" cy="28" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
                        <circle cx="28" cy="28" r="26" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="163" strokeDashoffset={163 - (163 * progress) / 100} strokeLinecap="round" className="transition-all duration-300" />
                    </svg>
                )}
                <span className="font-sans font-bold text-base relative z-10">{isCompleted ? <Check size={24} strokeWidth={3} /> : count}</span>
                {!isCompleted && <div className="absolute -bottom-2 bg-primary-light border border-white/10 px-2 py-0.5 rounded-full text-[10px] text-emerald-200 font-sans shadow-sm">{item.count}</div>}
             </div>
             <div className="w-8"></div>
          </div>
      </div>
    </div>
  );
};