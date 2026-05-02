/**
 * fiveKeysAlgorithms.ts
 * ─────────────────────────────────────────────────────────────
 * Pure algorithm functions implementing the Five Keys methodology.
 * No React, no store access, no UI logic — only math and page ranges.
 *
 * The Five Keys (المفاتيح الخمسة):
 *  1. Khatma (recitation 40 pages + listening 10 pages daily)
 *  2. Preparation (weekly, nightly, before-memorization)
 *  3. New Memorization (≥15 min repetition)
 *  4. Near Review  — last 20 pages (1 juz), starts after first full juz
 *  5. Far Review   — cycles all older pages at 40 pages/day (2 juz)
 */

import { MushafEdition } from '../data/mushafEditions';
import { ModuleId, Plan } from '../types';
import { buildRanges, formatRanges } from './planLogic';
import { toArabicNumerals } from './helpers';

// ─── Constants matching the methodology ──────────────────────
export const NEAR_REVIEW_SIZE = 20;  // 1 juz = 20 pages
export const FAR_REVIEW_SIZE  = 40;  // 2 juz = 40 pages/day
export const RECITATION_SIZE  = 40;  // 2 juz daily
export const LISTENING_SIZE   = 10;  // 1 hizb daily

// ─── Types ────────────────────────────────────────────────────

export type ReviewStrategy = 'spaced' | 'random' | 'recency';

export interface PageRange {
  start: number;
  end: number;
}

export interface ReviewPages {
  nearPages: number[];
  farPages: number[];
}

export interface ModulePages {
  pages: number[];
  ranges: PageRange[];
}

// ─── Khatma Algorithms ────────────────────────────────────────

/**
 * Returns the 40-page (2 juz) recitation range for a given active day index.
 * Cycles through the entire Mushaf continuously.
 */
export function getRecitationRange(
  activeDayIndex: number,
  totalPages: number,
): PageRange {
  const start = ((activeDayIndex * RECITATION_SIZE) % totalPages) + 1;
  const end   = ((start - 1 + RECITATION_SIZE - 1) % totalPages) + 1;
  return { start, end };
}

/**
 * Returns the 10-page (1 hizb) listening range for a given active day index.
 * Cycles through the entire Mushaf continuously.
 */
export function getListeningRange(
  activeDayIndex: number,
  totalPages: number,
): PageRange {
  const start = ((activeDayIndex * LISTENING_SIZE) % totalPages) + 1;
  const end   = ((start - 1 + LISTENING_SIZE - 1) % totalPages) + 1;
  return { start, end };
}

/**
 * Expands a page range into an array of page numbers, handling wrap-around.
 */
export function expandRange(range: PageRange, totalPages: number): number[] {
  const pages: number[] = [];
  if (range.end >= range.start) {
    for (let p = range.start; p <= range.end; p++) pages.push(p);
  } else {
    for (let p = range.start; p <= totalPages; p++) pages.push(p);
    for (let p = 1; p <= range.end; p++) pages.push(p);
  }
  return pages;
}

// ─── Review Algorithms ────────────────────────────────────────

/**
 * Calculates near review pages (last 20 pages = 1 juz).
 * Returns empty array until 20 pages are memorized (as per methodology).
 */
export function getNearReviewPages(alreadyDone: number[]): number[] {
  if (alreadyDone.length < NEAR_REVIEW_SIZE) return [];
  return alreadyDone.slice(alreadyDone.length - NEAR_REVIEW_SIZE);
}

/**
 * Calculates far review pages using the SPACED strategy.
 * Cycles through all pages older than the near window, 40/day.
 * @param farStartIndex - rotating offset that advances each day
 */
export function getFarReviewPagesSpaced(
  alreadyDone: number[],
  activeDayIndex: number,
  farStartIndex: number,
): { pages: number[]; nextFarStartIndex: number } {
  const pool = alreadyDone.slice(0, Math.max(0, alreadyDone.length - NEAR_REVIEW_SIZE));
  if (pool.length === 0) return { pages: [], nextFarStartIndex: farStartIndex };

  if (pool.length <= FAR_REVIEW_SIZE) {
    return {
      pages: [...pool],
      nextFarStartIndex: farStartIndex,
    };
  }

  const offset = (activeDayIndex * FAR_REVIEW_SIZE) % pool.length;
  const pages: number[] = [];
  for (let k = 0; k < FAR_REVIEW_SIZE; k++) {
    pages.push(pool[(offset + k) % pool.length]);
  }
  return {
    pages: Array.from(new Set(pages)).sort((a, b) => a - b),
    nextFarStartIndex: (farStartIndex + FAR_REVIEW_SIZE) % pool.length,
  };
}

/**
 * Calculates far review pages using the RECENCY strategy.
 * Shows the most recent 40 pages before the near window.
 */
