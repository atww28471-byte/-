import React, { useEffect, useState } from 'react';
import { PrayerTimeData, NextPrayerInfo } from '../types';
import { fetchPrayerTimes } from '../services/api';
import { MapPin, Calendar } from 'lucide-react';
import { getSettings } from '../services/settings';

const ARABIC_NAMES: {[key: string]: string} = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
  Sunrise: 'الشروق'
};

export const PrayerTimes: React.FC = () => {
  const [timings, setTimings] = useState<PrayerTimeData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>("جاري تحديد الموقع...");
  const [settings, setSettings] = useState(getSettings());
  const [hijriDate, setHijriDate] = useState<string>('');

  const fetchTimes = async () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const data = await fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
          setTimings(data);
          setLocationName("موقعي");
          setLoading(false);
        },
        async () => {
          const data = await fetchPrayerTimes(); // Fallback
          setTimings(data);
          setLocationName("الرياض");
          setLoading(false);
        }
      );
    } else {
      const data = await fetchPrayerTimes();
      setTimings(data);
      setLocationName("الرياض");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimes();
    
    // Set Hijri Date
    const now = new Date();
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
    });
    setHijriDate(hijriFormatter.format(now));

    const handleSettingsChange = () => {
        setSettings(getSettings());
    };
    window.addEventListener('settings-changed', handleSettingsChange);
    return () => window.removeEventListener('settings-changed', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (!timings) return;

    const calculateCountdown = () => {
      const now = new Date();
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      
      let nextPName = '';
      let nextPTime = null;
      
      // Parse prayer times for today
      const prayerTimesToday = prayers.map(p => {
        const [h, m] = timings[p].split(':').map(Number);
        const date = new Date(now);
        date.setHours(h, m, 0, 0);
        return { name: p, time: date };
      });

      // Find next prayer today
      const upcoming = prayerTimesToday.find(p => p.time > now);

      if (upcoming) {
        nextPName = upcoming.name;
        nextPTime = upcoming.time;
      } else {
        // If no prayer left today, next is Fajr tomorrow
        nextPName = 'Fajr';
        const [h, m] = timings['Fajr'].split(':').map(Number);
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(h, m, 0, 0);
        nextPTime = tomorrow;
      }

      const diffMs = nextPTime.getTime() - now.getTime();
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const timeString = timings[nextPName].split(' ')[0]; 

      setNextPrayer({
        name: nextPName,
        arabicName: ARABIC_NAMES[nextPName] || nextPName,
        time: timeString,
        countdown: `${hours > 0 ? `${hours}:` : ''}${minutes < 10 ? '0' + minutes : minutes}${settings.showSeconds ? `:${seconds < 10 ? '0' + seconds : seconds}` : ''}`
      });
    };

    calculateCountdown(); // Initial call
    const interval = setInterval(calculateCountdown, 1000); 
    return () => clearInterval(interval);
  }, [timings, settings.showSeconds]);

  if (loading || !timings || !nextPrayer) {
    return (
      <div className="w-full h-32 rounded-[2rem] bg-white/5 animate-pulse"></div>
    );
  }

  const isNext = (p: string) => nextPrayer.name === p;

  return (
    <div className="w-full flex items-stretch gap-2 h-32">
      {/* Prayer Times Card */}
      <div className="flex-[2] relative rounded-[1.5rem] bg-gradient-to-br from-[#0c392b] to-[#042f24] border border-white/5 shadow-lg overflow-hidden p-3 flex flex-col justify-between">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 mix-blend-overlay"></div>
        
        {/* Top Row: Next Prayer Large */}
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-1 opacity-70 mb-0.5">
                    <MapPin size={10} className="text-brand-gold" />
                    <span className="text-[9px] text-white font-medium">{locationName}</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-white leading-none">
                    {nextPrayer.arabicName}
                </h2>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                   - {nextPrayer.countdown}
                </div>
            </div>
            <div className="text-3xl font-light text-brand-gold tracking-tighter dir-ltr font-mono leading-none mt-1">
                {nextPrayer.time}
            </div>
        </div>

        {/* Bottom Row: All Prayers List */}
        <div className="relative z-10 flex justify-between items-center mt-2 pt-2 border-t border-white/5">
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => {
                const active = isNext(p);
                return (
                    <div key={p} className={`flex flex-col items-center ${active ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                        <span className={`text-[8px] mb-0.5 ${active ? 'text-brand-gold font-bold' : 'text-white'}`}>
                            {ARABIC_NAMES[p]}
                        </span>
                        <span className={`text-[9px] font-mono ${active ? 'text-brand-gold font-bold' : 'text-white'}`}>
                            {timings[p].split(' ')[0]}
                        </span>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Hijri Date Widget */}
      <div className="flex-1 min-w-[80px] rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center p-2 gap-1">
          <Calendar size={18} className="text-brand-gold opacity-80" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">
                {hijriDate.split(' ')[0]}
            </span>
            <span className="text-[9px] text-white/60 leading-tight">
                {hijriDate.split(' ').slice(1).join(' ')}
            </span>
          </div>
      </div>
    </div>
  );
};
