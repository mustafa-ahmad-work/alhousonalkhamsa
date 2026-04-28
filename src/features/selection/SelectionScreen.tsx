import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { HusoonAlert } from '../../components/shared/CustomAlert';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import { RangeSelection, ModuleId } from '../../types';
import { SurahMeta, TOTAL_PAGES } from '../../data/quranMeta';
import { useSelectionStore } from '../../store/selectionStore';

// Components
import { SelectionToggle } from '../../components/shared/SelectionToggle';
import { SurahPicker } from '../../components/shared/SurahPicker';
import { PageRangePicker } from '../../components/shared/PageRangePicker';
import { RangeChip } from '../../components/shared/RangeChip';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

type SelectionScreenProps = {
  moduleId: ModuleId;
  moduleName: string;
  onClose: () => void;
};

export function SelectionScreen({
  moduleId,
  moduleName,
  onClose,
}: SelectionScreenProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const {
    addTaskSelection,
    createSurahRange,
    createPageRange,
    getModuleSelections,
  } = useSelectionStore();

  const [selectionType, setSelectionType] = useState<'surah' | 'page'>('page');

  // Surah State
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [startAyah, setStartAyah] = useState('');
  const [endAyah, setEndAyah] = useState('');

  // Page State
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');

  // Local drafted ranges before saving
  const [draftRanges, setDraftRanges] = useState<RangeSelection[]>([]);

  // ─── Add Range to Draft ────────────────────────────────────
  const handleAddRange = () => {
    if (selectionType === 'surah') {
      if (!selectedSurah) {
        HusoonAlert.alert('خطأ', 'الرجاء اختيار السورة أولاً', [], 'error');
        return;
      }
      const sAyah = parseInt(startAyah) || 1;
      const eAyah = parseInt(endAyah) || selectedSurah.ayahCount;

      if (eAyah < sAyah || sAyah < 1 || eAyah > selectedSurah.ayahCount) {
        HusoonAlert.alert('خطأ', 'نطاق الآيات غير صحيح', [], 'error');
        return;
      }
      const newRange = createSurahRange(selectedSurah.id, sAyah, eAyah);
      setDraftRanges((prev) => [...prev, newRange]);

      // Reset
      setSelectedSurah(null);
      setStartAyah('');
      setEndAyah('');
    } else {
      const sPage = parseInt(startPage);
      const ePage = parseInt(endPage);

      if (!sPage || !ePage || ePage < sPage || sPage < 1 || ePage > TOTAL_PAGES) {
        HusoonAlert.alert('خطأ', 'نطاق الصفحات غير صحيح', [], 'error');
        return;
      }

      const newRange = createPageRange(sPage, ePage);
      setDraftRanges((prev) => [...prev, newRange]);

      // Reset
      setStartPage('');
      setEndPage('');
    }
  };

  const handleRemoveDraftRange = (id: string) => {
    setDraftRanges((prev) => prev.filter((r) => r.id !== id));
  };

  // ─── Save Task Selection ──────────────────────────────────
  const handleSave = () => {
    if (draftRanges.length === 0) {
      HusoonAlert.alert('تنبيه', 'أضف نطاقاً واحداً على الأقل للمتابعة', [], 'warning');
      return;
    }
    addTaskSelection(moduleId, draftRanges);
    onClose();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>اختيار النطاق ({moduleName})</Text>
        <Text style={styles.subtitle}>
          يمكنك تحديد مقاطع متفرقة لحفظها كورد واحد
        </Text>

        <SelectionToggle value={selectionType} onChange={setSelectionType} />

        <View style={styles.pickerContainer}>
          {selectionType === 'surah' ? (
            <SurahPicker
              selectedSurah={selectedSurah}
              startAyah={startAyah}
              endAyah={endAyah}
              onSurahChange={(s) => {
                setSelectedSurah(s);
                setStartAyah('1');
                setEndAyah(s.ayahCount.toString());
              }}
              onStartAyahChange={setStartAyah}
              onEndAyahChange={setEndAyah}
            />
          ) : (
            <PageRangePicker
              startPage={startPage}
              endPage={endPage}
              onStartPageChange={setStartPage}
              onEndPageChange={setEndPage}
            />
          )}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddRange}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>إضافة النطاق المختار</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Ranges Preview */}
        {draftRanges.length > 0 && (
          <View style={styles.draftSection}>
            <View style={styles.draftHeader}>
              <Text style={styles.draftTitle}>العناصر المحددة:</Text>
              <Text style={styles.draftCount}>{draftRanges.length}</Text>
            </View>
            <View style={styles.chipContainer}>
              {draftRanges.map((range) => (
                <RangeChip
                  key={range.id}
                  range={range}
                  onRemove={handleRemoveDraftRange}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Fixed Action */}
      <View style={styles.footer}>
        <PrimaryButton
          label="تأكيد وبدء العمل"
          onPress={handleSave}
          disabled={draftRanges.length === 0}
        />
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>إلغاء</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    scroll: {
      flexGrow: 1,
      padding: Spacing.lg,
      paddingBottom: 40,
      gap: Spacing.xl,
    },
    title: {
      fontFamily: Typography.heading, fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: Typography.body, fontSize: Typography.sm,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: -Spacing.lg, // slightly pull up due to gap
    },
    pickerContainer: {
      gap: Spacing.lg,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: Colors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    addBtnText: {
      fontFamily: Typography.heading, fontSize: Typography.base,
      fontWeight: Typography.bold,
      color: '#ffffff',
    },
    draftSection: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    draftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    draftTitle: {
      fontFamily: Typography.heading, fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    draftCount: {
      fontFamily: Typography.heading, fontSize: Typography.xs,
      fontWeight: Typography.bold,
      color: Colors.primary,
      backgroundColor: Colors.primaryMuted,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    footer: {
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      backgroundColor: Colors.background,
      gap: Spacing.md,
    },
    cancelBtn: {
      paddingVertical: Spacing.sm,
      alignItems: 'center',
    },
    cancelBtnText: {
      fontFamily: Typography.body, fontSize: Typography.base,
      fontWeight: Typography.medium,
      color: Colors.textTertiary,
    },
  });
