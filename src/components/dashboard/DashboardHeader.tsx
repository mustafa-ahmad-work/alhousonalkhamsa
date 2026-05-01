import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Spacing, Typography } from "../../theme";
import {
  TITLE_ICONS,
  getMotivationalMessage,
  getTitleFromXP,
} from "../../utils/helpers";

interface DashboardHeaderProps {
  user: any;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  Colors: any;
}

export function DashboardHeader({
  user,
  fadeAnim,
  slideAnim,
  Colors,
}: DashboardHeaderProps) {
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? "صباح النور" : hours < 17 ? "مساء الخير" : "طابت ليلتك";

  return (
    <Animated.View
      style={[
        styles.header,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.topRow}>
        <View style={{ width: 50 }} />
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/settings")}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greetingText}>{greeting}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.userName}>
              {user?.name ?? "يا حامل القرآن"}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <View style={styles.titleBadge}>
            <Ionicons
              name={
                (TITLE_ICONS[getTitleFromXP(user?.totalXP ?? 0)] as any) ||
                "star"
              }
              size={12}
              color={Colors.primary}
            />
            <Text style={styles.titleBadgeText}>
              {getTitleFromXP(user?.totalXP ?? 0)}
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="sparkles" size={12} color={Colors.gold} />
            <Text style={styles.xpBadgeText}>{user?.totalXP ?? 0} نقطة</Text>
          </View>
        </View>
      </View>

      <View style={styles.quoteCard}>
        <View style={styles.quoteLine} />
        <View style={styles.quoteContent}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={14}
            color={Colors.textTertiary}
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.quoteText}>{getMotivationalMessage()}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    header: { marginBottom: Spacing.sm },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.lg,
    },
    headerLogo: { width: 75, height: 75 },
    headerActions: { flexDirection: "row", gap: Spacing.md },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    greetingSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: Spacing.lg,
    },
    greetingText: {
      fontFamily: Typography.body,
      fontSize: 16,
      color: Colors.textSecondary,
    },
    userName: {
      fontFamily: Typography.heading,
      fontSize: 24,
      color: Colors.textPrimary,
      marginTop: 2,
    },
    xpBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${Colors.gold}15`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
      marginBottom: 4,
    },
    xpBadgeText: { fontSize: 12, color: Colors.gold },
    titleBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${Colors.primary}15`,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${Colors.primary}30`,
      gap: 4,
    },
    titleBadgeText: {
      fontFamily: Typography.heading,
      fontSize: 10,
      color: Colors.primary,
    },
    levelBadge: {
      backgroundColor: `${Colors.blue}15`,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: `${Colors.blue}30`,
      marginTop: 4,
    },
    levelBadgeText: {
      fontFamily: Typography.body,
      fontSize: 10,
      color: Colors.blue,
    },
    quoteCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingVertical: Spacing.md,
      paddingRight: Spacing.xl,
    },
    quoteLine: {
      width: 3,
      height: "100%",
      backgroundColor: Colors.primary,
      borderRadius: 2,
    },
    quoteContent: { flex: 1 },
    quoteText: {
      fontFamily: Typography.body,
      fontSize: 13,
      color: Colors.textSecondary,
      lineHeight: 20,
    },
  });
