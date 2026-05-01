import { Amiri_400Regular } from "@expo-google-fonts/amiri";
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  useFonts,
} from "@expo-google-fonts/tajawal";
import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  I18nManager,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import "../global.css";
import { CustomAlertProvider } from "../src/components/shared/CustomAlert";
import VersionOverlay from "../src/components/shared/VersionOverlay";
import { AppProvider } from "../src/store/AppStore";
import { UpdateInfo, UpdateService } from "../src/store/UpdateService";
import { Spacing, Typography, useTheme } from "../src/theme";
import "../src/theme/fontFix";

// Force RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width, height } = Dimensions.get("window");

// Global Font Fix: This is the ONLY way to affect StyleSheet elements globally in React Native.
// CSS files only affect Tailwind/NativeWind components.
const setGlobalFont = () => {
  const customStyle = { fontFamily: Typography.body, textAlign: "right" };

  // Patch Text components
  if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
  (Text as any).defaultProps.style = customStyle;

  // Patch TextInput components
  if ((TextInput as any).defaultProps == null)
    (TextInput as any).defaultProps = {};
  (TextInput as any).defaultProps.style = customStyle;

  // Ensure that even if a component has its own style, it merges with our font
  // @ts-ignore
  const oldRender = Text.render;
  if (oldRender) {
    // @ts-ignore
    Text.render = function (...args) {
      const origin = oldRender.call(this, ...args);
      // Only inject font if not already set to something specific (like Quran font)
      const currentFont = StyleSheet.flatten(origin.props.style)?.fontFamily;
      if (!currentFont || currentFont === "System") {
        return React.cloneElement(origin, {
          style: [customStyle, origin.props.style],
        });
      }
      return origin;
    };
  }
};

setGlobalFont();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // Load actual fonts to ensure fontsLoaded becomes true correctly
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Amiri_400Regular,
    ...Ionicons.font,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Removed stats
        // Just a small delay to ensure everything is mounted
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn("[RootLayout] Initialization tasks failed:", e);
      } finally {
        // Reveal the app as soon as fonts are ready
        setAppIsReady(true);
      }
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  const onFinish = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  if (!appIsReady || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#07090F",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
      </View>
    );
  }

  return (
    <AppProvider>
      <MainLayout showCustomSplash={showCustomSplash} onFinish={onFinish} />
    </AppProvider>
  );
}

function MainLayout({
  showCustomSplash,
  onFinish,
}: {
  showCustomSplash: boolean;
  onFinish: () => void;
}) {
  const Colors = useTheme();
  const pathname = usePathname();

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [blockType, setBlockType] = useState<
    "disabled" | "force_update" | "optional_update" | null
  >(null);

  const checkVersion = useCallback(async () => {
    try {
      const info = await UpdateService.checkForUpdate();
      if (info) {
        setUpdateInfo(info);
        if (info.isAppDisabled) setBlockType("disabled");
        else if (info.isMandatory) setBlockType("force_update");
        else if (info.hasUpdate) setBlockType("optional_update");
        else setBlockType(null);
      }
    } catch (err) {
      console.warn("[RootLayout] Update check failed:", err);
    }
  }, []);

  useEffect(() => {
    checkVersion();

    // Global Status Polling: Only poll for updates if the app is currently showing a blocking overlay.
    // Otherwise, it only checks on app start.
    if (blockType === "disabled" || blockType === "force_update") {
      const interval = setInterval(checkVersion, 45000);
      return () => clearInterval(interval);
    }
  }, [checkVersion, blockType]);

  // Track page views removed
  useEffect(() => {
    // Stats removed
  }, [pathname]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar
        barStyle={
          Colors.background === "#07090F" ? "light-content" : "dark-content"
        }
        translucent
        backgroundColor="transparent"
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <CustomAlertProvider />
      {showCustomSplash && <CustomSplashScreen onFinish={onFinish} />}

      {updateInfo && blockType && (
        <VersionOverlay
          type={blockType}
          info={updateInfo}
          onDismiss={() => setBlockType(null)}
          onRefresh={checkVersion}
        />
      )}
    </View>
  );
}

function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry & Progress
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.timing(starAnim, {
      toValue: 1,
      duration: 600,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Exit phase
    const timer = setTimeout(() => {
      Animated.timing(exitAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.splash, { opacity: exitAnim }]}>
      <View style={StyleSheet.absoluteFill} />

      {/* Background Decor */}
      <View style={styles.splashOrb1} />
      <View style={styles.splashOrb2} />

      <View style={styles.centerContent}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <Image
                source={require("../assets/images/android-icon-foreground.png")}
                style={styles.logoImageSplash}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View style={[styles.textBlock, { opacity: fadeAnim }]}>
          <Text style={styles.splashTitle}>مفاتيح حفظ القرآن</Text>
          <Text style={styles.tagline}>خطة متكاملة لإتقان حفظ القرآن</Text>
        </Animated.View>

        {/* Progress Bar Section */}
        <View style={[styles.loadingContainer, { width: 100 }]}>
          <Animated.View
            style={[
              styles.sleekLineFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>

      {/* Bottom Quote */}
      <Animated.View style={[styles.bottomQuote, { opacity: starAnim }]}>
        <Text style={styles.quoteText}>اقرأ وارقَ ورتِّل</Text>
      </Animated.View>
    </Animated.View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    splash: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    splashOrb1: {
      position: "absolute",
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: `${Colors.primary}05`,
      top: -100,
      right: -100,
    },
    splashOrb2: {
      position: "absolute",
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: `${Colors.blue}03`,
      bottom: -50,
      left: -100,
    },
    centerContent: {
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 40,
    },
    logoContainer: {
      marginBottom: Spacing.xl,
    },
    outerRing: {
      width: 220,
      height: 220,
      borderRadius: 110,
      borderWidth: 1,
      borderColor: `${Colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${Colors.primary}03`,
    },
    innerRing: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: `${Colors.primary}30`,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 5,
    },
    textBlock: {
      alignItems: "center",
      marginBottom: 40,
    },
    splashTitle: {
      fontFamily: "Tajawal_700Bold",
      fontSize: Typography["2xl"],
      color: Colors.textPrimary,
      textAlign: "center",
      letterSpacing: 1,
    },
    tagline: {
      fontFamily: "Tajawal_400Regular",
      fontSize: Typography.base,
      color: Colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
      opacity: 0.8,
    },
    loadingContainer: {
      alignItems: "center",
      marginTop: 20,
      height: 2,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 2,
      overflow: "hidden",
    },
    sleekLineFill: {
      height: "100%",
      backgroundColor: Colors.primary,
      borderRadius: 2,
    },
    bottomQuote: {
      position: "absolute",
      bottom: 60,
      alignItems: "center",
    },
    quoteText: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 16,
      color: Colors.primary,
      marginBottom: 8,
    },
    logoImageSplash: {
      width: 120,
      height: 120,
    },
  });
