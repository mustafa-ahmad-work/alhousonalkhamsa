import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PrimaryButton } from "../components/shared/PrimaryButton";
import { SURAHS } from "../data/quranMeta";
import { useAppStore } from "../store/AppStore";
import { BorderRadius, Spacing, Typography, useTheme , darkColors } from "../theme";
import { QURAN_GOALS, UserLevel } from "../types";
import { toArabicNumerals } from "../utils/helpers";



const { width } = Dimensions.get("window");

const LEVELS: {
  value: UserLevel;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "مبتدئ",
    label: "مبتدئ",
    icon: "star-outline",
    description: "لم أحفظ شيئاً بعد",
  },
  {
    value: "متوسط",
    label: "متوسط",
    icon: "star-half-outline",
    description: "حفظت بعض الأجزاء",
  },
  {
    value: "متقدم",
    label: "متقدم",
    icon: "star",
    description: "حفظت أكثر من نصف القرآن",
  },
];

const DAILY_PAGES = [1, 2, 3, 5];
const DAILY_PAGES_LABELS: Record<number, string> = {
  1: "صفحة واحدة",
  2: "صفحتان",
  3: "٣ صفحات",
  5: "٥ صفحات",
};

const STEPS = ["الترحيب", "مستواك", "محفوظك", "طاقتك", "البداية"];

