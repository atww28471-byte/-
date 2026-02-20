
import { PrayerTimeData, QuranProgress, Surah, Ayah, Reciter } from '../types';
import { ATHKAR_DATA } from '../data/athkar';
import { getSettings } from './settings'; // Import settings

// Coordinates for Riyadh as default fallback
const DEFAULT_LAT = 24.7136;
const DEFAULT_LNG = 46.6753;

// --- Prayer Times API ---
export const fetchPrayerTimes = async (lat?: number, lng?: number): Promise<PrayerTimeData | null> => {
  try {
    const latitude = lat || DEFAULT_LAT;
    const longitude = lng || DEFAULT_LNG;
    const date = new Date();
    const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    
    // Defaulting to Umm Al Qura (4) as user requested to remove manual selection
    const method = 4; 
    
    // Using Aladhan API for Prayer Times
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${method}`
    );
    const data = await response.json();
    return data.data.timings;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
};

// --- Persistence ---
export const fetchLastRead = async (): Promise<QuranProgress> => {
  return new Promise((resolve) => {
    const saved = localStorage.getItem('dhikr_last_read');
    if (saved) {
      resolve(JSON.parse(saved));
    } else {
      resolve({
        surahName: "سورة الفاتحة",
        surahNumber: 1,
        ayahNumber: 1,
        juz: 1,
        page: 1
      });
    }
  });
};

export const saveLastRead = (progress: QuranProgress) => {
  localStorage.setItem('dhikr_last_read', JSON.stringify(progress));
};

// --- Athkar Real Persistence ---

const getTodayDateString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const getAthkarProgress = (): Record<number, number> => {
    const dateKey = `athkar_progress_${getTodayDateString()}`;
    const saved = localStorage.getItem(dateKey);
    return saved ? JSON.parse(saved) : {};
};

export const saveAthkarProgress = (itemId: number, count: number) => {
    const dateKey = `athkar_progress_${getTodayDateString()}`;
    const currentProgress = getAthkarProgress();
    currentProgress[itemId] = count;
    localStorage.setItem(dateKey, JSON.stringify(currentProgress));
};

export const fetchDailyAthkarStats = async () => {
  return new Promise((resolve) => {
      // Determine Morning (AM) or Evening (PM)
      const hour = new Date().getHours();
      const isMorning = hour < 12; // Simple logic: Before 12 PM is morning, after is evening
      
      const categoryId = isMorning ? 'morning' : 'evening';
      const categoryData = ATHKAR_DATA.find(c => c.id === categoryId);
      
      if (!categoryData) {
          resolve({ total: 0, completed: 0, category: "الأذكار" });
          return;
      }

      // Get saved progress
      const progress = getAthkarProgress();
      
      let total = 0;
      let completed = 0;

      categoryData.items.forEach(item => {
          total += item.count;
          const userCount = progress[item.id] || 0;
          completed += Math.min(userCount, item.count); // Cap at max required
      });

      resolve({
          total,
          completed,
          category: categoryData.title
      });
  });
};

// --- Quran APIs ---

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

// Helper to get Page Image URL (Madani Mushaf High Quality)
export const getQuranPageUrl = (pageNumber: number): string => {
  const pad3 = pageNumber.toString().padStart(3, '0');
  // Official Android Quran App Source - The best quality "Real Mushaf" look available
  return `https://android.quran.com/data/width_1024/page${pad3}.png`;
};

// --- SURAH PAGE MAPPING ---
// This array maps Surah Index (0-113) to its Start Page.
const SURAH_START_PAGES = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604
];

export const SURAH_NAMES_ARABIC = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمـر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

export const getSurahsOnPage = (page: number): { number: number; name: string }[] => {
  const surahsOnPage: { number: number; name: string }[] = [];
  
  for (let i = 0; i < 114; i++) {
    const surahNum = i + 1;
    const startPage = SURAH_START_PAGES[i];
    const nextSurahStartPage = i < 113 ? SURAH_START_PAGES[i + 1] : 605;
    
    if (startPage === page) {
      surahsOnPage.push({ number: surahNum, name: SURAH_NAMES_ARABIC[i] });
    } else if (startPage < page && nextSurahStartPage > page) {
      surahsOnPage.push({ number: surahNum, name: SURAH_NAMES_ARABIC[i] });
    }
  }
  return surahsOnPage;
};

