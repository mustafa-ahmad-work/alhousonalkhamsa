import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, createAudioPlayer } from "expo-audio";
import * as KeepAwake from "expo-keep-awake";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Shadow, Spacing, Typography, useTheme } from "../../theme";
import { toArabicNumerals } from "../../utils/helpers";

const { width, height } = Dimensions.get("window");

interface VerseAudio {
  verse_key: string;
  url: string;
  text?: string;
}

interface AudioPlayerProps {
  visible: boolean;
  pages: number[];
  title: string;
  onClose: () => void;
}

export const AudioPlayer = ({
  visible,
  pages,
  title,
  onClose,
}: AudioPlayerProps) => {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<VerseAudio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const playerRef = useRef<any>(null);
  const isChangingTrackRef = useRef(false);
  const currentIndexRef = useRef(0);
  const trackToPlayRef = useRef("");
  const lastProcessedIndexRef = useRef(-1);

  const updateCurrentIndex = (idx: number) => {
    currentIndexRef.current = idx;
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (visible && pages.length > 0) {
      loadPlaylist();
      KeepAwake.activateKeepAwakeAsync();
    } else {
      shutdownPlayer();
      KeepAwake.deactivateKeepAwake();
    }
    return () => {
      shutdownPlayer();
      KeepAwake.deactivateKeepAwake();
    };
  }, [visible, pages]);

  const loadPlaylist = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Set global audio mode using the correct setAudioModeAsync function
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "doNotMix",
      });

      let allVerses: VerseAudio[] = [];
      for (const page of pages) {
        const [resAudio, resText] = await Promise.all([
          fetch(`https://api.quran.com/api/v4/recitations/6/by_page/${page}`),
          fetch(
            `https://api.quran.com/api/v4/quran/verses/uthmani?page_number=${page}`,
          ),
        ]);

        if (resAudio.ok && resText.ok) {
          const dataAudio = await resAudio.json();
          const dataText = await resText.json();

          const textMap = new Map<string, string>();
          dataText.verses.forEach((v: any) => {
            textMap.set(v.verse_key, v.text_uthmani);
          });

          const combined = dataAudio.audio_files.map((a: any) => ({
            ...a,
            text: textMap.get(a.verse_key) || "—",
          }));

          allVerses = [...allVerses, ...combined];
        }
      }

      if (allVerses.length > 0) {
        setPlaylist(allVerses);
        updateCurrentIndex(0);
        await playTrackIndex(0, allVerses);
      } else {
        setErrorMsg("لا توجد تلاوات متاحة لهذه الصفحات.");
      }
    } catch (e) {
      console.error("Failed to load audio:", e);
      setErrorMsg("حدث خطأ في الاتصال. يرجى التحقق من الإنترنت.");
    } finally {
      setIsLoading(false);
    }
  };

  const playTrackIndex = async (index: number, versesList = playlist) => {
    if (isChangingTrackRef.current) return;

    const verse = versesList[index];
    if (!verse) return;

    isChangingTrackRef.current = true;
    updateCurrentIndex(index);
    trackToPlayRef.current = verse.url;
    lastProcessedIndexRef.current = -1;
    
    try {
      const url = verse.url.startsWith("//") ? `https:${verse.url}` : verse.url;
      
      if (!playerRef.current) {
        const player = createAudioPlayer(url);
        playerRef.current = player;
        
        player.addListener("playbackStatusUpdate", (status) => {
          if (status.didJustFinish && lastProcessedIndexRef.current !== currentIndexRef.current) {
            lastProcessedIndexRef.current = currentIndexRef.current;
            setTimeout(() => {
              playNext();
            }, 100);
          }
        });
      } else {
        playerRef.current.replace(url);
      }

      if (trackToPlayRef.current !== verse.url || !visible) {
        return;
      }

      playerRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
    } finally {
      isChangingTrackRef.current = false;
    }
  };

  const playNext = async () => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < playlist.length) {
      await playTrackIndex(nextIdx);
    } else {
      setIsPlaying(false);
      updateCurrentIndex(0);
    }
  };

  const playPrevious = async () => {
    const prevIdx =
      currentIndexRef.current > 0 ? currentIndexRef.current - 1 : 0;
    await playTrackIndex(prevIdx);
  };

  const togglePlayPause = async () => {
    if (isChangingTrackRef.current) return;
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
        setIsPlaying(false);
      } else {
        playerRef.current.play();
        setIsPlaying(true);
      }
    } else if (playlist.length > 0) {
      playTrackIndex(currentIndexRef.current);
    }
  };

  const shutdownPlayer = async () => {
    trackToPlayRef.current = "";
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.remove();
      playerRef.current = null;
    }
    setIsPlaying(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons
                name="chevron-down"
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>الاستماع (الشيخ الحصري)</Text>
              <Text style={styles.headerSubtitle}>{title}</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.mainContent}>
            {isLoading ? (
              <View style={styles.loaderArea}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loaderText}>جاري تحضير التلاوات...</Text>
              </View>
            ) : errorMsg ? (
              <View style={styles.errorArea}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={60}
                  color={Colors.textTertiary}
                />
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={loadPlaylist}
                >
                  <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Animated.View
                  entering={FadeInDown.duration(600)}
                  style={{ flex: 1 }}
                >
                  <View style={styles.mushafCard}>
                    <View style={styles.mushafPattern} />
                    <ScrollView
                      style={styles.textScroll}
                      contentContainerStyle={styles.textScrollContent}
                      showsVerticalScrollIndicator={false}
                    >
                      <Text style={styles.quranText}>
                        {playlist[currentIndex]?.text}
                      </Text>
                    </ScrollView>

                    <View style={styles.ayahInfo}>
                      <View style={styles.infoBadge}>
                        <Text style={styles.infoBadgeText}>
                          {playlist[currentIndex]?.verse_key}
                        </Text>
                      </View>
                      <Text style={styles.progressCounter}>
                        {toArabicNumerals(currentIndex + 1)} /{" "}
                        {toArabicNumerals(playlist.length)}
                      </Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Player Controls Area */}
                <View style={styles.controlsArea}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${((currentIndex + 1) / playlist.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      style={styles.navBtn}
                      onPress={playNext}
                      disabled={currentIndex === playlist.length - 1}
                    >
                      <Ionicons
                        name="play-skip-back"
                        size={28}
                        color={
                          currentIndex === playlist.length - 1
                            ? Colors.textTertiary
                            : Colors.textPrimary
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playBtn}
                      onPress={togglePlayPause}
                    >
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={40}
                        color="#FFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.navBtn}
                      onPress={playPrevious}
                      disabled={currentIndex === 0}
                    >
                      <Ionicons
                        name="play-skip-forward"
                        size={28}
                        color={
                          currentIndex === 0
                            ? Colors.textTertiary
                            : Colors.textPrimary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const getStyles = (Colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    safeContainer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    headerTitleBox: {
      alignItems: "center",
    },
    headerTitle: {
      fontFamily: Typography.heading,
      fontSize: 14,
      color: Colors.textPrimary,
    },
    headerSubtitle: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textSecondary,
    },
    closeBtn: {
      padding: Spacing.sm,
      backgroundColor: Colors.surfaceElevated,
      borderRadius: 12,
    },
    mainContent: {
      flex: 1,
      padding: Spacing.xl,
      justifyContent: "center",
    },
    mushafCard: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing.xl,
    },
    mushafPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03,
      // Using a built-in symbol representation or just texture
    },
    textScroll: {
      flex: 1,
    },
    textScrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingVertical: Spacing.xl,
    },
    quranText: {
      fontFamily: Typography.quran,
      fontSize: 20,
      lineHeight: 65,
      color: Colors.textPrimary,
      textAlign: "center",
    },
    ayahInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: Spacing.xl,
    },
    infoBadge: {
      paddingVertical: 4,
    },
    infoBadgeText: {
      fontSize: 12,
      color: Colors.primary,
    },
    progressCounter: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textTertiary,
    },
    controlsArea: {
      marginTop: Spacing["2xl"],
      gap: Spacing.xl,
    },
    progressBar: {
      height: 4,
      width: "100%",
      backgroundColor: Colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: Colors.primary,
    },
    buttonsRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing["2xl"],
    },
    playBtn: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      ...Shadow.emerald,
    },
    navBtn: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: Colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.border,
    },
    loaderArea: {
      alignItems: "center",
      gap: Spacing.md,
    },
    loaderText: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: Colors.textSecondary,
    },
    errorArea: {
      alignItems: "center",
      gap: Spacing.lg,
    },
    errorText: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: Colors.textSecondary,
      textAlign: "center",
    },
    retryBtn: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      backgroundColor: Colors.primary,
      borderRadius: 12,
    },
    retryBtnText: {
      color: "#FFF",
    },
  });
