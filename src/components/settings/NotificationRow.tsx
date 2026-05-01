import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Spacing, Typography, useTheme } from "../../theme";

interface NotificationRowProps {
  label: string;
  field: string;
  timeField: string;
  notifications: Record<string, any>;
  isMasterEnabled: boolean;
  onToggle: (field: string) => void;
  onTimePress: (timeField: string) => void;
  showDivider?: boolean;
}

export function NotificationRow({
  label,
  field,
  timeField,
  notifications,
  isMasterEnabled,
  onToggle,
  onTimePress,
  showDivider = true,
}: NotificationRowProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const isEnabled = notifications[field];
  const time = notifications[timeField];

  return (
    <>
      <View style={[styles.row, !isMasterEnabled && { opacity: 0.5 }]}>
        <TouchableOpacity
          style={styles.main}
          disabled={!isMasterEnabled}
          onPress={() => onToggle(field)}
        >
          <Ionicons
            name={
              isEnabled && isMasterEnabled
                ? "notifications"
                : "notifications-off-outline"
            }
            size={20}
            color={
              isEnabled && isMasterEnabled
                ? Colors.primary
                : Colors.textTertiary
            }
          />
          <Text style={[styles.label, { marginLeft: 12 }]}>{label}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timeBtn}
          disabled={!isMasterEnabled}
          onPress={() => onTimePress(timeField)}
        >
          <Text style={styles.timeText}>{time}</Text>
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    main: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    label: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
    },
    timeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    timeText: {
      fontFamily: Typography.heading,
      fontSize: 13,
      color: Colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginVertical: Spacing.md,
    },
  });
