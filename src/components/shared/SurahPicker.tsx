import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import { SURAHS, SurahMeta } from '../../data/quranMeta';

type SurahPickerProps = {
  selectedSurah: SurahMeta | null;
  startAyah: string;
  endAyah: string;
  onSurahChange: (surah: SurahMeta) => void;
  onStartAyahChange: (value: string) => void;
  onEndAyahChange: (value: string) => void;
};

export function SurahPicker({
  selectedSurah,
  startAyah,
  endAyah,
  onSurahChange,
  onStartAyahChange,
  onEndAyahChange,
}: SurahPickerProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = SURAHS.filter(
    (s) =>
      s.nameAr.includes(searchQuery) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toString() === searchQuery
  );

  return (
    <View style={styles.container}>
      {/* Surah Selector */}
      <TouchableOpacity
        style={styles.surahSelector}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          {selectedSurah ? (
            <>
              <Text style={styles.surahNumber}>{selectedSurah.id}</Text>
              <Text style={styles.surahName}>{selectedSurah.nameAr}</Text>
              <Text style={styles.ayahInfo}>
                ({selectedSurah.ayahCount} آية)
              </Text>
            </>
          ) : (
            <Text style={styles.placeholder}>اختر السورة</Text>
          )}
        </View>
        <Ionicons
          name="chevron-down"
          size={18}
          color={Colors.textTertiary}
        />
      </TouchableOpacity>

      {/* Ayah Range */}
      {selectedSurah && (
        <View style={styles.ayahRow}>
          <View style={styles.ayahInputGroup}>
            <Text style={styles.ayahLabel}>من آية</Text>
            <TextInput
              style={styles.ayahInput}
              value={startAyah}
              onChangeText={onStartAyahChange}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor={Colors.textTertiary}
              textAlign="center"
            />
          </View>
          <View style={styles.ayahDivider}>
            <Ionicons
              name="arrow-back"
              size={16}
              color={Colors.textTertiary}
            />
          </View>
          <View style={styles.ayahInputGroup}>
            <Text style={styles.ayahLabel}>إلى آية</Text>
            <TextInput
              style={styles.ayahInput}
              value={endAyah}
              onChangeText={onEndAyahChange}
              keyboardType="numeric"
              placeholder={selectedSurah.ayahCount.toString()}
              placeholderTextColor={Colors.textTertiary}
              textAlign="center"
            />
          </View>
        </View>
      )}

      {/* Surah List Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر السورة</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={Colors.textTertiary}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="بحث بالاسم أو الرقم..."
                placeholderTextColor={Colors.textTertiary}
                textAlign="right"
              />
            </View>

            {/* List */}
            <ScrollView
              style={styles.surahList}
              showsVerticalScrollIndicator={false}
            >
              {filteredSurahs.map((surah) => (
                <TouchableOpacity
                  key={surah.id}
                  style={[
                    styles.surahItem,
                    selectedSurah?.id === surah.id && styles.surahItemSelected,
                  ]}
                  onPress={() => {
                    onSurahChange(surah);
                    setShowModal(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.surahItemLeft}>
                    <View style={styles.surahNumberBadge}>
                      <Text style={styles.surahNumberText}>{surah.id}</Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.surahItemName,
                          selectedSurah?.id === surah.id && {
                            color: Colors.primary,
                          },
                        ]}
                      >
                        {surah.nameAr}
                      </Text>
                      <Text style={styles.surahItemMeta}>
                        {surah.ayahCount} آية · صفحة {surah.startPage}
                      </Text>
                    </View>
                  </View>
                  {selectedSurah?.id === surah.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      gap: Spacing.md,
    },
    surahSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md + 2,
    },
    selectorContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    surahNumber: {
      fontFamily: Typography.heading, fontSize: Typography.sm,
      color: Colors.primary,
      backgroundColor: Colors.primaryMuted,
      width: 28,
      height: 28,
      lineHeight: 28,
      textAlign: 'center',
      borderRadius: 14,
      overflow: 'hidden',
    },
    surahName: {
      fontFamily: Typography.body, fontSize: Typography.base,
      color: Colors.textPrimary,
    },
    ayahInfo: {
      fontFamily: Typography.body, fontSize: Typography.sm,
      color: Colors.textTertiary,
    },
    placeholder: {
      fontFamily: Typography.body, fontSize: Typography.base,
      color: Colors.textTertiary,
    },

    // Ayah range
    ayahRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    ayahInputGroup: {
      flex: 1,
      gap: 4,
    },
    ayahLabel: {
      fontFamily: Typography.body, fontSize: Typography.xs,
      color: Colors.textTertiary,
      textAlign: 'center',
    },
    ayahInput: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.md,
      fontFamily: Typography.body, fontSize: Typography.base,
      color: Colors.textPrimary,
    },
    ayahDivider: {
      paddingTop: 18,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: BorderRadius['2xl'],
      borderTopRightRadius: BorderRadius['2xl'],
      maxHeight: '80%',
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    modalTitle: {
      fontFamily: Typography.heading, fontSize: Typography.lg,
      color: Colors.textPrimary,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: Spacing.sm + 2,
      fontFamily: Typography.body, fontSize: Typography.base,
      color: Colors.textPrimary,
    },
    surahList: {
      paddingHorizontal: Spacing.lg,
    },
    surahItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    surahItemSelected: {
      backgroundColor: Colors.primarySubtle,
      borderRadius: BorderRadius.md,
      borderBottomWidth: 0,
      marginVertical: 1,
    },
    surahItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    surahNumberBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    surahNumberText: {
      fontFamily: Typography.body, fontSize: Typography.sm,
      color: Colors.textSecondary,
    },
    surahItemName: {
      fontFamily: Typography.body, fontSize: Typography.base,
      color: Colors.textPrimary,
    },
    surahItemMeta: {
      fontFamily: Typography.body, fontSize: Typography.xs,
      color: Colors.textTertiary,
      marginTop: 2,
    },
  });
