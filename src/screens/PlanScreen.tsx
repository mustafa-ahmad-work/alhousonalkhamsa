import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Spacing, Typography, useTheme } from "../theme";
import { getMotivationalMessage } from "../utils/helpers";

// ── Components ────────────────────────────────────────────────────────────────
import { PlanDayCard } from "../components/plan/PlanDayCard";
import { PlanHeader } from "../components/plan/PlanHeader";
import { WeekGroupCard } from "../components/plan/WeekGroupCard";
import type { DayItem, WeekGroup } from "../components/plan/types";

// ============================================================
// Helpers
// ============================================================

// Shared helpers imported from ../utils/planLogic
import { buildWeeklyCalendar } from "../utils/planLogic";

// ============================================================
// Main Screen
// ============================================================

import { usePlanScreenLogic } from "../hooks/usePlanScreenLogic";

const { width } = Dimensions.get("window");

// ============================================================
// Celebration Overlay (inline — small component)
// ============================================================

const CELEBRATION_MESSAGES = [
  {
    title: "مبارك الإنجاز!",
    subtitle:
      "لقد أتممت وردك اليومي بنجاح، جعل الله القرآن ربيع قلبك ونور صدرك.",
    dua: "«يقال لصاحب القرآن اقرأ وارتقِ ورتل كما كنت ترتل في الدنيا»",
  },
  {
    title: "هنيئاً لك الرفعة!",
    subtitle:
      "خطوة ثابتة وعظيمة نحو ختم كتاب الله، استمر في هذا المسير المبارك.",
    dua: "«خيركم من تعلم القرآن وعلمه»",
  },
  {
    title: "رباط مع الخالق!",
    subtitle: "طبت وطاب لك العمل بصحبة كلام الله، يومك مشرق بالبركة والهدوء.",
    dua: "«أهل القرآن هم أهل الله وخاصته»",
  },
  {
    title: "توفيق من الله!",
    subtitle: "الثبات على الورد اليومي هو أعظم كرامة؛ فتشبث بحبله المتين.",
    dua: "«اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعًا لأصحابه»",
  },
  {
    title: "نور على نور!",
    subtitle: "أتممت وردك بصدق وإخلاص، هنيئاً لك السكينة التي نزلت على قلبك.",
    dua: "«ما اجتمع قوم في بيت من بيوت الله يتلون كتاب الله.. إلا نزلت عليهم السكينة»",
  },
];

const CelebrationOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const Colors = useTheme();
  const [msg] = useState(
    () =>
      CELEBRATION_MESSAGES[
        Math.floor(Math.random() * CELEBRATION_MESSAGES.length)
      ],
  );

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: 10000,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={{
          width: width * 0.88,
          maxWidth: 380,
          backgroundColor: Colors.surface,
          borderRadius: 32,
          padding: 32,
          alignItems: "center",
          borderWidth: 1,
          borderColor: Colors.borderLight,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: `${Colors.primary}15`,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="medal-outline" size={48} color={Colors.primary} />
        </View>

        <Text
          style={{
            fontFamily: Typography.heading,
            fontSize: 26,
            fontWeight: "bold",
            color: Colors.textPrimary,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {msg.title}
        </Text>
        <Text
          style={{
            fontFamily: Typography.body,
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 24,
          }}
        >
          {msg.subtitle}
        </Text>

        <View
          style={{
            padding: 20,
            backgroundColor: Colors.glass,
            borderRadius: 20,
            width: "100%",
            borderWidth: 1,
            borderColor: Colors.glassBorder,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: Colors.textPrimary,
              fontFamily: Typography.body,
              fontSize: 14,
              lineHeight: 24,
              textAlign: "center",
              fontWeight: "500",
              fontStyle: "italic",
            }}
          >
            {msg.dua}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.8}
          style={{
            backgroundColor: Colors.primary,
            width: "100%",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: Typography.heading,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            الحمد لله، استمرار
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ============================================================
// View Mode Toggle
// ============================================================

const ViewToggle = ({
  mode,
  onToggle,
}: {
  mode: "daily" | "weekly";
  onToggle: () => void;
}) => {
  const Colors = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(300)} style={viewToggleStyle.wrap}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={[
          viewToggleStyle.btn,
          {
            backgroundColor: Colors.surface,
            borderColor: Colors.border,
          },
        ]}
      >
        <Ionicons
          name={mode === "weekly" ? "list-outline" : "calendar-outline"}
          size={14}
          color={Colors.primary}
        />
        <Text style={[viewToggleStyle.text, { color: Colors.primary }]}>
          {mode === "weekly" ? "عرض يومي" : "عرض أسبوعي"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const viewToggleStyle = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    alignItems: "flex-end",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  text: {
    fontFamily: Typography.body,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default function PlanScreen() {
  const Colors = useTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const {
    plan,
    roadmap,
    settingsPlanMode,
    settingsActiveDays,
    handleComplete,
  } = usePlanScreenLogic();

  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [viewMode, setViewMode] = useState<"daily" | "weekly">(
    settingsPlanMode,
  );

  const pulse = useSharedValue(1);
  const barWidth = useSharedValue(0);
  const loadingMsg = useMemo(() => getMotivationalMessage(), []);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      true,
    );
    barWidth.value = withTiming(1, { duration: 1500 });

    const timer = setTimeout(() => setIsReady(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: withTiming(pulse.value === 1 ? 0.8 : 1),
  }));

  const animatedBar = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  // Sync view mode when settings change
  useEffect(() => {
    setViewMode(settingsPlanMode);
  }, [settingsPlanMode]);

  const handleDayComplete = useCallback(
    (item: DayItem) => {
      handleComplete(item, () => setShowCelebration(true));
    },
    [handleComplete],
  );

  const handleToggle = useCallback((day: number) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  }, []);

  const weekGroups = useMemo<WeekGroup[]>(() => {
    if (viewMode !== "weekly" || !plan || roadmap.length === 0) return [];
    return buildWeeklyCalendar(plan, roadmap, settingsActiveDays);
  }, [viewMode, plan, roadmap, settingsActiveDays]);

  // ─── Render items ──────────────────────────────────────────
  const renderDailyItem = useCallback(
    ({ item, index }: { item: DayItem; index: number }) => (
      <PlanDayCard
        item={item}
        expanded={expandedDay === item.dayIndex}
        onToggle={handleToggle}
        onComplete={handleDayComplete}
        isLast={index === roadmap.length - 1}
        showTimeline
      />
    ),
    [expandedDay, handleToggle, handleDayComplete, roadmap.length],
  );

  const renderWeeklyItem = useCallback(
    ({ item, index }: { item: WeekGroup; index: number }) => (
      <WeekGroupCard
        group={item}
        expandedDay={expandedDay}
        onToggle={handleToggle}
        onComplete={handleDayComplete}
        index={index}
      />
    ),
    [expandedDay, handleToggle, handleDayComplete],
  );

  // ─── Empty / Loading guards ───────────────────────────────
  if (!plan) {
    return (
      <View style={styles.emptyContainer}>
        <View style={StyleSheet.absoluteFill} />
        <Ionicons name="map-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyText}>لم يتم إنشاء خطة بعد</Text>
        <Text style={styles.emptySubText}>
          اذهب إلى الإعدادات لإنشاء خطة الحفظ
        </Text>
        <TouchableOpacity
          style={[styles.goSettingsBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.push("/settings" as any)}
        >
          <Ionicons name="settings-outline" size={16} color="#FFF" />
          <Text style={styles.goSettingsBtnText}>الإعدادات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={
            Colors.background === "#07090F" ? "light-content" : "dark-content"
          }
          translucent
          backgroundColor="transparent"
        />
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.loadingContainer}
        >
          <Animated.View style={[styles.loadingIconBox, animatedPulse]}>
            <Ionicons name="map-outline" size={52} color={Colors.primary} />
          </Animated.View>

          <View style={styles.loadingInfo}>
            <Text style={styles.loadingTitle}>تحضير الخطة...</Text>
            <Text style={styles.loadingSubtitle}>{loadingMsg}</Text>
          </View>

          <View style={styles.loadingBarWrapper}>
            <View style={styles.loadingBarBg}>
              <Animated.View style={[styles.loadingBarFill, animatedBar]} />
            </View>
            <Text style={styles.loadingProgressText}>جاري التهيئة</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  // ─── List header (shared) ─────────────────────────────────
  const ListHeader = (
    <>
      <PlanHeader roadmap={roadmap} plan={plan} />
      <ViewToggle
        mode={viewMode}
        onToggle={() =>
          setViewMode((v) => (v === "daily" ? "weekly" : "daily"))
        }
      />
    </>
  );

  // ─── Weekly view ──────────────────────────────────────────
  if (viewMode === "weekly") {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={
            Colors.background === "#07090F" ? "light-content" : "dark-content"
          }
          translucent
          backgroundColor="transparent"
        />
        <FlatList
          data={weekGroups}
          renderItem={renderWeeklyItem}
          keyExtractor={(item) => `week-${item.weekNumber}`}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
        />
        {showCelebration && (
          <CelebrationOverlay onComplete={() => setShowCelebration(false)} />
        )}
      </View>
    );
  }

  // ─── Daily view (default) ─────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          Colors.background === "#07090F" ? "light-content" : "dark-content"
        }
        translucent
        backgroundColor="transparent"
      />
      <FlatList
        data={roadmap}
        renderItem={renderDailyItem}
        keyExtractor={(item) => item.dayIndex.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
      />
      {showCelebration && (
        <CelebrationOverlay onComplete={() => setShowCelebration(false)} />
      )}
    </View>
  );
}

// ============================================================
// Styles
// ============================================================

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.background,
      padding: Spacing.xl,
    },
    loadingIconBox: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: Colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing.xl * 2,
      borderWidth: 1,
      borderColor: `${Colors.primary}10`,
    },
    loadingInfo: {
      alignItems: "center",
      marginBottom: Spacing.xl,
    },
    loadingTitle: {
      fontFamily: Typography.heading,
      fontSize: 22,
      fontWeight: "bold",
      color: Colors.textPrimary,
      marginBottom: Spacing.sm,
      letterSpacing: 0.5,
    },
    loadingSubtitle: {
      fontFamily: Typography.body,
      fontSize: 15,
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: Spacing.xl,
      opacity: 0.8,
    },
    loadingBarWrapper: {
      width: "70%",
      alignItems: "center",
      marginTop: Spacing.xl,
    },
    loadingBarBg: {
      width: "100%",
      height: 4,
      backgroundColor: Colors.border,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: Spacing.sm,
    },
    loadingBarFill: {
      height: "100%",
      backgroundColor: Colors.primary,
      borderRadius: 2,
    },
    loadingProgressText: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.md,
      backgroundColor: Colors.background,
    },
    emptyText: {
      fontFamily: Typography.heading,
      fontSize: 17,
      color: Colors.textSecondary,
      fontWeight: "600",
    },
    emptySubText: {
      fontFamily: Typography.body,
      fontSize: 13,
      color: Colors.textTertiary,
    },
    goSettingsBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
      marginTop: Spacing.sm,
    },
    goSettingsBtnText: {
      fontFamily: Typography.heading,
      fontSize: 14,
      fontWeight: "bold",
      color: "#FFF",
    },
    listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  });
