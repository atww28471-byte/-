
import React, { useState } from 'react';
import { X, Bell, Globe, Zap, Volume2, Check, Smartphone, Calendar, ChevronLeft, Moon, MapPin, Info } from 'lucide-react';
import { AppSettings, getSettings, saveSettings } from '../services/settings';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
       <div 
         className="bg-[#121212] w-full max-w-md h-[85vh] rounded-[2rem] border border-white/10 shadow-2xl animate-fade-in-up relative flex flex-col overflow-hidden"
         onClick={(e) => e.stopPropagation()}
       >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#121212]/90 backdrop-blur-xl z-10 sticky top-0">
              <h3 className="text-2xl font-serif font-bold text-white">الإعدادات</h3>
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                  <X size={18} />
              </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
              
              {/* Section: General */}
              <SettingsGroup title="عام" icon={<Globe size={16} />}>
                  <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5">
                      <ToggleItem 
                         label="نظام 24 ساعة"
                         checked={settings.timeFormat24}
                         onChange={(v) => updateSetting('timeFormat24', v)}
                      />
                      <ToggleItem 
                         label="إظهار التاريخ الميلادي"
                         checked={settings.showGregorianDate}
                         onChange={(v) => updateSetting('showGregorianDate', v)}
                      />
                      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
                          <span className="text-sm text-white font-medium">تعديل التاريخ الهجري</span>
                          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
                              <button onClick={() => updateSetting('hijriAdjustment', Math.max(-2, settings.hijriAdjustment - 1))} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded">-</button>
                              <span className="text-sm font-bold text-brand-gold w-4 text-center">{settings.hijriAdjustment > 0 ? `+${settings.hijriAdjustment}` : settings.hijriAdjustment}</span>
                              <button onClick={() => updateSetting('hijriAdjustment', Math.min(2, settings.hijriAdjustment + 1))} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded">+</button>
                          </div>
                      </div>
                  </div>
              </SettingsGroup>

              {/* Section: Notifications */}
              <SettingsGroup title="تنبيهات الصلوات" icon={<Bell size={16} />}>
                  <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5">
                      <div className="px-4 py-3 border-b border-white/5">
                          <label className="text-xs text-white/40 mb-3 block">صوت الآذان</label>
                          <div className="grid grid-cols-2 gap-2">
                              {(['makkah', 'madinah', 'alaqsa', 'short'] as const).map(sound => (
                                  <button
                                    key={sound}
                                    onClick={() => updateSetting('adhanSound', sound)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${settings.adhanSound === sound ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}`}
                                  >
                                      {sound === 'makkah' && 'مكة المكرمة'}
                                      {sound === 'madinah' && 'المدينة المنورة'}
                                      {sound === 'alaqsa' && 'المسجد الأقصى'}
                                      {sound === 'short' && 'تكبير فقط'}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-px bg-white/5 rounded-b-2xl overflow-hidden">
                         <NotifToggle label="الفجر" checked={settings.notifFajr} onChange={(v) => updateSetting('notifFajr', v)} />
                         <NotifToggle label="الشروق" checked={settings.notifSunrise} onChange={(v) => updateSetting('notifSunrise', v)} />
                         <NotifToggle label="الظهر" checked={settings.notifDhuhr} onChange={(v) => updateSetting('notifDhuhr', v)} />
                         <NotifToggle label="العصر" checked={settings.notifAsr} onChange={(v) => updateSetting('notifAsr', v)} />
                         <NotifToggle label="المغرب" checked={settings.notifMaghrib} onChange={(v) => updateSetting('notifMaghrib', v)} />
                         <NotifToggle label="العشاء" checked={settings.notifIsha} onChange={(v) => updateSetting('notifIsha', v)} />
                      </div>
                  </div>
              </SettingsGroup>

              {/* Section: Haptics */}
              <SettingsGroup title="التفاعل" icon={<Zap size={16} />}>
                  <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5">
                      <ToggleItem 
                         label="الاهتزاز عند اللمس"
                         checked={settings.enableHaptics}
                         onChange={(v) => updateSetting('enableHaptics', v)}
                         isLast={!settings.enableHaptics}
                      />
                      {settings.enableHaptics && (
                          <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
                              <span className="text-sm text-white/60">قوة الاهتزاز</span>
                              <div className="flex bg-black/40 rounded-lg p-1">
                                  {(['soft', 'medium', 'heavy'] as const).map((intensity) => (
                                      <button
                                        key={intensity}
                                        onClick={() => updateSetting('hapticIntensity', intensity)}
                                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${settings.hapticIntensity === intensity ? 'bg-white/20 text-white' : 'text-white/30'}`}
                                      >
                                          {intensity === 'soft' ? 'خفيف' : intensity === 'medium' ? 'وسط' : 'قوي'}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </SettingsGroup>

              {/* Section: Info */}
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Info size={16} />
                      </div>
                      <div>
                          <span className="block text-sm font-bold text-white">عن التطبيق</span>
                          <span className="text-xs text-white/40">الإصدار 1.4.0</span>
                      </div>
                  </div>
              </div>

              <div className="text-center pb-6">
                  <p className="text-xs text-white/20">تطبيق ذكري</p>
              </div>

          </div>
       </div>
    </div>
  );
};

// --- UI Components ---

const SettingsGroup: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({ title, icon, children }) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
            <span className="text-brand-gold">{icon}</span>
            <h4 className="font-bold text-xs text-white/50 uppercase tracking-wider">{title}</h4>
        </div>
        {children}
    </div>
);

const ToggleItem: React.FC<{label: string, checked: boolean, onChange: (c: boolean) => void, isLast?: boolean}> = ({ label, checked, onChange, isLast }) => (
    <div className={`flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer ${!isLast ? 'border-b border-white/5' : ''}`} onClick={() => onChange(!checked)}>
        <span className="text-sm font-medium text-white">{label}</span>
        <div className={`w-11 h-6 rounded-full transition-all relative ${checked ? 'bg-emerald-600' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-[2px]' : 'right-[2px]'}`}></div>
        </div>
    </div>
);

const NotifToggle: React.FC<{label: string, checked: boolean, onChange: (c: boolean) => void}> = ({ label, checked, onChange }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`flex items-center justify-between p-3 transition-colors hover:bg-white/5 ${checked ? 'bg-emerald-900/20' : ''}`}
    >
        <span className={`text-xs font-medium ${checked ? 'text-white' : 'text-white/40'}`}>{label}</span>
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
            {checked && <Check size={10} className="text-black" strokeWidth={3} />}
        </div>
    </button>
);
