import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";

const TIME_TYPE_LABELS: Record<string, string> = {
  recitationTime: "وقت التلاوة",
  listeningTime: "وقت الاستماع",
  weeklyPrepTime: "التحضير الأسبوعي",
  nightlyPrepTime: "التحضير الليلي",
  dailyPrepTime: "التحضير القبلي",
  memorizationTime: "وقت الحفظ",
  reviewTime: "وقت المراجعة",
};

interface TimePickerModalProps {
  visible: boolean;
  editType: string;
  selectedHour: number;
  selectedMinute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TimePickerModal({
  visible,
  editType,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
  onConfirm,
  onCancel,
}: TimePickerModalProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const title = TIME_TYPE_LABELS[editType] ?? "ضبط الوقت";

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.content, { paddingHorizontal: 0, maxHeight: "80%" }]}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.pickerContainer}>
            {/* Hours column */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>الساعة</Text>
              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.item, selectedHour === h && styles.itemActive]}
                    onPress={() => onHourChange(h)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedHour === h && styles.itemTextActive,
                      ]}
                    >
                      {h.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minutes column */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>الدقيقة</Text>
              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.item, selectedMinute === m && styles.itemActive]}
                    onPress={() => onMinuteChange(m)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedMinute === m && styles.itemTextActive,
                      ]}
                    >
                      {m.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={[styles.actions, { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg }]}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>تأكيد</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      width: "85%",
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    title: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      color: Colors.textPrimary,
      marginBottom: Spacing.lg,
      textAlign: "center",
    },
    pickerContainer: {
      flexDirection: "row",
      height: 200,
      paddingHorizontal: Spacing.xl,
    },
    column: { flex: 1, alignItems: "center" },
    columnLabel: {
      fontFamily: Typography.heading,
      fontSize: 10,
      color: Colors.textTertiary,
      marginBottom: 8,
    },
    list: { width: "100%" },
    item: {
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 8,
      marginVertical: 2,
    },
    itemActive: {
      backgroundColor: `${Colors.primary}15`,
      borderWidth: 1,
      borderColor: `${Colors.primary}30`,
    },
    itemText: {
      fontFamily: Typography.body,
      fontSize: 18,
      color: Colors.textSecondary,
    },
    itemTextActive: { color: Colors.primary},
    actions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: Spacing.md,
    },
    btn: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: "center",
    },
    cancelBtn: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    confirmBtn: { backgroundColor: Colors.primary },
    cancelText: {
      color: Colors.textSecondary,
      fontFamily: Typography.body,
      fontSize: Typography.sm,
    },
    confirmText: {
      color: "#FFF",
      fontFamily: Typography.body,
      fontSize: Typography.sm,
    },
  });
