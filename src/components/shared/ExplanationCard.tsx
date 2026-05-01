import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";

interface ExplanationCardProps {
  title: string;
  content: string | React.ReactNode;
  icon: string;
  color: string;
}

export function ExplanationCard({
  title,
  content,
  icon,
  color,
}: ExplanationCardProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <Text style={[styles.title, { color }]}>{title}</Text>
      </View>
      <View>
        {typeof content === "string" ? (
          <Text style={styles.paragraph}>{content}</Text>
        ) : (
          content
        )}
      </View>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.md,
      gap: Spacing.md,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: Typography.heading,
      fontSize: Typography.md,
      flex: 1,
      textAlign: "left",
    },
    paragraph: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textSecondary,
      lineHeight: Typography.base * 1.7,
      textAlign: "left",
    },
  });
