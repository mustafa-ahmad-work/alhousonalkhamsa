import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '../../theme';

type SelectionToggleProps = {
  value: 'surah' | 'page';
  onChange: (value: 'surah' | 'page') => void;
};

export function SelectionToggle({ value, onChange }: SelectionToggleProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, value === 'surah' && styles.optionActive]}
        onPress={() => onChange('surah')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            value === 'surah' && styles.optionTextActive,
          ]}
        >
          بالسورة
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, value === 'page' && styles.optionActive]}
        onPress={() => onChange('page')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            value === 'page' && styles.optionTextActive,
          ]}
        >
          بالصفحة
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: 3,
    },
    option: {
      flex: 1,
      paddingVertical: Spacing.sm + 2,
      alignItems: 'center',
      borderRadius: BorderRadius.md,
    },
    optionActive: {
      backgroundColor: Colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${Colors.primary}30`,
    },
    optionText: {
      fontFamily: Typography.body, fontSize: Typography.base,
      color: Colors.textTertiary,
    },
    optionTextActive: {
      color: Colors.primary,
    },
  });
