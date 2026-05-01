import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Spacing } from "../../theme";

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
  Colors: any;
}

export function SettingSection({ title, children, Colors }: SettingSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
        {children}
      </View>
    </View>
  );
}

interface SettingRowProps {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
  showDivider?: boolean;
  Colors: any;
}

export function SettingRow({ label, value, icon, onPress, showDivider, Colors }: SettingRowProps) {
  return (
    <React.Fragment>
      <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={styles.rowLeft}>
          <Text style={[styles.label, { color: Colors.textPrimary }]}>{label}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: Colors.primary }]}>{value}</Text>
            {icon && <Ionicons name={icon as any} size={14} color={Colors.primary} />}
          </View>
        </View>
        {onPress && <Ionicons name="chevron-back" size={14} color={Colors.textTertiary} />}
      </TouchableOpacity>
      {showDivider && <View style={[styles.divider, { backgroundColor: Colors.border }]} />}
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.xl },
  title: { fontSize: 13, marginBottom: Spacing.sm, marginHorizontal: Spacing.xs },
  card: { borderRadius: 20, borderWidth: 1, padding: Spacing.sm, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md },
  rowLeft: { flex: 1, alignItems: "flex-start" },
  label: { fontSize: 14, marginBottom: 2 },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: { fontSize: 13},
  divider: { height: 1, marginHorizontal: Spacing.md },
});
