import { useMemo } from 'react';
import { getMushafEdition } from '../data/mushafEditions';
import { useAppStore } from '../store/AppStore';
import { ModuleId, TaskSelection } from '../types';
import { ReviewStrategy } from '../utils/fiveKeysAlgorithms';
import {
  getActiveDayIndex,
  getModulePages,
  getModuleRecommendedSeconds,
} from '../utils/fiveKeysAlgorithms';
import { buildRanges } from '../utils/planLogic';

export function useModuleLogic(moduleId: string | string[] | undefined) {
  const { state } = useAppStore();
  const { plan, settings } = state;
  const id = (Array.isArray(moduleId) ? moduleId[0] : moduleId) as ModuleId | undefined;

  const todayPlanItem = useMemo(() => {
    if (!plan || !plan.targetPages || !id) return null;

    const editionId =
      (plan as any).mushafEditionId ?? settings.mushafEdition ?? 'madani_604';
    const edition = getMushafEdition(editionId as any);

    const isDaily = plan.planMode === 'daily';
    const settingsActiveDays = (settings as any).activeDaysOfWeek ?? [0, 1, 2, 3, 4];
    const activeDows = new Set<number>(
      isDaily ? [0, 1, 2, 3, 4, 5, 6] : (plan.activeDaysOfWeek ?? settingsActiveDays),
    );

    const activeDayIndex = getActiveDayIndex(
      plan.startDate ?? new Date().toISOString().split('T')[0],
      activeDows,
      plan.totalDays,
    );
    if (activeDayIndex < 0) return null;

    const reviewStrategy = (settings.reviewStrategy ?? 'spaced') as ReviewStrategy;
    const pages = getModulePages(id, plan, activeDayIndex, edition, reviewStrategy);

    if (pages.length === 0) return null;

    const moduleTitle: string =
      id === 'memorization'       ? 'حفظ اليوم'
      : id === 'listening'        ? 'استماع اليوم'
      : id === 'recitation'       ? 'تلاوة اليوم'
      : id.includes('preparation') ? 'تحضير اليوم'
      : 'مراجعة اليوم';

    return { ranges: buildRanges(pages), moduleTitle };
  }, [plan, settings, id]);

  const getPagesFromTask = (task: TaskSelection | null): number[] => {
    if (!task) return [];
    const pages: number[] = [];
    task.ranges.forEach(r => {
      for (let p = r.start; p <= r.end; p++) pages.push(p);
    });
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  const getRecommendedTime = (mId: string): number =>
    getModuleRecommendedSeconds(mId as ModuleId);

  return { todayPlanItem, getPagesFromTask, getRecommendedTime };
}
