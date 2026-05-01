import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Spacing, Typography, useTheme } from "../../theme";
import { toArabicNumerals } from "../../utils/helpers";
import type { DayItem, DayTask } from "./types";

// ─── Helpers re-exported for use by parent ────────────────────────────────────
export function formatRanges(ranges: { start: number; end: number }[]): string {
  return ranges
    .map((r) =>
      r.start === r.end
        ? toArabicNumerals(r.start)
        : `${toArabicNumerals(r.start)}-${toArabicNumerals(r.end)}`,
    )
    .join(" و ");
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
const MODULE_MAP: Record<string, string> = {
  mem: "memorization",
  prep_p: "preparation_before",
  prep_n: "preparation_night",
  prep_w: "preparation_weekly",
  listen: "listening",
  rev_s: "review_short",
  rev_l: "review_long",
  recit: "recitation",
};

const TaskRow = ({
  task,
  styles,
  isLocked,
}: {
  task: DayTask;
  styles: ReturnType<typeof getStyles>;
  isLocked?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.taskRow, isLocked && { opacity: 0.6 }]}
    onPress={() => {
      if (isLocked) return;
      const dest = MODULE_MAP[task.id];
      if (dest)
        router.push({ pathname: "/module", params: { id: dest } } as any);
    }}
    activeOpacity={isLocked ? 1 : 0.7}
  >
    <View style={[styles.taskIconBox, { backgroundColor: `${task.color}12` }]}>
      <Ionicons name={task.icon} size={14} color={task.color} />
    </View>
    <Text style={styles.taskText}>{task.label}</Text>
    <Ionicons
      name="chevron-back"
      size={12}
      color={task.color}
      style={{ opacity: 0.5 }}
    />
  </TouchableOpacity>
);

// ─── Plan Day Card ────────────────────────────────────────────────────────────
type PlanDayCardProps = {
  item: DayItem;
  expanded: boolean;
  onToggle: (day: number) => void;
  onComplete: (item: DayItem) => void;
  isLast: boolean;
  showTimeline?: boolean;
  /** Optional day-of-week name to show (for weekly view) */
  dowLabel?: string;
  isToday?: boolean;
};

