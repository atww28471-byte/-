
import React, { useState, useEffect } from 'react';
import { PrayerTimes } from '../PrayerTimes';
import { EventsIcon, CalendarIcon } from '../CustomIcons';
import { Play, Calendar, Video, Mic2, ArrowRight, Pause, Download, Volume2, Search, MapPin } from 'lucide-react';
import { getReciters, getSurahAudioUrl, SURAH_NAMES_ARABIC } from '../../services/api';
import { Reciter } from '../../types';

enum ToolView {
  DASHBOARD = 'dashboard',
  CALENDAR = 'calendar',
  LIVE = 'live',
  EVENTS = 'events',
  RECITERS = 'reciters'
}

export const ToolsTab: React.FC = () => {
  const [view, setView] = useState<ToolView>(ToolView.DASHBOARD);

  const renderDashboard = () => (
    <div className="animate-fade-in">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">إسلاميات</h2>
        <p className="text-emerald-200/50 font-sans text-sm mb-6">مواقيت، بث مباشر، وقراء</p>

        {/* Prayer Times - Always visible at top */}
        <div className="mb-8">
            <PrayerTimes />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 gap-4">
            <DashboardCard 
                title="التقويم الهجري" 
                subtitle="التاريخ والمناسبات"
                icon={<CalendarIcon size={32} />}
                color="bg-teal-800"
                onClick={() => setView(ToolView.CALENDAR)}
            />
            <DashboardCard 
                title="بث مباشر" 
                subtitle="الحرمين الشريفين"
                icon={<Video size={32} />}
                color="bg-red-900"
                onClick={() => setView(ToolView.LIVE)}
            />
            <DashboardCard 
                title="المناسبات" 
                subtitle="الأعياد ورمضان"
                icon={<EventsIcon size={36} />}
                color="bg-amber-700"
                onClick={() => setView(ToolView.EVENTS)}
            />
            <DashboardCard 
                title="القراء" 
                subtitle="استماع وتحميل"
                icon={<Mic2 size={28} />}
                color="bg-emerald-700"
                onClick={() => setView(ToolView.RECITERS)}
            />
        </div>
    </div>
  );

  return (
    <div className="px-6 pt-10 pb-28 min-h-screen">
      {view === ToolView.DASHBOARD && renderDashboard()}
      
      {view !== ToolView.DASHBOARD && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => setView(ToolView.DASHBOARD)} 
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/20 active:scale-95 transition-all"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-serif font-bold text-white">
                    {view === ToolView.CALENDAR && "التقويم الهجري"}
                    {view === ToolView.LIVE && "البث المباشر"}
                    {view === ToolView.EVENTS && "المناسبات القادمة"}
                    {view === ToolView.RECITERS && "القراء والتلاوات"}
                </h2>
             </div>
             
             {view === ToolView.CALENDAR && <CalendarView />}
             {view === ToolView.LIVE && <LiveView />}
             {view === ToolView.EVENTS && <EventsView />}
             {view === ToolView.RECITERS && <RecitersView />}
          </div>
      )}
    </div>
  );
};

// --- Dashboard Card ---
const DashboardCard = ({ title, subtitle, icon, color, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`relative h-40 rounded-[2rem] p-5 flex flex-col justify-between items-start overflow-hidden group active:scale-[0.98] transition-all border border-white/5 ${color} bg-opacity-40 backdrop-blur-md`}
    >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors"></div>
        
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-lg">
            {icon}
        </div>
        
        <div className="relative z-10 text-right w-full">
            <span className="block text-xl font-serif font-bold text-white mb-1">{title}</span>
            <span className="text-xs text-white/60 font-sans">{subtitle}</span>
        </div>
    </button>
);

// --- Sub-Views ---

