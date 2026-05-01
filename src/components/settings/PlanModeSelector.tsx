import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";

// ─── Arabic Day Names ─────────────────────────────────────────────────────────
const DAYS_OF_WEEK = [
  { id: 0, short: "أحد", full: "الأحد" },
  { id: 1, short: "اثن", full: "الاثنين" },
  { id: 2, short: "ثلا", full: "الثلاثاء" },
  { id: 3, short: "أرب", full: "الأربعاء" },
  { id: 4, short: "خمس", full: "الخميس" },
  { id: 5, short: "جمع", full: "الجمعة" },
  { id: 6, short: "سبت", full: "السبت" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  planMode: "daily" | "weekly";
  onModeChange: (mode: "daily" | "weekly") => void;
  dailyPages: number;
  onDailyPagesChange: (pages: number) => void;
  activeDaysOfWeek: number[];
  onActiveDaysChange: (days: number[]) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────
export function PlanModeSelector({
  planMode,
  onModeChange,
  dailyPages,
  onDailyPagesChange,
  activeDaysOfWeek,
  onActiveDaysChange,
}: Props) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const toggleDay = (dow: number) => {
    if (activeDaysOfWeek.includes(dow)) {
      if (activeDaysOfWeek.length <= 1) return; // يجب أن يكون هناك يوم واحد على الأقل
      onActiveDaysChange(
        activeDaysOfWeek.filter((d) => d !== dow).sort((a, b) => a - b),
      );
    } else {
      onActiveDaysChange([...activeDaysOfWeek, dow].sort((a, b) => a - b));
    }
  };

  const pagesPerActiveDay = dailyPages || 1;
  const totalWeeklyPages = pagesPerActiveDay * activeDaysOfWeek.length;

  return (
    <View>
      {/* ─── Mode Toggle Buttons ─── */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeBtn,
            planMode === "daily" && {
              backgroundColor: Colors.primary,
              borderColor: Colors.primary,
            },
          ]}
          onPress={() => onModeChange("daily")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="sunny-outline"
            size={16}
            color={planMode === "daily" ? "#FFF" : Colors.textSecondary}
          />
          <Text
            style={[
              styles.modeBtnText,
              planMode === "daily" && { color: "#FFF"},
            ]}
          >
            خطة يومية
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeBtn,
            planMode === "weekly" && {
              backgroundColor: Colors.primary,
              borderColor: Colors.primary,
            },
          ]}
          onPress={() => onModeChange("weekly")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={planMode === "weekly" ? "#FFF" : Colors.textSecondary}
          />
          <Text
            style={[
              styles.modeBtnText,
              planMode === "weekly" && { color: "#FFF"},
            ]}
          >
            خطة أسبوعية
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Mode Description ─── */}
      <Text style={styles.modeDesc}>
        {planMode === "daily"
          ? "تحفظ عدداً ثابتاً من الصفحات كل يوم بدون أيام راحة."
          : "تحدد عدد الصفحات أسبوعياً وتختار أيام الحفظ وأيام الراحة."}
      </Text>

      {/* ─── Pages Per Day (Always Visible) ─── */}
      <View style={styles.pagesSection}>
        <Text style={styles.sectionLabel}>
          {planMode === "daily" ? "عدد الصفحات اليومية" : "عدد الصفحات في أيام الحفظ"}
        </Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => onDailyPagesChange(Math.max(1, dailyPages - 1))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.stepperValue}>
            <Text style={[styles.stepperNum, { color: Colors.primary }]}>
              {dailyPages}
            </Text>
            <Text style={styles.stepperUnit}>صفحة/يوم</Text>
          </View>

          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => onDailyPagesChange(Math.min(20, dailyPages + 1))}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Weekly Settings (Days of Week) ─── */}
      {planMode === "weekly" && (
        <View style={styles.weeklySection}>
          {/* Days of Week Selector */}
          <Text style={[styles.sectionLabel, { marginTop: Spacing.sm }]}>
            أيام الحفظ الأسبوعية
          </Text>
          <Text style={styles.daysSub}>
            اضغط على اليوم لتشغيله أو إيقافه. الأيام الرمادية أيام راحة.
          </Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => {
              const isActive = activeDaysOfWeek.includes(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayBtn,
                    isActive && {
                      backgroundColor: Colors.primary,
                      borderColor: Colors.primary,
                    },
                  ]}
                  onPress={() => toggleDay(day.id)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.dayBtnText, isActive && { color: "#FFF" }]}
                  >
                    {day.full}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Summary */}
          <View
            style={[
              styles.summaryBox,
              {
                borderColor: `${Colors.primary}25`,
                backgroundColor: `${Colors.primary}08`,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Ionicons
                name="calendar-number-outline"
                size={14}
                color={Colors.primary}
              />
              <Text style={[styles.summaryText, { color: Colors.primary }]}>
                {activeDaysOfWeek.length} أيام حفظ في الأسبوع
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="book-outline" size={14} color={Colors.primary} />
              <Text style={[styles.summaryText, { color: Colors.primary }]}>
                {totalWeeklyPages} صفحة في الأسبوع
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons
                name="bed-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text
                style={[styles.summaryText, { color: Colors.textSecondary }]}
              >
                {7 - activeDaysOfWeek.length} أيام راحة في الأسبوع
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (Colors: any) =>
  StyleSheet.create({
    modeRow: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    modeBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
    },
    modeBtnText: {
      fontFamily: Typography.body,
      fontSize: 13,
      color: Colors.textSecondary,
    },
    modeDesc: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textTertiary,
      lineHeight: 17,
      marginBottom: Spacing.md,
    },
    pagesSection: {
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
    },
    weeklySection: {
      marginTop: Spacing.sm,
    },
    sectionLabel: {
      fontFamily: Typography.heading,
      fontSize: 13,
      color: Colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    stepperRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      marginBottom: Spacing.sm,
    },
    stepperBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: `${Colors.primary}12`,
      borderWidth: 1,
      borderColor: `${Colors.primary}25`,
      alignItems: "center",
      justifyContent: "center",
    },
    stepperValue: {
      flex: 1,
      alignItems: "center",
    },
    stepperNum: {
      fontFamily: Typography.heading,
      fontSize: 28,
    },
    stepperUnit: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    daysSub: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textTertiary,
      marginBottom: Spacing.sm,
      lineHeight: 16,
    },
    daysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    dayBtn: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.glass,
      alignItems: "center",
    },
    dayBtnText: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textSecondary,
    },
    summaryBox: {
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      padding: Spacing.md,
      gap: 6,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    summaryText: {
      fontFamily: Typography.body,
      fontSize: 12,
    },
  });
