import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppStore } from '../store/AppStore';
import { useSelectionStore } from '../store/selectionStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme, Typography, Spacing, BorderRadius, Shadow } from '../theme';
import { formatTime } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { TaskSelection } from '../types';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  interpolateColor,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type Phase = 'warmup' | 'repeating' | 'testing' | 'done';

const PHASES: Record<Phase, { title: string, desc: string, icon: string, color: string, gradient: [string, string] }> = {
  warmup: { title: 'التحضير السريع', desc: 'اقرأ الصفحة 3 مرات بتركيز كامل مع الاستمتاع بالتلاوة', icon: 'book', color: '#3498db', gradient: ['#3498db', '#2980b9'] },
  repeating: { title: 'مرحلة التكرار', desc: 'كرر الآيات الصعبة حتى ترسخ في الذاكرة القريبة', icon: 'refresh-circle', color: '#f39c12', gradient: ['#f39c12', '#e67e22'] },
  testing: { title: 'الاختبار النهائي', desc: 'اقرأ الصفحة كاملة غيباً دون النظر للمصحف', icon: 'shield-checkmark', color: '#2ecc71', gradient: ['#2ecc71', '#27ae60'] },
  done: { title: 'تم الحفظ!', desc: 'أحسنت! لقد ثبت حصنك اليوم بنجاح', icon: 'trophy', color: '#ffd700', gradient: ['#f1c40f', '#f39c12'] },
};