const CalendarView = () => {
    const [hijriGrid, setHijriGrid] = useState<{day: number, isCurrentMonth: boolean}[]>([]);
    const [hijriMonthName, setHijriMonthName] = useState("");
    const [hijriYear, setHijriYear] = useState("");
    const [gregorianString, setGregorianString] = useState("");
    const [todayHijriDay, setTodayHijriDay] = useState(0);

    useEffect(() => {
        const today = new Date();
        const u = 'ar-SA-u-ca-islamic-umalqura';

        // 1. Gregorian Text
        const gFormatter = new Intl.DateTimeFormat('ar-SA', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
        setGregorianString(gFormatter.format(today));

        // 2. Hijri Header info
        const hMonthFormatter = new Intl.DateTimeFormat(u, { month: 'long' });
        const hYearFormatter = new Intl.DateTimeFormat(u, { year: 'numeric' });
        const hDayFormatter = new Intl.DateTimeFormat(u, { day: 'numeric' });
        
        setHijriMonthName(hMonthFormatter.format(today));
        setHijriYear(hYearFormatter.format(today));
        
        // Get today's Hijri Day number
        const todayDayNum = parseInt(hDayFormatter.format(today).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString()));
        setTodayHijriDay(todayDayNum);

        // 3. Build Hijri Grid
        // We need to find the start of the Hijri month.
        // Since we don't have a library, we approximate by scanning backwards.
        const currentHijriMonthStr = hMonthFormatter.format(today);
        let iterDate = new Date(today);
        
        // Find 1st of Hijri Month
        while (true) {
            iterDate.setDate(iterDate.getDate() - 1);
            if (hMonthFormatter.format(iterDate) !== currentHijriMonthStr) {
                // We went too far back, add 1 day to get the 1st
                iterDate.setDate(iterDate.getDate() + 1);
                break;
            }
        }
        
        const firstDayOfHijriMonth = new Date(iterDate);
        const startWeekday = firstDayOfHijriMonth.getDay(); // 0=Sunday
        
        // Generate Days
        const days: {day: number, isCurrentMonth: boolean}[] = [];
        
        // Empty slots for start of week
        for (let i = 0; i < startWeekday; i++) {
            days.push({day: 0, isCurrentMonth: false});
        }

        // Fill month days
        iterDate = new Date(firstDayOfHijriMonth);
        let dayCounter = 1;
        
        while (hMonthFormatter.format(iterDate) === currentHijriMonthStr) {
            days.push({day: dayCounter, isCurrentMonth: true});
            iterDate.setDate(iterDate.getDate() + 1);
            dayCounter++;
            if (dayCounter > 30) break; // Safety break
        }

        setHijriGrid(days);

    }, []);

    return (
        <div className="space-y-6">
            {/* Header: Hijri Info */}
            <div className="bg-gradient-to-br from-brand-gold/20 to-brand-goldDim/10 border border-brand-gold/20 rounded-3xl p-8 text-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold/50"></div>
                <h3 className="text-brand-gold font-bold text-lg mb-2">{hijriMonthName}</h3>
                <div className="text-4xl font-serif font-bold text-white mb-2">{hijriYear}</div>
            </div>

            {/* Hijri Grid */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                     <Calendar size={20} className="text-brand-gold" />
                     <span className="font-bold text-white">التقويم الهجري</span>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(d => (
                        <div key={d} className="text-[10px] text-white/40 font-bold">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center">
                    {hijriGrid.map((cell, i) => {
                        if (!cell.isCurrentMonth) return <div key={i}></div>;
                        const isToday = cell.day === todayHijriDay;
                        return (
                            <div 
                                key={i} 
                                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-mono 
                                ${isToday ? 'bg-brand-gold text-primary font-bold shadow-gold-glow' : 'bg-white/5 text-white/70'}`}
                            >
                                {cell.day}
                            </div>
                        );
                    })}
                </div>
            </div>

             {/* Gregorian Date Text Only */}
             <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
                 <div className="text-white/50 font-mono text-sm mb-1">التاريخ الميلادي</div>
                 <div className="text-2xl font-bold text-white font-serif">{gregorianString}</div>
             </div>
        </div>
    );
}

const LiveView = () => (
    <div className="space-y-6">
        {/* Makkah Live Stream */}
        <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-xl">
            <div className="relative aspect-video bg-black">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/Cm1v4bteXbI?autoplay=0" 
                    title="Makkah Live" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
            <div className="p-4 flex items-center justify-between bg-[#0c1311]">
                <div>
                    <span className="block text-white font-serif font-bold">المسجد الحرام</span>
                    <span className="text-xs text-red-500 flex items-center gap-1 font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> مباشر
                    </span>
                </div>
            </div>
        </div>

        {/* Madinah Live Stream */}
        <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-xl">
            <div className="relative aspect-video bg-black">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/9A1S0xAPVIs?autoplay=0" 
                    title="Madinah Live" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
            <div className="p-4 flex items-center justify-between bg-[#0c1311]">
                <div>
                    <span className="block text-white font-serif font-bold">المسجد النبوي</span>
                    <span className="text-xs text-red-500 flex items-center gap-1 font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> مباشر
                    </span>
                </div>
            </div>
        </div>
    </div>
);

const EventsView = () => {
    // Extended list covering 2025 and 2026
    const events = [
        // 2025
        { name: "رمضان المبارك", date: "2025/02/28", hijri: "1 رمضان 1446" },
        { name: "عيد الفطر", date: "2025/03/30", hijri: "1 شوال 1446" },
        { name: "يوم عرفة", date: "2025/06/05", hijri: "9 ذو الحجة 1446" },
        { name: "عيد الأضحى", date: "2025/06/06", hijri: "10 ذو الحجة 1446" },
        { name: "عاشوراء", date: "2025/07/05", hijri: "10 محرم 1447" },
        { name: "المولد النبوي", date: "2025/09/04", hijri: "12 ربيع الأول 1447" },
        // 2026 (Estimates)
        { name: "رمضان المبارك", date: "2026/02/17", hijri: "1 رمضان 1447" },
        { name: "عيد الفطر", date: "2026/03/19", hijri: "1 شوال 1447" },
        { name: "يوم عرفة", date: "2026/05/26", hijri: "9 ذو الحجة 1447" },
        { name: "عيد الأضحى", date: "2026/05/27", hijri: "10 ذو الحجة 1447" },
        { name: "عاشوراء", date: "2026/06/25", hijri: "10 محرم 1448" },
    ];

    const getDaysRemaining = (dateStr: string) => {
        const today = new Date();
        const eventDate = new Date(dateStr); // Standard YYYY/MM/DD works well
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    
    // Ensure we only show future events (or today)
    const upcomingEvents = events.filter(e => getDaysRemaining(e.date) >= -1).sort((a, b) => getDaysRemaining(a.date) - getDaysRemaining(b.date));

    if (upcomingEvents.length === 0) {
        return (
            <div className="text-center p-8 bg-white/5 rounded-3xl">
                <p className="text-white/50">لا توجد مناسبات قريبة في هذا العام.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {upcomingEvents.map((event, idx) => {
                   const days = getDaysRemaining(event.date);
                   const isNearest = idx === 0;
                   return (
                       <div key={`${event.name}-${event.date}`} className={`rounded-3xl p-5 flex items-center justify-between border relative overflow-hidden ${isNearest ? 'bg-gradient-to-r from-brand-gold/10 to-transparent border-brand-gold/30' : 'bg-white/5 border-white/5'}`}>
                           {isNearest && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold"></div>}
                           
                           <div>
                               <h4 className={`font-serif font-bold text-xl mb-1 ${isNearest ? 'text-brand-gold' : 'text-white'}`}>{event.name}</h4>
                               <div className="flex items-center gap-3 text-xs text-white/50">
                                   <span className="bg-white/5 px-2 py-0.5 rounded">{event.hijri}</span>
                                   <span className="font-mono">{event.date}</span>
                               </div>
                           </div>
                           
                           <div className="text-center min-w-[70px]">
                               <span className={`block text-3xl font-bold font-mono tracking-tighter ${isNearest ? 'text-white' : 'text-white/60'}`}>{Math.max(0, days)}</span>
                               <span className="text-[10px] text-white/40 uppercase tracking-widest">يوم</span>
                           </div>
                       </div>
                   )
               })}
        </div>
    );
};

const RecitersView = () => {
    const reciters = getReciters();
    const [activeReciter, setActiveReciter] = useState<Reciter | null>(null);
    const [searchSurah, setSearchSurah] = useState('');

    if (activeReciter) {
        // Generate list of all 114 Surahs
        const allSurahs = SURAH_NAMES_ARABIC.map((name, index) => ({
            number: index + 1,
            name: name
        }));

        const filteredSurahs = allSurahs.filter(s => s.name.includes(searchSurah));

        return (
            <div className="animate-fade-in">
                <button onClick={() => setActiveReciter(null)} className="mb-4 text-white/50 flex items-center gap-2 hover:text-white text-sm">
                     <ArrowRight size={14} /> العودة للقائمة
                </button>
                
                <div className="bg-white/5 rounded-[2.5rem] p-6 text-center mb-6 border border-white/5">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-brand-gold shadow-lg overflow-hidden">
                        <img src={activeReciter.image} alt={activeReciter.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-1">{activeReciter.name}</h3>
                    <p className="text-emerald-400 text-sm">المصحف الكامل</p>
                </div>

                <div className="relative mb-6">
                    <input 
                        type="text" 
                        placeholder="ابحث عن سورة..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-10 pl-4 text-sm font-sans text-white placeholder-white/30 focus:outline-none focus:border-brand-gold/50"
                        value={searchSurah}
                        onChange={(e) => setSearchSurah(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3 text-white/30" size={18} />
                </div>

                <div className="space-y-3 pb-8">
                    {filteredSurahs.map(s => (
                        <AudioPlayerRow key={s.number} reciter={activeReciter} surah={s} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {reciters.map(reciter => (
                <button 
                    key={reciter.id}
                    onClick={() => setActiveReciter(reciter)}
                    className="bg-white/5 rounded-3xl p-4 flex flex-col items-center gap-3 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-[0.98]"
                >
                    <div className="w-20 h-20 rounded-full bg-white/10 shadow-lg overflow-hidden border-2 border-white/10 group-hover:border-brand-gold/50 transition-colors">
                        <img src={reciter.image} alt={reciter.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-serif font-bold text-white text-center text-sm">{reciter.name}</span>
                </button>
            ))}
        </div>
    );
};

const AudioPlayerRow: React.FC<{ reciter: Reciter, surah: { number: number, name: string } }> = ({ reciter, surah }) => {
    const [playing, setPlaying] = useState(false);
    const audioUrl = getSurahAudioUrl(reciter.id, surah.number);
    const [audio] = useState(new Audio(audioUrl));

    useEffect(() => {
        const handleEnded = () => setPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.pause();
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audio]);

    const toggle = () => {
        if (playing) {
            audio.pause();
        } else {
            document.querySelectorAll('audio').forEach(a => a.pause());
            audio.play();
        }
        setPlaying(!playing);
    }

    return (
        <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${playing ? 'bg-brand-gold text-primary' : 'bg-white/10 text-brand-gold'}`}>
                    <span className="font-sans font-bold text-xs">{surah.number}</span>
                </div>
                <span className="font-serif text-lg text-white">سورة {surah.name}</span>
            </div>

            <div className="flex gap-2">
                {/* Download Button */}
                <a 
                    href={audioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                    title="تحميل / استماع"
                >
                    <Download size={18} />
                </a>

                {/* Play Button */}
                <button 
                    onClick={toggle}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${playing ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}
                >
                    {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
            </div>
        </div>
    );
}