// Helper function to find start page of a surah by number
export const getSurahStartPage = (surahNumber: number): number => {
    if (surahNumber < 1 || surahNumber > 114) return 1;
    return SURAH_START_PAGES[surahNumber - 1];
};


export const fetchSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${ALQURAN_BASE}/surah`);
    const data = await response.json();
    return data.data; 
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return [];
  }
};

// New Helper to get single Surah object efficiently from cached list if possible, or fetch it
export const getSurahData = async (surahNumber: number): Promise<Surah | null> => {
    try {
        // We fetch all because the API structure is optimized for list, 
        // and we need the specific metadata (englishName, etc) for the reader component.
        // Caching this in memory for the session would be ideal in a larger app.
        const allSurahs = await fetchSurahs();
        return allSurahs.find(s => s.number === surahNumber) || null;
    } catch (e) {
        return null;
    }
}

export const fetchSurahDetails = async (surahNumber: number): Promise<{ ayahs: Ayah[] } | null> => {
  try {
    // Request 'quran-uthmani' edition for smaller payload and cleaner text
    const textPromise = fetch(`${ALQURAN_BASE}/surah/${surahNumber}/quran-uthmani`);
    const textRes = await textPromise;
    if (!textRes.ok) return null;
    const textData = await textRes.json();
    return { ayahs: textData.data.ayahs };
  } catch (error) {
    // Avoid logging full error object if it could contain circular refs in some environments
    console.error("Error fetching surah details");
    return null;
  }
};

// --- Reciters Data (Reliable Sources with Ayah support) ---
export const getReciters = (): Reciter[] => {
  return [
    {
      id: "alafasy",
      name: "مشاري العفاسي",
      image: "https://i.ibb.co/ycxV8j6c/383f79043b51c61b97972a0490fae256-removebg-preview.png",
      apiPath: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee",
      subfolder: "Alafasy_128kbps"
    },
    {
      id: "yasser",
      name: "ياسر الدوسري",
      image: "https://i.ibb.co/1jG2GX3/4ceb755f94fb63fda1220d86d1a2f782-removebg-preview.png",
      apiPath: "https://server11.mp3quran.net/yasser",
      subfolder: "Yasser_Ad-Dussary_128kbps"
    },
    {
      id: "maher",
      name: "ماهر المعيقلي",
      image: "https://i.ibb.co/MksGh51Q/76a0e2270e1cdb2078e7bade8fa600c3-removebg-preview.png", 
      apiPath: "https://download.quranicaudio.com/quran/maher_256",
      subfolder: "MaherAlMuaiqly128kbps"
    },
    {
      id: "sudais",
      name: "عبدالرحمن السديس",
      image: "https://i.ibb.co/8D7sLGpC/839fa1a43d6988809d0796f619eba1c8-removebg-preview.png",
      apiPath: "https://server11.mp3quran.net/sds",
      subfolder: "Abdurrahmaan_As-Sudais_192kbps"
    },
    {
      id: "shuraim",
      name: "سعود الشريم",
      image: "https://i.ibb.co/RGFGKrTr/8cc667e124163a7af6e1c9c32d624bf6-removebg-preview.png",
      apiPath: "https://download.quranicaudio.com/quran/sa3ud_ash-shuraym",
      subfolder: "Saood_ash-Shuraym_128kbps"
    }
  ];
};

export const getSurahAudioUrl = (reciterId: string, surahNumber: number): string => {
  const reciters = getReciters();
  const reciter = reciters.find(r => r.id === reciterId);
  const basePath = reciter ? reciter.apiPath : "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee";
  
  const pad3 = surahNumber.toString().padStart(3, '0');
  return `${basePath}/${pad3}.mp3`;
};

// NEW: Ayah by Ayah Audio using EveryAyah.com
export const getAyahAudioUrl = (reciterId: string, surahNumber: number, ayahNumberInSurah: number): string => {
    const reciters = getReciters();
    const reciter = reciters.find(r => r.id === reciterId);
    // Fallback to Alafasy if subfolder not defined
    const subfolder = reciter?.subfolder || "Alafasy_128kbps";
    
    const s = surahNumber.toString().padStart(3, '0');
    const a = ayahNumberInSurah.toString().padStart(3, '0');
    
    return `https://everyayah.com/data/${subfolder}/${s}${a}.mp3`;
};