export function getFarReviewPagesRecency(alreadyDone: number[]): number[] {
  if (alreadyDone.length <= NEAR_REVIEW_SIZE) return [];
  return alreadyDone.slice(
    Math.max(0, alreadyDone.length - NEAR_REVIEW_SIZE - FAR_REVIEW_SIZE),
    alreadyDone.length - NEAR_REVIEW_SIZE,
  );
}

/**
 * Calculates far review pages using the RANDOM (deterministic-shuffle) strategy.
 * Uses a stable seed per day to produce a consistent shuffle.
 */
export function getFarReviewPagesRandom(
  alreadyDone: number[],
  activeDayIndex: number,
): number[] {
  if (alreadyDone.length <= NEAR_REVIEW_SIZE) return [];
  const pool = alreadyDone.slice(0, alreadyDone.length - NEAR_REVIEW_SIZE);
  const shuffled = [...pool].sort(() => Math.sin(activeDayIndex * 31 + 7) - 0.5);
  return shuffled.slice(0, Math.min(FAR_REVIEW_SIZE, shuffled.length));
}

/**
 * Unified review calculator — picks the right strategy.
 */
export function calculateReviewPages(
  alreadyDone: number[],
  activeDayIndex: number,
  strategy: ReviewStrategy,
  farStartIndex: number = 0,
): ReviewPages & { nextFarStartIndex: number } {
  const nearPages = getNearReviewPages(alreadyDone);

  let farPages: number[];
  let nextFarStartIndex = farStartIndex;

  if (strategy === 'spaced') {
    const result = getFarReviewPagesSpaced(alreadyDone, activeDayIndex, farStartIndex);
    farPages = result.pages;
    nextFarStartIndex = result.nextFarStartIndex;
  } else if (strategy === 'random') {
    farPages = getFarReviewPagesRandom(alreadyDone, activeDayIndex);
  } else {
    farPages = getFarReviewPagesRecency(alreadyDone);
  }

  return { nearPages, farPages, nextFarStartIndex };
}

// ─── Preparation Algorithms ───────────────────────────────────

/**
 * Returns tomorrow's memorization pages for the nightly preparation.
 */
export function getNightPreparationPages(
  plan: Plan,
  activeDayIndex: number,
): number[] {
  return plan.targetPages.slice(
    (activeDayIndex + 1) * plan.pagesPerDay,
    (activeDayIndex + 2) * plan.pagesPerDay,
  );
}

/**
 * Returns next week's memorization pages for the weekly preparation.
 * Per methodology: read NEXT WEEK's content daily throughout the current week.
 */
export function getWeeklyPreparationPages(
  plan: Plan,
  activeDayIndex: number,
): number[] {
  return plan.targetPages.slice(
    (activeDayIndex + 1) * plan.pagesPerDay,
    (activeDayIndex + 1 + 7) * plan.pagesPerDay,
  );
}

// ─── Active Day Calculator ────────────────────────────────────

/**
 * Computes which active-plan-day corresponds to today's date.
 * Returns -1 if today is not an active day or plan is over.
 */
export function getActiveDayIndex(
  startDate: string,
  activeDaysOfWeek: Set<number>,
  totalDays: number,
): number {
  const [y, m, d] = startDate.split('-').map(Number);
  let current = new Date(y, m - 1, d);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  if (!activeDaysOfWeek.has(todayDate.getDay())) return -1;

  let activeDayIndex = -1;
  let iterations = 0;
  while (current <= todayDate && iterations < 3650) {
    if (activeDaysOfWeek.has(current.getDay())) activeDayIndex++;
    current.setDate(current.getDate() + 1);
    iterations++;
  }

  if (activeDayIndex < 0 || activeDayIndex >= totalDays) return -1;
  return activeDayIndex;
}

// ─── Module Pages Resolver ────────────────────────────────────

/**
 * Returns the relevant pages for a given module on a given plan day.
 * This is the single source of truth for all module page calculations.
 */
export function getModulePages(
  moduleId: ModuleId,
  plan: Plan,
  activeDayIndex: number,
  edition: MushafEdition,
  reviewStrategy: ReviewStrategy = 'spaced',
): number[] {
  const startIdx   = activeDayIndex * plan.pagesPerDay;
  const dayPages   = plan.targetPages.slice(startIdx, startIdx + plan.pagesPerDay);
  const alreadyDone = plan.targetPages.slice(0, startIdx);

  switch (moduleId) {
    case 'memorization':
    case 'preparation_before':
      return dayPages;

    case 'preparation_night':
      return getNightPreparationPages(plan, activeDayIndex);

    case 'preparation_weekly':
      return getWeeklyPreparationPages(plan, activeDayIndex);

    case 'recitation': {
      const range = getRecitationRange(activeDayIndex, edition.totalPages);
      return expandRange(range, edition.totalPages);
    }

    case 'listening': {
      const range = getListeningRange(activeDayIndex, edition.totalPages);
      return expandRange(range, edition.totalPages);
    }

    case 'review_short':
      return getNearReviewPages(alreadyDone);

    case 'review_long': {
      const { farPages } = calculateReviewPages(alreadyDone, activeDayIndex, reviewStrategy);
      return farPages;
    }

    default:
      return [];
  }
}

