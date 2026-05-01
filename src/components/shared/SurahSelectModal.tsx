import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SURAHS } from "../../data/quranMeta";
import { BorderRadius, Spacing, Typography, useTheme } from "../../theme";

interface SurahSelectModalProps {
  visible: boolean;
  selectedIds: number[];
  onToggle: (id: number) => void;
  onDone: () => void;
}

export function SurahSelectModal({
  visible,
  selectedIds,
  onToggle,
  onDone,
}: SurahSelectModalProps) {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.content, { height: "90%" }]}>
          <Text style={styles.title}>اختر السور</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {SURAHS.map((surah) => {
              const isSelected = selectedIds.includes(surah.id);
              return (
                <TouchableOpacity
                  key={surah.id}
                  style={[
                    styles.item,
                    isSelected && { backgroundColor: `${Colors.primary}10` },
                  ]}
                  onPress={() => onToggle(surah.id)}
                >
                  <Ionicons
                    name={isSelected ? "checkbox" : "square-outline"}
                    size={20}
                    color={isSelected ? Colors.primary : Colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.surahName,
                      isSelected && { color: Colors.primary },
                    ]}
                  >
                    {surah.nameAr}
                  </Text>
                  <Text style={styles.surahNumber}>{surah.id}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: Colors.primary }]}
              onPress={onDone}
            >
              <Text style={styles.btnText}>تم الاختيار</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      width: "90%",
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    title: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      color: Colors.textPrimary,
      marginBottom: Spacing.lg,
      textAlign: "center",
    },
    item: {
      flexDirection: "row-reverse",
      alignItems: "center",
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    surahName: {
      flex: 1,
      fontFamily: Typography.body,
      fontSize: Typography.base,
      color: Colors.textPrimary,
      textAlign: "left",
      paddingRight: Spacing.md,
    },
    surahNumber: {
      width: 30,
      fontFamily: Typography.body,
      fontSize: Typography.xs,
      color: Colors.textTertiary,
      textAlign: "center",
    },
    actions: {
      marginTop: Spacing.md,
    },
    btn: {
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: "center",
    },
    btnText: {
      color: "#FFF",
      fontFamily: Typography.body,
      fontSize: Typography.sm,
    },
  });
