import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  SlideOutDown,
  ZoomIn,
} from "react-native-reanimated";
import { BorderRadius, Shadow, Spacing, Typography, useTheme } from "../../theme";

const { width } = Dimensions.get("window");

export type AlertType = "info" | "success" | "warning" | "error" | "delete";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: AlertType;
}

let alertResolver: ((config: AlertConfig | null) => void) | null = null;

export const HusoonAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    type: AlertType = "info",
  ) => {
    if (alertResolver) {
      alertResolver({ title, message, buttons, type });
    }
  },
};

export function CustomAlertProvider() {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [active, setActive] = useState(false);
  const Colors = useTheme();

  useEffect(() => {
    alertResolver = (newConfig) => {
      if (newConfig) {
        setConfig(newConfig);
        setActive(true);
      } else {
        setActive(false);
      }
    };
    return () => {
      alertResolver = null;
    };
  }, []);

  const close = useCallback(() => {
    setActive(false);
    // Remove from tree after animation finishes (250ms for SlideOutDown)
    setTimeout(() => setConfig(null), 300);
  }, []);

  const handleButtonPress = (btn: AlertButton) => {
    // We close first to start animation
    close();
    if (btn.onPress) {
      // Execute callback after a slight delay to keep UI responsive
      setTimeout(btn.onPress, 100);
    }
  };

  if (!config) return null;

  const getIcon = () => {
    switch (config.type) {
      case "success":
        return { name: "checkmark-circle", color: Colors.success };
      case "error":
        return { name: "alert-circle", color: Colors.red };
      case "warning":
        return { name: "warning", color: Colors.gold };
      case "delete":
        return { name: "trash", color: Colors.red };
      default:
        return { name: "information-circle", color: Colors.primary };
    }
  };

  const icon = getIcon();
  const buttons: AlertButton[] =
    config.buttons && config.buttons.length > 0
      ? config.buttons
      : [{ text: "حسناً", onPress: () => {}, style: "default" }];

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents={active ? "auto" : "none"}>
      <View style={styles.overlay}>
        {active && (
          <>
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.6)" },
              ]}
            >
              <Pressable style={{ flex: 1 }} onPress={close} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.springify().damping(15).stiffness(100)}
              exiting={SlideOutDown.duration(250)}
              style={[styles.container, { backgroundColor: Colors.surface }]}
            >
              <Animated.View
                entering={ZoomIn.delay(200).springify()}
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${icon.color}15` },
                ]}
              >
                <Ionicons name={icon.name as any} size={40} color={icon.color} />
              </Animated.View>

              <Text style={[styles.title, { color: Colors.textPrimary }]}>
                {config.title}
              </Text>
              {config.message && (
                <Text style={[styles.message, { color: Colors.textSecondary }]}>
                  {config.message}
                </Text>
              )}

              <View
                style={[
                  styles.buttonRow,
                  buttons.length > 2 && styles.buttonColumn,
                ]}
              >
                {buttons.map((btn, index) => {
                  const isCancel = btn.style === "cancel";
                  const isDestructive =
                    btn.style === "destructive" || config.type === "delete";

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        isCancel
                          ? { backgroundColor: Colors.surfaceElevated }
                          : {
                              backgroundColor: isDestructive
                                ? Colors.red
                                : Colors.primary,
                            },
                        buttons.length > 2 && { width: "100%" },
                      ]}
                      onPress={() => handleButtonPress(btn)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isCancel
                            ? { color: Colors.textPrimary }
                            : { color: "#FFF" },
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    ...Shadow.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: 20,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: Typography.body,
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row-reverse",
    gap: Spacing.md,
    width: "100%",
  },
  buttonColumn: {
    flexDirection: "column",
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: Typography.body,
    fontSize: 16,
  },
});
