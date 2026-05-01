import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Spacing, Typography } from "../../theme";

interface ExplanationHeroProps {
  Colors: any;
}

export const ExplanationHero: React.FC<ExplanationHeroProps> = ({ Colors }) => {
  return (
    <View
      style={[styles.container, { backgroundColor: Colors.surfaceElevated }]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: Colors.primaryMuted },
          ]}
        >
          <Ionicons name="book" size={40} color={Colors.primary} />
        </View>
        <Text style={[styles.title, { color: Colors.textPrimary }]}>
          رحلة إتقان القرآن الكريم
        </Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
          نظام ذكي مبني على منهجية المفاتيح الخمسة لضمان رسوخ حفظك وعدم تفلته
        </Text>
      </View>

      <View style={styles.badgeContainer}>
        <View
          style={[
            styles.badge,
            { backgroundColor: Colors.goldMuted, borderColor: Colors.gold },
          ]}
        >
          <Ionicons name="star" size={14} color={Colors.gold} />
          <Text style={[styles.badgeText, { color: Colors.gold }]}>
            المنهجية العلمية
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: Colors.blueMuted, borderColor: Colors.blue },
          ]}
        >
          <Ionicons name="flash" size={14} color={Colors.blue} />
          <Text style={[styles.badgeText, { color: Colors.blue }]}>
            تقنية المراجعة المتباعدة
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    alignItems: "center",
    overflow: "hidden",
  },
  content: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xl,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.body,
    fontSize: Typography.base,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: Typography.body,
    fontSize: Typography.xs,
    marginLeft: 4,
  },
});
