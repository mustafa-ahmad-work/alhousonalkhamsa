import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/AppStore';
import { useTheme, Typography, Spacing, BorderRadius, Shadow } from '../theme';
import { MemorizationStrength } from '../types';
import {
  getDailyCompletionPercent,
  getXPProgressToNextLevel,
} from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { JUZ_META, SURAHS } from '../data/quranMeta';

const { width } = Dimensions.get('window');

const getStrengthColors = (Colors: any): Record<MemorizationStrength, string> => ({
  1: Colors.red,
  2: Colors.strength2,
  3: Colors.gold,
  4: Colors.strength4,
  5: Colors.primary,
});

export default function ProgressScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const STRENGTH_COLORS = React.useMemo(() => getStrengthColors(Colors), [Colors]);

  const { state, getMemorizedPages, getPagesDue } = useAppStore();
  const { user, plan, dailyProgress, streak } = state;
  const memorizedPages = getMemorizedPages();
  const pagesDue = getPagesDue();

  const xpProgress = getXPProgressToNextLevel(user?.totalXP ?? 0);

  // Last 7 days completion
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const progress = dailyProgress.find((p) => p.date === dateStr);
    const pct = progress ? getDailyCompletionPercent(progress) : 0;
    const dayName = date.toLocaleDateString('ar-EG', { weekday: 'short' });
    return { date: dateStr, pct, dayName };
  });

  // Strength distribution
  const strengthDist: Record<MemorizationStrength, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  memorizedPages.forEach((p) => {
    strengthDist[p.strength as MemorizationStrength]++;
  });

  const totalPages = plan ? plan.endPage - plan.startPage + 1 : 604;
  const planPct = totalPages > 0 ? memorizedPages.length / totalPages : 0;

  const totalXP = user?.totalXP ?? 0;

  // Juz progress calculation
  const juzProgress = JUZ_META.map(juz => {
    const pagesInJuz = Array.from({ length: juz.endPage - juz.startPage + 1 }, (_, i) => juz.startPage + i);
    const memorizedInJuz = pagesInJuz.filter(p => memorizedPages.some(mp => mp.pageNumber === p));
    const pct = memorizedInJuz.length / pagesInJuz.length;
    return { ...juz, pct };
  });

  // Surah progress calculation
  const surahProgress = SURAHS.slice(0, 15).map(surah => {
    const pagesInSurah = Array.from({ length: surah.endPage - surah.startPage + 1 }, (_, i) => surah.startPage + i);
    const memorizedInSurah = pagesInSurah.filter(p => memorizedPages.some(mp => mp.pageNumber === p));
    const pct = memorizedInSurah.length / pagesInSurah.length;
    return { ...surah, pct };
  }).filter(s => s.pct > 0 || (s.id <= 3)); 

  // Completion Estimation
  const pagesCount = memorizedPages.length;
  const streakCount = Math.max(streak.currentStreak, 1);
  const avgPagesPerDay = pagesCount / streakCount;
  const remaining = totalPages - pagesCount;
  const daysLeft = avgPagesPerDay > 0 ? Math.ceil(remaining / avgPagesPerDay) : remaining;
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysLeft);

  // Fortress consistency
  const fortressStats = [
    { id: 'recitation', label: 'التلاوة', color: Colors.fortressRecitation, count: dailyProgress.filter(p => p.recitation).length },
    { id: 'listening', label: 'الاستماع', color: Colors.blue, count: dailyProgress.filter(p => p.listening).length },
    { id: 'preparation', label: 'التهيؤ', color: Colors.fortressPreparation, count: dailyProgress.filter(p => p.preparation).length },
    { id: 'memorization', label: 'الحفظ', color: Colors.fortressMemorization, count: dailyProgress.filter(p => p.memorization).length },
    { id: 'review', label: 'المراجعة', color: Colors.fortressReview, count: dailyProgress.filter(p => p.shortReview || p.longReview).length },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>تحليلات متقدمة</Text>
        <Text style={styles.headerSubtitle}>رؤية شاملة لرحلة الحفظ</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Level & XP */}
        <View style={styles.levelCard}>
          <LinearGradient
            colors={[`${Colors.primary}12`, `${Colors.primary}04`]}
            style={styles.levelGradient}
          >
            <View style={styles.levelLeft}>
              <Ionicons name="medal-outline" size={32} color={Colors.gold} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{user?.title ?? 'مبتدئ'}</Text>
              <Text style={styles.levelSubtitle}>المستوى {Math.floor(totalXP / 1000) + 1}</Text>
              <View style={styles.xpBar}>
                <View style={styles.xpBarBg}>
                  <View
                    style={[
                      styles.xpBarFill,
                      { width: `${xpProgress.percentage * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.xpText}>{xpProgress.current} / {xpProgress.required} XP للترقية</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'الختم المتوقع', value: finishDate.toLocaleDateString('ar-EG', { month: 'short', year: '2-digit' }), icon: 'calendar', color: Colors.primary },
            { label: 'معدل الحفظ', value: `${avgPagesPerDay.toFixed(1)} ص/ي`, icon: 'trending-up', color: Colors.success },
            { label: 'الصفحات', value: `${memorizedPages.length}`, icon: 'book', color: Colors.purple },
            { label: 'السلسلة', value: `${streak.currentStreak} يوم`, icon: 'flame', color: Colors.gold },
          ].map((item, i) => (
            <View key={i} style={styles.gridCard}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={[styles.gridValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Advanced Progress Chart (Placeholder-like bar) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مؤشرات الإنجاز</Text>
          <View style={styles.advancedCard}>
            <View style={styles.advancedHeader}>
              <View>
                <Text style={styles.advancedTitle}>نسبة الإتمام الكلية</Text>
                <Text style={styles.advancedSub}>{Math.round(planPct * 100)}% من الورق الكلي</Text>
              </View>
              <Text style={styles.advancedBigPct}>{Math.round(planPct * 100)}%</Text>
            </View>
            <View style={styles.bigBarBg}>
              <View style={[styles.bigBarFill, { width: `${planPct * 100}%` }]} />
            </View>
            <View style={styles.advancedMetaRow}>
              <View style={styles.metaItem}>
                <View style={[styles.metaDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.metaText}>محفوظ: {memorizedPages.length}</Text>
              </View>
              <View style={styles.metaItem}>
                <View style={[styles.metaDot, { backgroundColor: Colors.border }]} />
                <Text style={styles.metaText}>متبقي: {remaining}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Juz completion Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خريطة الأجزاء (30 جزء)</Text>
          <View style={styles.juzGrid}>
            {juzProgress.map((j) => (
              <View key={j.id} style={styles.juzBox}>
                <View 
                  style={[
                    styles.juzCheck, 
                    { 
                      backgroundColor: j.pct >= 1 ? Colors.primary : j.pct > 0 ? `${Colors.primary}40` : Colors.borderLight,
                      borderColor: j.pct > 0 ? Colors.primary : Colors.border
                    }
                  ]}
                >
                  <Text style={[styles.juzNumber, j.pct >= 0.5 && { color: '#fff' }]}>{j.id}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Surah Progress List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تقدم السور الأساسية</Text>
          <View style={styles.surahCard}>
            {surahProgress.map((surah) => (
              <View key={surah.id} style={styles.surahRow}>
                <View style={styles.surahHeader}>
                  <Text style={styles.surahName}>{surah.nameAr}</Text>
                  <Text style={styles.surahPctText}>{Math.round(surah.pct * 100)}%</Text>
                </View>
                <View style={styles.surahBarBg}>
                  <View 
                    style={[
                      styles.surahBarFill, 
                      { 
                        width: `${surah.pct * 100}%`, 
                        backgroundColor: surah.pct === 1 ? Colors.success : Colors.primary 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Fortress Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أداء الحصون</Text>
          <View style={styles.fortressStatsRow}>
            {fortressStats.map((fs) => (
              <View key={fs.id} style={styles.fortressStatCard}>
                <View style={[styles.fortressStatIcon, { backgroundColor: `${fs.color}15` }]}>
                  <Text style={[styles.fortressStatCount, { color: fs.color }]}>{fs.count}</Text>
                </View>
                <Text style={styles.fortressStatLabel}>{fs.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Strength Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ميزان القوة</Text>
          <View style={styles.strengthCard}>
            {([5, 4, 3, 2, 1] as MemorizationStrength[]).map((s) => {
              const count = strengthDist[s];
              const pct = memorizedPages.length > 0 ? count / memorizedPages.length : 0;
              const labels: Record<MemorizationStrength, string> = {
                1: 'تحتاج إعادة', 2: 'غير مستقرة', 3: 'متوسطة', 4: 'قوية', 5: 'راسخة'
              };
              return (
                <View key={s} style={styles.strengthRow}>
                  <Text style={styles.strengthLabel}>{labels[s]}</Text>
                  <View style={styles.strengthBarBg}>
                    <View style={[styles.strengthBarFill, { width: `${pct * 100}%`, backgroundColor: STRENGTH_COLORS[s] }]} />
                  </View>
                  <Text style={styles.strengthValueText}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  headerTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'left' },
  headerSubtitle: { fontSize: Typography.sm, color: Colors.textTertiary, textAlign: 'left', marginTop: 3 },
  scroll: { padding: Spacing.base, gap: Spacing.lg },

  levelCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: `${Colors.primary}15` },
  levelGradient: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.base },
  levelLeft: { backgroundColor: `${Colors.primary}0A`, width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${Colors.primary}10` },
  levelInfo: { flex: 1, alignItems: 'flex-start', gap: 4 },
  levelTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  levelSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary },
  xpBar: { width: '100%', gap: 4, marginTop: 4 },
  xpBarBg: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  xpText: { fontSize: 10, color: Colors.textTertiary },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gridCard: { width: (width - Spacing.base * 2 - Spacing.sm) / 2, backgroundColor: Colors.glass, borderRadius: BorderRadius.lg, padding: Spacing.base, gap: 4, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center' },
  gridValue: { fontSize: Typography.base, fontWeight: Typography.bold },
  gridLabel: { fontSize: 10, color: Colors.textTertiary, textAlign: 'center' },

  section: { gap: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'left', paddingHorizontal: 4 },

  advancedCard: { backgroundColor: Colors.glass, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.glassBorder, gap: Spacing.md },
  advancedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  advancedTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  advancedSub: { fontSize: Typography.xs, color: Colors.textSecondary },
  advancedBigPct: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.primary },
  bigBarBg: { height: 10, backgroundColor: Colors.borderLight, borderRadius: 5, overflow: 'hidden' },
  bigBarFill: { height: 10, backgroundColor: Colors.primary, borderRadius: 5 },
  advancedMetaRow: { flexDirection: 'row', gap: Spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaDot: { width: 8, height: 8, borderRadius: 4 },
  metaText: { fontSize: 11, color: Colors.textSecondary },

  juzGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', backgroundColor: Colors.glass, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.glassBorder },
  juzBox: { width: (width - Spacing.xl * 2 - 80) / 6, alignItems: 'center' },
  juzCheck: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  juzNumber: { fontSize: 13, fontWeight: Typography.bold, color: Colors.textSecondary },

  surahCard: { backgroundColor: Colors.glass, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.glassBorder, gap: Spacing.md },
  surahRow: { gap: 6 },
  surahHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  surahName: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  surahPctText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.bold },
  surahBarBg: { height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, overflow: 'hidden' },
  surahBarFill: { height: 4, borderRadius: 2 },

  fortressStatsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  fortressStatCard: { flex: 1, minWidth: '30%', backgroundColor: Colors.glass, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs, borderWidth: 1, borderColor: Colors.glassBorder },
  fortressStatIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  fortressStatCount: { fontSize: Typography.md, fontWeight: Typography.bold },
  fortressStatLabel: { fontSize: 10, color: Colors.textSecondary },

  strengthCard: { backgroundColor: Colors.glass, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.glassBorder, gap: Spacing.sm },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  strengthLabel: { width: 64, fontSize: 10, color: Colors.textSecondary, textAlign: 'left' },
  strengthBarBg: { flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  strengthBarFill: { height: 6, borderRadius: 3 },
  strengthValueText: { width: 20, fontSize: 11, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
});
