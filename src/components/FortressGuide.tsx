import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Spacing, BorderRadius } from '../theme';
import { FiveFortressService } from '../store/FiveFortressService';
import { Plan, PageProgress } from '../types';

type FortressGuideProps = {
  plan: Plan | null;
  pageProgress: PageProgress[];
};

export function FortressGuide({ plan, pageProgress }: FortressGuideProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  
  // Calculate day index from plan start date (or today if no plan)
  const dayIndex = plan ? FiveFortressService.getDayIndex(plan.startDate) : 0;
  
  const khatmaRec = FiveFortressService.getKhatmaRecitationPages(dayIndex);
  const khatmaList = FiveFortressService.getKhatmaListeningPages(dayIndex);
  const weeklyPrep = FiveFortressService.getWeeklyPrepPages(plan);
  const nightPrep = FiveFortressService.getNightPrepPage(plan);
  const nearReview = FiveFortressService.getNearReviewPages(pageProgress);

  const GuideItem = ({ 
    title, 
    subtitle, 
    icon, 
    color, 
  }: { 
    title: string; 
    subtitle: string; 
    icon: string; 
    color: string;
  }) => (
    <View style={styles.item}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>خطة اليوم (الحصون الخمسة)</Text>
        <Text style={styles.dayBadge}>اليوم {dayIndex + 1}</Text>
      </View>

      <View style={styles.list}>
        <GuideItem 
          title="ختمة التلاوة (الحصن 1)"
          subtitle={`من صفحة ${khatmaRec.start} إلى ${khatmaRec.end}`}
          icon="book-outline"
          color={Colors.fortressRecitation}
        />
        
        <GuideItem 
          title="ختمة الاستماع (الحصن 1)"
          subtitle={`من صفحة ${khatmaList.start} إلى ${khatmaList.end}`}
          icon="headset-outline"
          color={Colors.blue}
        />

        {weeklyPrep && (
          <GuideItem 
            title="التحضير الأسبوعي (الحصن 2)"
            subtitle={`من صفحة ${weeklyPrep.start} إلى ${weeklyPrep.end}`}
            icon="calendar-outline"
            color={Colors.fortressPreparation}
          />
        )}

        {nightPrep && (
          <GuideItem 
            title="التحضير الليلي (الحصن 2)"
            subtitle={`صفحة غدًا هي ${nightPrep}`}
            icon="moon-outline"
            color={Colors.purple}
          />
        )}

        <GuideItem 
          title="الحفظ الجديد (الحصن 3)"
          subtitle={plan ? `من صفحة ${plan.currentPage} إلى ${plan.currentPage + plan.pagesPerDay - 1}` : "لم يتم تحديد الخطة"}
          icon="shield-checkmark-outline"
          color={Colors.fortressMemorization}
        />

        {nearReview.length > 0 && (
          <GuideItem 
            title="المراجعة القريبة (الحصن 4)"
            subtitle={`مراجعة آخر ${nearReview.length} صفحة محفوظة`}
            icon="sync-outline"
            color={Colors.fortressReview}
          />
        )}
      </View>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  dayBadge: {
    fontSize: 10,
    color: Colors.textSecondary,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  list: {
    gap: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
