// ============================================================
// الحصون الخمسة - Five Fortresses: Core Types
// ============================================================

export type UserLevel = 'مبتدئ' | 'متوسط' | 'متقدم';
export type UserTitle = 'مبتدئ' | 'حارس' | 'سيد' | 'حافظ';

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

export type Plan = {
  startPage: number;
  endPage: number;
  currentPage: number;
  pagesPerDay: number;
  totalDays: number;
  startDate: string;
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
  notificationsEnabled: boolean;
  morningReminderTime: string;
  nightReminderTime: string;
  showDailyProgressOnDashboard: boolean;
  memorizationTimerMinutes: number;
  preparationTimerMinutes: number;
  reviewTimerMinutes: number;
};

export type AppState = {
  user: User | null;
  plan: Plan | null;
  dailyProgress: DailyProgress[];
  pageProgress: PageProgress[];
  streak: StreakData;
  isOnboarded: boolean;
  isLoaded: boolean;
  themeMode: 'dark' | 'light';
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
  nightPrepEnabled: boolean;
  nightPrepTime: string;
  morningReminderEnabled: boolean;
  morningReminderTime: string;
  reviewReminderEnabled: boolean;
};

// ============================================================
// Constants
// ============================================================

export const FORTRESSES: Fortress[] = [
  {
    id: 'recitation',
    nameAr: 'التلاوة',
    nameEn: 'Recitation',
    icon: 'book-outline',
    description: 'تلاوة جزأين يومياً',
    color: '#10B981',
    xpReward: 20,
  },
  {
    id: 'listening',
    nameAr: 'الاستماع',
    nameEn: 'Listening',
    icon: 'headset-outline',
    description: 'الاستماع لنصف جزء',
    color: '#6366F1',
    xpReward: 15,
  },
  {
    id: 'preparation',
    nameAr: 'التهيؤ',
    nameEn: 'Preparation',
    icon: 'moon-outline',
    description: 'التحضير قبل النوم',
    color: '#F59E0B',
    xpReward: 15,
  },
  {
    id: 'memorization',
    nameAr: 'الحفظ',
    nameEn: 'Memorization',
    icon: 'shield-checkmark-outline',
    description: 'حفظ الصفحات الجديدة',
    color: '#EF4444',
    xpReward: 50,
  },
  {
    id: 'review',
    nameAr: 'المراجعة',
    nameEn: 'Review',
    icon: 'sync-outline',
    description: 'مراجعة قصيرة وطويلة',
    color: '#8B5CF6',
    xpReward: 30,
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
    description: 'قراءة المقرر قبل الحفظ بـ ١٥ دقيقة لتنشيط الذهن',
    fortressId: 'preparation',
  },
  {
    id: 'preparation_night',
    nameAr: 'التحضير الليلي',
    nameEn: 'Night Preparation',
    icon: 'moon-outline',
    color: '#8B5CF6',
    description: '١٥ دقيقة قراءة و١٥ دقيقة استماع لصفحة الغد قبل النوم',
    fortressId: 'preparation',
  },
  {
    id: 'preparation_weekly',
    nameAr: 'التحضير الأسبوعي',
    nameEn: 'Weekly Preparation',
    icon: 'calendar-outline',
    color: '#6366F1',
    description: 'قراءة صفحات الأسبوع القادم يومياً طوال الأسبوع الحالي',
    fortressId: 'preparation',
  },
  {
    id: 'memorization',
    nameAr: 'الحفظ الجديد',
    nameEn: 'New Memorization',
    icon: 'shield-checkmark-outline',
    color: '#EF4444',
    description: 'تكرار الصفحة لمدة ١٥ دقيقة على الأقل لنقلها للذاكرة البعيدة',
    fortressId: 'memorization',
  },
  {
    id: 'review_short',
    nameAr: 'المراجعة القريبة',
    nameEn: 'Short-term Review',
    icon: 'refresh-outline',
    color: '#10B981',
    description: 'مراجعة آخر جزء تم حفظه يومياً قبل البدء في الجديد',
    fortressId: 'review',
  },
  {
    id: 'review_long',
    nameAr: 'المراجعة البعيدة',
    nameEn: 'Long-term Review',
    icon: 'sync-outline',
    color: '#8B5CF6',
    description: 'مراجعة الأجزاء القديمة بمعدل جزئين يومياً للمتقدمين',
    fortressId: 'review',
  },
  {
    id: 'recitation',
    nameAr: 'ختمة التلاوة',
    nameEn: 'Khatma Recitation',
    icon: 'book-outline',
    color: '#10B981',
    description: 'قراءة جزئين يومياً (٤٠ صفحة) لضبط الحفظ بصرياً',
    fortressId: 'recitation',
  },
  {
    id: 'listening',
    nameAr: 'ختمة الاستماع',
    nameEn: 'Khatma Listening',
    icon: 'headset-outline',
    color: '#6366F1',
    description: 'الاستماع لحزب واحد يومياً لضبط مخارج الحروف',
    fortressId: 'listening',
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
  'مبتدئ': 0,
  'حارس': 500,
  'سيد': 2000,
  'حافظ': 5000,
};
