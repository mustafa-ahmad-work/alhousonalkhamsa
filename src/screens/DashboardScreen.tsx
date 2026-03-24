import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ModuleCard } from "../components/ModuleCard";
import { StreakBadge } from "../components/StreakBadge";
import { useAppStore } from "../store/AppStore";
import { useSelectionStore } from "../store/selectionStore";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";
import { MODULES } from "../types";
import { getMotivationalMessage } from "../utils/helpers";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const { state, getMemorizedPages, getPagesDue } = useAppStore();
  const { user, streak } = state;

  const isLoaded = useSelectionStore((state) => state.isLoaded);
  const loadFromStorage = useSelectionStore((state) => state.loadFromStorage);
  const taskSelections = useSelectionStore((state) => state.taskSelections);

  // Load selections when Dashboard mounts
  useEffect(() => {
    if (!isLoaded) {
      loadFromStorage();
    }
  }, [isLoaded, loadFromStorage]);

  const memorizedPages = getMemorizedPages();
  const pagesDue = getPagesDue();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleModulePress = (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push({ pathname: "/module", params: { id } } as any);
  };

  // Calculate generic completion rate over modules today
  const activeSelections = taskSelections.filter((s) => {
    const d = new Date(s.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  const completedToday = activeSelections.filter((s) => s.isCompleted).length;
  const completionPct =
    activeSelections.length > 0 ? completedToday / activeSelections.length : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Subtle background orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.brandingHeader}>
            <View style={styles.headerLogoBox}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.brandingText}>الحصون الخمسة</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push("/settings")}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.headerTop}>
            <View style={styles.greetingBox}>
              <Text
                style={styles.greeting}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                اهلا {user?.name ?? "أخي"}
              </Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString("ar-EG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            </View>
            <View style={styles.leftHeader}>
              <View style={styles.userBadge}>
                <Text style={styles.userTitle}>{user?.title ?? "مبتدئ"}</Text>
                <View style={styles.xpRow}>
                  <Text style={styles.xpText}>{user?.totalXP ?? 0}</Text>
                  <Ionicons name="star" size={10} color={Colors.gold} />
                </View>
              </View>
            </View>
          </View>

          {/* Quote */}
          <View style={styles.quoteBox}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={Colors.primary}
              style={{ marginTop: 1 }}
            />
            <Text style={styles.quoteText}>{getMotivationalMessage()}</Text>
          </View>
        </Animated.View>

        {/* App Explanation Banner */}
        <TouchableOpacity
          style={styles.explanationBanner}
          onPress={() => router.push("/explanation" as any)}
        >
          <View style={styles.explanationContent}>
            <View style={styles.explanationIcon}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={Colors.primary}
              />
            </View>
            <View style={{ flex: 1, alignItems: "flex-start" }}>
              <Text style={styles.explanationTitle}>شرح التطبيق</Text>
              <Text style={styles.explanationDesc}>
                تعرف على كيفية استخدام نظام الحصون الخمسة...
              </Text>
            </View>
            <Ionicons
              name="chevron-back"
              size={18}
              color={Colors.textTertiary}
            />
          </View>
        </TouchableOpacity>

        {/* Daily Progress Panel */}
        <Animated.View style={[styles.progressPanel, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={Colors.gradientCard}
            style={styles.progressGradient}
          >
            {/* Left: Circular */}
            <View style={styles.circularWrapper}>
              <View style={styles.circularOuter}>
                <View
                  style={[
                    styles.circularInner,
                    {
                      borderColor:
                        completionPct >= 1 ? Colors.primary : Colors.border,
                    },
                  ]}
                >
                  <Text style={styles.pctText}>
                    {Math.round(completionPct * 100)}%
                  </Text>
                  <Text style={styles.pctLabel}>إنجاز اليوم</Text>
                </View>
              </View>
            </View>

            {/* Right: Stats */}
            <View style={styles.statsColumn}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{taskSelections.length}</Text>
                <Text style={styles.statLabel}>إجمالي الأوراد</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{memorizedPages.length}</Text>
                <Text style={styles.statLabel}>صفحة محفوظة</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.warning }]}>
                  {pagesDue.length}
                </Text>
                <Text style={styles.statLabel}>للمراجعة</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <StreakBadge
          currentStreak={streak.currentStreak}
          longestStreak={streak.longestStreak}
        />

        {/* Dynamic Modules Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>منهج الحصون</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{MODULES.length} أقسام</Text>
          </View>
        </View>

        <View style={styles.modulesGrid}>
          {MODULES.map((moduleInfo) => (
            <ModuleCard
              key={moduleInfo.id}
              moduleInfo={moduleInfo}
              onPress={handleModulePress}
            />
          ))}
        </View>

        {/* All Done Message */}
        {completionPct >= 1 && activeSelections.length > 0 && (
          <View style={styles.allDoneBox}>
            <Ionicons name="medal-outline" size={40} color={Colors.primary} />
            <Text style={styles.allDoneTitle}>أحسنت! أتممت مهام اليوم</Text>
            <Text style={styles.allDoneSubtitle}>
              استمر على هذا المنوال وحافظ على سلسلتك
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    orb1: {
      position: "absolute",
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: `${Colors.primary}06`,
      top: -60,
      right: -80,
    },
    orb2: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: `${Colors.blue}04`,
      bottom: 200,
      left: -60,
    },
    scroll: {
      paddingHorizontal: Spacing.lg,
      paddingTop: 56,
      gap: Spacing.md,
    },
    header: {
      marginBottom: Spacing.xs,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: Spacing.base,
    },
    leftHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    greetingBox: {
      flex: 1,
      alignItems: "flex-start",
    },
    settingsBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    userBadge: {
      alignItems: "center",
      gap: 3,
    },
    userTitle: {
      fontSize: Typography.xs,
      color: Colors.gold,
      fontWeight: Typography.semibold,
      backgroundColor: Colors.goldMuted,
      paddingHorizontal: Spacing.md,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: `${Colors.gold}15`,
      overflow: "hidden",
    },
    xpRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    xpText: {
      fontSize: 10,
      color: Colors.textTertiary,
    },
    greeting: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      textAlign: "left",
      width: "100%",
    },
    date: {
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
      marginTop: 2,
    },
    quoteBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: Colors.primarySubtle,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: `${Colors.primary}0D`,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    quoteText: {
      flex: 1,
      fontSize: Typography.sm,
      color: Colors.primary,
      lineHeight: Typography.sm * 1.7,
      textAlign: "left",
      opacity: 0.85,
    },

    // Explanation Banner
    explanationBanner: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    explanationContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    explanationIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: Colors.primarySubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    explanationTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
      marginBottom: 2,
      textAlign: "left",
    },
    explanationDesc: {
      fontSize: Typography.xs,
      color: Colors.textSecondary,
      textAlign: "left",
    },

    // Progress Panel
    progressPanel: {
      borderRadius: BorderRadius.sm,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    progressGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    circularWrapper: {
      width: 100,
      height: 100,
      alignItems: "center",
      justifyContent: "center",
    },
    circularOuter: {
      width: 100,
      height: 100,
      alignItems: "center",
      justifyContent: "center",
    },
    circularInner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    pctText: {
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
      color: Colors.primary,
    },
    pctLabel: {
      fontSize: 10,
      color: Colors.textTertiary,
      marginTop: 1,
    },
    statsColumn: {
      flex: 1,
      gap: Spacing.sm,
    },
    statItem: {
      alignItems: "flex-start",
    },
    statValue: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    statLabel: {
      fontSize: 10,
      color: Colors.textTertiary,
      marginTop: 1,
    },
    statDivider: {
      height: 1,
      backgroundColor: Colors.border,
    },

    // Section
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 2,
      marginTop: Spacing.xs,
    },
    sectionTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    sectionBadge: {
      backgroundColor: Colors.primaryMuted,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: `${Colors.primary}15`,
      paddingHorizontal: Spacing.md,
      paddingVertical: 2,
    },
    sectionBadgeText: {
      color: Colors.primary,
      fontSize: Typography.xs,
      fontWeight: Typography.semibold,
    },
    modulesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: Spacing.sm,
    },
    allDoneBox: {
      backgroundColor: Colors.primarySubtle,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: `${Colors.primary}15`,
      padding: Spacing.xl,
      alignItems: "center",
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    allDoneTitle: {
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.primary,
      textAlign: "center",
    },
    allDoneSubtitle: {
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      textAlign: "center",
    },
    brandingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.xl,
    },
    headerLogoBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      backgroundColor: Colors.glass,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    brandingText: {
      fontSize: Typography.sm,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      letterSpacing: 0.5,
    },
    communityCard: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      marginTop: Spacing.sm,
    },
    communityHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    communityTitle: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: Colors.textSecondary,
    },
    communityRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    communityItem: {
      flex: 1,
      alignItems: "center",
    },
    communityValue: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: Colors.primary,
    },
    communityLabel: {
      fontSize: 10,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    communityDivider: {
      width: 1,
      height: 20,
      backgroundColor: Colors.border,
      opacity: 0.5,
    },
  });
