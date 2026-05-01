// ============================================================
// مفاتيح حفظ القرآن - Quran Anchoring Keys: Core Types
// ============================================================

export type UserLevel = 'مبتدئ' | 'متوسط' | 'متقدم';
export type UserTitle =
  | "مبتدئ"
  | "ساعي"
  | "طالب"
  | "مجتهد"
  | "مثابر"
  | "مرابط"
  | "ملازم"
  | "حارس"
  | "قوي"
  | "ثابت"
  | "متمكن"
  | "متقن"
  | "ضابط"
  | "راوي"
  | "ماهر"
  | "خادم القرآن"
  | "حافظ"
  | "جامع"
  | "صاحب القرآن"
  | "تاج الوقار";

export type User = {
  id: string;
  name: string;
  level: UserLevel;
  goal: string;
  dailyPages: number;
  createdAt: string;
  title: UserTitle;
  totalXP: number;
};

export type PlanDirection = 'forward' | 'backward';

export type Plan = {
  targetPages: number[];
  currentPageIndex: number;
  pagesPerDay: number;
  totalDays: number;
  startDate: string;
  direction: PlanDirection;
  // Metadata for display
  label: string;
  /** طبعة المصحف المستخدمة لبناء هذه الخطة */
  mushafEditionId?: string;
  /** نوع الخطة: يومية أو أسبوعية */
  planMode?: 'daily' | 'weekly';
  /** أيام الأسبوع النشطة (0=أحد .. 6=سبت) — للخطة الأسبوعية */
  activeDaysOfWeek?: number[];
};

export type DailyProgress = {
  date: string;
  recitation: boolean;
  listening: boolean;
  preparation: boolean;
  memorization: boolean;
  shortReview: boolean;
  longReview: boolean;
  xpEarned: number;
};

export type MemorizationStrength = 1 | 2 | 3 | 4 | 5;

export type PageProgress = {
  pageNumber: number;
  memorized: boolean;
  strength: MemorizationStrength;
  lastReviewed: string;
  reviewCount: number;
  nextReviewDate: string;
};

export type Fortress = {
  id: FortressId;
  nameAr: string;
  nameEn: string;
  icon: string;
  description: string;
  color: string;
  xpReward: number;
};

export type FortressId =
  | 'recitation'
  | 'listening'
  | 'preparation'
  | 'memorization'
  | 'review';

export type FortressTask = {
  fortressId: FortressId;
  completed: boolean;
  date: string;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
};

// ============================================================
// Selection & Task System Types
// ============================================================

/** Module identifiers for all fortress tasks */
export type ModuleId =
  | 'preparation_before'
  | 'preparation_night'
  | 'preparation_weekly'
  | 'memorization'
  | 'review_short'
  | 'review_long'
  | 'recitation'
  | 'listening';

/** A single range selection — surah/ayah or page range */
export type RangeSelection = {
  id: string;
  type: 'surah' | 'page';
  /** For surah type: surahId. For page type: start page */
  start: number;
  /** For surah type: not used directly (use startAyah/endAyah). For page type: end page */
  end: number;
  /** Only for surah ranges */
  surahId?: number;
  /** Start ayah (surah-based selection) */
  startAyah?: number;
  /** End ayah (surah-based selection) */
  endAyah?: number;
};

/** A task selection tied to a specific module */
export type TaskSelection = {
  id: string;
  module: ModuleId;
  ranges: RangeSelection[];
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
  timesCompleted: number;
  lastUsed?: string;
};

/** Module metadata for display */
export type ModuleInfo = {
  id: ModuleId;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
  fortressId: FortressId;
};

// ============================================================
// App State — Extended
// ============================================================

