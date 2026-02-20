
export interface AppSettings {
  // --- General Settings ---
  enableHaptics: boolean;
  hapticIntensity: 'soft' | 'medium' | 'heavy';
  showSeconds: boolean;
  timeFormat24: boolean;
  showGregorianDate: boolean;
  
  // Location & Date
  hijriAdjustment: number; // -2 to +2 days
  
  // Notification Toggles
  notifFajr: boolean;
  notifSunrise: boolean;
  notifDhuhr: boolean;
  notifAsr: boolean;
  notifMaghrib: boolean;
  notifIsha: boolean;
  adhanSound: 'makkah' | 'madinah' | 'alaqsa' | 'short'; // New: Adhan Sound Preference

  // --- Quran Settings (Now managed locally in Reader mostly, but stored here) ---
  mushafDarkMode: boolean;
  keepScreenOn: boolean;
  autoAdvance: boolean; 
  showPageBorders: boolean;
  showTopBar: boolean;
  tapNavigation: boolean;
  swipeSensitivity: number; 
}

const DEFAULT_SETTINGS: AppSettings = {
  enableHaptics: true,
  hapticIntensity: 'medium',
  showSeconds: true,
  timeFormat24: false,
  showGregorianDate: false,
  
  hijriAdjustment: 0,

  notifFajr: true,
  notifSunrise: false,
  notifDhuhr: true,
  notifAsr: true,
  notifMaghrib: true,
  notifIsha: true,
  adhanSound: 'makkah',

  mushafDarkMode: false,
  keepScreenOn: true,
  autoAdvance: true,
  showPageBorders: true,
  showTopBar: true,
  tapNavigation: true,
  swipeSensitivity: 1,
};

const STORAGE_KEY = 'dhikr_app_settings_v3'; // Bumped version

export const getSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('settings-changed'));
};

export const toggleWakeLock = async (enable: boolean) => {
  if ('wakeLock' in navigator) {
    if (enable) {
      try {
        await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
  }
};
