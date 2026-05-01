import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import quranData from '../../data/quran_pages.json';
import { getMushafEdition } from '../../data/mushafEditions';
import { getSurahById, SURAHS } from '../../data/quranMeta';
import { useAppStore } from '../../store/AppStore';
import { BorderRadius, Shadow, Spacing, Typography, useTheme } from '../../theme';
import { TaskSelection } from '../../types';
import { formatTime, toArabicNumerals } from '../../utils/helpers';

type TaskTimerProps = {
  initialSeconds: number;
  onFinish: () => void;
  onClose: () => void;
  title: string;
  task?: TaskSelection;
  showRepetition?: boolean;
  showControls?: boolean;
  showSetup?: boolean;
};

const STROKE_WIDTH = 12;

export function TaskTimer({ 
  initialSeconds, 
  onFinish, 
  onClose, 
  title, 
  task, 
  showRepetition = true,
  showControls = true,
  showSetup = true
}: TaskTimerProps) {
  const Colors = useTheme();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // New States for enhanced session control
  const [currentRep, setCurrentRep] = useState(0);
  const [currentAyah, setCurrentAyah] = useState<{surahId: number, ayah: number} | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [pageRange, setPageRange] = useState<{min: number, max: number}>({ min: 1, max: 604 });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { state } = useAppStore();
  const { settings } = state;

  // Initialize from task if available
  useEffect(() => {
    if (task && task.ranges.length > 0) {
      const editionId = settings.mushafEdition || 'madani_604';
      const edition = getMushafEdition(editionId as any);

      const firstRange = task.ranges[0];
      if (firstRange.type === 'surah' && firstRange.surahId) {
        setCurrentAyah({ surahId: firstRange.surahId, ayah: firstRange.startAyah || 1 });
      }
      
      // Calculate min/max pages from all ranges using the current edition
      const allPages: number[] = [];
      task.ranges.forEach(r => {
        if (r.type === 'page') {
          for (let p = r.start; p <= r.end; p++) allPages.push(p);
        } else if (r.type === 'surah' && r.surahId) {
          const range = edition.surahPages[r.surahId];
          if (range) {
            for (let p = range[0]; p <= range[1]; p++) allPages.push(p);
          }
        }
      });

      if (allPages.length > 0) {
        const minP = Math.min(...allPages);
        const maxP = Math.max(...allPages);
        setPageRange({ min: minP, max: maxP });
        setCurrentPage(minP);
      } else {
        // Fallback to standard range if no pages calculated
        setPageRange({ min: 1, max: edition.totalPages });
        setCurrentPage(1);
      }
    }
  }, [task, settings.mushafEdition]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      Vibration.vibrate([0, 500, 200, 500]);
      onFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  // Track ayahs for the current page
  useEffect(() => {
    if (currentPage) {
      const pageVerses = (quranData as any)[currentPage.toString()];
      if (pageVerses && pageVerses.length > 0) {
        const firstVerse = pageVerses[0];
        const [sId, aNum] = firstVerse.verse_key.split(':').map(Number);
        
        // Only reset if the current ayah is not on this page
        const isCurrentAyahOnPage = pageVerses.some((v: any) => v.verse_key === `${currentAyah?.surahId}:${currentAyah?.ayah}`);
        
        if (!isCurrentAyahOnPage) {
          setCurrentAyah({ surahId: sId, ayah: aNum });
        }
      }
    }
  }, [currentPage]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
    setIsFinished(false);
    setCurrentRep(0);
    if (pageRange.min) setCurrentPage(pageRange.min);
  };

  const percentage = initialSeconds > 0 ? seconds / initialSeconds : 0;
  
  // SVG Progress calculation
  const size = 260;
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  const handleNextAyah = () => {
    if (!currentPage) return;
    const pageVerses = (quranData as any)[currentPage.toString()];
    if (!pageVerses) return;

    setCurrentAyah(prev => {
      if (!prev) return { surahId: 1, ayah: 1 };
      
      const currentIndex = pageVerses.findIndex((v: any) => v.verse_key === `${prev.surahId}:${prev.ayah}`);
      if (currentIndex !== -1 && currentIndex < pageVerses.length - 1) {
        const nextVerse = pageVerses[currentIndex + 1];
        const [sId, aNum] = nextVerse.verse_key.split(':').map(Number);
        return { surahId: sId, ayah: aNum };
      }
      return prev; // Stay at last ayah of page
    });
    setCurrentRep(0);
  };

  const handlePrevAyah = () => {
    if (!currentPage) return;
    const pageVerses = (quranData as any)[currentPage.toString()];
    if (!pageVerses) return;

    setCurrentAyah(prev => {
      if (!prev) return prev;
      
      const currentIndex = pageVerses.findIndex((v: any) => v.verse_key === `${prev.surahId}:${prev.ayah}`);
      if (currentIndex > 0) {
        const prevVerse = pageVerses[currentIndex - 1];
        const [sId, aNum] = prevVerse.verse_key.split(':').map(Number);
        return { surahId: sId, ayah: aNum };
      }
      return prev; // Stay at first ayah of page
    });
    setCurrentRep(0);
  };

  return (
    <View style={styles.overlay}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={[styles.container, { backgroundColor: Colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Decorative Circles */}
        <View style={[styles.decorCircle, { top: -50, left: -50, backgroundColor: Colors.primarySubtle }]} />
        <View style={[styles.decorCircle, { bottom: -100, right: -50, backgroundColor: Colors.primarySubtle, width: 300, height: 300 }]} />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: isActive ? Colors.primaryMuted : Colors.glass }]}>
             <Text style={[styles.badgeText, { color: isActive ? Colors.primary : Colors.textTertiary }]}>
                {isActive ? 'جاري الآن' : 'متوقف'}
             </Text>
          </View>
        </View>
        
        <Animated.View style={[
          styles.timerContainer, 
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <View style={styles.circularContainer}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={Colors.borderLight}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isFinished ? Colors.success : Colors.primary}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>

            {/* Center Content */}
            <View style={[styles.timerCircle, { backgroundColor: Colors.surface, position: 'absolute' }]}>
              <Text style={[styles.timeText, { color: isFinished ? Colors.success : Colors.textPrimary }]}>
                {formatTime(seconds)}
              </Text>
              <Text style={[styles.remainingLabel, { color: Colors.textTertiary }]}>
                {isFinished ? 'تم بنجاح' : 'متبقي'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Dynamic controls for Hifz - Vertical Stack (Reordered) */}
        {showControls && (
          <View style={styles.hifzControls}>
          {currentAyah && (
            <Text style={[styles.surahName, { color: Colors.primary }]}>
              {getSurahById(currentAyah.surahId)?.nameAr}
            </Text>
          )}

          <View style={styles.hifzStack}>
             {/* 1. Page Control with Range Logic */}
             <View style={styles.stackedItem}>
                <Text style={[styles.hifzLabel, { color: Colors.textTertiary }]}>رقم الصفحة</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity 
                    onPress={() => setCurrentPage(prev => prev ? Math.max(pageRange.min, prev - 1) : pageRange.min)} 
                    style={[styles.largeMiniBtn, currentPage === pageRange.min && { opacity: 0.3 }]}
                    disabled={currentPage === pageRange.min}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[styles.hifzValueLarge, { color: Colors.textPrimary }]}>{currentPage || '-'}</Text>
                  <TouchableOpacity 
                    onPress={() => setCurrentPage(prev => prev ? Math.min(pageRange.max, prev + 1) : pageRange.min)} 
                    style={[styles.largeMiniBtn, currentPage === pageRange.max && { opacity: 0.3 }]}
                    disabled={currentPage === pageRange.max}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
             </View>

             <View style={styles.stackDivider} />

             {/* 2. Ayah Control */}
             <View style={styles.stackedItem}>
                <Text style={[styles.hifzLabel, { color: Colors.textTertiary }]}>رقم الآية</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity 
                    onPress={handlePrevAyah} 
                    style={[styles.largeMiniBtn, (!currentAyah || ((quranData as any)[currentPage?.toString() || ""]?.[0]?.verse_key === `${currentAyah.surahId}:${currentAyah.ayah}`)) && { opacity: 0.3 }]}
                    disabled={!currentAyah || ((quranData as any)[currentPage?.toString() || ""]?.[0]?.verse_key === `${currentAyah.surahId}:${currentAyah.ayah}`)}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[styles.hifzValueLarge, { color: Colors.textPrimary }]}>
                    {currentAyah ? toArabicNumerals(currentAyah.ayah) : '-'}
                  </Text>
                  <TouchableOpacity 
                    onPress={handleNextAyah} 
                    style={[styles.largeMiniBtn, (!currentAyah || ((quranData as any)[currentPage?.toString() || ""]?.slice(-1)[0]?.verse_key === `${currentAyah.surahId}:${currentAyah.ayah}`)) && { opacity: 0.3 }]}
                    disabled={!currentAyah || ((quranData as any)[currentPage?.toString() || ""]?.slice(-1)[0]?.verse_key === `${currentAyah.surahId}:${currentAyah.ayah}`)}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

             {showRepetition && (
               <>
                 <View style={styles.stackDivider} />

                 {/* 3. Repetition Control */}
                 <View style={styles.stackedItem}>
                    <Text style={[styles.hifzLabel, { color: Colors.textTertiary }]}>عدد التكرار</Text>
                    <View style={styles.counterRow}>
                      <TouchableOpacity onPress={() => setCurrentRep(prev => Math.max(0, prev - 1))} style={styles.largeMiniBtn}>
                        <Ionicons name="remove-circle-outline" size={24} color={Colors.textPrimary} />
                      </TouchableOpacity>
                      <Text style={[styles.hifzValueLarge, { color: Colors.textPrimary }]}>{currentRep}x</Text>
                      <TouchableOpacity onPress={() => setCurrentRep(prev => prev + 1)} style={styles.largeMiniBtn}>
                        <Ionicons name="add-circle-outline" size={24} color={Colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                 </View>
               </>
             )}
             </View>
          </View>
        )}

        <View style={styles.controls}>
          {!isFinished ? (
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.btn, { backgroundColor: isActive ? Colors.warning : Colors.primary }, Shadow.md]} 
              onPress={toggle}
            >
              <Ionicons name={isActive ? "pause" : "play"} size={24} color="#FFF" />
              <Text style={styles.btnText}>{isActive ? "إيقاف مؤقت" : "ابدأ الجلسة"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.btn, { backgroundColor: Colors.success }, Shadow.md]} 
              onPress={onClose}
            >
              <Ionicons name="checkmark-done" size={24} color="#FFF" />
              <Text style={styles.btnText}>إكمال الورد</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Ionicons name="refresh" size={16} color={Colors.textTertiary} style={{ marginLeft: 6 }} />
            <Text style={[styles.resetText, { color: Colors.textTertiary }]}>إعادة ضبط الوقت</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { backgroundColor: Colors.glass, borderColor: Colors.glassBorder }]}>
          <Ionicons name="bulb-outline" size={18} color={Colors.gold} />
          <Text style={[styles.hint, { color: Colors.textSecondary }]}>
            {isActive ? "استمر في التركيز، الله يبارك في وقتك" : "اضغط ابدأ عندما تكون مستعداً للبدء"}
          </Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: 80,
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 150,
    opacity: 0.4,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BorderRadius.full,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing["4xl"],
  },
  title: {
    fontFamily: Typography.heading, fontSize: Typography.xl,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeText: {
    fontFamily: Typography.heading, fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  timerContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  circularContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerCircle: {
    width: 260 - STROKE_WIDTH * 2,
    height: 260 - STROKE_WIDTH * 2,
    borderRadius: (260 - STROKE_WIDTH * 2) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Shadow.lg,
  },
  timeText: {
    fontFamily: 'System', 
    fontSize: Typography["5xl"],
    fontWeight: '200',
    letterSpacing: -1,
  },
  remainingLabel: {
    fontFamily: Typography.body, fontSize: Typography.sm,
    marginTop: -5,
  },
  hifzControls: {
    width: '90%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: Spacing.lg,
    borderRadius: 24,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  hifzStack: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  stackedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  hifzLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  hifzValueLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  largeMiniBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackDivider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  surahName: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: Spacing.sm,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  btn: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  btnText: {
    fontFamily: Typography.heading, fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: '#FFF',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  resetText: {
    fontFamily: Typography.body, fontSize: Typography.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    maxWidth: '90%',
  },
  hint: {
    fontFamily: Typography.body, fontSize: Typography.sm,
    textAlign: 'center',
  },
  setupCard: {
    width: '90%',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  setupTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  setupRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  setupItem: {
    flex: 1,
  },
  setupLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  setupInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.5)',
  }
});
