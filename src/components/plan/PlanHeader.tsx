import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getMushafEdition } from "../../data/mushafEditions";
import { Spacing, Typography, useTheme } from "../../theme";
import { toArabicNumerals } from "../../utils/helpers";
import type { DayItem } from "./types";

type PlanHeaderProps = {
  roadmap: DayItem[];
  plan: any;
};

export const PlanHeader = React.memo(function PlanHeader({
  roadmap,
  plan,
}: PlanHeaderProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const completedCount = roadmap.filter((d) => d.isCompleted).length;
  const totalCount = roadmap.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const currentDay = roadmap.find((d) => d.isCurrent);
  const currentDayIndex = currentDay
    ? currentDay.dayIndex
    : completedCount < totalCount
      ? completedCount + 1
      : totalCount;

  const totalYears = Math.floor(totalCount / 355);
  const remaining = totalCount % 355;
  const totalMonths = Math.floor(remaining / 30);
  const totalDays = remaining % 30;

  const direction =
    plan?.direction === "backward" ? "من الناس للفاتحة" : "من الفاتحة للناس";
  const editionName = plan?.mushafEditionId
    ? getMushafEdition(plan.mushafEditionId as any)?.nameAr
    : "المصحف المدني";

  const planMode = plan?.planMode ?? "daily";
  const activeDaysOfWeek: number[] = plan?.activeDaysOfWeek ?? [];

  // For weekly plan: compute week stats
  const activeDaysCount = activeDaysOfWeek.length || 5;
  const weeklyPagesVal = (plan?.pagesPerDay ?? 1) * activeDaysCount;

  const DOW_NAMES = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  return (
    <View style={styles.header}>
      {/* Title Section */}
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>خارطة الرحلة</Text>
        <View style={styles.headerBadgeRow}>
          <View
            style={[
              styles.headerChip,
              { backgroundColor: `${Colors.primary}15` },
            ]}
          >
            <Ionicons
              name={
                plan?.direction === "backward" ? "arrow-back" : "arrow-forward"
              }
              size={10}
              color={Colors.primary}
            />
            <Text style={[styles.headerChipText, { color: Colors.primary }]}>
              {direction}
            </Text>
          </View>
          {/* Plan Mode Badge */}
          <View
            style={[
              styles.headerChip,
              {
                backgroundColor:
                  planMode === "weekly"
                    ? `${Colors.purple}15`
                    : `${Colors.success}12`,
              },
            ]}
          >
            <Ionicons
              name={
                planMode === "weekly" ? "calendar-outline" : "sunny-outline"
              }
              size={10}
              color={planMode === "weekly" ? Colors.purple : Colors.success}
            />
            <Text
              style={[
                styles.headerChipText,
                {
                  color: planMode === "weekly" ? Colors.purple : Colors.success,
                },
              ]}
            >
              {planMode === "weekly" ? "أسبوعية" : "يومية"}
            </Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>{editionName}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: `${Colors.primary}10`,
              borderColor: `${Colors.primary}20`,
            },
          ]}
        >
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {toArabicNumerals(currentDayIndex)}
          </Text>
          <Text style={styles.statLabel}>اليوم الحالي</Text>
        </View>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: `${Colors.success}10`,
              borderColor: `${Colors.success}20`,
            },
          ]}
        >
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {toArabicNumerals(completedCount)}
          </Text>
          <Text style={styles.statLabel}>أيام منجزة</Text>
        </View>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: `${Colors.warning}10`,
              borderColor: `${Colors.warning}20`,
            },
          ]}
        >
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {toArabicNumerals(totalCount - completedCount)}
          </Text>
          <Text style={styles.statLabel}>متبقية</Text>
        </View>
      </View>

      {/* Progress section */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>الإنجاز الكلي</Text>
          <Text style={[styles.progressPercent, { color: Colors.primary }]}>
            {toArabicNumerals(Math.round(progressPct))}٪
          </Text>
        </View>
        <View
          style={[
            styles.progressBarBg,
            { height: 8, borderRadius: 4, marginTop: 8 },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                height: "100%",
                borderRadius: 4,
                width: `${progressPct}%`,
                backgroundColor: Colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Weekly plan active days summary */}
      {planMode === "weekly" && activeDaysOfWeek.length > 0 && (
        <View
          style={[
            styles.weekSummary,
            {
              borderColor: `${Colors.purple}20`,
              backgroundColor: `${Colors.purple}08`,
            },
          ]}
        >
          <View style={styles.weekSummaryRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.purple} />
            <Text style={[styles.weekSummaryText, { color: Colors.purple }]}>
              {activeDaysOfWeek.map((d) => DOW_NAMES[d]).join(" · ")}
            </Text>
          </View>
          <Text style={styles.weekSummaryMeta}>
            {activeDaysCount} أيام حفظ • {weeklyPagesVal} ص/أسبوع
          </Text>
        </View>
      )}

      {/* Duration */}
      <View style={styles.durationRow}>
        <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
        <Text style={styles.durationText}>
          مدة الرحلة:{" "}
          {totalYears > 0 ? `${toArabicNumerals(totalYears)} سنة ` : ""}
          {totalMonths > 0 ? `${toArabicNumerals(totalMonths)} شهر ` : ""}
          {toArabicNumerals(totalDays)} يوم
        </Text>
      </View>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (Colors: any) =>
  StyleSheet.create({
    header: {
      paddingTop: 80,
      paddingBottom: Spacing.xl,
      paddingHorizontal: Spacing.xs,
    },
    headerTop: { marginBottom: Spacing.xl },
    headerTitle: {
      fontFamily: Typography.heading,
      fontSize: 28,
      color: Colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    headerSubtitle: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textTertiary,
      marginTop: 4,
    },
    headerBadgeRow: { flexDirection: "row", gap: Spacing.sm, marginTop: 6 },
    headerChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    headerChipText: {
      fontFamily: Typography.heading,
      fontSize: 11,
    },
    statsGrid: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      paddingVertical: Spacing.md,
      alignItems: "center",
    },
    statValue: {
      fontFamily: Typography.heading,
      fontSize: 22,
    },
    statLabel: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    progressSection: { marginBottom: Spacing.md },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLabel: {
      fontFamily: Typography.body,
      fontSize: 13,
      color: Colors.textSecondary,
    },
    progressPercent: {
      fontFamily: Typography.heading,
      fontSize: 14,
    },
    progressBarBg: {
      height: 4,
      backgroundColor: Colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBarFill: { height: "100%" },
    weekSummary: {
      borderRadius: 12,
      borderWidth: 1,
      padding: Spacing.md,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
      gap: 4,
    },
    weekSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    weekSummaryText: {
      fontFamily: Typography.heading,
      fontSize: 12,
    },
    weekSummaryMeta: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    durationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: Spacing.md,
    },
    durationText: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textTertiary,
    },
  });