// ─── Recommended Time ─────────────────────────────────────────

/**
 * Returns the recommended time in seconds for a given module.
 * Matches the methodology's time allocation.
 */
export function getModuleRecommendedSeconds(moduleId: ModuleId): number {
  switch (moduleId) {
    case 'recitation':         return 40 * 60; // 2 juz × 20 min each
    case 'listening':          return 20 * 60; // 1 hizb
    case 'preparation_night':  return 30 * 60; // 15 min read + 15 min listen
    case 'preparation_before': return 15 * 60;
    case 'preparation_weekly': return 15 * 60;
    case 'memorization':       return 15 * 60; // min 15 min for long-term stability
    case 'review_short':       return 25 * 60;
    case 'review_long':        return 25 * 60;
    default:                   return 15 * 60;
  }
}

// ─── Roadmap Day Builder ──────────────────────────────────────

export interface RoadmapDayTasks {
  nearPages: number[];
  farPages: number[];
  nextDayPages: number[];
  weeklyPages: number[];
  recitationRange: PageRange;
  listeningRange: PageRange;
  nearLabel: string;
  distantLabel: string;
  recitationLabel: string;
  listeningLabel: string;
  nextLabel: string | null;
  weeklyLabel: string | null;
}

/**
 * Builds all derived data for a single roadmap day.
 * Pure function — takes plan data, returns display-ready values.
 */
export function buildRoadmapDayTasks(
  plan: Plan,
  dayIndex: number, // 0-indexed active day
  edition: MushafEdition,
  strategy: ReviewStrategy,
  farStartIndex: number,
  pageToSurahMap: Map<number, { id: number; name: string }>,
): RoadmapDayTasks & { nextFarStartIndex: number } {
  const startIdx    = dayIndex * plan.pagesPerDay;
  const alreadyDone = plan.targetPages.slice(0, startIdx);

  // Review
  const { nearPages, farPages, nextFarStartIndex } = calculateReviewPages(
    alreadyDone, dayIndex, strategy, farStartIndex,
  );

  // Preparation
  const nextDayPages  = getNightPreparationPages(plan, dayIndex);
  const weeklyPages   = getWeeklyPreparationPages(plan, dayIndex);

  // Khatma ranges
  const recitationRange = getRecitationRange(dayIndex, edition.totalPages);
  const listeningRange  = getListeningRange(dayIndex, edition.totalPages);

  // Helper to build a label from pages
  const makeLabel = (pages: number[], suffix = ''): string | null => {
    if (pages.length === 0) return null;
    const segs = getFastSegmentsFromMap(pages, pageToSurahMap);
    return segs.map(s => s.name).slice(0, 2).join(' + ')
      + ` — ص ${formatRanges(buildRanges(pages))}`
      + suffix;
  };

  const makeRangeLabel = (range: PageRange, total: number): string => {
    if (range.end >= range.start) {
      return `${toArabicNumerals(range.start)} - ${toArabicNumerals(range.end)}`;
    }
    return `${toArabicNumerals(range.start)} - ${toArabicNumerals(total)} و ١ - ${toArabicNumerals(range.end)}`;
  };

  const nearLabel = nearPages.length > 0
    ? makeLabel(nearPages)! + ''
    : 'لا يوجد (بداية الخطة)';
  const distantLabel = farPages.length > 0
    ? makeLabel(farPages)!
    : 'لا يوجد بعد';

  return {
    nearPages,
    farPages,
    nextFarStartIndex,
    nextDayPages,
    weeklyPages,
    recitationRange,
    listeningRange,
    nearLabel,
    distantLabel,
    recitationLabel: makeRangeLabel(recitationRange, edition.totalPages),
    listeningLabel:  makeRangeLabel(listeningRange, edition.totalPages),
    nextLabel:   makeLabel(nextDayPages),
    weeklyLabel: makeLabel(weeklyPages),
  };
}

// Internal helper — fast segment lookup using a pre-built map
function getFastSegmentsFromMap(
  pages: number[],
  map: Map<number, { id: number; name: string }>,
): { id: number; name: string }[] {
  const seen = new Map<number, string>();
  pages.forEach(p => {
    const meta = map.get(p);
    if (meta && !seen.has(meta.id)) seen.set(meta.id, meta.name);
  });
  return Array.from(seen.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.id - b.id);
}
