import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MUSHAF_EDITIONS } from "../../data/mushafEditions";
import { Spacing, Typography, useTheme } from "../../theme";

interface MushafEditionPickerProps {
  currentEditionId: string;
  onSelect: (editionId: string) => void;
}

export function MushafEditionPicker({
  currentEditionId,
}: MushafEditionPickerProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  // بما أنه لا توجد إلا طبعة واحدة حالياً
  const edition = MUSHAF_EDITIONS[0];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.name}>{edition.nameAr}</Text>
          </View>
          <Text style={styles.desc}>{edition.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons
              name="checkmark-circle"
              size={12}
              color={Colors.primary}
            />
            <Text style={styles.source}>المصدر: {edition.source}</Text>
          </View>
          <Text style={styles.meta}>
            رواية: {edition.riwaya} • {edition.totalPages} صفحة
          </Text>
        </View>
        <Ionicons name="radio-button-on" size={20} color={Colors.primary} />
      </View>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: Spacing.xs,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    name: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.primary,
      textAlign: "left",
    },
    desc: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textSecondary,
      textAlign: "left",
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 6,
    },
    source: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textPrimary,
      //
      lineHeight: 18,
      textAlign: "left",
    },
    meta: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.textTertiary,
      marginTop: 4,
      textAlign: "left",
    },
  });
