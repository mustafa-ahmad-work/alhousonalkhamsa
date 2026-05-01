import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";

const EDIT_TYPE_LABELS: Record<string, string> = {
  name: "الاسم",
  goal: "الهدف",
  startPage: "بداية النطاق",
  endPage: "نهاية النطاق",
  dailyPages: "الصفحات اليومية",
  dailyAyahs: "الآيات اليومية",
  memorizationTimer: "مؤقت الحفظ",
  reviewTimer: "مؤقت المراجعة",
  preparationTimer: "مؤقت التحضير",
  listeningTimer: "مؤقت الاستماع",
  recitationTime: "وقت تنبيه التلاوة",
  listeningTime: "وقت تنبيه الاستماع",
  weeklyPrepTime: "وقت التحضير الأسبوعي",
  nightlyPrepTime: "وقت التحضير الليلي",
  dailyPrepTime: "وقت التحضير القبلي",
  memorizationTime: "وقت تنبيه الحفظ",
  reviewTime: "وقت تنبيه المراجعة",
};

interface EditModalProps {
  visible: boolean;
  editType: string;
  value: string;
  onChangeValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditModal({
  visible,
  editType,
  value,
  onChangeValue,
  onSave,
  onCancel,
}: EditModalProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const label = EDIT_TYPE_LABELS[editType] ?? editType;
  const isNumeric = ["dailyPages", "memorizationTimer", "reviewTimer",
    "preparationTimer", "recitationTimer", "listeningTimer"].includes(editType);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>تعديل {label}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeValue}
            placeholder={`أدخل ${label}...`}
            placeholderTextColor={Colors.textTertiary}
            textAlign="right"
            keyboardType={isNumeric ? "numeric" : "default"}
            autoFocus
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={onSave}
            >
              <Text style={styles.saveText}>حفظ</Text>
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
    input: {
      backgroundColor: Colors.background,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textPrimary,
      marginBottom: Spacing.xl,
    },
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
    saveBtn: { backgroundColor: Colors.primary },
    cancelText: {
      color: Colors.textSecondary,
      fontFamily: Typography.body,
      fontSize: Typography.sm,
    },
    saveText: {
      color: "#FFF",
      fontFamily: Typography.body,
      fontSize: Typography.sm,
    },
  });
