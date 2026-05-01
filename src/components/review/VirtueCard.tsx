import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Spacing, Typography } from "../../theme";

interface VirtueCardProps {
  title: string;
  desc: string;
  icon: string;
  color: string;
  Colors: any;
}

export function VirtueCard({
  title,
  desc,
  icon,
  color,
  Colors,
}: VirtueCardProps) {
  return (
    <View style={styles.flatRow}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.flatContent}>
        <Text style={[styles.flatTitle, { color: Colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.flatDesc, { color: Colors.textSecondary }]}>
          {desc}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flatRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  flatContent: {
    flex: 1,
    alignItems: "flex-start",
  },
  flatTitle: {
    fontFamily: Typography.heading,
    fontSize: 16,
    marginBottom: 4,
    textAlign: "left",
    width: "100%",
  },
  flatDesc: {
    fontFamily: Typography.body,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "left",
    width: "100%",
  },
});