export const getDailyContent = () => {
  // Use Days since Epoch to guarantee a daily change that doesn't repeat too quickly
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const dailyVerses = [
    { type: 'verse', text: "فَإِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا", source: "سورة الشرح - 5" },
    { type: 'verse', text: "وَلَسَوۡفَ يُعۡطِيكَ رَبُّكَ فَتَرۡضَىٰ", source: "سورة الضحى - 5" },
    { type: 'verse', text: "أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ", source: "سورة الرعد - 28" },
    { type: 'verse', text: "وَقَالَ رَبُّكُمُ ٱدۡعُونِيٓ أَسۡتَجِبۡ لَكُمۡ", source: "سورة غافر - 60" },
    { type: 'verse', text: "إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ", source: "سورة البقرة - 153" },
    { type: 'verse', text: "لَا يُكَلِّفُ ٱللَّهُ نَفۡسًا إِلَّا وُسۡعَهَا", source: "سورة البقرة - 286" },
    { type: 'verse', text: "وَأَحۡسِنُوٓاْۛ إِنَّ ٱللَّهَ يُحِبُّ ٱلۡمُحۡسِنِينَ", source: "سورة البقرة - 195" },
    { type: 'verse', text: "رَبَّنَآ ءَاتِنَا فِي ٱلدُّنۡيَا حَسَنَةٗ وَفِي ٱلۡأٓخِرَةِ حَسَنَةٗ", source: "سورة البقرة - 201" },
    { type: 'verse', text: "وَٱللَّهُ يَعۡلَمُ وَأَنتُمۡ لَا تَعۡلَمُونَ", source: "سورة البقرة - 216" },
    { type: 'verse', text: "قُل لَّن يُصِيبَنَآ إِلَّا مَا كَتَبَ ٱللَّهُ لَنَا", source: "سورة التوبة - 51" },
    { type: 'verse', text: "وَمَن يَتَّقِ ٱللَّهَ يَجۡعَل لَّهُۥ مَخۡرَجٗا", source: "سورة الطلاق - 2" },
    { type: 'verse', text: "إِنَّ ٱللَّهَ غَفُورٞ رَّحِيمٞ", source: "سورة البقرة - 173" },
    { type: 'verse', text: "ٱللَّهُ لَطِيفُۢ بِعِبَادِهِۦ", source: "سورة الشورى - 19" },
    { type: 'verse', text: "وَرِحۡمَتِي وَسِعَتۡ كُلَّ شَيۡءٖ", source: "سورة الأعراف - 156" },
    { type: 'verse', text: "فَٱذۡكُرُونِيٓ أَذۡكُرۡكُمۡ وَٱشۡكُرُواْ لِي وَلَا تَكۡفُرُونِ", source: "سورة البقرة - 152" },
  ];

  const dailyHadiths = [
    { type: 'hadith', text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", source: "رواه البخاري" },
    { type: 'hadith', text: "الدِّينُ النَّصِيحَةُ", source: "رواه مسلم" },
    { type: 'hadith', text: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ", source: "متفق عليه" },
    { type: 'hadith', text: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", source: "متفق عليه" },
    { type: 'hadith', text: "مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا", source: "رواه مسلم" },
    { type: 'hadith', text: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", source: "متفق عليه" },
    { type: 'hadith', text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا", source: "الترمذي" },
    { type: 'hadith', text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", source: "متفق عليه" },
    { type: 'hadith', text: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", source: "الترمذي" },
  ];

  const dailyDhikrs = [
    { type: 'dhikr', text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", source: "كلمتان خفيفتان على اللسان" },
    { type: 'dhikr', text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", source: "كنز من كنوز الجنة" },
    { type: 'dhikr', text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", source: "مائة مرة في اليوم" },
    { type: 'dhikr', text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ", source: "سيد الاستغفار" },
    { type: 'dhikr', text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", source: "الصلاة على النبي" },
    { type: 'dhikr', text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", source: "دعاء الكرب" },
    { type: 'dhikr', text: "لا إِلَهَ إِلا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", source: "دعاء ذي النون" },
  ];

  return {
    verse: dailyVerses[dayOfYear % dailyVerses.length],
    hadith: dailyHadiths[dayOfYear % dailyHadiths.length],
    dhikr: dailyDhikrs[dayOfYear % dailyDhikrs.length]
  };
}
