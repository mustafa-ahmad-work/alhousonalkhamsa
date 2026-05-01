import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";
import { Fortress } from "../../types";

interface FortressCardProps {
  fortress: Fortress;
  completed: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function FortressCard({
  fortress,
  completed,
  onPress,
  style,
}: FortressCardProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    onPress();
  };

  const color = fortress.color;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: completed ? `${color}0A` : Colors.glass,
            borderColor: completed ? `${color}20` : Colors.glassBorder,
          },
        ]}
      >
        {/* Left: Icon + Info */}
        <View style={styles.left}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${color}10`,
                borderColor: `${color}1A`,
              },
            ]}
          >
            <Ionicons name={fortress.icon as any} size={22} color={color} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, completed && { color }]}>
              {fortress.nameAr}
            </Text>
            <Text style={styles.description}>{fortress.description}</Text>
          </View>
        </View>

        {/* Right: Check & XP */}
        <View style={styles.right}>
          <View style={styles.xpRow}>
            <Text
              style={[
                styles.xp,
                { color: completed ? color : Colors.textTertiary },
              ]}
            >
              +{fortress.xpReward}
            </Text>
            <Ionicons
              name="star"
              size={10}
              color={completed ? color : Colors.textTertiary}
            />
          </View>
          <View
            style={[
              styles.checkBox,
              {
                backgroundColor: completed ? color : "transparent",
                borderColor: completed ? color : Colors.border,
              },
            ]}
          >
            {completed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      paddingHorizontal: Spacing.base,
      paddingVertical: 14,
      marginBottom: Spacing.sm,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: Spacing.md,
    },
    iconContainer: {
      width: 42,
      height: 42,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textPrimary,
      textAlign: "left",
      writingDirection: "rtl",
    },
    description: {
      fontFamily: Typography.body,
      fontSize: Typography.xs,
      color: Colors.textTertiary,
      textAlign: "left",
      writingDirection: "rtl",
    },
    right: {
      alignItems: "center",
      gap: 6,
    },
    xpRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    xp: {
      fontFamily: Typography.heading,
      fontSize: Typography.xs,
    },
    checkBox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
  });
