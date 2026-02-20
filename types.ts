
export interface PrayerTimeData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface NextPrayerInfo {
  name: string;
  time: string;
  countdown: string;
  arabicName: string;
}

export interface QuranProgress {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  juz: number;
  page: number;
}

export interface AthkarStats {
  total: number;
  completed: number;
  category: string;
}

// --- Quran Types (API.AlQuran.Cloud) ---

export interface Surah {
  number: number;
  name: string;           // "سورة الفاتحة"
  englishName: string;    // "Al-Faatiha"
  englishNameTranslation: string; // "The Opening"
  numberOfAyahs: number;
  revelationType: string; // "Meccan" or "Medinan"
}

export interface Ayah {
  number: number;         // Global Ayah number
  text: string;           // Quran Text (Uthmani)
  numberInSurah: number;  // 1, 2, 3...
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  audio?: string;
}

export interface Reciter {
  id: string;             // "ar.alafasy"
  name: string;           // "مشاري العفاسي"
  image: string;          // URL to profile image
  apiPath: string;        // Path for MP3Quran or AlQuran API
  subfolder?: string;     // Folder name for EveryAyah API (Ayah-by-Ayah)
}

// --- Athkar Types ---

export interface ThikrItem {
  id: number;
  text: string;
  count: number;
  reward?: string;
  reference?: string; // Source (e.g., Muslim, Bukhari)
}

export interface AthkarCategory {
  id: string;
  title: string;
  iconName: string;
  items: ThikrItem[];
}

export enum Tab {
  HOME = 'home',
  QURAN = 'quran',
  ATHKAR = 'athkar',
  ISLAMIC = 'islamic' // New Section
}