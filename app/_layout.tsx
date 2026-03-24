import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  I18nManager,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import "../global.css";
import { AppProvider } from "../src/store/AppStore";
import { useTheme, Typography, Spacing, BorderRadius } from "../src/theme";
import { StatisticsService } from "../src/store/StatisticsService";

// Force RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get("window");

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load logic here if needed
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onFinish = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <AppProvider>
      <MainLayout showCustomSplash={showCustomSplash} onFinish={onFinish} />
    </AppProvider>
  );
}

function MainLayout({ showCustomSplash, onFinish }: { showCustomSplash: boolean, onFinish: () => void }) {
  const Colors = useTheme();
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    if (pathname) {
      StatisticsService.trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle={Colors.background === "#07090F" ? "light-content" : "dark-content"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      {showCustomSplash && <CustomSplashScreen onFinish={onFinish} />}
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
        useNativeDriver: false, // Width cannot be animated with native driver
      }),
    ]).start();

    Animated.timing(starAnim, {
      toValue: 1,
      duration: 600,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Exit
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
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

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
              <Ionicons name="shield-checkmark" size={54} color={Colors.primary} />
            </View>
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View style={[styles.textBlock, { opacity: fadeAnim }]}>
          <Text style={styles.splashTitle}>الحصون الخمسة</Text>
          <Text style={styles.tagline}>خطة متكاملة لإتقان حفظ القرآن</Text>
        </Animated.View>

        {/* Progress Bar Section */}
        <View style={styles.loadingContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>

      {/* Bottom Quote */}
      <Animated.View style={[styles.bottomQuote, { opacity: starAnim }]}>
        <Text style={styles.quoteText}>"اقرأ وارقَ ورتِّل"</Text>
        <View style={styles.starsRow}>
          {["star", "star", "star"].map((s, i) => (
            <Ionicons
              key={i}
              name={s as any}
              size={12}
              color={Colors.primary}
              style={{ marginHorizontal: 4, opacity: 0.5 }}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
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
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${Colors.primary}03`,
  },
  innerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.glass,
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
    fontSize: Typography["3xl"],
    fontWeight: Typography.extrabold,
    color: Colors.textPrimary,
    textAlign: "center",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
    opacity: 0.8,
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  progressBarBg: {
    width: "80%",
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: "500",
    letterSpacing: 1,
  },
  bottomQuote: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  quoteText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
  },
});
