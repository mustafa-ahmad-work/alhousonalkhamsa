import { useCallback, useMemo } from 'react';
import { getMushafEdition } from '../data/mushafEditions';
import { SURAHS } from '../data/quranMeta';
import { useAppStore } from '../store/AppStore';
import { useSelectionStore } from '../store/selectionStore';
import { DEV_CONFIG } from '../developerConfig';
import { todayISO } from '../utils/helpers';
import { buildRanges } from '../utils/planLogic';
import {
  ReviewStrategy,
  buildRoadmapDayTasks,
  getRecitationRange,
  getListeningRange,
  calculateReviewPages,
  getNightPreparationPages,
  getWeeklyPreparationPages,
} from '../utils/fiveKeysAlgorithms';
import { buildWeeklyCalendar } from '../utils/planLogic';
import type { DayItem, DayTask, WeekGroup } from '../components/plan/types';
import { toArabicNumerals } from '../utils/helpers';

export function usePlanScreenLogic() {
  const { state, dispatch } = useAppStore();
  const selectionStore = useSelectionStore();
  const { plan, pageProgress, settings } = state;

  const reviewStrategy = (settings.reviewStrategy ?? 'spaced') as ReviewStrategy;
  const settingsPlanMode = (settings as any).planMode ?? 'daily';
  const settingsActiveDays: number[] = (settings as any).activeDaysOfWeek ?? [0, 1, 2, 3, 4];

  const edition = useMemo(() => {
    const editionId =
      (plan as any)?.mushafEditionId ??
      (settings as any).mushafEdition ??
      'madani_604';
    return getMushafEdition(editionId as any);
  }, [plan, settings]);

  // Pre-built page→surah map for O(1) lookups (built once per edition/plan)
  const pageToSurahMap = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    Object.entries(edition.surahPages).forEach(([idStr, [start, end]]) => {
      const id = Number(idStr);
      const name = SURAHS.find(s => s.id === id)?.nameAr ?? `سورة ${id}`;
      for (let p = start; p <= end; p++) map.set(p, { id, name });
    });
    return map;
  }, [edition]);

  const roadmap = useMemo(() => {
    if (!plan || !plan.targetPages) return [];

    const memorizedSet = new Set(
      pageProgress.filter(pg => pg.memorized).map(pg => pg.pageNumber),
    );

    const isDaily = plan?.planMode === 'daily';
    const activeDows = new Set<number>(
      isDaily
        ? [0, 1, 2, 3, 4, 5, 6]
        : (plan?.activeDaysOfWeek ?? settingsActiveDays ?? [0, 1, 2, 3, 4]),
    );
    if (activeDows.size === 0) activeDows.add(new Date().getDay());

    // Build ISO date list for each active plan day
    const planDates: string[] = [];
    const _rawDate = plan.startDate ?? new Date().toISOString().split('T')[0];
    const [y, m, d] = _rawDate.split('-').map(Number);
    let currentDate = new Date(y, m - 1, d);
    while (planDates.length < plan.totalDays) {
      if (activeDows.has(currentDate.getDay())) {
        planDates.push(
          `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
        );
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const today = todayISO();
    const days: DayItem[] = [];
    let foundCurrent = false;
    let farStartIndex = 0;

    for (let i = 0; i < plan.totalDays; i++) {
      const startIdx = i * plan.pagesPerDay;
      const dayPages = plan.targetPages.slice(startIdx, startIdx + plan.pagesPerDay);
      if (dayPages.length === 0) continue;

      // ── Memorization label ───────────────────────────────────
      const ranges = buildRanges(dayPages);
      const daySurahs = getFastSegments(dayPages, pageToSurahMap);
      const surahLabel = daySurahs.map(s => s.nameAr).slice(0, 2).join(' - ');
      const mainLabel = daySurahs.length === 1
        ? `${daySurahs[0].nameAr} — صفحات ${formatRanges(ranges)}`
        : `${daySurahs.map(s => s.nameAr).join(' + ')} — صفحات ${formatRanges(ranges)}`;

      // ── Completion state ─────────────────────────────────────
      const memorizedCount = dayPages.filter(p => memorizedSet.has(p)).length;
      const isCompleted = memorizedCount === dayPages.length;
      let isCurrent = false;
      if (!isCompleted && !foundCurrent) { isCurrent = true; foundCurrent = true; }

      // ── Pure algorithm — all derived data ───────────────────
      const derived = buildRoadmapDayTasks(
        plan, i, edition, reviewStrategy, farStartIndex, pageToSurahMap,
      );
      farStartIndex = derived.nextFarStartIndex;

      const strategyLabel =
        reviewStrategy === 'spaced' ? 'تكرار متباعد'
        : reviewStrategy === 'random' ? 'عشوائي'
        : 'الأحدث أولاً';

      const tasks: DayTask[] = [
        {
          id: 'mem',
          label: `الحفظ الجديد: ${mainLabel}`,
          icon: 'book',
          color: '#10B981',
        },
        {
          id: 'prep_p',
          label: `التحضير القبلي (١٥ د): قراءة ${mainLabel} بسرعة قبل الحفظ`,
          icon: 'flash-outline',
          color: '#F59E0B',
        },
        {
          id: 'prep_n',
          label: derived.nextLabel
            ? `التحضير الليلي (٣٠ د): قراءة وسماع ${derived.nextLabel}`
            : 'الاستعداد للختم المبارك',
          icon: 'moon',
          color: '#8B5CF6',
        },
        {
          id: 'prep_w',
          label: derived.weeklyLabel
            ? `التحضير الأسبوعي: قراءة ${derived.weeklyLabel}`
            : 'الأسابيع الأخيرة في الختمة',
          icon: 'calendar-outline',
          color: '#F97316',
        },
        {
          id: 'listen',
          label: `ختمة الاستماع (حزب): ص ${derived.listeningLabel}`,
          icon: 'headset',
          color: '#3B82F6',
        },
        {
          id: 'rev_s',
          label: `المراجعة القريبة (${strategyLabel}): ${derived.nearLabel}`,
          icon: 'refresh',
          color: '#10B981',
        },
        {
          id: 'rev_l',
          label: `المراجعة البعيدة (${strategyLabel}): ${derived.distantLabel}`,
          icon: 'sync',
          color: '#8B5CF6',
        },
        {
          id: 'recit',
          label: `ورد التلاوة (جزءين): ص ${derived.recitationLabel}`,
          icon: 'eye',
          color: '#EF4444',
        },
      ];

      days.push({
        dayIndex: i + 1,
        pageNumbers: dayPages,
        ranges,
        surahSegments: daySurahs,
        surahLabel,
        isCurrent,
        isCompleted,
        completionPct: (memorizedCount / dayPages.length) * 100,
        tasks,
        date: planDates[i],
        isLocked: DEV_CONFIG.unlockAllPlans ? false : planDates[i] > today,
      });
    }

    return days;
  }, [plan, pageProgress, edition, reviewStrategy, settingsActiveDays, pageToSurahMap]);

  const handleComplete = useCallback(
    (item: DayItem, onCompleteCb?: () => void) => {
      if (!plan) return;

      dispatch({ type: 'MARK_PAGES_MEMORIZED', payload: { pages: item.pageNumbers } });
      dispatch({ type: 'COMPLETE_ALL_TODAY' });

      type ModuleIdType =
        | 'memorization' | 'preparation_before' | 'preparation_night'
        | 'preparation_weekly' | 'recitation' | 'listening'
        | 'review_short' | 'review_long';

      const i = item.dayIndex - 1;
      const startIdx = i * plan.pagesPerDay;
      const alreadyDone = plan.targetPages.slice(0, startIdx);

      // ── Build modules to sync using pure functions ───────────
      const modulesToSync: { moduleId: ModuleIdType; ranges: { start: number; end: number }[] }[] = [
        { moduleId: 'memorization', ranges: item.ranges },
        { moduleId: 'preparation_before', ranges: item.ranges },
      ];

      // Recitation range
      const recitRange = getRecitationRange(i, edition.totalPages);
      modulesToSync.push({
        moduleId: 'recitation',
        ranges: [{ start: recitRange.start, end: recitRange.end }],
      });

      // Listening range
      const listenRange = getListeningRange(i, edition.totalPages);
      modulesToSync.push({
        moduleId: 'listening',
        ranges: [{ start: listenRange.start, end: listenRange.end }],
      });

      // Nightly preparation
      const nextDayPages = getNightPreparationPages(plan, i);
      if (nextDayPages.length > 0) {
        modulesToSync.push({ moduleId: 'preparation_night', ranges: buildRanges(nextDayPages) });
      }

      // Weekly preparation
      const weeklyPages = getWeeklyPreparationPages(plan, i);
      if (weeklyPages.length > 0) {
        modulesToSync.push({ moduleId: 'preparation_weekly', ranges: buildRanges(weeklyPages) });
      }

      // Review pages
      const { nearPages, farPages } = calculateReviewPages(alreadyDone, i, reviewStrategy);
      if (nearPages.length > 0) {
        modulesToSync.push({ moduleId: 'review_short', ranges: buildRanges(nearPages) });
      }
      if (farPages.length > 0) {
        modulesToSync.push({ moduleId: 'review_long', ranges: buildRanges(farPages) });
      }

      // ── Sync to selectionStore ───────────────────────────────
      modulesToSync.forEach(m => {
        const existing = selectionStore
          .getModuleSelections(m.moduleId as any)
          .find(
            s =>
              s.ranges.length === m.ranges.length &&
              s.ranges.every((r, idx) => r.start === m.ranges[idx].start && r.end === m.ranges[idx].end),
          );
        if (existing) {
          if (!existing.isCompleted) selectionStore.completeTaskSelection(existing.id);
        } else {
          selectionStore.addTaskSelection(
            m.moduleId as any,
            m.ranges.map(r => selectionStore.createPageRange(r.start, r.end)),
          );
          const latest = selectionStore.getLatestSelection(m.moduleId as any);
          if (latest) selectionStore.completeTaskSelection(latest.id);
        }
      });

      if (onCompleteCb) onCompleteCb();
    },
    [dispatch, selectionStore, edition, plan, reviewStrategy],
  );

  return {
    plan,
    roadmap,
    settingsPlanMode,
    settingsActiveDays,
    handleComplete,
  };
}

// ─── Local helpers (display only, not algorithmic) ────────────

function getFastSegments(
  pages: number[],
  map: Map<number, { id: number; name: string }>,
): { surahId: number; nameAr: string; pages: number[] }[] {
  const segs: Record<number, { surahId: number; nameAr: string; pages: number[] }> = {};
  pages.forEach(p => {
    const meta = map.get(p);
    if (meta) {
      if (!segs[meta.id]) segs[meta.id] = { surahId: meta.id, nameAr: meta.name, pages: [p] };
      else segs[meta.id].pages.push(p);
    }
  });
  return Object.values(segs).sort((a, b) => a.surahId - b.surahId);
}

function formatRanges(ranges: { start: number; end: number }[]): string {
  return ranges
    .map(r =>
      r.start === r.end
        ? toArabicNumerals(r.start)
        : `${toArabicNumerals(r.start)}-${toArabicNumerals(r.end)}`,
    )
    .join(' و ');
}
