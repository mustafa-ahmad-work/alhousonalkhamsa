import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";
import { toArabicNumerals } from "../../utils/helpers";
import { PlanDayCard } from "./PlanDayCard";
import type { DayItem, WeekGroup } from "./types";

// ─── Arabic Day Names ─────────────────────────────────────────────────────────
const DOW_NAMES_SHORT = ["أحد", "اثن", "ثلا", "أرب", "خمس", "جمع", "سبت"];
const DOW_NAMES_FULL = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

// ─── Rest Day Card ────────────────────────────────────────────────────────────
const RestDayCard = ({
  dow,
  isToday,
  Colors,
}: {
  dow: number;
  isToday?: boolean;
  Colors: any;
}) => (
  <View
    style={[
      restStyles.card,
      {
        backgroundColor: Colors.glass,
        borderColor: isToday ? Colors.primary : Colors.glassBorder,
        borderWidth: isToday ? 2 : 1,
      },
    ]}
  >
    <View style={restStyles.inner}>
      <Ionicons
        name={isToday ? "time-outline" : "bed-outline"}
        size={16}
        color={isToday ? Colors.primary : Colors.textTertiary}
      />
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={[
              restStyles.dayName,
              {
                color: isToday ? Colors.primary : Colors.textTertiary,
              },
            ]}
          >
            {DOW_NAMES_FULL[dow]}
          </Text>
          {isToday && (
            <View
              style={{
                // backgroundColor: Colors.primary,
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 9}}>
                اليوم
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            restStyles.restLabel,
            {
              color: isToday ? Colors.primary : Colors.textMuted,
              opacity: isToday ? 0.8 : 1,
            },
          ]}
        >
          يوم راحة
        </Text>
      </View>
    </View>
  </View>
);

const restStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: Spacing.md,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    opacity: 0.6,
  },
  dayName: {
    fontFamily: Typography.body,
    fontSize: 13,
  },
  restLabel: {
    fontFamily: Typography.body,
    fontSize: 11,
    marginTop: 1,
  },
});

// ─── Week Group Card ──────────────────────────────────────────────────────────
type WeekGroupCardProps = {
  group: WeekGroup;
  expandedDay: number | null;
  onToggle: (day: number) => void;
  onComplete: (item: DayItem) => void;
  index: number;
};