export const PlanDayCard = React.memo(function PlanDayCard({
  item,
  expanded,
  onToggle,
  onComplete,
  isLast,
  showTimeline = true,
  dowLabel,
  isToday,
}: PlanDayCardProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const primarySurah = item.surahSegments[0];
  const extraSurahCount = item.surahSegments.length - 1;

  const cardBorderColor = item.isCompleted
    ? Colors.success
    : item.isCurrent
      ? Colors.primary
      : Colors.border;

  const progressFill = item.isCompleted ? 100 : item.completionPct;

  return (
    <View style={styles.rowWrap}>
      {/* Timeline column */}
      {showTimeline && (
        <View style={styles.timelineCol}>
          <View
            style={[
              styles.timelineNode,
              item.isCompleted && {
                backgroundColor: Colors.success,
                borderColor: Colors.success,
              },
              item.isCurrent && {
                borderColor: Colors.primary,
                borderWidth: 2.5,
              },
              isToday && {
                // shadowColor: Colors.primary,
                // shadowOpacity: 0.5,
                // shadowRadius: 5,
                elevation: 5,
              },
            ]}
          >
            {item.isCompleted ? (
              <Ionicons name="checkmark" size={13} color="#FFF" />
            ) : (
              <View
                style={[
                  styles.timelineDot,
                  item.isCurrent && { backgroundColor: Colors.primary },
                ]}
              />
            )}
          </View>
          {!isLast && (
            <View
              style={[
                styles.timelineLine,
                item.isCompleted && { backgroundColor: Colors.success },
              ]}
            />
          )}
        </View>
      )}

      {/* Card */}
      <Animated.View
        entering={FadeIn.duration(250)}
        style={[
          styles.dayCard,
          { borderColor: cardBorderColor },
          !showTimeline && { marginRight: 0 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onToggle(item.dayIndex)}
          style={styles.cardTouchable}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            {/* Day number badge */}
            <View style={styles.dayNumBadge}>
              {dowLabel ? (
                <Text
                  style={[
                    styles.dowLabel,
                    isToday && { color: Colors.primary },
                  ]}
                >
                  {dowLabel}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.dayNumText,
                    item.isCurrent && { color: Colors.primary },
                    isToday && {},
                  ]}
                >
                  {toArabicNumerals(item.dayIndex)}
                </Text>
              )}
            </View>

            <View style={styles.cardMeta}>
              {/* Surah name(s) */}
              <View style={styles.surahRow}>
                <Text style={styles.surahName} numberOfLines={1}>
                  {primarySurah?.nameAr ?? item.surahLabel}
                  {extraSurahCount > 0
                    ? ` + ${toArabicNumerals(extraSurahCount)}`
                    : ""}
                </Text>
                {isToday && (
                  <View
                    style={[styles.badge, { backgroundColor: Colors.primary }]}
                  >
                    <Text style={styles.badgeText}>اليوم</Text>
                  </View>
                )}
                {item.isCurrent && !isToday && (
                  <View
                    style={[styles.badge, { backgroundColor: Colors.gold }]}
                  >
                    <Text style={styles.badgeText}>المطلوب</Text>
                  </View>
                )}
                {item.isCompleted && (
                  <View
                    style={[styles.badge, { backgroundColor: Colors.success }]}
                  >
                    <Text style={styles.badgeText}>✓</Text>
                  </View>
                )}
              </View>

              {/* Page range */}
              <View style={styles.pageRangeRow}>
                <Ionicons
                  name="book-outline"
                  size={11}
                  color={Colors.textTertiary}
                />
                <Text style={styles.pageRangeText}>
                  صفحات {formatRanges(item.ranges)}
                </Text>
                <Text style={styles.pageCountDot}>•</Text>
                <Text style={styles.pageRangeText}>
                  {toArabicNumerals(item.pageNumbers.length)} ص
                </Text>
              </View>
            </View>

            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={expanded ? Colors.primary : Colors.textTertiary}
            />
          </View>

          {/* Surah breakdown chips */}
          {item.surahSegments.length > 1 && (
            <View style={styles.surahChips}>
              {item.surahSegments.map((seg) => (
                <View
                  key={seg.surahId}
                  style={[
                    styles.surahChip,
                    { borderColor: `${Colors.primary}30` },
                  ]}
                >
                  <Text
                    style={[styles.surahChipText, { color: Colors.primary }]}
                  >
                    {seg.nameAr}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Expanded tasks */}
          {expanded && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.tasksSection}
            >
              <View style={styles.tasksDivider} />
              <Text style={styles.tasksTitle}>مهام هذا اليوم</Text>
              <View style={styles.tasksList}>
                {item.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    styles={styles}
                    isLocked={item.isLocked}
                  />
                ))}
              </View>

              {item.isCurrent && !item.isCompleted && (
                <TouchableOpacity
                  style={[
                    styles.completeBtn,
                    {
                      backgroundColor: item.isLocked
                        ? Colors.textTertiary
                        : Colors.primary,
                    },
                  ]}
                  onPress={() => (item.isLocked ? null : onComplete(item))}
                  activeOpacity={item.isLocked ? 1 : 0.7}
                >
                  <Ionicons
                    name={item.isLocked ? "lock-closed" : "checkmark-circle"}
                    size={22}
                    color="#FFF"
                  />
                  <Text style={styles.completeBtnText}>
                    {item.isLocked
                      ? "شريط المهام مغلق (يفتح غداً)"
                      : "إتمام كافة مهام اليوم"}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Progress bar */}
        {progressFill > 0 && (
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressFill}%`,
                  backgroundColor: item.isCompleted
                    ? Colors.success
                    : Colors.primary,
                },
              ]}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (Colors: any) =>
  StyleSheet.create({
    rowWrap: { flexDirection: "row", alignItems: "stretch", marginBottom: 0 },
    timelineCol: { width: 40, alignItems: "center" },
    timelineNode: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.surface,
      borderWidth: 2,
      borderColor: Colors.borderLight,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      marginTop: 20,
    },
    timelineDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: Colors.borderLight,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: Colors.borderLight,
    },
    dayCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      marginBottom: 18,
      marginRight: Spacing.sm,
      // ...Shadow.sm,
      overflow: "hidden",
    },
    cardTouchable: { padding: Spacing.md },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.sm,
    },
    dayNumBadge: {
      minWidth: 44,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    dayNumText: {
      fontFamily: Typography.heading,
      fontSize: 13,
      color: Colors.textSecondary,
    },
    dowLabel: {
      fontFamily: Typography.heading,
      fontSize: 10,
      color: Colors.textSecondary,
      textAlign: "center",
    },
    cardMeta: { flex: 1 },
    surahRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      flexWrap: "wrap",
      marginBottom: 4,
    },
    surahName: {
      fontFamily: Typography.heading,
      fontSize: 15,
      color: Colors.textPrimary,
      flexShrink: 1,
    },
    badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
    badgeText: {
      fontFamily: Typography.heading,
      fontSize: 9,
      color: "#FFF",
    },
    pageRangeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      flexWrap: "wrap",
    },
    pageRangeText: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textTertiary,
    },
    pageCountDot: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textTertiary,
    },
    surahChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 10,
    },
    surahChip: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 14,
      borderWidth: 1,
      backgroundColor: Colors.glass,
    },
    surahChipText: {
      fontFamily: Typography.heading,
      fontSize: 11,
    },
    tasksSection: { marginTop: Spacing.sm },
    tasksDivider: {
      height: 1,
      backgroundColor: Colors.borderLight,
      marginBottom: Spacing.md,
    },
    tasksTitle: {
      fontFamily: Typography.heading,
      fontSize: 11,
      color: Colors.textTertiary,
      marginBottom: Spacing.md,
      textAlign: "left",
      opacity: 0.8,
    },
    tasksList: { gap: 8 },
    taskRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: Colors.glass,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    taskIconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    taskText: {
      flex: 1,
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textPrimary,
      textAlign: "left",
      lineHeight: 18,
    },
    completeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 16,
      marginTop: Spacing.lg,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: `rgba(255,255,255,0.15)`,
    },
    completeBtnText: {
      color: "#FFF",
      fontFamily: Typography.heading,
      fontSize: 15,
    },
    progressBarBg: {
      height: 4,
      backgroundColor: Colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBarFill: { height: "100%" },
  });
