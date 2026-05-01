import { SURAHS } from "../data/quranMeta";
import {
  PageProgress,
  MemorizationStrength,
  TOTAL_QURAN_PAGES,
  Plan,
  PlanDirection,
  TaskSelection,
  TITLE_XP_REQUIREMENTS,
  UserTitle,
} from "../types";

export const TITLE_ICONS: Record<string, string> = {
  مبتدئ: "leaf-outline",
  ساعي: "footsteps-outline",
  طالب: "book-outline",
  مجتهد: "fitness-outline",
  مثابر: "infinite-outline",
  مرابط: "shield-outline",
  ملازم: "link-outline",
  حارس: "shield-checkmark-outline",
  قوي: "barbell-outline",
  ثابت: "anchor-outline",
  متمكن: "ribbon-outline",
  متقن: "star-outline",
  ضابط: "key-outline",
  راوي: "mic-outline",
  ماهر: "flash-outline",
  "خادم القرآن": "heart-outline",
  حافظ: "medal-outline",
  جامع: "briefcase-outline",
  "صاحب القرآن": "trophy-outline",
  "تاج الوقار": "sparkles-outline",
};

// ─── Date Helpers ─────────────────────────────────────────

export function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
}

export function isToday(date: string): boolean {
  return date === todayISO();
}

export function isOverdue(nextReviewDate: string): boolean {
  return nextReviewDate <= todayISO();
}

// ─── Plan Generator ───────────────────────────────────────

export function generatePlan(
  pageNumbers: number[],
  pagesPerDay: number,
  label: string = "خطة حفظ",
  direction: PlanDirection = "forward",
  mushafSurahPages?: Record<number, [number, number]>,
): Plan {
  const uniquePages = Array.from(new Set(pageNumbers)).filter((p) => p > 0);
  const usedPageSet = new Set(uniquePages);
  const surahsData = mushafSurahPages
    ? Object.entries(mushafSurahPages).map(([id, [s, e]]) => ({ id: Number(id), startPage: s, endPage: e }))
    : SURAHS.map((s) => ({ id: s.id, startPage: s.startPage, endPage: s.endPage }));

  const sortedSurahs = [...surahsData].sort((a, b) =>
    direction === "forward" ? a.id - b.id : b.id - a.id,
  );

  const result: number[] = [];
  const addedPages = new Set<number>();

  sortedSurahs.forEach((surah) => {
    // IMPORTANT: Even in backward mode (Nas -> Fatiha), the pages WITHIN
    // a single Surah must be memorized forward (e.g. 582 then 583 for An-Naba).
    for (let p = surah.startPage; p <= surah.endPage; p++) {
      if (usedPageSet.has(p) && !addedPages.has(p)) {
        result.push(p);
        addedPages.add(p);
      }
    }
  });

  const fallbackSorted = [...uniquePages].sort((a, b) =>
    direction === "forward" ? a - b : b - a,
  );
  fallbackSorted.forEach((p) => {
    if (!addedPages.has(p)) {
      result.push(p);
      addedPages.add(p);
    }
  });

  return {
    targetPages: result,
    currentPageIndex: 0,
    pagesPerDay: Math.max(1, pagesPerDay),
    totalDays: Math.ceil(result.length / Math.max(1, pagesPerDay)),
    startDate: todayISO(),
    direction,
    label,
  };
}

export function getPlanDayDate(
  startDate: string,
  dayIndex: number,
  activeDays: number[],
): string {
  const activeSet = new Set(activeDays.length > 0 ? activeDays : [0, 1, 2, 3, 4]);
  const [y, m, d] = startDate.split("-").map(Number);
  let current = new Date(y, m - 1, d);
  let found = 0;
  while (true) {
    if (activeSet.has(current.getDay())) {
      if (found === dayIndex) {
        return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
      }
      found++;
    }
    current.setDate(current.getDate() + 1);
  }
}

// ─── Spaced Repetition ────────────────────────────────────

export function getNextReviewDate(
  strength: MemorizationStrength,
  today: string = todayISO(),
): string {
  const intervals: Record<MemorizationStrength, number> = {
    1: 1, 2: 2, 3: 7, 4: 14, 5: 30,
  };
  return addDays(today, intervals[strength]);
}

export function strengthAfterReview(
  currentStrength: MemorizationStrength,
  passed: boolean,
): MemorizationStrength {
  if (passed) return Math.min(5, currentStrength + 1) as MemorizationStrength;
  return Math.max(1, currentStrength - 2) as MemorizationStrength;
}

