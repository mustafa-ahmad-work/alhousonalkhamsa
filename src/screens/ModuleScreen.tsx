import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppStore } from "../store/AppStore";
import { useSelectionStore } from "../store/selectionStore";
import { BorderRadius, Shadow, Spacing, Typography, useTheme } from "../theme";
import { MODULES, ModuleId, TaskSelection } from "../types";

import { RangeChip } from "../components/RangeChip";
import { SelectionScreen } from "../features/selection/SelectionScreen";
import { TaskTimer } from "../components/TaskTimer";
import { formatTime } from "../utils/helpers";

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const { state, dispatch } = useAppStore();
  const selectionStore = useSelectionStore();

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskSelection | null>(null);

  const getRecommendedTime = (mId: string) => {
    switch (mId) {
      case "recitation":
        return 20 * 60; // Standard 20m per juz
      case "listening":
        return 15 * 60;
      case "preparation_night":
      case "preparation_before":
      case "preparation_weekly":
        return (state.settings.preparationTimerMinutes || 15) * 60;
      case "memorization":
        return (state.settings.memorizationTimerMinutes || 20) * 60;
      case "review_short":
      case "review_long":
        return (state.settings.reviewTimerMinutes || 15) * 60;
      default:
        return 15 * 60;
    }
  };

  // Validate module
  const moduleInfo = MODULES.find((m) => m.id === id);
  if (!moduleInfo) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.emptyText}>القسم غير موجود</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>العودة للرئيسية</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get selections
  const selections = selectionStore.getModuleSelections(
    moduleInfo.id as ModuleId,
  );
  const activeSelections = selections.filter((s) => !s.isCompleted);
  const completedSelections = selections.filter((s) => s.isCompleted);

  const handleComplete = (task: TaskSelection) => {
    // Complete the task in selection store
    selectionStore.completeTaskSelection(task.id);

    // If it's the memorization format, mark progress
    if (moduleInfo.id === "memorization") {
      const pagesToMark: number[] = [];
      task.ranges.forEach((r) => {
        for (let p = r.start; p <= r.end; p++) pagesToMark.push(p);
      });
      selectionStore.markPagesMemorized(pagesToMark);
      dispatch({
        type: "MARK_PAGES_MEMORIZED",
        payload: { pages: pagesToMark },
      });
    } else if (moduleInfo.id === "review_short" || moduleInfo.id === "review_long") {
      const pagesToMark: number[] = [];
      task.ranges.forEach((r) => {
        for (let p = r.start; p <= r.end; p++) pagesToMark.push(p);
      });
      // Mark as reviewed (assume passed if manual completion)
      pagesToMark.forEach(p => {
        selectionStore.reviewPage(p, true);
        dispatch({
          type: "REVIEW_PAGE",
          payload: { pageNumber: p, passed: true },
        });
      });
    }

    // Award XP to AppStore
    dispatch({
      type: "TOGGLE_FORTRESS",
      payload: { fortressId: moduleInfo.fortressId },
    });

    Alert.alert("إنجاز عظيم!", `أتممت ورد ${moduleInfo.nameAr}`);
  };

  const handleRemove = (taskId: string) => {
    Alert.alert("تأكيد", "هل تريد حذف هذا النطاق؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => selectionStore.removeTaskSelection(taskId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{moduleInfo.nameAr}</Text>
          <Text style={styles.headerSubtitle}>{moduleInfo.description}</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: Colors.primaryMuted }]}
          onPress={() => setShowSelectionModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأوراد الحالية</Text>
          {activeSelections.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="document-text-outline"
                size={40}
                color={Colors.textTertiary}
              />
              <Text style={styles.emptyText}>
                لم تحدد أوراداً لهذا القسم بعد
              </Text>
            </View>
          ) : (
            activeSelections.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskDate}>
                    أُضيف في:{" "}
                    {new Date(task.createdAt).toLocaleDateString("ar-EG")}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemove(task.id)}>
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={Colors.error}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.rangesContainer}>
                  {task.ranges.map((r, i) => (
                    <RangeChip key={i} range={r} onRemove={() => {}} />
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.completeBtn,
                    { backgroundColor: `${moduleInfo.color}15` },
                  ]}
                  onPress={() => handleComplete(task)}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={moduleInfo.color}
                  />
                  <Text
                    style={[
                      styles.completeBtnText,
                      { color: moduleInfo.color },
                    ]}
                  >
                    تحديد كمنجز
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.startBtn,
                    { borderColor: `${moduleInfo.color}30` },
                  ]}
                  onPress={() => {
                    setSelectedTask(task);
                    setTimerVisible(true);
                  }}
                >
                  <Ionicons
                    name="timer-outline"
                    size={18}
                    color={moduleInfo.color}
                  />
                  <Text
                    style={[styles.startBtnText, { color: moduleInfo.color }]}
                  >
                    بدء الجلسة المؤقتة
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Completed Tasks History */}
        {completedSelections.length > 0 && (
          <View style={[styles.section, { marginTop: Spacing.xl }]}>
            <Text style={styles.sectionTitle}>سجل الإنجاز</Text>
            {completedSelections.map((task) => (
              <View key={task.id} style={[styles.taskCard, { opacity: 0.6 }]}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskDate}>
                    تم الإنجاز:{" "}
                    {task.completedAt
                      ? new Date(task.completedAt).toLocaleDateString("ar-EG")
                      : ""}
                  </Text>
                  <Ionicons
                    name="checkmark-done"
                    size={16}
                    color={Colors.success}
                  />
                </View>
                <View
                  style={[styles.rangesContainer, { pointerEvents: "none" }]}
                >
                  {task.ranges.map((r, i) => (
                    <RangeChip key={i} range={r} onRemove={() => {}} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Selection Modal */}
      <Modal
        visible={showSelectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSelectionModal(false)}
      >
        <SelectionScreen
          moduleId={moduleInfo.id as ModuleId}
          moduleName={moduleInfo.nameAr}
          onClose={() => setShowSelectionModal(false)}
        />
      </Modal>

      {timerVisible && selectedTask && (
        <TaskTimer
          title={`جلسة ${moduleInfo.nameAr}`}
          initialSeconds={getRecommendedTime(moduleInfo.id)}
          onFinish={() => {
            // Logic after timer finish if needed
          }}
          onClose={() => setTimerVisible(false)}
        />
      )}
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
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.sm,
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderColor: Colors.glass,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitleContainer: {
      alignItems: "center",
      flex: 1,
    },
    headerTitle: {
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
    },
    headerSubtitle: {
      fontSize: Typography.xs,
      color: Colors.textSecondary,
    },
    scroll: {
      padding: Spacing.lg,
      paddingBottom: 40,
    },
    section: {
      gap: Spacing.md,
    },
    sectionTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    emptyBox: {
      alignItems: "center",
      padding: Spacing.xl,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      borderStyle: "dashed",
      gap: Spacing.md,
    },
    emptyText: {
      fontSize: Typography.base,
      color: Colors.textSecondary,
    },
    backBtn: {
      marginTop: Spacing.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      backgroundColor: Colors.primaryMuted,
      borderRadius: BorderRadius.md,
    },
    backBtnText: {
      color: Colors.primary,
      fontWeight: Typography.medium,
    },

    taskCard: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glass,
      padding: Spacing.md,
      gap: Spacing.md,
      ...Shadow.sm,
    },
    taskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderLight,
      paddingBottom: Spacing.sm,
    },
    taskDate: {
      fontSize: Typography.xs,
      color: Colors.textTertiary,
    },
    rangesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },
    completeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
    },
    completeBtnText: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
    },
    startBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
      borderWidth: 1,
      marginTop: Spacing.xs,
    },
    startBtnText: {
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
  });
