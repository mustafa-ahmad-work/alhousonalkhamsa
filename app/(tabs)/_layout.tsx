import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
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
import { useAppStore } from "../../src/store/AppStore";
import { Shadow, Typography, useTheme } from "../../src/theme";

// Filled vs outline icons for each tab
const ICONS: Record<string, { outline: string; filled: string }> = {
  dashboard: { outline: "home-outline", filled: "home" },
  memorization: {
    outline: "map-outline",
    filled: "map",
  },
  review: { outline: "heart-outline", filled: "heart" },
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

  // Minimalist active scale
  const activeScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
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
          { transform: [{ scale: activeScale }] },
          isFocused && { marginTop: -24 },
        ]}
      >
        {isFocused ? (
          <View style={styles.activeCircle}>
            <Ionicons name={iconName as any} size={24} color="#FFFFFF" />
            <Text
              numberOfLines={1}
              style={[styles.tabText, { color: "#FFFFFF", marginTop: 2 }]}
            >
              {title}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Ionicons
              name={iconName as any}
              size={22}
              color={Colors.textSecondary}
            />
            <Text numberOfLines={1} style={styles.tabText}>
              {title}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function PremiumTabBar({
  state: navState,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.buttonsRow}>
        {navState.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          if ((options as any).href === null) return null;

          const title =
            options.title !== undefined ? options.title : route.name;
          const isFocused = navState.index === index;

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
      <Tabs.Screen name="progress" options={{ title: "التقدم" }} />
      <Tabs.Screen name="dashboard" options={{ title: "الرئيسية" }} />
      <Tabs.Screen name="memorization" options={{ title: "الخطة" }} />
    </Tabs>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    // The Floating Pill bar
    outerContainer: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 40 : 30,
      left: 24,
      right: 24,
      height: 76,
      borderRadius: 38,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      overflow: "visible",
    },
    buttonsRow: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    tabButton: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      fontFamily: Typography.body,
      justifyContent: "center",
      overflow: "visible",
    },

    tabContent: {
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      width: "100%",
      height: "100%",
    },
    activeCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0,
      // borderColor: Colors.surface,
      ...Shadow.md,
    },

    iconContainer: {
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },

    activeDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.primary,
      marginTop: 4,
    },

    tabText: {
      fontFamily: Typography.body,
      fontSize: 9,
      color: Colors.textSecondary,
      textAlign: "center",
    },

    tabTextActive: {
      color: "#FFFFFF",
      fontFamily: Typography.body,
    },
  });
