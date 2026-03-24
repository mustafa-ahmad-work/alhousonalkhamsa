// ============================================================
// Quran Metadata — 114 Surahs
// Source: Standard Madani Mushaf (604 pages)
// ============================================================

export type SurahMeta = {
  id: number;
  nameAr: string;
  nameEn: string;
  ayahCount: number;
  startPage: number;
  endPage: number;
  revelationType: 'meccan' | 'medinan';
};

export const SURAHS: SurahMeta[] = [
  { id: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatiha', ayahCount: 7, startPage: 1, endPage: 1, revelationType: 'meccan' },
  { id: 2, nameAr: 'البقرة', nameEn: 'Al-Baqara', ayahCount: 286, startPage: 2, endPage: 49, revelationType: 'medinan' },
  { id: 3, nameAr: 'آل عمران', nameEn: 'Aal-Imran', ayahCount: 200, startPage: 50, endPage: 76, revelationType: 'medinan' },
  { id: 4, nameAr: 'النساء', nameEn: 'An-Nisa', ayahCount: 176, startPage: 77, endPage: 106, revelationType: 'medinan' },
  { id: 5, nameAr: 'المائدة', nameEn: 'Al-Maida', ayahCount: 120, startPage: 106, endPage: 127, revelationType: 'medinan' },
  { id: 6, nameAr: 'الأنعام', nameEn: 'Al-Anam', ayahCount: 165, startPage: 128, endPage: 150, revelationType: 'meccan' },
  { id: 7, nameAr: 'الأعراف', nameEn: 'Al-Araf', ayahCount: 206, startPage: 151, endPage: 176, revelationType: 'meccan' },
  { id: 8, nameAr: 'الأنفال', nameEn: 'Al-Anfal', ayahCount: 75, startPage: 177, endPage: 186, revelationType: 'medinan' },
  { id: 9, nameAr: 'التوبة', nameEn: 'At-Tawba', ayahCount: 129, startPage: 187, endPage: 207, revelationType: 'medinan' },
  { id: 10, nameAr: 'يونس', nameEn: 'Yunus', ayahCount: 109, startPage: 208, endPage: 221, revelationType: 'meccan' },
  { id: 11, nameAr: 'هود', nameEn: 'Hud', ayahCount: 123, startPage: 221, endPage: 235, revelationType: 'meccan' },
  { id: 12, nameAr: 'يوسف', nameEn: 'Yusuf', ayahCount: 111, startPage: 235, endPage: 248, revelationType: 'meccan' },
  { id: 13, nameAr: 'الرعد', nameEn: 'Ar-Rad', ayahCount: 43, startPage: 249, endPage: 255, revelationType: 'medinan' },
  { id: 14, nameAr: 'إبراهيم', nameEn: 'Ibrahim', ayahCount: 52, startPage: 255, endPage: 261, revelationType: 'meccan' },
  { id: 15, nameAr: 'الحجر', nameEn: 'Al-Hijr', ayahCount: 99, startPage: 262, endPage: 267, revelationType: 'meccan' },
  { id: 16, nameAr: 'النحل', nameEn: 'An-Nahl', ayahCount: 128, startPage: 267, endPage: 281, revelationType: 'meccan' },
  { id: 17, nameAr: 'الإسراء', nameEn: 'Al-Isra', ayahCount: 111, startPage: 282, endPage: 293, revelationType: 'meccan' },
  { id: 18, nameAr: 'الكهف', nameEn: 'Al-Kahf', ayahCount: 110, startPage: 293, endPage: 304, revelationType: 'meccan' },
  { id: 19, nameAr: 'مريم', nameEn: 'Maryam', ayahCount: 98, startPage: 305, endPage: 312, revelationType: 'meccan' },
  { id: 20, nameAr: 'طه', nameEn: 'Ta-Ha', ayahCount: 135, startPage: 312, endPage: 321, revelationType: 'meccan' },
  { id: 21, nameAr: 'الأنبياء', nameEn: 'Al-Anbiya', ayahCount: 112, startPage: 322, endPage: 331, revelationType: 'meccan' },
  { id: 22, nameAr: 'الحج', nameEn: 'Al-Hajj', ayahCount: 78, startPage: 332, endPage: 341, revelationType: 'medinan' },
  { id: 23, nameAr: 'المؤمنون', nameEn: 'Al-Muminun', ayahCount: 118, startPage: 342, endPage: 349, revelationType: 'meccan' },
  { id: 24, nameAr: 'النور', nameEn: 'An-Nur', ayahCount: 64, startPage: 350, endPage: 359, revelationType: 'medinan' },
  { id: 25, nameAr: 'الفرقان', nameEn: 'Al-Furqan', ayahCount: 77, startPage: 359, endPage: 366, revelationType: 'meccan' },
  { id: 26, nameAr: 'الشعراء', nameEn: 'Ash-Shuara', ayahCount: 227, startPage: 367, endPage: 376, revelationType: 'meccan' },
  { id: 27, nameAr: 'النمل', nameEn: 'An-Naml', ayahCount: 93, startPage: 377, endPage: 385, revelationType: 'meccan' },
  { id: 28, nameAr: 'القصص', nameEn: 'Al-Qasas', ayahCount: 88, startPage: 385, endPage: 396, revelationType: 'meccan' },
  { id: 29, nameAr: 'العنكبوت', nameEn: 'Al-Ankabut', ayahCount: 69, startPage: 396, endPage: 404, revelationType: 'meccan' },
  { id: 30, nameAr: 'الروم', nameEn: 'Ar-Rum', ayahCount: 60, startPage: 404, endPage: 410, revelationType: 'meccan' },
  { id: 31, nameAr: 'لقمان', nameEn: 'Luqman', ayahCount: 34, startPage: 411, endPage: 414, revelationType: 'meccan' },
  { id: 32, nameAr: 'السجدة', nameEn: 'As-Sajda', ayahCount: 30, startPage: 415, endPage: 417, revelationType: 'meccan' },
  { id: 33, nameAr: 'الأحزاب', nameEn: 'Al-Ahzab', ayahCount: 73, startPage: 418, endPage: 427, revelationType: 'medinan' },
  { id: 34, nameAr: 'سبأ', nameEn: 'Saba', ayahCount: 54, startPage: 428, endPage: 434, revelationType: 'meccan' },
  { id: 35, nameAr: 'فاطر', nameEn: 'Fatir', ayahCount: 45, startPage: 434, endPage: 440, revelationType: 'meccan' },
  { id: 36, nameAr: 'يس', nameEn: 'Ya-Sin', ayahCount: 83, startPage: 440, endPage: 445, revelationType: 'meccan' },
  { id: 37, nameAr: 'الصافات', nameEn: 'As-Saffat', ayahCount: 182, startPage: 446, endPage: 452, revelationType: 'meccan' },
  { id: 38, nameAr: 'ص', nameEn: 'Sad', ayahCount: 88, startPage: 453, endPage: 458, revelationType: 'meccan' },
  { id: 39, nameAr: 'الزمر', nameEn: 'Az-Zumar', ayahCount: 75, startPage: 458, endPage: 467, revelationType: 'meccan' },
  { id: 40, nameAr: 'غافر', nameEn: 'Ghafir', ayahCount: 85, startPage: 467, endPage: 476, revelationType: 'meccan' },
  { id: 41, nameAr: 'فصلت', nameEn: 'Fussilat', ayahCount: 54, startPage: 477, endPage: 482, revelationType: 'meccan' },
  { id: 42, nameAr: 'الشورى', nameEn: 'Ash-Shura', ayahCount: 53, startPage: 483, endPage: 489, revelationType: 'meccan' },
  { id: 43, nameAr: 'الزخرف', nameEn: 'Az-Zukhruf', ayahCount: 89, startPage: 489, endPage: 495, revelationType: 'meccan' },
  { id: 44, nameAr: 'الدخان', nameEn: 'Ad-Dukhan', ayahCount: 59, startPage: 496, endPage: 498, revelationType: 'meccan' },
  { id: 45, nameAr: 'الجاثية', nameEn: 'Al-Jathiya', ayahCount: 37, startPage: 499, endPage: 502, revelationType: 'meccan' },
  { id: 46, nameAr: 'الأحقاف', nameEn: 'Al-Ahqaf', ayahCount: 35, startPage: 502, endPage: 506, revelationType: 'meccan' },
  { id: 47, nameAr: 'محمد', nameEn: 'Muhammad', ayahCount: 38, startPage: 507, endPage: 510, revelationType: 'medinan' },
  { id: 48, nameAr: 'الفتح', nameEn: 'Al-Fath', ayahCount: 29, startPage: 511, endPage: 515, revelationType: 'medinan' },
  { id: 49, nameAr: 'الحجرات', nameEn: 'Al-Hujurat', ayahCount: 18, startPage: 515, endPage: 517, revelationType: 'medinan' },
  { id: 50, nameAr: 'ق', nameEn: 'Qaf', ayahCount: 45, startPage: 518, endPage: 520, revelationType: 'meccan' },
  { id: 51, nameAr: 'الذاريات', nameEn: 'Adh-Dhariyat', ayahCount: 60, startPage: 520, endPage: 523, revelationType: 'meccan' },
  { id: 52, nameAr: 'الطور', nameEn: 'At-Tur', ayahCount: 49, startPage: 523, endPage: 525, revelationType: 'meccan' },
  { id: 53, nameAr: 'النجم', nameEn: 'An-Najm', ayahCount: 62, startPage: 526, endPage: 528, revelationType: 'meccan' },
  { id: 54, nameAr: 'القمر', nameEn: 'Al-Qamar', ayahCount: 55, startPage: 528, endPage: 531, revelationType: 'meccan' },
  { id: 55, nameAr: 'الرحمن', nameEn: 'Ar-Rahman', ayahCount: 78, startPage: 531, endPage: 534, revelationType: 'medinan' },
  { id: 56, nameAr: 'الواقعة', nameEn: 'Al-Waqia', ayahCount: 96, startPage: 534, endPage: 537, revelationType: 'meccan' },
  { id: 57, nameAr: 'الحديد', nameEn: 'Al-Hadid', ayahCount: 29, startPage: 537, endPage: 541, revelationType: 'medinan' },
  { id: 58, nameAr: 'المجادلة', nameEn: 'Al-Mujadila', ayahCount: 22, startPage: 542, endPage: 545, revelationType: 'medinan' },
  { id: 59, nameAr: 'الحشر', nameEn: 'Al-Hashr', ayahCount: 24, startPage: 545, endPage: 548, revelationType: 'medinan' },
  { id: 60, nameAr: 'الممتحنة', nameEn: 'Al-Mumtahina', ayahCount: 13, startPage: 549, endPage: 551, revelationType: 'medinan' },
  { id: 61, nameAr: 'الصف', nameEn: 'As-Saff', ayahCount: 14, startPage: 551, endPage: 552, revelationType: 'medinan' },
  { id: 62, nameAr: 'الجمعة', nameEn: 'Al-Jumua', ayahCount: 11, startPage: 553, endPage: 554, revelationType: 'medinan' },
  { id: 63, nameAr: 'المنافقون', nameEn: 'Al-Munafiqun', ayahCount: 11, startPage: 554, endPage: 555, revelationType: 'medinan' },
  { id: 64, nameAr: 'التغابن', nameEn: 'At-Taghabun', ayahCount: 18, startPage: 556, endPage: 557, revelationType: 'medinan' },
  { id: 65, nameAr: 'الطلاق', nameEn: 'At-Talaq', ayahCount: 12, startPage: 558, endPage: 559, revelationType: 'medinan' },
  { id: 66, nameAr: 'التحريم', nameEn: 'At-Tahrim', ayahCount: 12, startPage: 560, endPage: 561, revelationType: 'medinan' },
  { id: 67, nameAr: 'الملك', nameEn: 'Al-Mulk', ayahCount: 30, startPage: 562, endPage: 564, revelationType: 'meccan' },
  { id: 68, nameAr: 'القلم', nameEn: 'Al-Qalam', ayahCount: 52, startPage: 564, endPage: 566, revelationType: 'meccan' },
  { id: 69, nameAr: 'الحاقة', nameEn: 'Al-Haqqa', ayahCount: 52, startPage: 566, endPage: 568, revelationType: 'meccan' },
  { id: 70, nameAr: 'المعارج', nameEn: 'Al-Maarij', ayahCount: 44, startPage: 568, endPage: 570, revelationType: 'meccan' },
  { id: 71, nameAr: 'نوح', nameEn: 'Nuh', ayahCount: 28, startPage: 570, endPage: 571, revelationType: 'meccan' },
  { id: 72, nameAr: 'الجن', nameEn: 'Al-Jinn', ayahCount: 28, startPage: 572, endPage: 573, revelationType: 'meccan' },
  { id: 73, nameAr: 'المزمل', nameEn: 'Al-Muzzammil', ayahCount: 20, startPage: 574, endPage: 575, revelationType: 'meccan' },
  { id: 74, nameAr: 'المدثر', nameEn: 'Al-Muddaththir', ayahCount: 56, startPage: 575, endPage: 577, revelationType: 'meccan' },
  { id: 75, nameAr: 'القيامة', nameEn: 'Al-Qiyama', ayahCount: 40, startPage: 577, endPage: 578, revelationType: 'meccan' },
  { id: 76, nameAr: 'الإنسان', nameEn: 'Al-Insan', ayahCount: 31, startPage: 578, endPage: 580, revelationType: 'medinan' },
  { id: 77, nameAr: 'المرسلات', nameEn: 'Al-Mursalat', ayahCount: 50, startPage: 580, endPage: 581, revelationType: 'meccan' },
  { id: 78, nameAr: 'النبأ', nameEn: 'An-Naba', ayahCount: 40, startPage: 582, endPage: 583, revelationType: 'meccan' },
  { id: 79, nameAr: 'النازعات', nameEn: 'An-Naziat', ayahCount: 46, startPage: 583, endPage: 584, revelationType: 'meccan' },
  { id: 80, nameAr: 'عبس', nameEn: 'Abasa', ayahCount: 42, startPage: 585, endPage: 585, revelationType: 'meccan' },
  { id: 81, nameAr: 'التكوير', nameEn: 'At-Takwir', ayahCount: 29, startPage: 586, endPage: 586, revelationType: 'meccan' },
  { id: 82, nameAr: 'الانفطار', nameEn: 'Al-Infitar', ayahCount: 19, startPage: 587, endPage: 587, revelationType: 'meccan' },
  { id: 83, nameAr: 'المطففين', nameEn: 'Al-Mutaffifin', ayahCount: 36, startPage: 587, endPage: 589, revelationType: 'meccan' },
  { id: 84, nameAr: 'الانشقاق', nameEn: 'Al-Inshiqaq', ayahCount: 25, startPage: 589, endPage: 589, revelationType: 'meccan' },
  { id: 85, nameAr: 'البروج', nameEn: 'Al-Buruj', ayahCount: 22, startPage: 590, endPage: 590, revelationType: 'meccan' },
  { id: 86, nameAr: 'الطارق', nameEn: 'At-Tariq', ayahCount: 17, startPage: 591, endPage: 591, revelationType: 'meccan' },
  { id: 87, nameAr: 'الأعلى', nameEn: 'Al-Ala', ayahCount: 19, startPage: 591, endPage: 592, revelationType: 'meccan' },
  { id: 88, nameAr: 'الغاشية', nameEn: 'Al-Ghashiya', ayahCount: 26, startPage: 592, endPage: 592, revelationType: 'meccan' },
  { id: 89, nameAr: 'الفجر', nameEn: 'Al-Fajr', ayahCount: 30, startPage: 593, endPage: 594, revelationType: 'meccan' },
  { id: 90, nameAr: 'البلد', nameEn: 'Al-Balad', ayahCount: 20, startPage: 594, endPage: 594, revelationType: 'meccan' },
  { id: 91, nameAr: 'الشمس', nameEn: 'Ash-Shams', ayahCount: 15, startPage: 595, endPage: 595, revelationType: 'meccan' },
  { id: 92, nameAr: 'الليل', nameEn: 'Al-Layl', ayahCount: 21, startPage: 595, endPage: 596, revelationType: 'meccan' },
  { id: 93, nameAr: 'الضحى', nameEn: 'Ad-Duha', ayahCount: 11, startPage: 596, endPage: 596, revelationType: 'meccan' },
  { id: 94, nameAr: 'الشرح', nameEn: 'Ash-Sharh', ayahCount: 8, startPage: 596, endPage: 596, revelationType: 'meccan' },
  { id: 95, nameAr: 'التين', nameEn: 'At-Tin', ayahCount: 8, startPage: 597, endPage: 597, revelationType: 'meccan' },
  { id: 96, nameAr: 'العلق', nameEn: 'Al-Alaq', ayahCount: 19, startPage: 597, endPage: 597, revelationType: 'meccan' },
  { id: 97, nameAr: 'القدر', nameEn: 'Al-Qadr', ayahCount: 5, startPage: 598, endPage: 598, revelationType: 'meccan' },
  { id: 98, nameAr: 'البينة', nameEn: 'Al-Bayyina', ayahCount: 8, startPage: 598, endPage: 599, revelationType: 'medinan' },
  { id: 99, nameAr: 'الزلزلة', nameEn: 'Az-Zalzala', ayahCount: 8, startPage: 599, endPage: 599, revelationType: 'medinan' },
  { id: 100, nameAr: 'العاديات', nameEn: 'Al-Adiyat', ayahCount: 11, startPage: 599, endPage: 600, revelationType: 'meccan' },
  { id: 101, nameAr: 'القارعة', nameEn: 'Al-Qaria', ayahCount: 11, startPage: 600, endPage: 600, revelationType: 'meccan' },
  { id: 102, nameAr: 'التكاثر', nameEn: 'At-Takathur', ayahCount: 8, startPage: 600, endPage: 600, revelationType: 'meccan' },
  { id: 103, nameAr: 'العصر', nameEn: 'Al-Asr', ayahCount: 3, startPage: 601, endPage: 601, revelationType: 'meccan' },
  { id: 104, nameAr: 'الهمزة', nameEn: 'Al-Humaza', ayahCount: 9, startPage: 601, endPage: 601, revelationType: 'meccan' },
  { id: 105, nameAr: 'الفيل', nameEn: 'Al-Fil', ayahCount: 5, startPage: 601, endPage: 601, revelationType: 'meccan' },
  { id: 106, nameAr: 'قريش', nameEn: 'Quraysh', ayahCount: 4, startPage: 602, endPage: 602, revelationType: 'meccan' },
  { id: 107, nameAr: 'الماعون', nameEn: 'Al-Maun', ayahCount: 7, startPage: 602, endPage: 602, revelationType: 'meccan' },
  { id: 108, nameAr: 'الكوثر', nameEn: 'Al-Kawthar', ayahCount: 3, startPage: 602, endPage: 602, revelationType: 'meccan' },
  { id: 109, nameAr: 'الكافرون', nameEn: 'Al-Kafirun', ayahCount: 6, startPage: 603, endPage: 603, revelationType: 'meccan' },
  { id: 110, nameAr: 'النصر', nameEn: 'An-Nasr', ayahCount: 3, startPage: 603, endPage: 603, revelationType: 'medinan' },
  { id: 111, nameAr: 'المسد', nameEn: 'Al-Masad', ayahCount: 5, startPage: 603, endPage: 603, revelationType: 'meccan' },
  { id: 112, nameAr: 'الإخلاص', nameEn: 'Al-Ikhlas', ayahCount: 4, startPage: 604, endPage: 604, revelationType: 'meccan' },
  { id: 113, nameAr: 'الفلق', nameEn: 'Al-Falaq', ayahCount: 5, startPage: 604, endPage: 604, revelationType: 'meccan' },
  { id: 114, nameAr: 'الناس', nameEn: 'An-Nas', ayahCount: 6, startPage: 604, endPage: 604, revelationType: 'meccan' },
];

// Helper: Get surah by ID
export function getSurahById(id: number): SurahMeta | undefined {
  return SURAHS.find((s) => s.id === id);
}

// Helper: Get surah name by ID
export function getSurahName(id: number): string {
  return SURAHS.find((s) => s.id === id)?.nameAr ?? `سورة ${id}`;
}

// Helper: Format a range for display
export function formatRangeLabel(
  type: 'surah' | 'page',
  start: number,
  end: number,
  surahId?: number
): string {
  if (type === 'surah' && surahId) {
    const surah = getSurahById(surahId);
    if (surah) {
      if (start === 1 && end === surah.ayahCount) {
        return `${surah.nameAr} (كاملة)`;
      }
      return `${surah.nameAr}: ${start} - ${end}`;
    }
  }
  if (type === 'page') {
    if (start === end) return `صفحة ${start}`;
    return `صفحة ${start} - ${end}`;
  }
  return `${start} - ${end}`;
}

// Total pages in the Quran
export const TOTAL_PAGES = 604;

export const JUZ_META = [
  { id: 1, startPage: 1, endPage: 21 },
  { id: 2, startPage: 22, endPage: 41 },
  { id: 3, startPage: 42, endPage: 61 },
  { id: 4, startPage: 62, endPage: 81 },
  { id: 5, startPage: 82, endPage: 101 },
  { id: 6, startPage: 102, endPage: 121 },
  { id: 7, startPage: 122, endPage: 141 },
  { id: 8, startPage: 142, endPage: 161 },
  { id: 9, startPage: 162, endPage: 181 },
  { id: 10, startPage: 182, endPage: 201 },
  { id: 11, startPage: 202, endPage: 221 },
  { id: 12, startPage: 222, endPage: 241 },
  { id: 13, startPage: 242, endPage: 261 },
  { id: 14, startPage: 262, endPage: 281 },
  { id: 15, startPage: 282, endPage: 301 },
  { id: 16, startPage: 302, endPage: 321 },
  { id: 17, startPage: 322, endPage: 341 },
  { id: 18, startPage: 342, endPage: 361 },
  { id: 19, startPage: 362, endPage: 381 },
  { id: 20, startPage: 382, endPage: 401 },
  { id: 21, startPage: 402, endPage: 421 },
  { id: 22, startPage: 422, endPage: 441 },
  { id: 23, startPage: 442, endPage: 461 },
  { id: 24, startPage: 462, endPage: 481 },
  { id: 25, startPage: 482, endPage: 501 },
  { id: 26, startPage: 502, endPage: 521 },
  { id: 27, startPage: 522, endPage: 541 },
  { id: 28, startPage: 542, endPage: 561 },
  { id: 29, startPage: 562, endPage: 581 },
  { id: 30, startPage: 582, endPage: 604 },
];
