import { useCallback, useMemo } from 'react';
import { getMushafEdition } from '../data/mushafEditions';
import { SURAHS } from '../data/quranMeta';
import { useAppStore } from '../store/AppStore';
import { useSelectionStore } from '../store/selectionStore';
import { DEV_CONFIG } from '../developerConfig';
import { todayISO, toArabicNumerals } from '../utils/helpers';
import { buildRanges, formatRanges, getSurahSegments } from '../utils/planLogic';
import type { DayItem, DayTask, WeekGroup } from '../components/plan/types';

export function usePlanScreenLogic() {
  const { state, dispatch } = useAppStore();
  const selectionStore = useSelectionStore();
  const { plan, pageProgress, settings } = state;

  const reviewStrategy = settings.reviewStrategy ?? 'spaced';
  const settingsPlanMode = (settings as any).planMode ?? 'daily';
  const settingsActiveDays: number[] = (settings as any).activeDaysOfWeek ?? [0, 1, 2, 3, 4];

  const edition = useMemo(() => {
    const editionId =
      (plan as any)?.mushafEditionId ??
      (settings as any).mushafEdition ??
      'madani_604';
    return getMushafEdition(editionId as any);
  }, [plan, settings]);

  const roadmap = useMemo(() => {
    if (!plan || !plan.targetPages) return [];

    const memorizedSet = new Set(
      pageProgress.filter((pg) => pg.memorized).map((pg) => pg.pageNumber),
    );

    const isDaily = plan?.planMode === 'daily';
    const activeDows = new Set<number>(
      isDaily
        ? [0, 1, 2, 3, 4, 5, 6]
        : (plan?.activeDaysOfWeek ?? settingsActiveDays ?? [0, 1, 2, 3, 4]),
    );
    if (activeDows.size === 0) activeDows.add(new Date().getDay());

    // Optimization: Pre-calculate page-to-surah mapping for the entire edition
    const surahEntries = Object.entries(edition.surahPages);
    const pageToSurahMap = new Map<number, { id: number; name: string }>();
    
    // This is only ~600 iterations, done once per roadmap calc
    surahEntries.forEach(([idStr, [start, end]]) => {
      const id = Number(idStr);
      const name = SURAHS.find(s => s.id === id)?.nameAr ?? `سورة ${id}`;
      for (let p = start; p <= end; p++) {
        pageToSurahMap.set(p, { id, name });
      }
    });

    const getFastSegments = (pages: number[]) => {
      const segments: Record<number, { surahId: number; nameAr: string; pages: number[] }> = {};
      pages.forEach(p => {
        const meta = pageToSurahMap.get(p);
        if (meta) {
          if (!segments[meta.id]) {
            segments[meta.id] = { surahId: meta.id, nameAr: meta.name, pages: [p] };
          } else {
            segments[meta.id].pages.push(p);
          }
        }
      });
      return Object.values(segments).sort((a, b) => a.surahId - b.surahId);
    };

    const planDates: string[] = [];
    const _rawDate = plan.startDate ?? new Date().toISOString().split('T')[0];
    const [y, m, d] = _rawDate.split('-').map(Number);
    let currentDate = new Date(y, m - 1, d);

    while (planDates.length < plan.totalDays) {
      if (activeDows.has(currentDate.getDay())) {
        const _iso = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        planDates.push(_iso);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const today = todayISO();
    const days: DayItem[] = [];
    let foundCurrent = false;
    let currentFarStartIndex = 0;

    for (let i = 0; i < plan.totalDays; i++) {
      const startIdx = i * plan.pagesPerDay;
      const dayPages = plan.targetPages.slice(
        startIdx,
        startIdx + plan.pagesPerDay,
      );
      if (dayPages.length === 0) continue;

      const ranges = buildRanges(dayPages);
      const surahSegments = getFastSegments(dayPages);
      const surahLabel = surahSegments
        .map((s) => s.nameAr)
        .slice(0, 2)
        .join(' - ');

      const memorizedCount = dayPages.filter((p) => memorizedSet.has(p)).length;
      const isCompleted = memorizedCount === dayPages.length;
      let isCurrent = false;
      if (!isCompleted && !foundCurrent) {
        isCurrent = true;
        foundCurrent = true;
      }

      const mainLabel =
        surahSegments.length === 1
          ? `${surahSegments[0].nameAr} — صفحات ${formatRanges(ranges)}`
          : `${surahSegments.map((s) => s.nameAr).join(' + ')} — صفحات ${formatRanges(ranges)}`;

      const nextDayPages = plan.targetPages.slice(
        (i + 1) * plan.pagesPerDay,
        (i + 2) * plan.pagesPerDay,
      );
      const nextSegments =
        nextDayPages.length > 0 ? getFastSegments(nextDayPages) : [];
      const nextLabel =
        nextSegments.length > 0
          ? nextSegments
              .map((s) => s.nameAr)
              .slice(0, 2)
              .join(' + ') +
            ' — ' +
            formatRanges(buildRanges(nextDayPages))
          : null;

      const weeklyPages = plan.targetPages.slice(
        (i + 7) * plan.pagesPerDay,
        (i + 14) * plan.pagesPerDay,
      );
      const weeklyLabel =
        weeklyPages.length > 0
          ? getFastSegments(weeklyPages)
              .map((s) => s.nameAr)
              .slice(0, 2)
              .join(' + ') +
            ' — ' +
            formatRanges(buildRanges(weeklyPages))
          : null;

      // Review strategy
      const alreadyDone = plan.targetPages.slice(0, startIdx);
      let nearPages: number[];
      let farPages: number[];

      if (reviewStrategy === 'spaced') {
        const NEAR_SIZE = 20;
        const FAR_SIZE = 40;
        nearPages =
          alreadyDone.length > 0
            ? alreadyDone.slice(Math.max(0, alreadyDone.length - NEAR_SIZE))
            : [];
        const olderPages =
          alreadyDone.length > NEAR_SIZE
            ? alreadyDone.slice(0, alreadyDone.length - NEAR_SIZE)
            : [];
        if (olderPages.length > 0) {
          if (olderPages.length <= FAR_SIZE) {
            farPages = [...olderPages];
          } else {
            farPages = [];
            for (let j = 0; j < FAR_SIZE; j++) {
              farPages.push(
                olderPages[(currentFarStartIndex + j) % olderPages.length],
              );
            }
            currentFarStartIndex =
              (currentFarStartIndex + FAR_SIZE) % olderPages.length;
          }
        } else {
          farPages = [];
        }
      } else if (reviewStrategy === 'random') {
        const shuffled = [...alreadyDone].sort(
          () => Math.sin(i * 31 + 7) - 0.5,
        );
        nearPages = shuffled.slice(0, Math.min(20, shuffled.length));
        farPages = shuffled.slice(20, Math.min(60, shuffled.length));
      } else {
        nearPages =
          alreadyDone.length > 0
            ? alreadyDone.slice(Math.max(0, alreadyDone.length - 20))
            : [];
        farPages =
          alreadyDone.length > 20
            ? alreadyDone.slice(
                Math.max(0, alreadyDone.length - 60),
                alreadyDone.length - 20,
              )
            : [];
      }

      const nearSegments =
        nearPages.length > 0 ? getFastSegments(nearPages) : [];
      const nearLabel =
        nearSegments.length > 0
          ? nearSegments
              .map((s) => s.nameAr)
              .slice(0, 2)
              .join(' + ') +
            ' (ص ' +
            formatRanges(buildRanges(nearPages)) +
            ')'
          : 'لا يوجد (بداية الخطة)';

      const distantSegments =
        farPages.length > 0 ? getFastSegments(farPages) : [];
      const distantLabel =
        distantSegments.length > 0
          ? distantSegments
              .map((s) => s.nameAr)
              .slice(0, 2)
              .join(' + ') +
            ' (ص ' +
            formatRanges(buildRanges(farPages)) +
            ')'
          : 'لا يوجد بعد';

      const wardStart = ((i * 40) % edition.totalPages) + 1;
      const wardEnd = ((wardStart + 39 - 1) % edition.totalPages) + 1;
      const wardLabel =
        wardEnd >= wardStart
          ? `${toArabicNumerals(wardStart)} - ${toArabicNumerals(wardEnd)}`
          : `${toArabicNumerals(wardStart)} - ${toArabicNumerals(edition.totalPages)} و ١ - ${toArabicNumerals(wardEnd)}`;

      const listenStart = ((i * 10) % edition.totalPages) + 1;
      const listenEnd = ((listenStart + 9 - 1) % edition.totalPages) + 1;
      const listenLabel =
        listenEnd >= listenStart
          ? `${toArabicNumerals(listenStart)} - ${toArabicNumerals(listenEnd)}`
          : `${toArabicNumerals(listenStart)} - ${toArabicNumerals(edition.totalPages)} و ١ - ${toArabicNumerals(listenEnd)}`;

      const strategyLabel =
        reviewStrategy === 'spaced'
          ? 'تكرار متباعد'
          : reviewStrategy === 'random'
            ? 'عشوائي'
            : 'الأحدث أولاً';

      // The caller will map colors based on their theme, so we pass string identifiers or use defaults
      const tasks: DayTask[] = [
        {
          id: 'mem',
          label: `الحفظ الجديد: ${mainLabel}`,
          icon: 'book',
          color: '#10B981', // These will be replaced by UI if needed
        },
        {
          id: 'prep_p',
          label: `التحضير القبلي (١٥ د): قراءة ${mainLabel} بسرعة قبل الحفظ`,
          icon: 'flash-outline',
          color: '#F59E0B',
        },
        {
          id: 'prep_n',
          label: nextLabel
            ? `التحضير الليلي (٣٠ د): قراءة وسماع ${nextLabel}`
            : 'الاستعداد للختم المبارك',
          icon: 'moon',
          color: '#8B5CF6',
        },
        {
          id: 'prep_w',
          label: weeklyLabel
            ? `التحضير الأسبوعي: قراءة ${weeklyLabel}`
            : 'الأسابيع الأخيرة في الختمة',
          icon: 'calendar-outline',
          color: '#F97316',
        },
        {
          id: 'listen',
          label: `ختمة الاستماع (حزب): ص ${listenLabel}`,
          icon: 'headset',
          color: '#3B82F6',
        },
        {
          id: 'rev_s',
          label: `المراجعة القريبة (${strategyLabel}): ${nearLabel}`,
          icon: 'refresh',
          color: '#10B981',
        },
        {
          id: 'rev_l',
          label: `المراجعة البعيدة (${strategyLabel}): ${distantLabel}`,
          icon: 'sync',
          color: '#8B5CF6',
        },
        {
          id: 'recit',
          label: `ورد التلاوة (جزءين): ص ${wardLabel}`,
          icon: 'eye',
          color: '#EF4444',
        },
      ];

      days.push({
        dayIndex: i + 1,
        pageNumbers: dayPages,
        ranges,
        surahSegments,
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
  }, [plan, pageProgress, edition, reviewStrategy, settingsActiveDays]);

  const handleComplete = useCallback(
    (item: DayItem, onCompleteCb?: () => void) => {
      if (!plan) return;
      dispatch({
        type: 'MARK_PAGES_MEMORIZED',
        payload: { pages: item.pageNumbers },
      });
      dispatch({ type: 'COMPLETE_ALL_TODAY' });

      type ModuleIdType =
        | 'memorization'
        | 'preparation_before'
        | 'preparation_night'
        | 'preparation_weekly'
        | 'recitation'
        | 'listening'
        | 'review_short'
        | 'review_long';

      const modulesToSync: {
        moduleId: ModuleIdType;
        ranges: { start: number; end: number }[];
      }[] = [
        { moduleId: 'memorization', ranges: item.ranges },
        { moduleId: 'preparation_before', ranges: item.ranges },
        {
          moduleId: 'recitation',
          ranges: [
            {
              start: (((item.dayIndex - 1) * 40) % edition.totalPages) + 1,
              end: (((item.dayIndex - 1) * 40 + 39) % edition.totalPages) + 1,
            },
          ],
        },
        {
          moduleId: 'listening',
          ranges: [
            {
              start: (((item.dayIndex - 1) * 10) % edition.totalPages) + 1,
              end: (((item.dayIndex - 1) * 10 + 9) % edition.totalPages) + 1,
            },
          ],
        },
      ];

      const i = item.dayIndex - 1;
      const startIdx = i * plan.pagesPerDay;
      const alreadyDone = plan.targetPages.slice(0, startIdx);

      const nextDayPages = plan.targetPages.slice(
        (i + 1) * plan.pagesPerDay,
        (i + 2) * plan.pagesPerDay,
      );
      if (nextDayPages.length > 0) {
        modulesToSync.push({
          moduleId: 'preparation_night',
          ranges: buildRanges(nextDayPages),
        });
      }

      const weeklyPages = plan.targetPages.slice(
        (i + 7) * plan.pagesPerDay,
        (i + 14) * plan.pagesPerDay,
      );
      if (weeklyPages.length > 0) {
        modulesToSync.push({
          moduleId: 'preparation_weekly',
          ranges: buildRanges(weeklyPages),
        });
      }

      let nearPages: number[] = [];
      let farPages: number[] = [];

      if (reviewStrategy === 'spaced') {
        const NEAR_SIZE = 20;
        const FAR_SIZE = 40;
        nearPages =
          alreadyDone.length > 0
            ? alreadyDone.slice(Math.max(0, alreadyDone.length - NEAR_SIZE))
            : [];
        const olderPages =
          alreadyDone.length > NEAR_SIZE
            ? alreadyDone.slice(0, alreadyDone.length - NEAR_SIZE)
            : [];
        if (olderPages.length > 0) {
          if (olderPages.length <= FAR_SIZE) {
            farPages = [...olderPages];
          } else {
            let rotatingStart = 0;
            for (let day = 0; day < i; day++) {
              const dayAlreadyDone = plan.targetPages.slice(
                0,
                day * plan.pagesPerDay,
              );
              const dayOlder =
                dayAlreadyDone.length > NEAR_SIZE
                  ? dayAlreadyDone.slice(0, dayAlreadyDone.length - NEAR_SIZE)
                  : [];
              if (dayOlder.length > FAR_SIZE)
                rotatingStart = (rotatingStart + FAR_SIZE) % dayOlder.length;
            }
            for (let j = 0; j < FAR_SIZE; j++) {
              farPages.push(
                olderPages[(rotatingStart + j) % olderPages.length],
              );
            }
          }
        }
      } else if (reviewStrategy === 'random') {
        const shuffled = [...alreadyDone].sort(
          () => Math.sin(i * 31 + 7) - 0.5,
        );
        nearPages = shuffled.slice(0, Math.min(20, shuffled.length));
        farPages = shuffled.slice(20, Math.min(60, shuffled.length));
      } else {
        nearPages = alreadyDone.slice(Math.max(0, alreadyDone.length - 20));
        farPages = alreadyDone.slice(
          Math.max(0, alreadyDone.length - 60),
          Math.max(0, alreadyDone.length - 20),
        );
      }

      if (nearPages.length > 0)
        modulesToSync.push({
          moduleId: 'review_short',
          ranges: buildRanges(nearPages),
        });
      if (farPages.length > 0)
        modulesToSync.push({
          moduleId: 'review_long',
          ranges: buildRanges(farPages),
        });

      modulesToSync.forEach((m) => {
        const existing = selectionStore
          .getModuleSelections(m.moduleId as any)
          .find(
            (s) =>
              s.ranges.length === m.ranges.length &&
              s.ranges.every(
                (r, i) =>
                  r.start === m.ranges[i].start && r.end === m.ranges[i].end,
              ),
          );
        if (existing) {
          if (!existing.isCompleted)
            selectionStore.completeTaskSelection(existing.id);
        } else {
          selectionStore.addTaskSelection(
            m.moduleId as any,
            m.ranges.map((r) => selectionStore.createPageRange(r.start, r.end)),
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
