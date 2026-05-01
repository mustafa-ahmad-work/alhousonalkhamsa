import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import quranData from "../../data/quran_pages.json";
import {
  BorderRadius,
  Shadow,
  Spacing,
  Typography,
  useTheme,
} from "../../theme";
import { toArabicNumerals } from "../../utils/helpers";

const { width } = Dimensions.get("window");

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

interface PageData {
  pageNumber: number;
  verses: Verse[];
}

interface InteractiveQuranProps {
  visible: boolean;
  pages: number[];
  moduleId: string;
  moduleName: string;
  moduleDescription?: string;
  onClose: () => void;
  onComplete?: () => void;
}

export function InteractiveQuran({
  visible,
  pages,
  moduleId,
  moduleName,
  moduleDescription,
  onClose,
  onComplete,
}: InteractiveQuranProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const [isLoading, setIsLoading] = useState(true);
  const [pagesData, setPagesData] = useState<PageData[]>([]);
  const [readingMode, setReadingMode] = useState<"app" | "physical" | null>(
    null,
  );

  // Features state
  const isMemorizationOrReview =
    moduleId === "memorization" || moduleId.includes("review");
  const isPreparation = moduleId.includes("preparation");

  const [isMasked, setIsMasked] = useState(false);
  const [revealedVerses, setRevealedVerses] = useState<Set<string>>(new Set());

  // Timer & Reps
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    let interval: any;
    if (visible && readingMode) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (!visible) {
        setSecondsElapsed(0);
        setRevealedVerses(new Set());
        setReps(0);
        setReadingMode(null);
      }
    }
    return () => clearInterval(interval);
  }, [visible, readingMode]);

  useEffect(() => {
    if (visible && pages.length > 0) {
      loadPagesData();
    }
  }, [visible, pages]);

  const loadPagesData = () => {
    setIsLoading(true);
    try {
      const fetched: PageData[] = [];
      const typedData = quranData as Record<string, Verse[]>;

      for (const pageNum of pages) {
        const verses = typedData[pageNum.toString()];
        if (verses) {
          fetched.push({
            pageNumber: pageNum,
            verses: verses,
          });
        }
      }
      setPagesData(fetched);
    } catch (e) {
      console.error("Error loading local Quran data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMask = () => {
    setIsMasked(!isMasked);
    if (!isMasked) {
      setRevealedVerses(new Set());
    }
  };

  const toggleVerseReveal = (verseKey: string) => {
    if (!isMasked) return;
    setRevealedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseKey)) next.delete(verseKey);
      else next.add(verseKey);
      return next;
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer}>
          {/* Mode Selection */}
          {!readingMode && (
            <View style={styles.modeSelectionContainer}>
              <Text style={styles.modeSelectionTitle}>
                كيف ستؤدي وردك اليوم؟
              </Text>
              <View style={styles.modeOptions}>
                <TouchableOpacity
                  style={styles.modeCard}
                  onPress={() => setReadingMode("app")}
                >
                  <View
                    style={[
                      styles.modeIconCircle,
                      { backgroundColor: Colors.primaryMuted },
                    ]}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={32}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.modeLabel}>من داخل التطبيق</Text>
                  <Text style={styles.modeSubLabel}>عرض الآيات بخط المصحف</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modeCard}
                  onPress={() => setReadingMode("physical")}
                >
                  <View
                    style={[
                      styles.modeIconCircle,
                      { backgroundColor: Colors.goldMuted },
                    ]}
                  >
                    <Ionicons
                      name="book-outline"
                      size={32}
                      color={Colors.gold}
                    />
                  </View>
                  <Text style={styles.modeLabel}>من مصحف ورقي</Text>
                  <Text style={styles.modeSubLabel}>استخدام التايمر فقط</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          )}

          {readingMode && (
            <>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerTitleBox}>
                  <Text style={styles.headerTitle}>{moduleName}</Text>
                  <View style={styles.timerChip}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.textTertiary}
                    />
                    <Text style={styles.timerText}>
                      {formatTimer(secondsElapsed)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.finishBtn,
                    { backgroundColor: Colors.success },
                  ]}
                  onPress={() => {
                    if (onComplete) onComplete();
                    onClose();
                  }}
                >
                  <Text style={styles.finishBtnText}>إنهاء</Text>
                </TouchableOpacity>
              </View>

              {/* Module Description & Info */}
              <View style={styles.descriptionBar}>
                <View style={styles.descriptionContent}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {moduleDescription || "اتبع خطوات الورد المحددة بعناية"}
                  </Text>
                </View>
              </View>

              {/* Tools Bar (Only in App mode) */}
              {readingMode === "app" && (
                <View style={styles.toolsBar}>
                  {isMemorizationOrReview && (
                    <TouchableOpacity
                      style={[
                        styles.toolBtn,
                        isMasked && { backgroundColor: Colors.primaryMuted },
                      ]}
                      onPress={toggleMask}
                    >
                      <Ionicons
                        name={isMasked ? "eye-off" : "eye"}
                        size={20}
                        color={isMasked ? Colors.primary : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.toolBtnText,
                          isMasked && { color: Colors.primary },
                        ]}
                      >
                        {isMasked ? "إظهار الكل" : "إخفاء (اختبار)"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isPreparation && (
                    <View style={styles.infoModeChip}>
                      <Ionicons
                        name="book-outline"
                        size={18}
                        color={Colors.primary}
                      />
                      <Text style={styles.infoModeText}>وضع التهيئة</Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }} />
                  <Text style={styles.pagesCount}>
                    {toArabicNumerals(pages.length)} صفحات
                  </Text>
                </View>
              )}

              {/* Main Content */}
              <View style={styles.mainContent}>
                {readingMode === "physical" ? (
                  <View style={styles.physicalModeContainer}>
                    <Ionicons
                      name="book"
                      size={80}
                      color={Colors.goldMuted}
                      style={{ marginBottom: 20 }}
                    />
                    <Text style={styles.physicalTitle}>
                      أنت تقرأ الآن من المصحف الورقي
                    </Text>
                    <View style={styles.rangeInfoCard}>
                      <Text style={styles.rangeInfoLabel}>النطاق المطلوب:</Text>
                      <Text style={styles.rangeInfoValue}>
                        من صفحة {toArabicNumerals(pages[0])} إلى{" "}
                        {toArabicNumerals(pages[pages.length - 1])}
                      </Text>
                    </View>
                    <View style={styles.largeTimerContainer}>
                      <Text style={styles.largeTimerLabel}>الوقت المنقضي</Text>
                      <Text style={styles.largeTimerValue}>
                        {formatTimer(secondsElapsed)}
                      </Text>
                    </View>
                  </View>
                ) : isLoading ? (
                  <View style={styles.centerArea}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loaderText}>جاري تجهيز المصحف...</Text>
                  </View>
                ) : (
                  <ScrollView
                    style={styles.textScroll}
                    contentContainerStyle={styles.textScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {pagesData.map((pageData) => (
                      <View
                        key={`page-${pageData.pageNumber}`}
                        style={styles.pageContainer}
                      >
                        <View style={styles.pageHeader}>
                          <Text style={styles.pageHeaderText}>
                            صفحة {toArabicNumerals(pageData.pageNumber)}
                          </Text>
                          <View style={styles.pageHeaderLine} />
                        </View>

                        <View style={styles.quranTextContainer}>
                          {pageData.verses.map((v) => {
                            const isHidden =
                              isMasked && !revealedVerses.has(v.verse_key);
                            const ayahNum = v.verse_key.split(":")[1];

                            return (
                              <Text
                                key={v.verse_key}
                                onPress={() => toggleVerseReveal(v.verse_key)}
                                style={[
                                  styles.quranText,
                                  isHidden && styles.quranTextHidden,
                                ]}
                              >
                                {isHidden ? " ┄┄┄ " : ` ${v.text_uthmani} `}
                                <Text style={styles.ayahNumberText}>
                                  {" "}({toArabicNumerals(parseInt(ayahNum))}){" "}
                                </Text>
                              </Text>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                    <View style={{ height: 120 }} />
                  </ScrollView>
                )}
              </View>

              {/* Floating Repetition Counter (only for memorization) */}
              {moduleId === "memorization" && !isLoading && (
                <Animated.View
                  entering={FadeInDown}
                  style={styles.repContainer}
                >
                  <Text style={styles.repLabel}>مرات التكرار</Text>
                  <View style={styles.repControls}>
                    <TouchableOpacity
                      onPress={() => setReps((r) => Math.max(0, r - 1))}
                      style={styles.repBtn}
                    >
                      <Ionicons
                        name="remove"
                        size={24}
                        color={Colors.textPrimary}
                      />
                    </TouchableOpacity>
                    <Text style={styles.repCount}>{reps}</Text>
                    <TouchableOpacity
                      onPress={() => setReps((r) => r + 1)}
                      style={styles.repBtn}
                    >
                      <Ionicons
                        name="add"
                        size={24}
                        color={Colors.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    safeContainer: {
      flex: 1,
    },
    // Mode Selection Styles
    modeSelectionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: Spacing.xl,
    },
    modeSelectionTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography.xl,
      color: Colors.textPrimary,
      marginBottom: Spacing["2xl"],
      textAlign: "center",
    },
    modeOptions: {
      width: "100%",
      gap: Spacing.lg,
    },
    modeCard: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.border,
      // ...Shadow.md,
    },
    modeIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    modeLabel: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      color: Colors.textPrimary,
      marginBottom: 4,
    },
    modeSubLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textSecondary,
    },
    cancelBtn: {
      marginTop: Spacing["2xl"],
      padding: Spacing.md,
    },
    cancelBtnText: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textTertiary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      backgroundColor: Colors.surface,
    },
    headerTitleBox: {
      alignItems: "center",
    },
    headerTitle: {
      fontFamily: Typography.heading,
      fontSize: 16,
      fontWeight: "bold",
      color: Colors.textPrimary,
    },
    timerChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    timerText: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textTertiary,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    finishBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
      borderRadius: 12,
      ...Shadow.sm,
    },
    finishBtnText: {
      color: "#FFF",
      fontSize: 13,
      fontWeight: "bold",
    },
    descriptionBar: {
      backgroundColor: Colors.surfaceElevated,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    descriptionContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    descriptionText: {
      flex: 1,
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textSecondary,
      lineHeight: 18,
      textAlign: "left",
    },
    toolsBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    toolBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors.surfaceElevated,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    toolBtnText: {
      fontSize: 12,
      fontWeight: "bold",
      color: Colors.textSecondary,
    },
    infoModeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    infoModeText: {
      fontSize: 12,
      fontWeight: "bold",
      color: Colors.primary,
    },
    pagesCount: {
      fontSize: 12,
      color: Colors.textTertiary,
      fontFamily: Typography.body,
    },
    mainContent: {
      flex: 1,
    },
    centerArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.md,
      padding: Spacing.xl,
    },
    loaderText: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: Colors.textSecondary,
    },
    textScroll: {
      flex: 1,
    },
    textScrollContent: {
      padding: Spacing.xl,
    },
    pageContainer: {
      marginBottom: Spacing["4xl"],
    },
    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: Spacing.xl,
    },
    pageHeaderText: {
      fontSize: 14,
      fontWeight: "bold",
      color: Colors.textTertiary,
      fontFamily: Typography.body,
    },
    pageHeaderLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.border,
    },
    quranTextContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      direction: "rtl",
    },
    quranText: {
      fontFamily: Typography.quran,
      fontSize: 20,
      color: Colors.textPrimary,
      lineHeight: 65,
      textAlign: "center",
    },
    quranTextHidden: {
      color: Colors.borderLight,
      backgroundColor: Colors.surfaceElevated,
    },
    ayahNumberText: {
      fontFamily: Typography.body,
      fontSize: 20,
      fontWeight: "bold",
      color: Colors.primary,
    },
    physicalModeContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: Spacing.xl,
    },
    physicalTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      color: Colors.textPrimary,
      textAlign: "center",
      marginBottom: Spacing.xl,
    },
    rangeInfoCard: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      width: "100%",
      alignItems: "center",
      marginBottom: Spacing["3xl"],
      borderWidth: 1,
      borderColor: Colors.border,
    },
    rangeInfoLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      marginBottom: 4,
    },
    rangeInfoValue: {
      fontFamily: Typography.heading,
      fontSize: Typography.md,
      color: Colors.primary,
    },
    largeTimerContainer: {
      alignItems: "center",
    },
    largeTimerLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    largeTimerValue: {
      fontFamily: Typography.heading,
      fontSize: 64,
      color: Colors.textPrimary,
      fontWeight: "bold",
    },
    repContainer: {
      position: "absolute",
      bottom: Spacing.xl,
      alignSelf: "center",
      backgroundColor: Colors.surfaceElevated,
      borderRadius: 30,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadow.lg,
    },
    repLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: Colors.textSecondary,
      marginRight: Spacing.sm,
    },
    repControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    repBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.borderLight,
    },
    repCount: {
      fontSize: 20,
      fontWeight: "900",
      color: Colors.primary,
      minWidth: 24,
      textAlign: "center",
    },
  });
