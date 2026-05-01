import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelectionStore } from "../../store/selectionStore";
import { Shadow, Spacing, Typography, useTheme } from "../../theme";
import { ModuleInfo } from "../../types";

const { width } = Dimensions.get("window");

type ModuleCardProps = {
  moduleInfo: ModuleInfo;
  onPress: (id: string) => void;
};

export function ModuleCard({ moduleInfo, onPress }: ModuleCardProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const taskSelections = useSelectionStore((state) => state.taskSelections);
  const todayStr = new Date().toDateString();

  const dailyModuleSelections = taskSelections.filter(
    (s) =>
      s.module === moduleInfo.id &&
      new Date(s.createdAt).toDateString() === todayStr,
  );

  const completedCount = dailyModuleSelections.filter(
    (s) => s.isCompleted,
  ).length;
  const totalSelections = dailyModuleSelections.length;
  const hasSelections = totalSelections > 0;
  const completionPct = hasSelections ? completedCount / totalSelections : 0;

  const stats = {
    totalSelections,
    completedCount,
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(moduleInfo.id)}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${moduleInfo.color}12` },
          ]}
        >
          <Ionicons
            name={moduleInfo.icon as any}
            size={22}
            color={moduleInfo.color}
          />
        </View>

        {/* Progress Indicator Badge */}
        <View style={styles.progressBadge}>
          {completionPct === 1 ? (
            <View style={styles.doneBadge}>
              <Ionicons name="checkmark-done" size={14} color="#FFF" />
            </View>
          ) : completionPct > 0 ? (
            <View
              style={[
                styles.pctPill,
                { backgroundColor: `${moduleInfo.color}15` },
              ]}
            >
              <Text style={[styles.pctText, { color: moduleInfo.color }]}>
                {Math.round(completionPct * 100)}%
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{moduleInfo.nameAr}</Text>
        <Text style={styles.subtitle}>{moduleInfo.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.statsTextWrap}>
          <Text style={styles.statsValue}>
            {stats.completedCount}/{stats.totalSelections}
          </Text>
          <Text style={styles.statsLabel}>مكتمل</Text>
        </View>
        <Ionicons name="chevron-back" size={12} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    card: {
      width: "48%",
      backgroundColor: Colors.surface,
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: Colors.border,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    iconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.border,
    },
    progressBadge: {
      alignItems: "flex-end",
    },
    doneBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: Colors.success,
      alignItems: "center",
      justifyContent: "center",
      ...Shadow.sm,
    },
    pctPill: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    pctText: {
      fontSize: 9,
    },
    content: { marginBottom: Spacing.md },
    title: {
      fontFamily: Typography.heading,
      fontSize: 15,
      color: Colors.textPrimary,
      marginBottom: 2,
    },
    subtitle: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textSecondary,
      lineHeight: 14,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    statsTextWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
    statsValue: { fontSize: 10, color: Colors.textPrimary },
    statsLabel: { fontSize: 8, color: Colors.textTertiary },
  });
