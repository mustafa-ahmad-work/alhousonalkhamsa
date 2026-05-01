import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';

type PageRangePickerProps = {
  startPage: string;
  endPage: string;
  onStartPageChange: (value: string) => void;
  onEndPageChange: (value: string) => void;
};

export function PageRangePicker({
  startPage,
  endPage,
  onStartPageChange,
  onEndPageChange,
}: PageRangePickerProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>من صفحة</Text>
        <TextInput
          style={styles.input}
          value={startPage}
          onChangeText={onStartPageChange}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor={Colors.textTertiary}
          textAlign="center"
        />
      </View>
      <View style={styles.divider}>
        <Ionicons name="documents-outline" size={24} color={Colors.primary} style={{ opacity: 0.5 }} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>إلى صفحة</Text>
        <TextInput
          style={styles.input}
          value={endPage}
          onChangeText={onEndPageChange}
          keyboardType="numeric"
          placeholder="604"
          placeholderTextColor={Colors.textTertiary}
          textAlign="center"
        />
      </View>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.md,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: Spacing.lg,
    },
    inputGroup: {
      flex: 1,
      gap: Spacing.sm,
    },
    label: {
      fontFamily: Typography.body, fontSize: Typography.sm,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    input: {
      backgroundColor: Colors.surfaceElevated,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      fontFamily: Typography.heading, fontSize: Typography.lg,
      color: Colors.textPrimary,
    },
    divider: {
      paddingTop: 20,
    },
  });
