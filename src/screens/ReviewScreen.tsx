import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppStore } from '../store/AppStore';
import { useSelectionStore } from '../store/selectionStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme, Typography, Spacing, BorderRadius, Shadow } from '../theme';
import { PageProgress, MemorizationStrength, TaskSelection } from '../types';
import { getNextReviewDate, strengthAfterReview, todayISO, getPagesDueForReview } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { FiveFortressService } from '../store/FiveFortressService';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  interpolateColor,
  withSequence
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type ReviewMode = 'select' | 'reviewing' | 'done';

const getStrengthLabels = (Colors: any): Record<
  MemorizationStrength,
  { label: string; color: string; icon: string }
> => ({
  1: { label: 'ضعيف جداً', color: Colors.red, icon: 'sad-outline' },
  2: { label: 'ضعيف', color: Colors.warning, icon: 'warning-outline' },
  3: { label: 'متوسط', color: Colors.blue, icon: 'thumbs-up-outline' },
  4: { label: 'جيد', color: Colors.primary, icon: 'happy-outline' },
  5: { label: 'ممتاز', color: Colors.primaryDark, icon: 'star-outline' },
});

export default function ReviewScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const STRENGTH_LABELS = React.useMemo(() => getStrengthLabels(Colors), [Colors]);

  const { state, dispatch } = useAppStore();
  const selectionStore = useSelectionStore();
  const memorizedPages = state.pageProgress;
  const pagesDue = getPagesDueForReview(state.pageProgress);

  const [mode, setMode] = useState<ReviewMode>('select');
  const [reviewType, setReviewType] = useState<'short' | 'long'>('short');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionResults, setSessionResults] = useState<{ page: number, oldS: number, newS: number }[]>([]);

  // Reanimated values
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const progressValue = useSharedValue(0);

  // Filter pages for review
  const shortReviewPages = FiveFortressService.getNearReviewPages(memorizedPages)
    .map((pageNum) => memorizedPages.find((p) => p.pageNumber === pageNum)!)
    .filter(Boolean);

  const longReviewPages = pagesDue;

  const currentPages = reviewType === 'short' ? shortReviewPages : longReviewPages;
  const currentPage = currentPages[currentReviewIndex];

  useEffect(() => {
    if (mode === 'reviewing') {
      progressValue.value = withTiming(currentReviewIndex / currentPages.length);
    }
  }, [currentReviewIndex, mode]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (state.settings.hapticsEnabled) {
      Haptics.impactAsync(style);
    }
  };

  const handleStartReview = (type: 'short' | 'long') => {
    const list = type === 'short' ? shortReviewPages : longReviewPages;
    if (list.length === 0) {
      Alert.alert('منجز!', 'لا توجد صفحات تحتاج للمراجعة في هذا القسم حالياً.');
      return;
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setReviewType(type);
    setCurrentReviewIndex(0);
    setReviewedCount(0);
    setMode('reviewing');
    setSessionResults([]);
  };

  const handleRate = (strength: MemorizationStrength) => {
    if (!currentPage) return;

    triggerHaptic(strength >= 4 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    
    const passed = strength >= 3;
    const oldS = currentPage.strength;
    const newS = strengthAfterReview(oldS, passed);

    setSessionResults(prev => [...prev, { page: currentPage.pageNumber, oldS, newS }]);
    selectionStore.reviewPage(currentPage.pageNumber, passed);
    dispatch({ type: 'REVIEW_PAGE', payload: { pageNumber: currentPage.pageNumber, passed } });

    setReviewedCount((c) => c + 1);

    if (currentReviewIndex < currentPages.length - 1) {
      cardOpacity.value = withSequence(withTiming(0, { duration: 150 }), withTiming(1, { duration: 250 }));
      cardScale.value = withSequence(withTiming(0.9, { duration: 150 }), withSpring(1));
      setTimeout(() => setCurrentReviewIndex(i => i + 1), 150);
    } else {
      setMode('done');
      if (reviewType === 'short') {
        const activeShortTask = selectionStore.getModuleSelections('review_short').find(s => !s.isCompleted);
        if (activeShortTask) selectionStore.completeTaskSelection(activeShortTask.id);
        dispatch({ type: 'TOGGLE_FORTRESS', payload: { fortressId: 'review' } });
      } else {
        const activeLongTask = selectionStore.getModuleSelections('review_long').find(s => !s.isCompleted);
        if (activeLongTask) selectionStore.completeTaskSelection(activeLongTask.id);
      }
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => mode === 'reviewing' ? setMode('select') : router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>بيئة المراجعة</Text>
        <View style={{ width: 40 }} />
      </View>

      {mode === 'select' && (
        <ScrollView contentContainerStyle={styles.selectContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>اختر وردك</Text>
            <Text style={styles.introDesc}>المراجعة هي أساس التثبيت والاستمرار</Text>
          </View>

          <View style={styles.modeGrid}>
            <TouchableOpacity style={styles.modeCard} onPress={() => handleStartReview('short')}>
              <LinearGradient colors={[`${Colors.primary}15`, `${Colors.primary}05`]} style={styles.modeCardContent}>
                <View style={[styles.modeIcon, { backgroundColor: `${Colors.primary}10` }]}>
                  <Ionicons name="flash" size={26} color={Colors.primary} />
                </View>
                <View style={styles.modeCardInfo}>
                  <Text style={styles.modeTitle}>المراجعة القريبة</Text>
                  <Text style={styles.modeDesc} numberOfLines={2}>تثبيت الصفحات التي حفظتها مؤخراً</Text>
                  <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.badgeText}>{shortReviewPages.length} صفحة</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modeCard} onPress={() => handleStartReview('long')}>
              <LinearGradient colors={[`${Colors.purple}15`, `${Colors.purple}05`]} style={styles.modeCardContent}>
                <View style={[styles.modeIcon, { backgroundColor: `${Colors.purple}10` }]}>
                  <Ionicons name="infinite" size={26} color={Colors.purple} />
                </View>
                <View style={styles.modeCardInfo}>
                  <Text style={styles.modeTitle}>المراجعة العميقة</Text>
                  <Text style={styles.modeDesc} numberOfLines={2}>تنشيط المحفوظ القديم وربط الأجزاء</Text>
                  <View style={[styles.badge, { backgroundColor: Colors.purple }]}>
                    <Text style={styles.badgeText}>{longReviewPages.length} صفحة</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {mode === 'reviewing' && currentPage && (
        <ScrollView contentContainerStyle={styles.reviewContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
            </View>
            <Text style={styles.progressStatus}>{currentReviewIndex + 1} / {currentPages.length}</Text>
          </View>

          <Animated.View style={[styles.reviewCard, animatedCardStyle]}>
            <View style={styles.pageInfo}>
              <Text style={styles.pageLabel}>الصفحة</Text>
              <Text style={styles.pageValue}>{currentPage.pageNumber}</Text>
              <View style={[styles.strengthPill, { backgroundColor: `${STRENGTH_LABELS[currentPage.strength as MemorizationStrength].color}15` }]}>
                <Ionicons name={STRENGTH_LABELS[currentPage.strength as MemorizationStrength].icon as any} size={14} color={STRENGTH_LABELS[currentPage.strength as MemorizationStrength].color} />
                <Text style={[styles.strengthText, { color: STRENGTH_LABELS[currentPage.strength as MemorizationStrength].color }]}>
                  {STRENGTH_LABELS[currentPage.strength as MemorizationStrength].label}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>كيف كان أداء تسميعك؟</Text>
              <View style={styles.ratingRow}>
                {([1, 2, 3, 4, 5] as MemorizationStrength[]).map((s) => (
                  <TouchableOpacity key={s} style={styles.rateBtn} onPress={() => handleRate(s)}>
                    <View style={[styles.rateIcon, { backgroundColor: `${STRENGTH_LABELS[s].color}12` }]}>
                      <Ionicons name={STRENGTH_LABELS[s].icon as any} size={22} color={STRENGTH_LABELS[s].color} />
                    </View>
                    <Text style={[styles.rateLabel, { color: STRENGTH_LABELS[s].color }]}>{STRENGTH_LABELS[s].label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          <Text style={styles.hint}>اقرأ الصفحة كاملة غيباً قبل التقييم</Text>
        </ScrollView>
      )}

      {mode === 'done' && (
        <ScrollView contentContainerStyle={styles.doneContainer} showsVerticalScrollIndicator={false}>
          <Ionicons name="sparkles" size={60} color={Colors.primary} />
          <Text style={styles.doneTitle}>مبارك التثبيت!</Text>
          <Text style={styles.doneText}>لقد أتممت مراجعة ورد اليوم. استمرارك هو الحصن المنيع.</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>ملخص الجلسة</Text>
            {sessionResults.map((r, i) => (
              <View key={i} style={styles.sumRow}>
                <Text style={styles.sumPage}>صفحة {r.page}</Text>
                <View style={styles.sumMove}>
                  <Text style={{ fontSize: 10, color: STRENGTH_LABELS[r.oldS as MemorizationStrength].color }}>{STRENGTH_LABELS[r.oldS as MemorizationStrength].label}</Text>
                  <Ionicons name="arrow-back" size={12} color={Colors.textTertiary} />
                  <Text style={{ fontSize: 10, color: STRENGTH_LABELS[r.newS as MemorizationStrength].color, fontWeight: 'bold' }}>{STRENGTH_LABELS[r.newS as MemorizationStrength].label}</Text>
                </View>
              </View>
            ))}
          </View>

          <PrimaryButton label="تم والعودة للرئيسية" onPress={() => router.back()} style={{ width: '100%', marginTop: 20 }} />
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  countNum: { fontSize: 32, fontWeight: Typography.bold, color: Colors.textPrimary },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.glass, borderRadius: 12 },

  selectContainer: { padding: Spacing.xl },
  introBox: { marginBottom: Spacing.xl, alignItems: 'flex-start' },
  introTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  introDesc: { fontSize: Typography.sm, color: Colors.textSecondary },

  modeGrid: { gap: Spacing.md },
  modeCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder },
  modeCardContent: { padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  modeIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modeCardInfo: { flex: 1, alignItems: 'flex-start', gap: 2 },
  modeTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  modeDesc: { fontSize: Typography.xs, color: Colors.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  badgeText: { fontSize: 9, color: '#FFF', fontWeight: 'bold' },

  reviewContainer: { padding: Spacing.xl, gap: Spacing.xl },
  progressSection: { gap: 8 },
  progressTrack: { height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary },
  progressStatus: { fontSize: 10, color: Colors.textSecondary, textAlign: 'right', fontWeight: 'bold' },

  reviewCard: { backgroundColor: Colors.glass, borderRadius: 32, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center', gap: Spacing.xl, ...Shadow.md },
  pageInfo: { alignItems: 'center', gap: 4 },
  pageLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: 'bold' },
  pageValue: { fontSize: 80, color: Colors.primary, fontWeight: Typography.bold },
  strengthPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  strengthText: { fontSize: 10, fontWeight: 'bold' },

  divider: { width: '100%', height: 1, backgroundColor: Colors.borderLight },

  ratingSection: { width: '100%', alignItems: 'center', gap: Spacing.lg },
  ratingTitle: { fontSize: Typography.sm, fontWeight: 'bold', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  rateBtn: { alignItems: 'center', gap: 6, width: (width - 120) / 3 },
  rateIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rateLabel: { fontSize: 9, fontWeight: 'bold' },
  hint: { fontSize: Typography.xs, color: Colors.textTertiary, fontStyle: 'italic', textAlign: 'center' },

  doneContainer: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  doneTitle: { fontSize: Typography.xl, fontWeight: 'bold', color: Colors.textPrimary },
  doneText: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  summaryCard: { width: '100%', backgroundColor: Colors.glass, borderRadius: 20, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.glassBorder },
  summaryTitle: { fontSize: Typography.sm, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12, textAlign: 'center' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  sumPage: { fontSize: Typography.sm, color: Colors.textSecondary },
  sumMove: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
