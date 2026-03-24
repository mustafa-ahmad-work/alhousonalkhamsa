import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Typography, useTheme } from "../../src/theme";
import { useAppStore } from "../../src/store/AppStore";

// Filled vs outline icons for each tab
const ICONS: Record<string, { outline: string; filled: string }> = {
  dashboard: { outline: "home-outline", filled: "home" },
  memorization: {
    outline: "shield-checkmark-outline",
    filled: "shield-checkmark",
  },
  review: { outline: "sync-outline", filled: "sync" },
  progress: { outline: "stats-chart-outline", filled: "stats-chart" },
};

function TabItem({
  routeName,
  title,
  isFocused,
  onPress,
  onLongPress,
}: {
  routeName: string;
  title: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  // Animation ref
  const progressAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: isFocused ? 1 : 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  // Elegant subtle lift for the entire content block
  const iconTranslateY = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  // The active background bubble scales in
  const bgScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const bgOpacity = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const icons = ICONS[routeName] ?? {
    outline: "ellipse-outline",
    filled: "ellipse",
  };
  const iconName = isFocused ? icons.filled : icons.outline;

  const { state } = useAppStore();

  const handlePress = () => {
    if (state.settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handleLongPress = () => {
    if (state.settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress();
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.tabContent,
          { transform: [{ translateY: iconTranslateY }] },
        ]}
      >
        <View style={styles.iconContainer}>
          {/* Animated Background Bubble */}
          <Animated.View
            style={[
              styles.iconActiveBg,
              { opacity: bgOpacity, transform: [{ scale: bgScale }] },
            ]}
          />
          <Ionicons
            name={iconName as any}
            size={22}
            color={isFocused ? Colors.primary : Colors.textTertiary}
            style={{ zIndex: 2 }} // Ensure icon is over the bubble
          />
        </View>

        <Text
          numberOfLines={1}
          style={[styles.tabText, isFocused && styles.tabTextActive]}
        >
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function PremiumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={[Colors.surface, Colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.buttonsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          if ((options as any).href === null) return null;

          const title =
            options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              title={title}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PremiumTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "الرئيسية" }} />
      <Tabs.Screen name="memorization" options={{ title: "الحفظ" }} />
      <Tabs.Screen name="review" options={{ title: "المراجعة" }} />
      <Tabs.Screen name="progress" options={{ title: "التقدم" }} />
    </Tabs>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    // The Floating Pill bar
    outerContainer: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 28 : 16,
      left: 16,
      right: 16,
      height: 70,
      borderRadius: 35, // Perfectly rounded capsule
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      overflow: "hidden", // Clean and sharp glass crop

      // Beautiful subtle shadow
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
        },
        android: { elevation: 0 },
      }),
    },

    buttonsRow: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 9,
    },

    tabButton: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    tabContent: {
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    iconContainer: {
      width: 44,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },

    iconActiveBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.primaryMuted, // E.g. rgba(193, 154, 107, 0.15) or suitable soft equivalent
      borderRadius: 16, // Soft rounded rectangle/pill behind the icon
    },

    tabText: {
      fontSize: 10,
      color: Colors.textTertiary,
      fontWeight: Typography.medium,
      textAlign: "center",
    },

    tabTextActive: {
      color: Colors.primary,
      fontWeight: Typography.bold,
    },
  });