export default function MemorizationScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const { state, dispatch } = useAppStore();
  const selectionStore = useSelectionStore();
  const { plan } = state;

  const [phase, setPhase] = useState<Phase>('warmup');
  const [elapsed, setElapsed] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  
  const MIN_SECONDS = (state.settings.memorizationTimerMinutes || 15) * 60;
  
  const activeTask = selectionStore.getModuleSelections('memorization').find(s => !s.isCompleted);
  const getPagesFromTask = (task: TaskSelection | undefined) => {
    if (!task) {
      if (!plan) return [];
      const res = [];
      const dailyPages = state.user?.dailyPages ?? plan.pagesPerDay;
      for (let i = 0; i < dailyPages; i++) {
        const p = plan.currentPage + i;
        if (p <= plan.endPage) res.push(p);
      }
      return res;
    }
    const res: number[] = [];
    task.ranges.forEach(r => {
      for (let p = r.start; p <= r.end; p++) res.push(p);
    });
    return res;
  };

  const pages = getPagesFromTask(activeTask);

  // Reanimated values
  const bgIntensity = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const cardRotate = useSharedValue(0);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        progressValue.value = withTiming(Math.min(next / MIN_SECONDS, 1));
        return next;
      });
    }, 1000);
    
    bgIntensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      true
    );

    return () => clearInterval(timer);
  }, [MIN_SECONDS]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (state.settings.hapticsEnabled) {
      Haptics.impactAsync(style);
    }
  };

  const handleNextPhase = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    cardScale.value = withSequence(withTiming(0.95, { duration: 100 }), withSpring(1));

    if (phase === 'warmup') setPhase('repeating');
    else if (phase === 'repeating') setPhase('testing');
    else if (phase === 'testing') {
      if (elapsed < MIN_SECONDS) {
        Alert.alert('تمهل قليلاً', 'لم تنتهِ المدة الزمنية المخصصة للحفظ بعد. هل أنت متأكد من الإتقان؟', [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'نعم، أتقنت', onPress: completeSession }
        ]);
      } else {
        completeSession();
      }
    }
  };

  const completeSession = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    if (pages.length > 0) {
      selectionStore.markPagesMemorized(pages);
      if (activeTask) selectionStore.completeTaskSelection(activeTask.id);
      dispatch({ type: 'MARK_PAGES_MEMORIZED', payload: { pages } });
      dispatch({ type: 'TOGGLE_FORTRESS', payload: { fortressId: 'memorization' } });
    }
    setPhase('done');
  };

  const currentPhaseInfo = PHASES[phase];

  const animatedBackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        bgIntensity.value,
        [0, 1],
        [`${currentPhaseInfo.color}05`, `${currentPhaseInfo.color}15`]
      ),
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: cardScale.value },
        { rotateZ: `${cardRotate.value}deg` }
      ],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[StyleSheet.absoluteFill, animatedBackStyle]} />
      <LinearGradient colors={['transparent', Colors.background]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Text style={styles.timerValue}>{formatTime(elapsed)}</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressIndicator, progressStyle, { backgroundColor: currentPhaseInfo.color }]} />
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Phase Header */}
        <View style={styles.phaseNav}>
          {(['warmup', 'repeating', 'testing'] as Phase[]).map((p, i) => (
            <View key={p} style={styles.phaseNavItem}>
              <View style={[styles.phaseCircle, { 
                backgroundColor: phase === p ? PHASES[p].color : Colors.borderLight,
                borderColor: phase === p ? `${PHASES[p].color}40` : 'transparent',
                borderWidth: phase === p ? 4 : 0
              }]}>
                <Ionicons name={PHASES[p].icon as any} size={14} color={phase === p ? '#FFF' : Colors.textTertiary} />
              </View>
              {i < 2 && <View style={styles.phaseConnector} />}
            </View>
          ))}
        </View>

        {/* Main Card */}
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <LinearGradient 
            colors={[`${currentPhaseInfo.color}15`, 'transparent']} 
            style={styles.cardGradient}
          />
          
          <View style={[styles.iconContainer, { shadowColor: currentPhaseInfo.color }]}>
            <Ionicons name={currentPhaseInfo.icon as any} size={48} color={currentPhaseInfo.color} />
          </View>

          <Text style={[styles.title, { color: currentPhaseInfo.color }]}>{currentPhaseInfo.title}</Text>
          <Text style={styles.description}>{currentPhaseInfo.desc}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>الصفحات</Text>
              <Text style={styles.statMain}>{pages.join(', ') || '—'}</Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>المؤقت</Text>
              <Text style={styles.statMain}>{Math.ceil(MIN_SECONDS / 60)}د</Text>
            </View>
          </View>

          {phase === 'repeating' && (
            <View style={styles.counterSection}>
              <Text style={styles.counterHint}>سجل تكرارك الآلي</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity 
                  style={styles.controlBtn} 
                  onPress={() => {
                    setRepeatCount(Math.max(0, repeatCount - 1));
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons name="remove" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
                <View style={styles.countDisplay}>
                  <Text style={styles.countNum}>{repeatCount}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.controlBtn, { backgroundColor: Colors.primary }]} 
                  onPress={() => {
                    setRepeatCount(repeatCount + 1);
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                    cardRotate.value = withSequence(withTiming(2, { duration: 50 }), withTiming(-2, { duration: 50 }), withTiming(0));
                  }}
                >
                  <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {phase === 'done' && (
            <View style={styles.completionContainer}>
              <Ionicons name="star" size={32} color={Colors.gold} />
              <Text style={styles.completionText}>إنجاز رائع!</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.actionSection}>
          {phase !== 'done' ? (
            <TouchableOpacity 
              style={[styles.mainAction, { backgroundColor: currentPhaseInfo.color }]} 
              onPress={handleNextPhase}
            >
              <Text style={styles.actionLabel}>
                {phase === 'testing' ? 'تأكيد الحفظ النهائي' : 'المرحلة التالية'}
              </Text>
              <Ionicons name="chevron-back" size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <PrimaryButton label="تم الحفظ والعودة" onPress={() => router.back()} />
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.glass, borderRadius: 12 },
  timerContainer: { 
    flex: 1, 
    marginHorizontal: Spacing.xl, 
    alignItems: 'center',
    gap: 6
  },
  timerValue: { 
    fontSize: Typography.lg, 
    fontWeight: Typography.bold, 
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1
  },
  progressTrack: {
    width: 120,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressIndicator: {
    height: '100%',
    borderRadius: 2,
  },

  scrollContent: { padding: Spacing.xl, alignItems: 'center' },

  phaseNav: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl * 1.5 },
  phaseNavItem: { flexDirection: 'row', alignItems: 'center' },
  phaseCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  phaseConnector: { width: 30, height: 2, backgroundColor: Colors.borderLight, marginHorizontal: 8 },

  card: {
    width: '100%',
    backgroundColor: Colors.glass,
    borderRadius: 32,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  cardGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  iconContainer: { 
    width: 90, 
    height: 90, 
    borderRadius: 30, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8
  },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: Spacing.sm },
  description: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10, marginBottom: Spacing.xl * 1.5 },

  statsContainer: { 
    flexDirection: 'row', 
    width: '100%', 
    backgroundColor: Colors.surface, 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 10, color: Colors.textTertiary, textTransform: 'uppercase' },
  statMain: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLine: { width: 1, height: '60%', backgroundColor: Colors.borderLight },

  counterSection: { width: '100%', alignItems: 'center', gap: Spacing.md },
  counterHint: { fontSize: Typography.xs, color: Colors.textSecondary },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  controlBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 18, 
    backgroundColor: Colors.surface, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border
  },
  countDisplay: { minWidth: 60, alignItems: 'center' },
  countNum: { fontSize: 32, fontWeight: Typography.bold, color: Colors.textPrimary },

  completionContainer: { alignItems: 'center', gap: 8 },
  completionText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.gold },

  actionSection: { width: '100%', marginTop: Spacing.xl * 1.5 },
  mainAction: { 
    width: '100%', 
    height: 56, 
    borderRadius: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 12,
    ...Shadow.md
  },
  actionLabel: { color: '#FFF', fontSize: Typography.md, fontWeight: Typography.bold },
});
