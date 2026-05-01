import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CircularProgress } from "../components/progress/CircularProgress";
import { JuzRoadmap } from "../components/progress/JuzRoadmap";
import { JUZ_META } from "../data/quranMeta";
import { useAppStore } from "../store/AppStore";
import { Spacing, useTheme, Typography } from "../theme";
import { MemorizationStrength, TITLE_XP_REQUIREMENTS, UserTitle } from "../types";
import { toArabicNumerals, TITLE_ICONS, getTitleFromXP } from "../utils/helpers";
import { useProgressLogic } from "../hooks/useProgressLogic";



const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.45;

const getStrengthColors = (
  Colors: any,
): Record<MemorizationStrength, string> => ({
  1: Colors.red,
  2: Colors.strength2,
  3: Colors.gold,
  4: Colors.strength4,
  5: Colors.primary,
});

export default function ProgressScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const STRENGTH_COLORS = React.useMemo(
    () => getStrengthColors(Colors),
    [Colors],
  );

  const {
    user,
    streak,
    memorizedPages,
    xpProgress,
    totalXP,
    planPct,
    juzProgress,
    stabilityIndex,
    masteredCount,
    weakCount,
    remainingCount,
    daysRemaining,
    finishDate,
    getJuzStability
  } = useProgressLogic();

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={Colors.background === "#07090F" ? "light-content" : "dark-content"} 
        translucent 
        backgroundColor="transparent" 
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <CircularProgress
            percentage={planPct}
            color={Colors.primary}
            size={CIRCLE_SIZE}
            Colors={Colors}
          />
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {toArabicNumerals(memorizedPages.length)}
              </Text>
              <Text style={styles.metaLabel}>صفحة متممة</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {toArabicNumerals(remainingCount)}
              </Text>
              <Text style={styles.metaLabel}>صفحة متبقية</Text>
            </View>
          </View>
          <View style={styles.predictionBox}>
            <Text style={styles.predictionText}>
              تاريخ الختم المتوقع:{" "}
              <Text style={{ color: Colors.gold }}>
                {finishDate.toLocaleDateString("ar-EG", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </Text>
          </View>
        </View>

        {/* Level Banner */}
        <View style={styles.levelCard}>
          <View style={styles.levelIconBox}>
            <Ionicons
              name={
                (TITLE_ICONS[getTitleFromXP(totalXP)] as any) || "medal"
              }
              size={24}
              color={Colors.primary}
            />
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>
              {user?.name || "يا حامل القرآن"}
            </Text>
            <Text style={styles.levelSubtitle}>
              المستوى{" "}
              {toArabicNumerals(
                Object.values(TITLE_XP_REQUIREMENTS).filter((xp) => totalXP >= xp)
                  .length,
              )}{" "}
              — {getTitleFromXP(totalXP)}
            </Text>
            <View style={styles.xpTrack}>
              <View
                style={[
                  styles.xpFill,
                  { width: `${xpProgress.percentage * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.xpStatus}>
              {toArabicNumerals(xpProgress.current)} /{" "}
              {toArabicNumerals(xpProgress.required)} XP للتالي
            </Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الألقاب والأوسمة</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {toArabicNumerals(
                  Object.values(TITLE_XP_REQUIREMENTS).filter((xp) => totalXP >= xp)
                    .length,
                )}{" "}
                / ٢٠ لقباً
              </Text>
            </View>
          </View>
          <View style={styles.titlesGrid}>
            {Object.entries(TITLE_XP_REQUIREMENTS).map(([title, reqXp]) => {
              const isUnlocked = totalXP >= reqXp;
              return (
                <View
                  key={title}
                  style={[
                    styles.titleCard,
                    !isUnlocked && styles.titleCardLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.titleIconBox,
                      {
                        backgroundColor: isUnlocked
                          ? `${Colors.primary}15`
                          : Colors.borderLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={(TITLE_ICONS[title] as any) || "star"}
                      size={20}
                      color={isUnlocked ? Colors.primary : Colors.textTertiary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.titleName,
                      { color: isUnlocked ? Colors.textPrimary : Colors.textTertiary },
                    ]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                  <Text style={styles.titleXp}>
                    {toArabicNumerals(reqXp)} XP
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Detailed Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statMiniCard}>
            <Ionicons name="flame" size={18} color={Colors.gold} />
            <Text style={styles.statMiniValue}>
              {toArabicNumerals(streak.currentStreak)}
            </Text>
            <Text style={styles.statMiniLabel}>يوم متواصل</Text>
          </View>
          <View style={styles.statMiniCard}>
            <Ionicons name="analytics" size={18} color={Colors.blue} />
            <Text style={styles.statMiniValue}>
              {toArabicNumerals(user?.dailyPages || 1)}
            </Text>
            <Text style={styles.statMiniLabel}>صفحة/يوم</Text>
          </View>
          <View style={styles.statMiniCard}>
            <Ionicons name="trophy" size={18} color={Colors.success} />
            <Text style={styles.statMiniValue}>
              {toArabicNumerals(totalXP)}
            </Text>
            <Text style={styles.statMiniLabel}>نقاط الخبرة</Text>
          </View>
        </View>

        {/* Roadmap */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>رحلة الختام (٣٠ جزء)</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {toArabicNumerals(juzProgress.filter((j) => j.pct >= 1).length)}{" "}
                / ٣٠ جزء
              </Text>
            </View>
          </View>
          <JuzRoadmap juzProgress={juzProgress} Colors={Colors} />
        </View>

        {/* Stability Balance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ميزان الرسوخ (الجودة)</Text>
            <View
              style={[
                styles.stabilityBadge,
                {
                  backgroundColor:
                    stabilityIndex > 70
                      ? Colors.success + "15"
                      : Colors.gold + "15",
                },
              ]}
            >
              <Text
                style={[
                  styles.stabilityBadgeText,
                  { color: stabilityIndex > 70 ? Colors.success : Colors.gold },
                ]}
              >
                {toArabicNumerals(stabilityIndex)}٪ ثبات
              </Text>
            </View>
          </View>

          <View style={styles.stabilityCard}>
            <View style={styles.stabilityBarBg}>
              <View
                style={[
                  styles.stabilityBarFill,
                  {
                    width: `${stabilityIndex}%`,
                    backgroundColor:
                      stabilityIndex > 70 ? Colors.primary : Colors.gold,
                  },
                ]}
              />
            </View>
            <View style={styles.qualityRow}>
              <View style={styles.qualityItem}>
                <Text style={styles.qualityLabel}>متين (قوي)</Text>
                <Text style={[styles.qualityValue, { color: Colors.primary }]}>
                  {toArabicNumerals(masteredCount)} ص
                </Text>
              </View>
              <View style={styles.qualityDivider} />
              <View style={styles.qualityItem}>
                <Text style={styles.qualityLabel}>مهتز (ضعيف)</Text>
                <Text style={[styles.qualityValue, { color: Colors.red }]}>
                  {toArabicNumerals(weakCount)} ص
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>تحليل الرسوخ لكل جزء</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.juzStabilityScroll}
          >
            {juzProgress
              .filter((j) => j.pct > 0)
              .map((j) => {
                const juzStability = getJuzStability(j.id);
                return (
                  <View key={j.id} style={styles.juzMiniCard}>
                    <Text style={styles.juzMiniName}>
                      جزء {toArabicNumerals(j.id)}
                    </Text>
                    <Text
                      style={[
                        styles.juzMiniStability,
                        {
                          color:
                            juzStability > 80 ? Colors.primary : Colors.gold,
                        },
                      ]}
                    >
                      {toArabicNumerals(juzStability)}٪
                    </Text>
                  </View>
                );
              })}
          </ScrollView>
        </View>

        {/* Bottom Metrics */}
        <View style={styles.detailedCard}>
          {[
            {
              label: "إجمالي الصفحات المتبقية",
              value: `${toArabicNumerals(remainingCount)} صفحة`,
            },
            {
              label: "أيام الإنجاز المتبقية",
              value: `${toArabicNumerals(daysRemaining)} يوم`,
            },
            {
              label: "أطول سلسلة إنجاز",
              value: `${toArabicNumerals(streak.longestStreak)} يوم`,
            },
          ].map((item, i) => (
            <View key={i}>
              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
              {i < 2 && <View style={styles.detailDivider} />}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { padding: Spacing.xl, paddingTop: 50 },
    heroCard: {
      backgroundColor: Colors.primaryMuted,
      borderRadius: 32,
      padding: Spacing.xl,
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: `${Colors.primary}30`,
      marginBottom: Spacing.xl,
    },
    heroMeta: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-around",
      marginVertical: Spacing.lg,
    },
    metaItem: { alignItems: "center" },
    metaValue: { fontSize: 24, color: Colors.textPrimary },
    metaLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
    metaDivider: { width: 1, height: 30, backgroundColor: Colors.glassBorder },
    predictionBox: {
      backgroundColor: `${Colors.gold}10`,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    predictionText: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: "left",
    },
    levelCard: {
      backgroundColor: Colors.surface,
      borderRadius: 24,
      padding: Spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    levelIconBox: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: `${Colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    levelInfo: { flex: 1, alignItems: "flex-start" },
    levelTitle: {
      fontSize: 18,
      color: Colors.textPrimary,
      textAlign: "left",
      width: "100%",
    },
    levelSubtitle: {
      fontSize: 12,
      color: Colors.textSecondary,
      marginBottom: 8,
      textAlign: "left",
      width: "100%",
    },
    xpTrack: {
      height: 6,
      width: "100%",
      backgroundColor: Colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    xpFill: { height: "100%", backgroundColor: Colors.primary },
    xpStatus: {
      fontSize: 10,
      color: Colors.textTertiary,
      marginTop: 4,
      textAlign: "left",
      width: "100%",
    },
    statsRow: {
      flexDirection: "row",
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    statMiniCard: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: Spacing.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.border,
    },
    statMiniValue: {
      fontSize: 16,
      color: Colors.textPrimary,
      marginVertical: 4,
    },
    statMiniLabel: { fontSize: 9, color: Colors.textSecondary },
    stabilityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    stabilityBadgeText: { fontSize: 11},
    stabilityCard: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: Spacing.lg,
    },
    stabilityBarBg: {
      height: 10,
      backgroundColor: Colors.borderLight,
      borderRadius: 5,
      width: "100%",
      overflow: "hidden",
      marginBottom: Spacing.md,
    },
    stabilityBarFill: { height: "100%", borderRadius: 5 },
    qualityRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginTop: 4,
    },
    qualityItem: { alignItems: "center" },
    qualityLabel: {
      fontSize: 10,
      color: Colors.textSecondary,
      marginBottom: 2,
    },
    qualityValue: { fontSize: 14},
    qualityDivider: { width: 1, height: 20, backgroundColor: Colors.border },
    subsectionTitle: {
      fontSize: 13,
      color: Colors.textSecondary,
      marginBottom: Spacing.md,
      textAlign: "left",
    },
    juzStabilityScroll: { gap: Spacing.md, paddingBottom: 4 },
    juzMiniCard: {
      backgroundColor: Colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: "center",
      minWidth: 70,
    },
    juzMiniName: { fontSize: 10, color: Colors.textSecondary, marginBottom: 2 },
    juzMiniStability: { fontSize: 13},
    section: { marginBottom: Spacing.lg },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      color: Colors.textPrimary,
      textAlign: "left",
    },
    badge: {
      backgroundColor: Colors.primaryMuted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: { fontSize: 13, color: Colors.primary},
    detailedCard: {
      backgroundColor: Colors.surface,
      borderRadius: 24,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    detailTitle: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: "left",
    },
    detailValue: {
      fontSize: 14,
      color: Colors.textPrimary,
    },
    detailDivider: { height: 1, backgroundColor: Colors.border, opacity: 0.5 },
    titlesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: Spacing.sm,
    },
    titleCard: {
      width: (width - 2 * Spacing.xl - 30) / 4,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.border,
    },
    titleCardLocked: {
      opacity: 0.5,
      borderColor: "transparent",
    },
    titleIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    titleName: {
      fontFamily: Typography.heading,
      fontSize: 9,
      textAlign: "center",
      marginBottom: 2,
    },
    titleXp: {
      fontSize: 8,
      color: Colors.textTertiary,
    },
  });
