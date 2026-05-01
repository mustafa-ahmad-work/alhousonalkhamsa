import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';
import { RangeSelection } from '../../types';
import { formatRangeLabel } from '../../data/quranMeta';

type RangeChipProps = {
  range: RangeSelection;
  onRemove: (id: string) => void;
};

export function RangeChip({ range, onRemove }: RangeChipProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const label =
    range.type === 'surah' && range.surahId
      ? formatRangeLabel('surah', range.startAyah ?? 1, range.endAyah ?? 1, range.surahId)
      : formatRangeLabel('page', range.start, range.end);

  const chipColor =
    range.type === 'surah' ? Colors.primary : Colors.blue;

  return (
    <View style={[styles.chip, { borderColor: `${chipColor}30` }]}>
      <Ionicons
        name={range.type === 'surah' ? 'book-outline' : 'document-outline'}
        size={14}
        color={chipColor}
      />
      <Text style={[styles.chipText, { color: chipColor }]} numberOfLines={1}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => onRemove(range.id)}
        style={styles.removeBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={14} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
    },
    chipText: {
      fontFamily: Typography.body, fontSize: Typography.sm,
      maxWidth: 180,
    },
    removeBtn: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },
  });
