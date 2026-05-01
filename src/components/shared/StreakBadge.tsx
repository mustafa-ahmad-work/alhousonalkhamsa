import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({
  currentStreak,
  longestStreak,
}: StreakBadgeProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      {/* Flame + Current */}
      <View style={styles.streakMain}>
        <View style={styles.flameContainer}>
          <Ionicons name="flame" size={20} color={Colors.gold} />
        </View>
        <View>
          <Text style={styles.count}>{currentStreak} يوم</Text>
          <Text style={styles.label}>سلسلة الحفظ</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Best */}
      <View style={styles.streakBest}>
        <Ionicons name="trophy" size={16} color={Colors.gold} />
        <View>
          <Text style={styles.bestCount}>{longestStreak}</Text>
          <Text style={styles.label}>الأفضل</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.goldMuted,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: `${Colors.gold}15`,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
    },
    streakMain: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      flex: 1,
    },
    flameContainer: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: `${Colors.gold}10`,
      alignItems: "center",
      justifyContent: "center",
    },
    count: {
      fontFamily: Typography.heading, fontSize: Typography.base,
      color: Colors.gold,
      textAlign: "left",
    },
    label: {
      fontFamily: Typography.body, fontSize: 10,
      color: Colors.textTertiary,
      textAlign: "left",
      marginTop: 1,
    },
    divider: {
      width: 1,
      height: 30,
      backgroundColor: `${Colors.gold}15`,
      marginHorizontal: Spacing.base,
    },
    streakBest: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    bestCount: {
      fontFamily: Typography.heading, fontSize: Typography.base,
      color: Colors.goldLight,
      textAlign: "center",
    },
  });