export type AppSettings = {
  hapticsEnabled: boolean;
  reviewStrategy: 'spaced' | 'random' | 'recency';
  notifications: NotificationSettings;
  showDailyProgressOnDashboard: boolean;
  memorizationTimerMinutes: number;
  preparationTimerMinutes: number;
  reviewTimerMinutes: number;
  recitationTimerMinutes: number;
  listeningTimerMinutes: number;
  memorizationMethod: 'standard' | 'linking';
  chunksPerPage: number;
  /** طبعة المصحف المختارة */
  mushafEdition: 'madani_604';
  /** نوع الخطة: يومية أو أسبوعية */
  planMode: 'daily' | 'weekly';
  /** أيام الأسبوع النشطة: 0=أحد، 1=اثنين ... 6=سبت */
  activeDaysOfWeek: number[];
};

export type AppState = {
  user: User | null;
  plan: Plan | null;
  dailyProgress: DailyProgress[];
  pageProgress: PageProgress[];
  streak: StreakData;
  isOnboarded: boolean;
  isLoaded: boolean;
  /** All task selections across modules */
  taskSelections: TaskSelection[];
  /** Real-time statistics from backend */
  globalStats: {
    totalUsers: number;
    totalTasks: number;
    totalPages: number;
    totalLaunches: number;
    totalPageViews: number;
  };
  settings: AppSettings;
};

export type ReviewPage = {
  pageNumber: number;
  strength: MemorizationStrength;
  isOverdue: boolean;
};

export type NotificationSettings = {
  enabled: boolean;
  recitationEnabled: boolean;
  recitationTime: string;
  listeningEnabled: boolean;
  listeningTime: string;
  weeklyPrepEnabled: boolean;
  weeklyPrepTime: string;
  nightlyPrepEnabled: boolean;
  nightlyPrepTime: string;
  dailyPrepEnabled: boolean;
  dailyPrepTime: string;
  memorizationEnabled: boolean;
  memorizationTime: string;
  reviewEnabled: boolean;
  reviewTime: string;
};

// ============================================================
// Constants
// ============================================================

export const FORTRESSES: Fortress[] = [
  {
    id: 'recitation', // Used as Key 1: Khatma
    nameAr: 'الختمة المستمرة',
    nameEn: 'Continuous Khatma',
    icon: 'book-outline',
    description: 'تلاوة جزأين واستماع لحزب يومياً',
    color: '#10B981',
    xpReward: 35,
  },
  {
    id: 'preparation', // Key 2: Prep
    nameAr: 'التحضير',
    nameEn: 'Preparation',
    icon: 'timer-outline',
    description: 'أسبوعي، ليلي، وقبلي',
    color: '#F59E0B',
    xpReward: 30,
  },
  {
    id: 'memorization', // Key 3: New Mem
    nameAr: 'الحفظ الجديد',
    nameEn: 'New Memorization',
    icon: 'shield-checkmark-outline',
    description: 'تكرار الصفحة لمدة ١٥ دقيقة',
    color: '#EF4444',
    xpReward: 50,
  },
  {
    id: 'review', // Key 4: Near Review
    nameAr: 'المراجعة القريبة',
    nameEn: 'Near Review',
    icon: 'refresh-outline',
    description: 'مراجعة آخر جزء تم حفظه',
    color: '#8B5CF6',
    xpReward: 30,
  },
  {
    id: 'review_long' as any, // Key 5: Far Review
    nameAr: 'المراجعة البعيدة',
    nameEn: 'Far Review',
    icon: 'layers-outline',
    description: 'مراجعة المحفوظ القديم دورياً',
    color: '#6366F1',
    xpReward: 40,
  },
];

