import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
 TextStyle, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SURAHS } from "../data/quranMeta";
import { useAppStore } from "../store/AppStore";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";
import { toArabicNumerals, todayISO } from "../utils/helpers";

import { Verse } from "../store/QuranStore";
import { useQuizLogic } from "../hooks/useQuizLogic";

const { width } = Dimensions.get("window");

const truncateVerseStart = (text: string, wordCount: number = 5) => {
  const words = text.split(" ");
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + " ...";
};

const truncateVerseEnd = (text: string, wordCount: number = 5) => {
  const words = text.split(" ");
  if (words.length <= wordCount) return text;
  return "... " + words.slice(-wordCount).join(" ");
};

export default function QuizScreen() {
  const Colors = useTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const {
    memorizedPages,
    sessionStarted,
    quizScope,
    totalQuestions,
    currentIndex,
    correctCount,
    finished,
    currentQuestion,
    showAnswer,
    setShowAnswer,
    isLoading,
    startQuiz,
    handleResponse
  } = useQuizLogic();

  if (memorizedPages.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={
            Colors.background === "#07090F" ? "light-content" : "dark-content"
          }
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>اختبار الحفظ</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="school" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyText}>لا يوجد محفوظ للمراجعة</Text>
          <Text style={styles.emptySub}>
            قم بتحديد السور التي تحفظها في الخطة لتبدأ اختبارات الحفظ الذكية
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryBtnText}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (finished) {
    const scorePct = (correctCount / totalQuestions) * 100;
    let feedback = "";
    let icon = "trophy-outline";
    let color = Colors.gold;

    if (scorePct >= 90) {
      feedback =
        "تبارك الله! حفظك متقن وراسخ كالفاتحة. استمر على هذا النهج المبارك.";
      icon = "star";
      color = Colors.gold;
    } else if (scorePct >= 70) {
      feedback =
        "أحسنت! حفظك جيد جداً، مع بعض التركيز في المراجعة ستصل للإتقان التام.";
      icon = "ribbon-outline";
      color = Colors.primary;
    } else if (scorePct >= 50) {
      feedback =
        "بداية طيبة، لكن بعض المواضع تحتاج لتثبيت أكثر. ركز على مراجعة القريب.";
      icon = "medal-outline";
      color = Colors.blue;
    } else {
      feedback =
        "لا بأس، القرآن يحتاج لتكرار دائم. هذه الأسئلة كشفت لك مواضع الضعف لتقويتها.";
      icon = "alert-circle-outline";
      color = Colors.red;
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>نتائج الاختبار</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown} style={styles.resultCard}>
            <View
              style={[styles.resultIconBox, { backgroundColor: `${color}15` }]}
            >
              <Ionicons name={icon as any} size={60} color={color} />
            </View>
            <Text style={styles.resultScoreText}>
              {toArabicNumerals(correctCount)} من{" "}
              {toArabicNumerals(totalQuestions)}
            </Text>
            <Text style={styles.resultPctText}>
              {toArabicNumerals(Math.round(scorePct))}% إتقان
            </Text>
            <Text style={styles.resultFeedback}>{feedback}</Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { width: "100%" }]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryBtnText}>العودة للرئيسية</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextBtn,
                {
                  marginTop: Spacing.md,
                  width: "100%",
                  justifyContent: "center",
                },
              ]}
              onPress={() => startQuiz(quizScope)}
            >
              <Text style={styles.nextBtnText}>
                إعادة الاختبار ({quizScope === "all" ? "شامل" : "اليوم"})
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  if (!sessionStarted) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={
            Colors.background === "#07090F" ? "light-content" : "dark-content"
          }
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>اختبار الحفظ</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="medal-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyText}>جاهز للاختبار؟</Text>
          <Text style={styles.emptySub}>
            سيقوم التطبيق باختبار حفظك في مواضع عشوائية من محفوظك، مع التركيز
            على المواضع التي تحتاج لتثبيت.
          </Text>

          <View style={styles.quizInfoRow}>
            <View style={styles.quizInfoTag}>
              <Text style={styles.quizInfoValue}>
                {toArabicNumerals(memorizedPages.length)}
              </Text>
              <Text style={styles.quizInfoLabel}>صفحة مخزنة</Text>
            </View>
          </View>

          <View style={styles.scopeButtons}>
            <TouchableOpacity
              style={styles.scopeBtn}
              onPress={() => startQuiz("all")}
            >
              <View
                style={[
                  styles.scopeIcon,
                  { backgroundColor: Colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="globe-outline"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.scopeTextWrap}>
                <Text style={styles.scopeTitle}>اختبار شامل</Text>
                <Text style={styles.scopeSub}>
                  يختبرك في كل ما تم حفظه سابقاً
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scopeBtn}
              onPress={() => startQuiz("today")}
            >
              <View
                style={[
                  styles.scopeIcon,
                  { backgroundColor: Colors.success + "15" },
                ]}
              >
                <Ionicons
                  name="today-outline"
                  size={24}
                  color={Colors.success}
                />
              </View>
              <View style={styles.scopeTextWrap}>
                <Text style={styles.scopeTitle}>اختبار محفوظ اليوم</Text>
                <Text style={styles.scopeSub}>
                  يركز على ما أنجزته خلال الـ 24 ساعة الماضية
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            سؤال {toArabicNumerals(currentIndex + 1)} من{" "}
            {toArabicNumerals(totalQuestions)}
          </Text>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${((currentIndex + 1) / totalQuestions) * 100}%` },
              ]}
            />
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loaderArea}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>جاري اختيار مقطع من محفوظك...</Text>
          </View>
        ) : currentQuestion ? (
          <View style={styles.quizWrapper}>
            {/* Context Header */}
            <View style={styles.contextHeader}>
              <View style={styles.surahBadge}>
                <Text style={styles.surahBadgeText}>
                  {currentQuestion.surahName}
                </Text>
              </View>
              <Text style={styles.infoText}>
                تسميع {toArabicNumerals(currentQuestion.gapSize)} آيات
              </Text>
            </View>

            {/* Start Block */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.verseCard}
            >
              <Text style={styles.cardLabel}>أكمل من بعد قوله تعالى:</Text>
              <Text style={styles.verseUthmani}>
                {truncateVerseStart(currentQuestion.startVerse.text_uthmani, 6)}
              </Text>
              <Text style={styles.verseKey}>
                سورة {currentQuestion.surahName} - آية{" "}
                {toArabicNumerals(
                  parseInt(currentQuestion.startVerse.verse_key.split(":")[1]),
                )}
              </Text>
            </Animated.View>

            {/* Gap Visualizer */}
            <View style={styles.gapVisual}>
              <View style={styles.gapLine} />
              <View style={styles.gapIconBox}>
                <Ionicons name="book-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.gapLine} />
            </View>

            {/* Target Block */}
            <Animated.View
              entering={FadeInDown.delay(400)}
              style={[
                styles.verseCard,
                { borderColor: Colors.borderLight, opacity: 0.8 },
              ]}
            >
              <Text style={styles.cardLabel}>حتى تصل إلى قوله تعالى:</Text>
              <Text style={[styles.verseUthmani, { fontSize: 20 }]}>
                {truncateVerseEnd(currentQuestion.targetVerse.text_uthmani, 6)}
              </Text>
              <Text style={styles.verseKey}>
                آية{" "}
                {toArabicNumerals(
                  parseInt(currentQuestion.targetVerse.verse_key.split(":")[1]),
                )}
              </Text>
            </Animated.View>

            {/* Answer Toggle */}
            <View style={styles.actionArea}>
              {!showAnswer ? (
                <TouchableOpacity
                  style={styles.showAnswerBtn}
                  onPress={() => setShowAnswer(true)}
                >
                  <Text style={styles.showAnswerText}>إظهار الآيات للتأكد</Text>
                  <Ionicons name="eye" size={20} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <Animated.View entering={FadeIn} style={styles.answerSection}>
                  <View style={styles.answerHeader}>
                    <Text style={styles.answerTitle}>الآيات المطلوبة:</Text>
                  </View>
                  <View style={styles.answerCloud}>
                    <Text style={styles.gapVerseText}>
                      {currentQuestion.startVerse.text_uthmani} ﴿
                      {toArabicNumerals(
                        parseInt(currentQuestion.startVerse.verse_key.split(":")[1]),
                      )}﴾
                    </Text>
                    {currentQuestion.gapVerses.map((v: Verse, i: number) => (
                      <Text key={i} style={styles.gapVerseText}>
                        {v.text_uthmani} ﴿
                        {toArabicNumerals(parseInt(v.verse_key.split(":")[1]))}﴾
                      </Text>
                    ))}
                    <Text style={styles.gapVerseText}>
                      {currentQuestion.targetVerse.text_uthmani} ﴿
                      {toArabicNumerals(
                        parseInt(currentQuestion.targetVerse.verse_key.split(":")[1]),
                      )}﴾
                    </Text>
                  </View>

                  <View style={styles.evaluationArea}>
                    <Text style={styles.evaluationTitle}>كيف كان تسميعك؟</Text>
                    <View style={styles.evaluationBtns}>
                      <TouchableOpacity
                        style={[
                          styles.evalBtn,
                          {
                            backgroundColor: Colors.error + "15",
                            borderColor: Colors.error,
                          },
                        ]}
                        onPress={() => handleResponse(false)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={Colors.error}
                        />
                        <Text
                          style={[styles.evalBtnText, { color: Colors.error }]}
                        >
                          غير متقن
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.evalBtn,
                          {
                            backgroundColor: Colors.success + "15",
                            borderColor: Colors.success,
                          },
                        ]}
                        onPress={() => handleResponse(true)}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={Colors.success}
                        />
                        <Text
                          style={[
                            styles.evalBtnText,
                            { color: Colors.success },
                          ]}
                        >
                          متقن جداً
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) => {
  const styles = {
    container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
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
    } as ViewStyle,
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: Colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    headerTitle: {
      fontFamily: Typography.heading,
      fontSize: 18,
      color: Colors.textPrimary,
    } as TextStyle,
    content: { padding: Spacing.xl, paddingBottom: 100 } as ViewStyle,
    quizWrapper: { gap: Spacing.lg } as ViewStyle,
    contextHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    } as ViewStyle,
    surahBadge: {
      backgroundColor: `${Colors.gold}12`,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${Colors.gold}20`,
    } as ViewStyle,
    surahBadgeText: {
      color: Colors.gold,
      fontSize: 13,
    } as TextStyle,
    infoText: {
      fontSize: 12,
      color: Colors.textSecondary,
    } as TextStyle,
    verseCard: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1.5,
      borderColor: Colors.border,
      alignItems: "center",
    } as ViewStyle,
    cardLabel: {
      fontSize: 13,
      color: Colors.primary,
      marginBottom: Spacing.lg,
      opacity: 0.8,
    } as TextStyle,
    verseUthmani: {
      fontFamily: Typography.quran,
      fontSize: 26,
      color: Colors.textPrimary,
      textAlign: "center",
      lineHeight: 48,
      marginBottom: Spacing.md,
    } as TextStyle,
    verseKey: {
      fontSize: 12,
      color: Colors.textTertiary,
      fontFamily: Typography.body,
    } as TextStyle,
    gapVisual: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: -Spacing.sm,
    } as ViewStyle,
    gapLine: {
      flex: 1,
      height: 2,
      backgroundColor: Colors.border,
      marginHorizontal: 10,
      borderStyle: "dashed",
    } as ViewStyle,
    gapIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${Colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    } as ViewStyle,
    actionArea: { marginTop: Spacing.xl } as ViewStyle,
    showAnswerBtn: {
      backgroundColor: Colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingVertical: 18,
      borderRadius: BorderRadius.xl,
    } as ViewStyle,
    showAnswerText: {
      color: "#FFF",
      fontSize: 16,
    } as TextStyle,
    answerSection: { gap: Spacing.md } as ViewStyle,
    answerHeader: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      paddingBottom: 10,
      marginBottom: 5,
    } as ViewStyle,
    answerTitle: {
      fontSize: 15,
      color: Colors.textPrimary,
      textAlign: "right",
    } as TextStyle,
    answerCloud: {
      backgroundColor: Colors.surfaceElevated,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    gapVerseText: {
      fontFamily: Typography.quran,
      fontSize: 22,
      color: Colors.textPrimary,
      textAlign: "center",
      lineHeight: 40,
      marginBottom: Spacing.md,
    } as TextStyle,
    resultActions: { marginTop: Spacing.lg, alignItems: "center" } as ViewStyle,
    nextBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: BorderRadius.lg,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    nextBtnText: { color: Colors.textPrimary } as TextStyle,
    progressHeader: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: Spacing.md,
    } as ViewStyle,
    progressText: {
      fontSize: 12,
      color: Colors.textSecondary,
      marginBottom: 4,
    } as TextStyle,
    progressBarBg: {
      width: "100%",
      height: 6,
      backgroundColor: Colors.border,
      borderRadius: 3,
      overflow: "hidden",
    } as ViewStyle,
    progressBarFill: {
      height: "100%",
      backgroundColor: Colors.primary,
    } as ViewStyle,
    quizInfoRow: {
      flexDirection: "row",
      gap: Spacing.lg,
      marginVertical: Spacing.xl,
    } as ViewStyle,
    quizInfoTag: {
      alignItems: "center",
      backgroundColor: Colors.surfaceElevated,
      padding: 12,
      borderRadius: 12,
      minWidth: 100,
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    quizInfoValue: {
      fontSize: 18,
      color: Colors.primary,
    } as TextStyle,
    quizInfoLabel: {
      fontSize: 10,
      color: Colors.textTertiary,
      marginTop: 2,
    } as TextStyle,
    scopeButtons: {
      width: "100%",
      gap: Spacing.md,
      marginTop: Spacing.lg,
    } as ViewStyle,
    scopeBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.border,
      gap: 16,
    } as ViewStyle,
    scopeIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    scopeTextWrap: { flex: 1, alignItems: "flex-start" } as ViewStyle,
    scopeTitle: {
      fontSize: 16,
      color: Colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,
    scopeSub: { fontSize: 12, color: Colors.textSecondary } as TextStyle,
    evaluationArea: {
      marginTop: Spacing.xl,
      padding: Spacing.lg,
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    evaluationTitle: {
      fontSize: 15,
      color: Colors.textPrimary,
      textAlign: "center",
      marginBottom: Spacing.lg,
    } as TextStyle,
    evaluationBtns: { flexDirection: "row", gap: Spacing.md } as ViewStyle,
    evalBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
    } as ViewStyle,
    evalBtnText: { fontSize: 14 } as TextStyle,
    resultCard: {
      alignItems: "center",
      padding: Spacing.xl,
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    resultIconBox: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.xl,
    } as ViewStyle,
    resultScoreText: {
      fontSize: 32,
      color: Colors.textPrimary,
    } as TextStyle,
    resultPctText: {
      fontSize: 18,
      color: Colors.primary,
      marginBottom: Spacing.lg,
    } as TextStyle,
    resultFeedback: {
      fontSize: 15,
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: Spacing["2xl"],
    } as TextStyle,
    loaderArea: {
      height: 400,
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.lg,
    } as ViewStyle,
    loaderText: { color: Colors.textSecondary, fontSize: 14 } as TextStyle,
    offlineWarning: {
      backgroundColor: `${Colors.primary}10`,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    } as ViewStyle,
    offlineTitle: {
      fontFamily: Typography.heading,
      fontSize: 14,
      color: Colors.textPrimary,
      textAlign: "right",
    } as TextStyle,
    offlineSub: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textSecondary,
      textAlign: "right",
      marginTop: 2,
    } as TextStyle,
    downloadBtn: {
      backgroundColor: Colors.primary,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    } as ViewStyle,
    downloadBtnText: {
      color: "#FFF",
      fontSize: 13,
    } as TextStyle,
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: Spacing.xl,
      gap: Spacing.lg,
    } as ViewStyle,
    emptyIconBox: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${Colors.primary}10`,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    emptyText: {
      fontSize: 22,
      color: Colors.textPrimary,
    } as TextStyle,
    emptySub: {
      fontSize: 15,
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    } as TextStyle,
    primaryBtn: {
      marginTop: Spacing.lg,
      paddingHorizontal: 32,
      paddingVertical: 14,
      backgroundColor: Colors.primary,
      borderRadius: BorderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    primaryBtnText: {
      color: "#FFF",
      fontSize: 16,
    } as TextStyle,
  };
  return StyleSheet.create(styles);
};