export function calculateStabilityIndex(
  pages: PageProgress[],
  taskSelections: TaskSelection[] = [],
): number {
  if (pages.length === 0) return 0;
  const baseWeights = { 1: 15, 2: 35, 3: 65, 4: 85, 5: 100 };
  const totalStability = pages.reduce((sum, p) => {
    let score = baseWeights[p.strength as MemorizationStrength];
    const modulesCoveringPage = new Set<string>();
    taskSelections.forEach((task) => {
      if (task.timesCompleted > 0) {
        const isCovered = task.ranges.some((range) => {
          if (range.type === "page") {
            return p.pageNumber >= range.start && p.pageNumber <= range.end;
          }
          return false;
        });
        if (isCovered) modulesCoveringPage.add(task.module);
      }
    });
    const bonus = modulesCoveringPage.size * 3;
    return sum + Math.min(100, score + bonus);
  }, 0);
  return Math.round(totalStability / pages.length);
}

// ─── Pages Due for Review ─────────────────────────────────

export function getPagesDueForReview(pages: PageProgress[]): PageProgress[] {
  const today = todayISO();
  return pages
    .filter((p) => p.memorized && p.nextReviewDate <= today)
    .sort((a, b) => a.strength - b.strength);
}

// ─── XP & Title ───────────────────────────────────────────

export function getTitleFromXP(xp: number): UserTitle {
  if (xp >= 80000) return "تاج الوقار";
  if (xp >= 60000) return "صاحب القرآن";
  if (xp >= 45000) return "جامع";
  if (xp >= 35000) return "حافظ";
  if (xp >= 28000) return "خادم القرآن";
  if (xp >= 22000) return "ماهر";
  if (xp >= 17000) return "راوي";
  if (xp >= 12500) return "ضابط";
  if (xp >= 9000) return "متقن";
  if (xp >= 6500) return "متمكن";
  if (xp >= 4500) return "ثابت";
  if (xp >= 3000) return "قوي";
  if (xp >= 2000) return "حارس";
  if (xp >= 1300) return "ملازم";
  if (xp >= 800) return "مرابط";
  if (xp >= 450) return "مثابر";
  if (xp >= 200) return "مجتهد";
  if (xp >= 75) return "طالب";
  if (xp >= 25) return "ساعي";
  return "مبتدئ";
}

export function getXPProgressToNextLevel(xp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const sortedReqs = Object.entries(TITLE_XP_REQUIREMENTS)
    .sort((a, b) => a[1] - b[1])
    .map((e) => e[1]);

  for (let i = 0; i < sortedReqs.length - 1; i++) {
    if (xp < sortedReqs[i + 1]) {
      const lower = sortedReqs[i];
      const upper = sortedReqs[i + 1];
      const current = xp - lower;
      const required = upper - lower;
      return { current, required, percentage: Math.min(1, current / required) };
    }
  }
  // Max level
  return { current: 100, required: 100, percentage: 1 };
}

// ─── Daily Completion ─────────────────────────────────────

export function getDailyCompletionPercent(progress: {
  recitation: boolean;
  listening: boolean;
  preparation: boolean;
  memorization: boolean;
  shortReview: boolean;
  longReview: boolean;
}): number {
  const tasks = Object.values(progress);
  const done = tasks.filter(Boolean).length;
  return done / tasks.length;
}

// ─── Streak Logic ─────────────────────────────────────────

export function calculateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string,
  completedToday: boolean
): { current: number; longest: number; lastActiveDate: string } {
  const today = todayISO();
  const yesterday = addDays(today, -1);
  if (!completedToday) {
    if (lastActiveDate && lastActiveDate < yesterday) return { current: 0, longest: longestStreak, lastActiveDate };
    return { current: currentStreak, longest: longestStreak, lastActiveDate };
  }
  if (lastActiveDate === today) return { current: currentStreak, longest: longestStreak, lastActiveDate: today };
  if (lastActiveDate === yesterday) {
    const newCurrent = currentStreak + 1;
    return { current: newCurrent, longest: Math.max(longestStreak, newCurrent), lastActiveDate: today };
  }
  return { current: 1, longest: Math.max(longestStreak, 1), lastActiveDate: today };
}

// ─── Arabic Number Formatter ──────────────────────────────

export function toArabicNumerals(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => arabicDigits[parseInt(d)] ?? d)
    .join('');
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Motivational Messages ────────────────────────────────

export const MOTIVATIONAL_MESSAGES = [
  'كُلُّ لحظةٍ تتلو فيها كلامَ الله تُقرَّب إليه',
  'الحافظ الصادق يعيش مع كلام الله في قلبه',
  'الاستمرار أعظم من الإتقان... فلا تقطع',
  'ما تعلمته اليوم يبقى معك إلى الآخرة',
  'كُن حارسًا لحصنك اليوم',
  'كُلُّ يومٍ بلا مراجعةٍ هو يومٌ في الغفلة',
  'القرآن شراكتك مع الله، لا تقطعها',
  'الثبات على القليل خيرٌ من الانقطاع عن الكثير',
  'ادفع الكسلَ بالتذكّر: من تحفظ لأجله؟',
  'نِعمَ الجليسُ كتابُ الله',
];

export function getMotivationalMessage(): string {
  const idx = new Date().getDate() % MOTIVATIONAL_MESSAGES.length;
  return MOTIVATIONAL_MESSAGES[idx];
}