export default function OnboardingScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const { dispatch } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>("مبتدئ");
  const [selectedGoal] = useState(QURAN_GOALS[0]);
  const [selectedPages, setSelectedPages] = useState<number>(1);
  const [selectedSurahIds, setSelectedSurahIds] = useState<number[]>([]);
  const [planDirection] = useState<"forward" | "backward">(
    "forward",
  );
  const [surahModalVisible, setSurahModalVisible] = useState(false);
  const [alreadyMemorizedSurahIds, setAlreadyMemorizedSurahIds] = useState<
    number[]
  >([]);
  const [alreadyMemorizedModalVisible, setAlreadyMemorizedModalVisible] =
    useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const animateToStep = (nextStep: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -15,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    setStep(nextStep);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      animateToStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) animateToStep(step - 1);
  };

  const handleFinish = () => {
    let pages: number[] = [];
    let label = "";

    pages = Array.from({ length: 604 }, (_, i) => i + 1);
    label = "القرآن الكريم كاملاً";

    dispatch({
      type: "COMPLETE_ONBOARDING",
      payload: {
        user: {
          name: name || "أخي الحافظ",
          level: selectedLevel,
          dailyPages: selectedPages,
          goal: label,
        },
        pageNumbers: pages,
        label,
        direction: planDirection,
        alreadyMemorizedSurahIds,
      },
    });
    router.replace("/(tabs)/dashboard" as any);
  };

  const canProceed = () => {
    if (step === 0) return true;
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          Colors.background === "#07090F" ? "light-content" : "dark-content"
        }
        translucent
        backgroundColor="transparent"
      />
      <View style={StyleSheet.absoluteFill} />

      {/* Subtle decorative orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header - Step Indicator */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, step === 0 && { opacity: 0 }]}
          disabled={step === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.steps}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotDone,
              ]}
            />
          ))}
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* STEP 0: Welcome */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <View style={styles.logoCircleIntro}>
                <Ionicons
                  name="shield-checkmark"
                  size={54}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.stepTitle}>مرحباً بك في</Text>
              <Text style={styles.appName}>مفاتيح حفظ القرآن</Text>
              <Text style={styles.appSubtitle}></Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ما اسمك؟ (اختياري)</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل اسمك..."
                  placeholderTextColor={Colors.textTertiary}
                  textAlign="left"
                />
              </View>

              <View style={styles.featuresList}>
                {[
                  {
                    icon: "shield-checkmark-outline",
                    text: "نظام مفاتيح حفظ القرآن المتكامل",
                  },
                  {
                    icon: "sync-outline",
                    text: "مراجعة ذكية بالتكرار المتباعد",
                  },
                  {
                    icon: "stats-chart-outline",
                    text: "تتبع التقدم والإنجازات",
                  },
                  { icon: "flame-outline", text: "نظام السلاسل والمكافآت" },
                ].map((f, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons
                      name={f.icon as any}
                      size={20}
                      color={Colors.primary}
                      style={{ opacity: 0.75 }}
                    />
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* STEP 1: Level */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="book-outline"
                size={48}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>ما مستواك الحالي؟</Text>
              <Text style={styles.stepSubtitle}>
                سيساعدنا ذلك في تخصيص خطتك
              </Text>

              {LEVELS.map((lvl) => (
                <TouchableOpacity
                  key={lvl.value}
                  style={[
                    styles.optionCard,
                    selectedLevel === lvl.value && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedLevel(lvl.value)}
                >
                  <Ionicons
                    name={lvl.icon as any}
                    size={24}
                    color={
                      selectedLevel === lvl.value
                        ? Colors.primary
                        : Colors.textTertiary
                    }
                  />
                  <View style={styles.optionInfo}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedLevel === lvl.value && {
                          color: Colors.primary,
                        },
                      ]}
                    >
                      {lvl.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {lvl.description}
                    </Text>
                  </View>
                  {selectedLevel === lvl.value && (
                    <View style={styles.selectedCheck}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STEP 2: Previous Memorization */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="library-outline"
                size={48}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>
                هل تحفظ شيئاً من القرآن بالفعل؟
              </Text>
              <Text style={styles.stepSubtitle}>
                سنقوم بتخطي هذه السور في خطة الحفظ الجديدة
              </Text>

              <View
                style={[styles.card, { width: "100%", padding: Spacing.lg }]}
              >
                <TouchableOpacity
                  style={styles.surahSelectBtn}
                  onPress={() => setAlreadyMemorizedModalVisible(true)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons name="list" size={18} color={Colors.primary} />
                    <Text style={styles.surahSelectText}>
                      {alreadyMemorizedSurahIds.length === 0
                        ? "اختر السور التي تحفظها"
                        : `تحفظ حالياً ${alreadyMemorizedSurahIds.length} سورة`}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>

                <Text
                  style={{
                    fontFamily: Typography.body,
                    fontSize: 12,
                    color: Colors.textTertiary,
                    marginTop: Spacing.sm,
                    lineHeight: 18,
                  }}
                >
                  ملاحظة: سيتم إضافة الصفحات الخاصة بهذه السور بمستوى المراجعة
                  التلقائي حتى تستمر في مراجعتها ولن يطلب منك حفظها.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 3: Daily Capacity */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="flash-outline"
                size={48}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>طاقتك اليومية</Text>
              <Text style={styles.stepSubtitle}>
                كم صفحة تستطيع حفظها يومياً؟
              </Text>

              <View style={styles.pagesGrid}>
                {DAILY_PAGES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.pageOption,
                      selectedPages === p && styles.pageOptionSelected,
                    ]}
                    onPress={() => setSelectedPages(p)}
                  >
                    <Text
                      style={[
                        styles.pageNum,
                        selectedPages === p && { color: Colors.primary },
                      ]}
                    >
                      {p}
                    </Text>
                    <Text style={styles.pageLabel}>
                      {DAILY_PAGES_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.estimateBox}>
                <Text style={styles.estimateLabel}>التقدير</Text>
                <Text style={styles.estimateValue}>
                  {selectedGoal && selectedPages > 0
                    ? `تقريباً ${Math.ceil(
                        (() => {
                          // ... estimating total items ...
                          const count = 604;
                          return count / selectedPages;
                        })(),
                      )} يوم`
                    : "—"}
                </Text>
              </View>
            </View>
          )}

          {/* STEP 4: Ready */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={64}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>أنت مستعد!</Text>
              <Text style={styles.stepSubtitle}>
                رحلتك مع كلام الله تبدأ الآن
              </Text>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>ملخص خطتك</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>الاسم</Text>
                  <Text style={styles.summaryValue}>
                    {name || "أخي الحافظ"}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>المستوى</Text>
                  <Text style={styles.summaryValue}>{selectedLevel}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>الهدف</Text>
                  <Text style={styles.summaryValue}>
                    {(() => {
                      return "القرآن كاملاً";
                    })()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>يومياً</Text>
                  <Text style={styles.summaryValue}>
                    {DAILY_PAGES_LABELS[selectedPages]}
                  </Text>
                </View>

                <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.summaryLabel}>الاتجاه</Text>
                  <Text style={styles.summaryValue}>
                    {planDirection === "forward"
                      ? "من الفاتحة للناس"
                      : "من الناس للفاتحة"}
                  </Text>
                </View>
              </View>

              <View style={styles.planPreviewBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={Colors.textTertiary}
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.planPreviewText}>
                  {(() => {
                    const pagesPerDay = selectedPages;
                    const totalPages = 604;
                    const days = Math.ceil(totalPages / pagesPerDay);
                    return `ستحفظ تقريباً خلال ${days} يوماً حسب وردك اليومي.`;
                  })()}
                </Text>
              </View>

              <Text style={styles.hadith}>
                &quot;اقرأ وارقَ ورتِّل كما كنتَ تُرتِّلُ في الدنيا&quot;
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Surah Selection Modal (Multi-select) */}
      <Modal visible={surahModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "90%", width: "90%" }]}>
            <Text style={styles.modalTitle}>اختر السور</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {SURAHS.map((surah) => {
                const isSelected = selectedSurahIds.includes(surah.id);
                return (
                  <TouchableOpacity
                    key={surah.id}
                    style={[
                      styles.surahItem,
                      isSelected && { backgroundColor: `${Colors.primary}10` },
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedSurahIds(
                          selectedSurahIds.filter((id) => id !== surah.id),
                        );
                      } else {
                        setSelectedSurahIds([...selectedSurahIds, surah.id]);
                      }
                    }}
                  >
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={20}
                      color={isSelected ? Colors.primary : Colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.surahNameAr,
                        isSelected && { color: Colors.primary },
                      ]}
                    >
                      {surah.nameAr}
                    </Text>
                    <Text style={styles.surahNumber}>
                      {toArabicNumerals(surah.id)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.primary },
                ]}
                onPress={() => setSurahModalVisible(false)}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                  تم الاختيار
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Already Memorized Surah Selection Modal (Multi-select) */}
      <Modal
        visible={alreadyMemorizedModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "90%", width: "90%" }]}>
            <Text style={styles.modalTitle}>اختر السور المحفوظة</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {SURAHS.map((surah) => {
                const isSelected = alreadyMemorizedSurahIds.includes(surah.id);
                return (
                  <TouchableOpacity
                    key={surah.id}
                    style={[
                      styles.surahItem,
                      isSelected && { backgroundColor: `${Colors.primary}10` },
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setAlreadyMemorizedSurahIds(
                          alreadyMemorizedSurahIds.filter(
                            (id) => id !== surah.id,
                          ),
                        );
                      } else {
                        setAlreadyMemorizedSurahIds([
                          ...alreadyMemorizedSurahIds,
                          surah.id,
                        ]);
                      }
                    }}
                  >
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={20}
                      color={isSelected ? Colors.primary : Colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.surahNameAr,
                        isSelected && { color: Colors.primary },
                      ]}
                    >
                      {surah.nameAr}
                    </Text>
                    <Text style={styles.surahNumber}>
                      {toArabicNumerals(surah.id)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.primary },
                ]}
                onPress={() => setAlreadyMemorizedModalVisible(false)}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                  تم الاختيار
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          label={step === STEPS.length - 1 ? "ابدأ رحلتك" : "التالي"}
          onPress={handleNext}
          disabled={!canProceed()}
        />
      </View>
    </View>
  );
}

