import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useAppStore } from "../store/AppStore";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";

export default function SettingsScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const { state, dispatch } = useAppStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<"name" | "goal" | "dailyPages">(
    "name",
  );
  const [editValue, setEditValue] = useState("");

  const handleEdit = (type: "name" | "goal" | "dailyPages") => {
    setEditType(type);
    let value = "";
    if (type === "name") value = state.user?.name ?? "";
    else if (type === "goal") value = state.user?.goal ?? "";
    else if (type === "dailyPages")
      value = (state.user?.dailyPages ?? 0).toString();

    setEditValue(value);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    const payload: any = {};
    if (editType === "dailyPages") {
      payload.dailyPages = parseInt(editValue, 10) || 0;
    } else {
      payload[editType] = editValue;
    }

    dispatch({
      type: "UPDATE_USER",
      payload,
    });
    setEditModalVisible(false);
  };

  const handleReset = () => {
    Alert.alert(
      "مسح البيانات بالكامل",
      "هل أنت متأكد من مسح جميع بيانات الحفظ والتقدم؟ هذا الإجراء لا يمكن التراجع عنه.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح البيانات",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "RESET" });
            router.replace("/");
          },
        },
      ],
    );
  };

  const handleToggleTheme = () => {
    Alert.alert(
      "تغيير المظهر",
      "سيتم حفظ المظهر الجديد الآن. يرجى إغلاق التطبيق كلياً وإعادة فتحه لتطبيق الألوان الجديدة بشكل كامل.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تبديل وحفظ",
          onPress: () => {
            dispatch({ type: "TOGGLE_THEME" });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>معلومات الحساب</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEdit("name")}
          >
            <Text style={styles.label}>الاسم</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
              }}
            >
              <Text style={styles.value}>{state.user?.name ?? "—"}</Text>
              <Ionicons name="pencil" size={12} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEdit("goal")}
          >
            <Text style={styles.label}>الهدف</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
              }}
            >
              <Text style={styles.value}>{state.user?.goal ?? "—"}</Text>
              <Ionicons name="pencil" size={12} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEdit("dailyPages")}
          >
            <Text style={styles.label}>طاقتك اليومية</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
              }}
            >
              <Text style={styles.value}>
                {state.user?.dailyPages} صفحة/صفحات
              </Text>
              <Ionicons name="pencil" size={12} color={Colors.primary} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>تاريخ البدء</Text>
            <Text style={styles.value}>{state.user?.createdAt ?? "—"}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          التخصيص
        </Text>
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <View>
              <Text style={styles.label}>المظهر</Text>
              <Text style={styles.value}>
                {state.themeMode === "light" ? "فاتح" : "داكن"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={handleToggleTheme}
            >
              <Ionicons
                name={
                  state.themeMode === "light" ? "sunny-outline" : "moon-outline"
                }
                size={18}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          عن التطبيق
        </Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => router.push("/legal" as any)}
          >
            <Text style={styles.label}>الشروط وسياسة الخصوصية</Text>
            <Ionicons
              name="chevron-back"
              size={16}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          البيانات
        </Text>
        <View style={[styles.card, styles.dangerZone]}>
          <Text style={styles.dangerTitle}>منطقة الخطر</Text>
          <Text style={styles.dangerDesc}>
            يمكنك مسح بياناتك والبدء من جديد. لن يتم استرجاع أي خطط أو صفحات
            محفوظة.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleReset}>
            <Ionicons name="trash-outline" size={16} color={Colors.red} />
            <Text style={styles.dangerBtnText}>إعادة تعيين التقدم بالكامل</Text>
          </TouchableOpacity>
        </View>
 

      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              تعديل {editType === "name" ? "الاسم" : "الهدف"}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`أدخل ${editType === "name" ? "الاسم" : editType === "goal" ? "الهدف" : "عدد الصفحات"}...`}
              placeholderTextColor={Colors.textTertiary}
              textAlign="right"
              keyboardType={editType === "dailyPages" ? "numeric" : "default"}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={saveEdit}
              >
                <Text style={styles.modalSaveText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 56,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    backBtn: {
      width: 40,
      height: 40,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      padding: Spacing.xl,
    },
    sectionTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
      marginBottom: Spacing.sm,
      textAlign: "left",
    },
    card: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    label: {
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
    },
    value: {
      fontSize: Typography.sm,
      color: Colors.textPrimary,
      fontWeight: Typography.medium,
      textAlign: "left",
    },
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginVertical: Spacing.md,
    },
    themeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: Colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${Colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
    },
    dangerZone: {
      borderColor: `${Colors.red}20`,
      backgroundColor: Colors.redMuted,
    },
    dangerTitle: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: Colors.red,
      textAlign: "left",
      marginBottom: Spacing.xs,
    },
    dangerDesc: {
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      textAlign: "left",
      lineHeight: Typography.sm * 1.6,
      marginBottom: Spacing.lg,
    },
    dangerBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: `${Colors.red}30`,
      backgroundColor: `${Colors.red}0A`,
    },
    dangerBtnText: {
      color: Colors.red,
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "80%",
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    modalTitle: {
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      marginBottom: Spacing.lg,
      textAlign: "center",
    },
    modalInput: {
      backgroundColor: Colors.background,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: Typography.base,
      color: Colors.textPrimary,
      marginBottom: Spacing.xl,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: Spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: "center",
    },
    modalCancel: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    modalSave: {
      backgroundColor: Colors.primary,
    },
    modalCancelText: {
      color: Colors.textSecondary,
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
    modalSaveText: {
      color: "#FFF",
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
  });
