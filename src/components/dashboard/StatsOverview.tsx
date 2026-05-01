import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Spacing } from "../../theme";

interface StatsOverviewProps {
  memorizedCount: number;
  targetPagesCount: number;
  streak: number;
  finishDate: Date;
  Colors: any;
}

export function StatsOverview({
  memorizedCount,
  targetPagesCount,
  streak,
  finishDate,
  Colors,
}: StatsOverviewProps) {
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const progressPercent = Math.round((memorizedCount / targetPagesCount) * 100);

  return (
    <View style={styles.statsOverview}>
      <View style={styles.mainStatCard}>
        <Text style={styles.mainStatLabel}>تقدمك الكلي</Text>
        <Text style={styles.mainStatValue}>{progressPercent}%</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.mainStatSub}>{memorizedCount} صفحة متممة</Text>
      </View>

      <View style={styles.sideStatsCol}>
        <View style={styles.sideStatCard}>
          <View
            style={[
              styles.sideStatIcon,
              { backgroundColor: `${Colors.gold}15` },
            ]}
          >
            <Ionicons name="flame" size={16} color={Colors.gold} />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.sideStatValue}>{streak}</Text>
            <Text style={styles.sideStatLabel}>يوم متواصل</Text>
          </View>
        </View>
        <View style={styles.sideStatCard}>
          <View
            style={[
              styles.sideStatIcon,
              { backgroundColor: `${Colors.primary}15` },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.primary}
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={styles.sideStatValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {finishDate.toLocaleDateString("ar-EG", {
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.sideStatLabel}>الختم المتوقع</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    statsOverview: {
      flexDirection: "row",
      gap: Spacing.md,
      marginBottom: Spacing.sm,
    },
    mainStatCard: {
      flex: 1.2,
      backgroundColor: Colors.primaryMuted,
      borderRadius: 24,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    },
    mainStatLabel: {
      color: Colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
    },
    mainStatValue: { color: Colors.primary, fontSize: 32, marginBottom: 12 },
    progressBarBg: {
      height: 8,
      backgroundColor: Colors.border,
      borderRadius: 4,
      marginBottom: 8,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: Colors.primary,
      borderRadius: 4,
    },
    mainStatSub: { color: Colors.textTertiary, fontSize: 11 },
    sideStatsCol: { flex: 1, gap: Spacing.md },
    sideStatCard: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 20,
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    sideStatIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    sideStatValue: {
      fontSize: 14,
      color: Colors.textPrimary,
      textAlign: "center",
    },
    sideStatLabel: {
      fontSize: 8,
      color: Colors.textSecondary,
      textAlign: "center",
    },
  });