const getStyles = (Colors: typeof darkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    orb1: {
      position: "absolute",
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: `${Colors.primary}05`,
      top: -100,
      right: -80,
    },
    orb2: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: `${Colors.blue}04`,
      bottom: 100,
      left: -60,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 56,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.base,
    },
    backButton: {
      width: 40,
      height: 40,
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    steps: {
      flexDirection: "row",
      gap: 6,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.border,
    },
    stepDotActive: {
      width: 20,
      backgroundColor: Colors.primary,
    },
    stepDotDone: {
      backgroundColor: Colors.primaryDark,
    },
    content: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing["4xl"],
    },
    stepContainer: {
      alignItems: "center",
      paddingTop: Spacing.xl,
    },
    stepTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography["2xl"],
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      textAlign: "center",
      marginBottom: Spacing.sm,
    },
    appName: {
      fontFamily: Typography.heading,
      fontSize: Typography["3xl"],
      fontWeight: Typography.extrabold,
      color: Colors.primary,
      textAlign: "center",
    },
    appSubtitle: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textSecondary,
      textAlign: "center",
      marginTop: Spacing.sm,
      marginBottom: Spacing["sm"],
    },
    stepSubtitle: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textSecondary,
      textAlign: "center",
      marginBottom: Spacing.xl,
    },
    inputContainer: {
      width: "100%",
      marginBottom: Spacing.xl,
    },
    inputLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
      marginBottom: Spacing.sm,
    },
    input: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      color: Colors.textPrimary,
      fontFamily: Typography.body,
      fontSize: Typography.base,
      textAlign: "right",
    },
    featuresList: {
      width: "100%",
      gap: Spacing.sm,
    },
    featureItem: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
    },
    featureText: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      flex: 1,
      textAlign: "left",
    },
    optionCard: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
    },
    optionCardSelected: {
      borderColor: `${Colors.primary}40`,
      backgroundColor: Colors.primaryMuted,
    },
    optionInfo: {
      flex: 1,
      alignItems: "flex-start",
    },
    optionLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      fontWeight: Typography.medium,
      color: Colors.textPrimary,
    },
    optionDescription: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    selectedCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    goalCard: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.sm,
    },
    goalText: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textPrimary,
      textAlign: "left",
      flex: 1,
    },
    pagesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      justifyContent: "center",
      width: "100%",
      marginBottom: Spacing.xl,
    },
    pageOption: {
      width: (width - Spacing.xl * 2 - Spacing.sm * 2) / 3,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      paddingVertical: Spacing.base,
      gap: 3,
    },
    pageOptionSelected: {
      borderColor: `${Colors.primary}40`,
      backgroundColor: Colors.primaryMuted,
    },
    pageNum: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    pageLabel: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textTertiary,
      textAlign: "center",
    },
    estimateBox: {
      width: "100%",
      backgroundColor: Colors.primarySubtle,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: `${Colors.primary}0D`,
      padding: Spacing.base,
      alignItems: "center",
    },
    estimateLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      marginBottom: 3,
    },
    estimateValue: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.primary,
    },
    summaryBox: {
      width: "100%",
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      gap: Spacing.sm,
    },
    summaryTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
      textAlign: "left",
      marginBottom: Spacing.sm,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    summaryLabel: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "right",
    },
    summaryValue: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
      color: Colors.textPrimary,
      textAlign: "right",
    },
    hadith: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.primary,
      textAlign: "center",
      fontStyle: "italic",
      lineHeight: Typography.base * 1.8,
      paddingHorizontal: Spacing.lg,
      opacity: 0.8,
    },
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: 36,
      paddingTop: Spacing.base,
    },
    logoCircleIntro: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: Colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    },
    card: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    label: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
    },
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginVertical: Spacing.md,
    },
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
    activeTab: { backgroundColor: Colors.surface },
    tabText: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textTertiary,
    },
    activeTabText: { color: Colors.primary, fontWeight: "bold" },
    rangeInputs: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    inputGroup: { flex: 1 },
    inputLabelSmall: {
      fontFamily: Typography.body,
      fontSize: 9,
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
    directionRow: { marginBottom: Spacing.md },
    directionToggle: { flexDirection: "row", gap: Spacing.sm, marginTop: 8 },
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
    activeDirText: { color: Colors.primary, fontWeight: "bold" },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    modalTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      marginBottom: Spacing.lg,
      textAlign: "center",
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: Spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: "center",
    },
    surahItem: {
      flexDirection: "row-reverse",
      alignItems: "center",
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    surahNumber: {
      width: 30,
      fontFamily: Typography.body,
      fontSize: Typography.xs,
      color: Colors.textTertiary,
      textAlign: "center",
    },
    surahNameAr: {
      flex: 1,
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textPrimary,
      fontWeight: Typography.medium,
      textAlign: "left",
      paddingRight: Spacing.md,
    },
    planPreviewBox: {
      marginTop: Spacing.xl,
      padding: Spacing.md,
      backgroundColor: `${Colors.primary}05`,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
      borderStyle: "dashed",
    },
    planPreviewText: {
      fontFamily: Typography.body,
      fontSize: Typography.xs,
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
  });