export const WeekGroupCard = React.memo(function WeekGroupCard({
  group,
  expandedDay,
  onToggle,
  onComplete,
  index,
}: WeekGroupCardProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const progressPct =
    group.totalActiveCount > 0
      ? (group.completedCount / group.totalActiveCount) * 100
      : 0;

  const isAllDone =
    group.completedCount === group.totalActiveCount &&
    group.totalActiveCount > 0;

  const weekBorderColor = isAllDone
    ? Colors.success
    : group.isCurrentWeek
      ? Colors.primary
      : Colors.border;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60)
        .duration(300)
        .springify()}
      style={[
        styles.weekContainer,
        {
          borderColor: weekBorderColor,
          borderLeftWidth: group.isCurrentWeek ? 3 : 1.5,
        },
      ]}
    >
      {/* ─── Week Header ─── */}
      <View style={styles.weekHeader}>
        <View style={styles.weekTitleRow}>
          <View
            style={[
              styles.weekBadge,
              {
                backgroundColor: isAllDone
                  ? `${Colors.success}15`
                  : group.isCurrentWeek
                    ? `${Colors.primary}15`
                    : Colors.glass,
                borderColor: isAllDone
                  ? `${Colors.success}30`
                  : group.isCurrentWeek
                    ? `${Colors.primary}30`
                    : Colors.glassBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.weekBadgeText,
                {
                  color: isAllDone
                    ? Colors.success
                    : group.isCurrentWeek
                      ? Colors.primary
                      : Colors.textSecondary,
                },
              ]}
            >
              أسبوع {toArabicNumerals(group.weekNumber)}
            </Text>
          </View>

          {group.isCurrentWeek && (
            <View
              style={[styles.currentBadge, { backgroundColor: Colors.primary }]}
            >
              <Text style={styles.currentBadgeText}>الأسبوع الحالي</Text>
            </View>
          )}
          {isAllDone && (
            <View
              style={[styles.currentBadge, { backgroundColor: Colors.success }]}
            >
              <Ionicons name="checkmark" size={10} color="#FFF" />
              <Text style={styles.currentBadgeText}>مكتمل</Text>
            </View>
          )}
        </View>

        {/* Progress mini bar */}
        <View style={styles.weekProgressRow}>
          <View style={styles.weekProgressBg}>
            <View
              style={[
                styles.weekProgressFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: isAllDone ? Colors.success : Colors.primary,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.weekProgressText,
              {
                color: isAllDone
                  ? Colors.success
                  : group.isCurrentWeek
                    ? Colors.primary
                    : Colors.textTertiary,
              },
            ]}
          >
            {toArabicNumerals(group.completedCount)}/
            {toArabicNumerals(group.totalActiveCount)}
          </Text>
        </View>

        {/* Days of week mini legend */}
        <View style={styles.dowRow}>
          {group.days.map((day, i) => {
            const isActive = day.type === "active";
            const isCurrentDay = isActive && day.item.isCurrent;
            const isDone = isActive && day.item.isCompleted;
            const isToday = day.isToday;

            return (
              <View
                key={i}
                style={[
                  styles.dowDot,
                  {
                    backgroundColor: isDone
                      ? Colors.success
                      : isCurrentDay
                        ? Colors.primary
                        : isActive
                          ? `${Colors.primary}25`
                          : Colors.glass,
                    borderColor: isToday
                      ? Colors.primary
                      : isDone
                        ? Colors.success
                        : isCurrentDay
                          ? Colors.primary
                          : isActive
                            ? `${Colors.primary}30`
                            : Colors.glassBorder,
                    borderWidth: isToday ? 2 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dowDotText,
                    {
                      color:
                        isDone || isCurrentDay
                          ? "#FFF"
                          : isToday
                            ? Colors.primary
                            : isActive
                              ? Colors.primary
                              : Colors.textMuted,
                    },
                  ]}
                >
                  {DOW_NAMES_FULL[day.dow]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ─── Day Cards / Rest Cards ─── */}
      <View style={styles.daysContainer}>
        {group.days.map((day, i) => {
          if (day.type === "rest") {
            return (
              <RestDayCard
                key={`rest-${i}`}
                dow={day.dow}
                isToday={day.isToday}
                Colors={Colors}
              />
            );
          }
          return (
            <PlanDayCard
              key={day.item.dayIndex}
              item={day.item}
              expanded={expandedDay === day.item.dayIndex}
              onToggle={onToggle}
              onComplete={onComplete}
              isLast={i === group.days.length - 1}
              showTimeline={false}
              dowLabel={DOW_NAMES_FULL[day.dow]}
              isToday={day.isToday}
            />
          );
        })}
      </View>
    </Animated.View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (Colors: any) =>
  StyleSheet.create({
    weekContainer: {
      borderRadius: BorderRadius.lg,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      marginBottom: Spacing.lg,
      overflow: "hidden",
      // ...Shadow.sm,
    },
    weekHeader: {
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderLight,
      gap: Spacing.sm,
    },
    weekTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    weekBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    weekBadgeText: {
      fontFamily: Typography.heading,
      fontSize: 13,
    },
    currentBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    currentBadgeText: {
      fontFamily: Typography.heading,
      fontSize: 10,
      color: "#FFF",
    },
    weekProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    weekProgressBg: {
      flex: 1,
      height: 4,
      backgroundColor: Colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    weekProgressFill: {
      height: "100%",
      borderRadius: 2,
    },
    weekProgressText: {
      fontFamily: Typography.heading,
      fontSize: 11,
      minWidth: 28,
      textAlign: "right",
    },
    dowRow: {
      flexDirection: "row",
      gap: 4,
      flexWrap: "wrap",
    },
    dowDot: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 44,
    },
    dowDotText: {
      fontFamily: Typography.heading,
      fontSize: 10,
    },
    daysContainer: {
      padding: Spacing.md,
      paddingBottom: Spacing.xs,
    },
  });
