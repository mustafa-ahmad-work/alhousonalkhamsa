import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { ModuleCard } from "../components/dashboard/ModuleCard";
import { StatsOverview } from "../components/dashboard/StatsOverview";
import VersionOverlay from "../components/shared/VersionOverlay";
import { useAppStore } from "../store/AppStore";
import { UpdateInfo, UpdateService } from "../store/UpdateService";
import { DEV_CONFIG } from "../developerConfig";
import { useSelectionStore } from "../store/selectionStore";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";
import { MODULES, TaskSelection } from "../types";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const Colors = useTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const { state, getMemorizedPages, getPagesDue } = useAppStore();
  const { user, streak, plan } = state;

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [blockType, setBlockType] = useState<
    "disabled" | "force_update" | "optional_update" | null
  >(null);
  const [hasDismissedUpdate, setHasDismissedUpdate] = useState(false);

  const checkVersion = useCallback(async () => {
    try {
      const info = await UpdateService.checkForUpdate();
      if (info) {
        setUpdateInfo(info);
        if (info.isAppDisabled) setBlockType("disabled");
        else if (info.isMandatory) setBlockType("force_update");
        else if (info.hasUpdate && !hasDismissedUpdate) setBlockType("optional_update");
        else if (!info.hasUpdate) setBlockType(null);
      }
    } catch (e) {
      console.warn("Failed to check version:", e);
    }
  }, [hasDismissedUpdate]);

  // 1. Initial Check on Mount
  useEffect(() => {
    checkVersion();
  }, []);

  // 2. Continuous Check only for Critical Blocks
  useEffect(() => {
    if (blockType === "disabled" || blockType === "force_update") {
      const interval = setInterval(checkVersion, DEV_CONFIG.bypassUpdateCache ? 5000 : 30000);
      return () => clearInterval(interval);
    }
  }, [checkVersion, blockType]);

  const isLoaded = useSelectionStore((state) => state.isLoaded);
  const loadFromStorage = useSelectionStore((state) => state.loadFromStorage);
  const taskSelections = useSelectionStore((state) => state.taskSelections);

  useEffect(() => {
    if (!isLoaded) loadFromStorage();
  }, [isLoaded, loadFromStorage]);

  const memorizedPages = getMemorizedPages();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleModulePress = (id: string) => {
    router.push({ pathname: "/module", params: { id } } as any);
  };

  const todayStr = new Date().toDateString();
  const dailySelections = taskSelections.filter(
    (s: TaskSelection) => new Date(s.createdAt).toDateString() === todayStr,
  );
  
  // Count how many of the 5 "Keys" (Fortresses) have at least one completed module today
  const completedKeys = useMemo(() => {
    const completedModuleIds = new Set(
      dailySelections.filter(s => s.isCompleted).map(s => s.module)
    );
    const completedFortressIds = new Set<string>();
    
    MODULES.forEach(m => {
      if (completedModuleIds.has(m.id)) {
        completedFortressIds.add(m.fortressId);
      }
    });
    
    return completedFortressIds.size;
  }, [dailySelections]);

  const memorizedCount = memorizedPages.length;
  const targetPagesCount = plan?.targetPages.length || 604;

  const daysRemaining = Math.max(
    1,
    Math.ceil((targetPagesCount - memorizedCount) / (user?.dailyPages || 1)),
  );
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysRemaining);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          Colors.background === "#07090F" ? "light-content" : "dark-content"
        }
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.backgroundAccent} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <DashboardHeader
          user={user}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          Colors={Colors}
        />

        {updateInfo && blockType && (
          <VersionOverlay
            type={blockType}
            info={updateInfo}
            onDismiss={() => {
              if (updateInfo) UpdateService.dismissUpdate(updateInfo.latestVersion);
              setHasDismissedUpdate(true);
              setBlockType(null);
            }}
            onRefresh={checkVersion}
          />
        )}

        <StatsOverview
          memorizedCount={memorizedCount}
          targetPagesCount={targetPagesCount}
          streak={streak.currentStreak}
          finishDate={finishDate}
          Colors={Colors}
        />

        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/explanation" as any)}
          >
            <View
              style={[
                styles.actionIconBox,
                { backgroundColor: `${Colors.primary}10` },
              ]}
            >
              <Ionicons name="bulb" size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: Colors.primary }]}>
              دليل البدء
            </Text>
            <Text style={styles.actionSub}>كيف يعمل التطبيق؟</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { borderColor: `${Colors.gold}40` }]}
            onPress={() => router.push("/review" as any)}
          >
            <View
              style={[
                styles.actionIconBox,
                { backgroundColor: `${Colors.gold}10` },
              ]}
            >
              <Ionicons name="heart" size={24} color={Colors.gold} />
            </View>
            <Text style={[styles.actionTitle, { color: Colors.gold }]}>
              فضائل القرآن
            </Text>
            <Text style={styles.actionSub}>مقامات وحقائق</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.quizActionCard}
          onPress={() => router.push("/quiz" as any)}
        >
          <View style={styles.quizActionIconBox}>
            <Ionicons name="school" size={24} color={Colors.blue} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text
              style={[
                styles.actionTitle,
                { color: Colors.blue, textAlign: "left" },
              ]}
            >
              اختبر حفظك
            </Text>
            <Text style={[styles.actionSub, { textAlign: "left" }]}>
              تسميع ذاتي ذكي لما أتممت حفظه
            </Text>
          </View>
          <Ionicons name="chevron-back" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>المفاتيح الخمسة</Text>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>{completedKeys}/5 أنجزت</Text>
          </View>
        </View>

        <View style={styles.modulesGrid}>
          {MODULES.map((moduleInfo) => (
            <ModuleCard
              key={moduleInfo.id}
              moduleInfo={moduleInfo}
              onPress={handleModulePress}
            />
          ))}
        </View>

        {completedKeys >= 5 && (
          <View style={styles.completionMessage}>
            <View style={styles.completionIcon}>
              <Ionicons name="checkmark-done" size={24} color="#FFF" />
            </View>
            <Text style={styles.completionTitle}>
              هنيئاً لك إتمام المفاتيح الخمسة!
            </Text>
            <Text style={styles.completionDesc}>
              لقد أتممت جميع مراحل منهجية "المفاتيح الخمسة" لهذا اليوم، ثبت الله حفظك ونفع بك.
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    backgroundAccent: {
      position: "absolute",
      width: width * 1.2,
      height: 300,
      backgroundColor: `${Colors.primary}05`,
      borderRadius: width,
      top: -100,
      left: -width * 0.1,
    },
    scroll: { paddingHorizontal: Spacing.xl, paddingTop: 44, gap: Spacing.lg },
    quickActionsRow: {
      flexDirection: "row",
      gap: Spacing.md,
    },
    actionCard: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    actionIconBox: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.sm,
    },
    actionTitle: {
      fontFamily: Typography.heading,
      fontSize: 15,
      marginBottom: 2,
    },
    actionSub: { fontSize: 11, color: Colors.textSecondary },
    quizActionCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    quizActionIconBox: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: `${Colors.blue}12`,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: Spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      color: Colors.textPrimary,
    },
    pillBadge: {
      backgroundColor: `${Colors.primary}10`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    pillText: { fontSize: 11, color: Colors.primary },
    modulesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    completionMessage: {
      backgroundColor: Colors.primaryMuted,
      borderRadius: 24,
      padding: Spacing.xl,
      alignItems: "center",
      marginTop: Spacing.md,
      borderWidth: 1.5,
      borderColor: `${Colors.success}30`,
    },
    completionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Colors.success,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    completionTitle: {
      color: Colors.success,
      fontSize: 18,
      marginBottom: 6,
    },
    completionDesc: {
      color: Colors.textSecondary,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
  });
