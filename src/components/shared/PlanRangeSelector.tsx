import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";

export type SelectionType = "complete" | "surahs" | "range";
export type PlanDirection = "forward" | "backward";

interface PlanRangeSelectorProps {
  selectionType: SelectionType;
  onSelectionTypeChange: (type: SelectionType) => void;
  startPage: string;
  endPage: string;
  onStartPageChange: (v: string) => void;
  onEndPageChange: (v: string) => void;
  endPagePlaceholder?: string;
  selectedSurahCount: number;
  onOpenSurahModal: () => void;
  planDirection: PlanDirection;
  onDirectionChange: (d: PlanDirection) => void;
}

export function PlanRangeSelector({
  selectionType,
  onSelectionTypeChange,
  startPage,
  endPage,
  onStartPageChange,
  onEndPageChange,
  endPagePlaceholder = "604",
  selectedSurahCount,
  onOpenSurahModal,
  planDirection,
  onDirectionChange,
}: PlanRangeSelectorProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View>
      {/* Type Tabs */}
      <View style={styles.tabRow}>
        {(
          [
            { key: "complete", label: "الختم الكامل" },
            { key: "surahs", label: "سور محددة" },
            { key: "range", label: "نطاق صفحات" },
          ] as { key: SelectionType; label: string }[]
        ).map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, selectionType === key && styles.activeTab]}
            onPress={() => onSelectionTypeChange(key)}
          >
            <Text
              style={[
                styles.tabText,
                selectionType === key && styles.activeTabText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Range Inputs */}
      {selectionType === "range" && (
        <View style={styles.rangeInputs}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>من صفحة</Text>
            <TextInput
              style={styles.smallInput}
              value={startPage}
              onChangeText={onStartPageChange}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>إلى صفحة</Text>
            <TextInput
              style={styles.smallInput}
              value={endPage}
              onChangeText={onEndPageChange}
              keyboardType="numeric"
              placeholder={endPagePlaceholder}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </View>
      )}

      {/* Surah Select Button */}
      {selectionType === "surahs" && (
        <TouchableOpacity
          style={styles.surahSelectBtn}
          onPress={onOpenSurahModal}
        >
          <Text style={styles.surahSelectText}>
            {selectedSurahCount === 0
              ? "اضغط لاختيار السور"
              : `تم اختيار ${selectedSurahCount} سورة`}
          </Text>
          <Ionicons name="list" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Direction Toggle */}
      <View style={styles.directionRow}>
        <Text style={styles.directionLabel}>اتجاه الحفظ</Text>
        <View style={styles.directionToggle}>
          {(
            [
              { key: "forward", label: "من الفاتحة للناس" },
              { key: "backward", label: "من الناس للفاتحة" },
            ] as { key: PlanDirection; label: string }[]
          ).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.dirBtn,
                planDirection === key && styles.activeDirBtn,
              ]}
              onPress={() => onDirectionChange(key)}
            >
              <Text
                style={[
                  styles.dirText,
                  planDirection === key && styles.activeDirText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    tabRow: {
      flexDirection: "row",
      backgroundColor: Colors.background,
      borderRadius: BorderRadius.md,
      padding: 4,
      marginBottom: Spacing.md,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: BorderRadius.md,
    },
    activeTab: {
      backgroundColor: Colors.surface,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textTertiary,
    },
    activeTabText: { color: Colors.primary},
    rangeInputs: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    inputGroup: { flex: 1 },
    inputLabel: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textTertiary,
      marginBottom: 4,
      textAlign: "right",
    },
    smallInput: {
      backgroundColor: Colors.background,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: BorderRadius.sm,
      padding: 8,
      textAlign: "center",
      color: Colors.textPrimary,
    },
    surahSelectBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.background,
      padding: 12,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: Spacing.md,
    },
    surahSelectText: {
      fontFamily: Typography.body,
      fontSize: 13,
      color: Colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginVertical: Spacing.md,
    },
    directionRow: { marginBottom: Spacing.md },
    directionLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
      marginBottom: 8,
    },
    directionToggle: { flexDirection: "row", gap: Spacing.sm },
    dirBtn: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: Colors.background,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: "center",
    },
    activeDirBtn: {
      borderColor: Colors.primary,
      backgroundColor: `${Colors.primary}05`,
    },
    dirText: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textSecondary,
    },
    activeDirText: { color: Colors.primary},
  });
