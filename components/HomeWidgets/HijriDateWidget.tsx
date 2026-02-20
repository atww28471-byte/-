import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

export const HijriDateWidget: React.FC = () => {
  const [date, setDate] = useState<string>('');
  const [dayName, setDayName] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const dayFormatter = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' });

    setDate(hijriFormatter.format(now));
    setDayName(dayFormatter.format(now));
  }, []);

  return (
    <div className="glass-panel rounded-[2rem] p-5 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute -right-10 -top-10 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 opacity-60">
          <Calendar size={16} className="text-emerald-400" />
          <span className="text-xs font-medium text-white">التاريخ الهجري</span>
        </div>
        
        <h3 className="text-xl font-serif font-bold text-white mb-1 leading-tight">
          {dayName}
        </h3>
        <p className="text-sm text-emerald-100/80 font-medium">
          {date}
        </p>
      </div>
    </div>
  );
};