/** All modules available in the app */
export const MODULES: ModuleInfo[] = [
  {
    id: 'preparation_before',
    nameAr: 'التحضير القبلي',
    nameEn: 'Pre-Memorization',
    icon: 'sunny-outline',
    color: '#F59E0B',
    description: 'قراءة صفحة الحفظ لمدة ١٥ دقيقة لتصفية الذهن قبل البدء الفعلي',
    fortressId: 'preparation',
  },
  {
    id: 'preparation_night',
    nameAr: 'التحضير الليلي',
    nameEn: 'Night Preparation',
    icon: 'moon-outline',
    color: '#8B5CF6',
    description: 'قبل النوم مباشرة؛ قراءة صفحة الغد (١٥ دقيقة) وسماعها (١٥ دقيقة)',
    fortressId: 'preparation',
  },
  {
    id: 'preparation_weekly',
    nameAr: 'التحضير الأسبوعي',
    nameEn: 'Weekly Preparation',
    icon: 'calendar-outline',
    color: '#6366F1',
    description: 'قراءة وسماع ورد الأسبوع القادم (٥-٦ صفحات) يومياً طوال الأسبوع الحالي',
    fortressId: 'preparation',
  },
  {
    id: 'memorization',
    nameAr: 'الحفظ الجديد',
    nameEn: 'New Memorization',
    icon: 'shield-checkmark-outline',
    color: '#EF4444',
    description: 'تكرار الصفحة لمدة لا تقل عن ١٥ دقيقة لنقل الآيات للذاكرة بعيدة المدى',
    fortressId: 'memorization',
  },
  {
    id: 'review_short',
    nameAr: 'المراجعة القريبة',
    nameEn: 'Near Review',
    icon: 'refresh-outline',
    color: '#10B981',
    description: 'مراجعة آخر جزء (٢٠ صفحة) تم حفظه كاملاً لضمان ربطه ومنع تفلته',
    fortressId: 'review',
  },
  {
    id: 'review_long',
    nameAr: 'المراجعة البعيدة',
    nameEn: 'Far Review',
    icon: 'layers-outline',
    color: '#8B5CF6',
    description: 'مراجعة كل ما سبق من أجزاء قديمة بقدر ثابت يومياً لضمان الرسوخ الأبدي',
    fortressId: 'review_long' as any,
  },
  {
    id: 'recitation',
    nameAr: 'ختمة التلاوة',
    nameEn: 'Khatma Recitation',
    icon: 'book-outline',
    color: '#10B981',
    description: 'قراءة جزأين يومياً (٤٠ صفحة) بطريقة الحدر السريعة لضمان ختم المصحف كل أسبوعين',
    fortressId: 'recitation',
  },
  {
    id: 'listening',
    nameAr: 'ختمة الاستماع',
    nameEn: 'Khatma Listening',
    icon: 'headset-outline',
    color: '#6366F1',
    description: 'الاستماع لحزب واحد يومياً (١٠ صفحات) بصوت الحصري لضبط التجويد والمخارج',
    fortressId: 'recitation',
  },
];

export const QURAN_GOALS = [
  'القرآن الكريم كاملاً',
  'الجزء الثلاثون (عمّ)',
  'الجزء التاسع والعشرون',
  'الجزء الثامن والعشرون',
  'خمسة أجزاء',
  'عشرة أجزاء',
  'خمسة عشر جزءاً',
  'عشرون جزءاً',
];

export const TOTAL_QURAN_PAGES = 604;

export const GOAL_PAGE_RANGES: Record<string, { start: number; end: number }> = {
  'القرآن الكريم كاملاً': { start: 1, end: 604 },
  'الجزء الثلاثون (عمّ)': { start: 582, end: 604 },
  'الجزء التاسع والعشرون': { start: 562, end: 581 },
  'الجزء الثامن والعشرون': { start: 542, end: 561 },
  'خمسة أجزاء': { start: 1, end: 100 },
  'عشرة أجزاء': { start: 1, end: 200 },
  'خمسة عشر جزءاً': { start: 1, end: 300 },
  'عشرون جزءاً': { start: 1, end: 400 },
};

export const TITLE_XP_REQUIREMENTS: Record<UserTitle, number> = {
  مبتدئ: 0,
  ساعي: 25,
  طالب: 75,
  مجتهد: 200,
  مثابر: 450,
  مرابط: 800,
  ملازم: 1300,
  حارس: 2000,
  قوي: 3000,
  ثابت: 4500,
  متمكن: 6500,
  متقن: 9000,
  ضابط: 12500,
  راوي: 17000,
  ماهر: 22000,
  "خادم القرآن": 28000,
  حافظ: 35000,
  جامع: 45000,
  "صاحب القرآن": 60000,
  "تاج الوقار": 80000,
};
