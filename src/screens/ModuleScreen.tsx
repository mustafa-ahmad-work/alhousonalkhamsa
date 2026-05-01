import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KhumsAlert } from "../components/shared/CustomAlert";

import { useModuleLogic } from "../hooks/useModuleLogic";
import { useAppStore } from "../store/AppStore";
import { useSelectionStore } from "../store/selectionStore";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";
import { MODULES, ModuleId, TaskSelection } from "../types";
import { toArabicNumerals } from "../utils/helpers";
import { formatRanges } from "../utils/planLogic";

import { AudioPlayer } from "../components/shared/AudioPlayer";
import { InteractiveQuran } from "../components/shared/InteractiveQuran";
import { RangeChip } from "../components/shared/RangeChip";
import { TaskCard } from "../components/shared/TaskCard";
import { TaskTimer } from "../components/shared/TaskTimer";
import { SelectionScreen } from "../features/selection/SelectionScreen";

const { width } = Dimensions.get("window");

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const Colors = useTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const { state, dispatch } = useAppStore();
  const selectionStore = useSelectionStore();

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [quranReaderVisible, setQuranReaderVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskSelection | null>(null);

  const { plan, pageProgress, settings } = state;

  const { todayPlanItem, getPagesFromTask, getRecommendedTime } =
    useModuleLogic(id);

  const handleAddTodayPlan = () => {
    if (!todayPlanItem || !moduleInfo) return;
    selectionStore.addTaskSelection(
      moduleInfo.id as ModuleId,
      todayPlanItem.ranges.map((r) =>
        selectionStore.createPageRange(r.start, r.end),
      ),
    );
    KhumsAlert.alert(
      "تم الإضافة",
      "تمت إضافة ورد الخطة إلى الأوراد الحالية",
      [],
      "success",
    );
  };

  const moduleInfo = MODULES.find((m) => m.id === id);
  const selections = moduleInfo
    ? selectionStore.getModuleSelections(moduleInfo.id as ModuleId)
    : [];
  const activeSelections = selections.filter((s) => !s.isCompleted);
  const completedSelections = selections.filter((s) => s.isCompleted);

  const handleComplete = (task: TaskSelection) => {
    if (!moduleInfo) return;
    selectionStore.completeTaskSelection(task.id);
    const pagesToMark: number[] = [];
    task.ranges.forEach((r) => {
      for (let p = r.start; p <= r.end; p++) pagesToMark.push(p);
    });

    if (moduleInfo.id === "memorization") {
      selectionStore.markPagesMemorized(pagesToMark);
      dispatch({
        type: "MARK_PAGES_MEMORIZED",
        payload: { pages: pagesToMark },
      });
    } else if (
      moduleInfo.id === "review_short" ||
      moduleInfo.id === "review_long"
    ) {
      pagesToMark.forEach((p) => {
        selectionStore.reviewPage(p, true);
        dispatch({
          type: "REVIEW_PAGE",
          payload: { pageNumber: p, passed: true },
        });
      });
    }

    dispatch({
      type: "TOGGLE_FORTRESS",
      payload: { fortressId: moduleInfo.fortressId },
    });
    KhumsAlert.alert(
      "إنجاز عظيم!",
      `أتممت ورد ${moduleInfo.nameAr}`,
      [],
      "success",
    );
  };

  const handleRemove = (taskId: string) => {
    const task = selections.find((s) => s.id === taskId);
    KhumsAlert.alert(
      "تأكيد",
      "هل تريد حذف هذا النطاق؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => {
            if (task && task.isCompleted) {
              const pages: number[] = [];
              task.ranges.forEach((r) => {
                for (let p = r.start; p <= r.end; p++) pages.push(p);
              });
              if (task.module === "memorization") {
                dispatch({
                  type: "UNMARK_PAGES_MEMORIZED",
                  payload: { pages },
                });
              } else if (task.module.includes("review")) {
                pages.forEach((p) =>
                  dispatch({
                    type: "UNREVIEW_PAGE",
                    payload: { pageNumber: p },
                  }),
                );
              }
            }
            selectionStore.removeTaskSelection(taskId);
          },
        },
      ],
      "delete",
    );
  };

  const groupedCompleted = useMemo(() => {
    const groups: { [date: string]: TaskSelection[] } = {};
    completedSelections.forEach((task) => {
      const dateKey = new Date(task.completedAt!).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(task);
    });
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    );
  }, [completedSelections]);

  const handleRemoveRange = (taskId: string, rangeId: string) => {
    const task = selections.find((s) => s.id === taskId);
    if (!task) return;
    const newRanges = task.ranges.filter((r) => r.id !== rangeId);
    if (newRanges.length === 0) {
      selectionStore.removeTaskSelection(taskId);
    } else {
      selectionStore.updateTaskRanges(taskId, newRanges);
    }
  };

  const handleClearAll = () => {
    if (!moduleInfo) return;
    KhumsAlert.alert(
      "مسح السجل",
      "هل أنت متأكد من حذف سجل الإنجاز بالكامل لهذا القسم؟ لا يمكن التراجع عن هذه الخطوة.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح الكل",
          style: "destructive",
          onPress: () => {
            const completed = selections.filter(
              (s) => s.isCompleted && s.module === moduleInfo.id,
            );
            completed.forEach((task) => {
              const pages: number[] = [];
              task.ranges.forEach((r) => {
                for (let p = r.start; p <= r.end; p++) pages.push(p);
              });
              if (task.module === "memorization") {
                dispatch({
                  type: "UNMARK_PAGES_MEMORIZED",
                  payload: { pages },
                });
              } else if (task.module.includes("review")) {
                pages.forEach((p) =>
                  dispatch({
                    type: "UNREVIEW_PAGE",
                    payload: { pageNumber: p },
                  }),
                );
              }
            });
            selectionStore.clearModuleSelections(moduleInfo.id as ModuleId);
          },
        },
      ],
      "delete",
    );
  };

  const handleStartSession = (task: TaskSelection) => {
    if (!moduleInfo) return;
    setSelectedTask(task);
    if (moduleInfo.id === "listening") {
      setAudioPlayerVisible(true);
    } else if (moduleInfo.id === "memorization") {
      setTimerVisible(true);
    } else {
      setQuranReaderVisible(true);
    }
  };

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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          Colors.background === "#07090F" ? "light-content" : "dark-content"
        }
        translucent
        backgroundColor="transparent"
      />
      {/* Background Glow */}
      <View
        style={[styles.bgGlow, { backgroundColor: `${moduleInfo.color}08` }]}
      />

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
          {/* <View style={[styles.moduleBadge, { backgroundColor: `${moduleInfo.color}15` }]}>
             <Ionicons name={moduleInfo.icon} size={10} color={moduleInfo.color} />
             <Text style={[styles.moduleBadgeText, { color: moduleInfo.color }]}>{moduleInfo.fortressId}</Text>
          </View> */}
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Methodology Description Card */}
        <Animated.View entering={FadeInDown} style={styles.methodologyCard}>
          <View style={styles.methodologyHeader}>
            <Ionicons
              name="information-circle"
              size={18}
              color={moduleInfo.color}
            />
            <Text
              style={[styles.methodologyTitle, { color: moduleInfo.color }]}
            >
              منهجية العمل
            </Text>
          </View>
          <Text style={styles.methodologyDesc}>{moduleInfo.description}</Text>
        </Animated.View>

        {todayPlanItem && (
          <Animated.View entering={FadeInDown} style={styles.planSuggestion}>
            <View style={styles.planSugHeader}>
              <View style={styles.planSugIcon}>
                <Ionicons name="sparkles" size={16} color={moduleInfo.color} />
              </View>
              <Text style={[styles.planSugTitle, { color: moduleInfo.color }]}>
                {todayPlanItem.moduleTitle}
              </Text>
              <View
                style={[
                  styles.planSugBadge,
                  { backgroundColor: `${moduleInfo.color}15` },
                ]}
              >
                <Text
                  style={[styles.planSugBadgeText, { color: moduleInfo.color }]}
                >
                  مقترح من الخطّة
                </Text>
              </View>
            </View>

            <View style={styles.planSugContent}>
              <Text style={styles.planSugRange}>
                صفحات: {formatRanges(todayPlanItem.ranges)}
              </Text>
              <TouchableOpacity
                style={[
                  styles.planSugAction,
                  { backgroundColor: moduleInfo.color },
                ]}
                onPress={handleAddTodayPlan}
              >
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.planSugActionText}>إضافة للأوراد</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text style={styles.sectionTitle}>الأوراد الحالية</Text>
              {activeSelections.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {toArabicNumerals(activeSelections.length)}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.addBtnHeader, { borderColor: moduleInfo.color }]}
              onPress={() => setShowSelectionModal(true)}
            >
              <Ionicons name="add" size={16} color={moduleInfo.color} />
              <Text style={[styles.addBtnText, { color: moduleInfo.color }]}>
                إضافة ورد يدوي
              </Text>
            </TouchableOpacity>
          </View>

          {activeSelections.length === 0 ? (
            <Animated.View entering={FadeInDown} style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="document-text-outline"
                  size={40}
                  color={Colors.textTertiary}
                />
              </View>
              <Text style={styles.emptyText}>
                لم تحدد أوراداً لهذا القسم بعد. يمكنك إضافة أوراد مخصصة الآن.
              </Text>
              <TouchableOpacity
                style={[
                  styles.addBtnSmall,
                  { backgroundColor: moduleInfo.color, marginTop: 12 },
                ]}
                onPress={() => setShowSelectionModal(true)}
              >
                <Text style={{ color: "#FFF" }}>إضافة ورد جديد</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            activeSelections.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                moduleColor={moduleInfo.color}
                isListeningModule={moduleInfo.id === "listening"}
                onRemove={handleRemove}
                onRemoveRange={handleRemoveRange}
                onComplete={handleComplete}
                onStartSession={handleStartSession}
                Colors={Colors}
              />
            ))
          )}
        </View>

        {groupedCompleted.length > 0 && (
          <View style={[styles.section, { marginTop: Spacing.xl * 1.5 }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: Spacing.md,
                paddingHorizontal: 4,
              }}
            >
              <Text style={[styles.sectionTitle, { fontSize: 20 }]}>
                سجل الإنجاز
              </Text>
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.clearBtn}
              >
                <Ionicons name="trash-outline" size={14} color={Colors.red} />
                <Text
                  style={{
                    color: Colors.red,
                    fontSize: 13,
                  }}
                >
                  مسح السجل
                </Text>
              </TouchableOpacity>
            </View>

            {groupedCompleted.map(([date, tasks]) => (
              <View key={date} style={styles.dayGroup}>
                <View style={styles.dateDivider}>
                  <Text style={styles.dateLabel}>
                    {new Date(date).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </Text>
                  <View style={styles.dateLine} />
                </View>

                {tasks.map((task) => (
                  <Animated.View
                    entering={FadeInDown}
                    key={task.id}
                    style={[
                      styles.taskCardCompleted,
                      { backgroundColor: Colors.surface },
                    ]}
                  >
                    <View style={styles.taskHeader}>
                      <View style={styles.timeTag}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={Colors.textTertiary}
                        />
                        <Text style={styles.taskDate}>
                          {new Date(task.completedAt!).toLocaleTimeString(
                            "ar-EG",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </Text>
                      </View>

                      <View style={styles.completedActions}>
                        <View style={styles.statusBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={Colors.success}
                          />
                          <Text style={styles.statusText}>مكتمل</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteCircle}
                          onPress={() => handleRemove(task.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={14}
                            color={Colors.red}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.rangesContainer}>
                      {task.ranges.map((r, i) => (
                        <RangeChip
                          key={i}
                          range={r}
                          onRemove={(rid) => handleRemoveRange(task.id, rid)}
                        />
                      ))}
                    </View>
                  </Animated.View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
          task={selectedTask}
          showRepetition={moduleInfo.id === "memorization"}
          showControls={moduleInfo.id === "memorization"}
          showSetup={moduleInfo.id === "memorization"}
          onFinish={() => {}}
          onClose={() => setTimerVisible(false)}
        />
      )}

      <AudioPlayer
        visible={audioPlayerVisible}
        pages={getPagesFromTask(selectedTask)}
        title={`الاستماع لـ ${moduleInfo.nameAr}`}
        onClose={() => setAudioPlayerVisible(false)}
      />

      <InteractiveQuran
        visible={quranReaderVisible}
        pages={getPagesFromTask(selectedTask)}
        moduleId={moduleInfo.id}
        moduleName={moduleInfo.nameAr}
        moduleDescription={moduleInfo.description}
        onClose={() => setQuranReaderVisible(false)}
        onComplete={() => {
          if (selectedTask) handleComplete(selectedTask);
        }}
      />
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    bgGlow: {
      position: "absolute",
      width: width,
      height: 400,
      top: -100,
      borderRadius: width / 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 60,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.lg,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      zIndex: 10,
    },
    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitleContainer: { alignItems: "center", flex: 1 },
    headerTitle: {
      fontFamily: Typography.heading,
      fontSize: 18,
      color: Colors.textPrimary,
    },
    moduleBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      marginTop: 4,
    },
    moduleBadgeText: {
      fontSize: 10,
      textTransform: "uppercase",
    },
    scroll: { padding: Spacing.xl, paddingBottom: 60 },
    planSuggestion: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.surface,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    planSugHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.md,
      gap: 8,
    },
    planSugIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: Colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    planSugTitle: {
      fontFamily: Typography.heading,
      fontSize: 15,
    },
    planSugBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      marginLeft: "auto",
    },
    planSugBadgeText: {
      fontSize: 10,
    },
    planSugContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    planSugRange: {
      fontSize: 18,
      color: Colors.textPrimary,
      flex: 1,
    },
    planSugAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      marginLeft: 12,
    },
    planSugActionText: {
      color: "#FFF",
      fontSize: 12,
    },
    section: {
      gap: Spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: Spacing.xs,
    },
    sectionTitle: {
      fontFamily: Typography.heading,
      fontSize: 17,
      color: Colors.textPrimary,
    },
    countBadge: {
      backgroundColor: Colors.surfaceElevated,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.surface,
    },
    countBadgeText: {
      fontSize: 11,
      color: Colors.textSecondary,
    },
    emptyBox: {
      alignItems: "center",
      padding: Spacing.xl * 1.5,
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.surface,
      borderStyle: "dashed",
      gap: Spacing.md,
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: Colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.sm,
    },
    emptyText: {
      fontFamily: Typography.body,
      fontSize: 15,
      color: Colors.textSecondary,
      textAlign: "center",
    },
    addBtnSmall: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      marginTop: Spacing.sm,
    },
    addBtnHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addBtnText: {
      fontSize: 13,
    },
    backBtn: {
      marginTop: Spacing.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      backgroundColor: Colors.primaryMuted,
      borderRadius: BorderRadius.md,
    },
    backBtnText: { color: Colors.primary },
    clearBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors.redMuted,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    taskCardCompleted: {
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.surface,
      padding: Spacing.lg,
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    taskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      paddingBottom: Spacing.md,
    },
    timeTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors.surfaceElevated,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    taskDate: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textSecondary,
    },
    completedActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: `${Colors.success}12`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: { fontSize: 11, color: Colors.success },
    deleteCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.redMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    rangesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },
    dayGroup: {
      marginBottom: Spacing.lg,
    },
    dateDivider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: Spacing.lg,
      gap: 12,
    },
    dateLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.border,
    },
    dateLabel: {
      fontSize: 14,
      color: Colors.textPrimary,
      fontFamily: Typography.heading,
      backgroundColor: Colors.surfaceElevated,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
      overflow: "hidden",
    },
    methodologyCard: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    methodologyHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    methodologyTitle: {
      fontFamily: Typography.heading,
      fontSize: 14,
    },
    methodologyDesc: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textSecondary,
      lineHeight: 20,
      textAlign: "left",
    },
  });
