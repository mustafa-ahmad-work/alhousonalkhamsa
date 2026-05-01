import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Spacing, Typography } from "../../theme";

interface IntentionButtonProps {
  tapped: boolean;
  onPress: () => void;
  Colors: any;
}

export function IntentionButton({ tapped, onPress, Colors }: IntentionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.intentionBtn,
        { borderColor: `${Colors.primary}30`, backgroundColor: Colors.glass },
        tapped && { backgroundColor: `${Colors.success}15`, borderColor: Colors.success },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.intentionIcon, { backgroundColor: tapped ? Colors.success : Colors.primary }]}>
        <Ionicons name={tapped ? "checkmark" : "leaf"} size={20} color="#FFF" />
      </View>
      <View style={styles.intentionTextWrap}>
        <Text style={[styles.intentionTitle, { color: tapped ? Colors.success : Colors.primary }]}>
          {tapped ? "تم تجديد النية لله" : "تجديد النية لكتاب الله"}
        </Text>
        <Text style={[styles.intentionDesc, { color: Colors.textSecondary }]}>
          {tapped ? "تقبل الله منك، سدد الله خطاك." : "اضغط هنا لتذكر نفسك بالإخلاص في حفظك."}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  intentionBtn: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  intentionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  intentionTextWrap: { flex: 1 },
  intentionTitle: { fontFamily: Typography.heading, fontSize: 16, textAlign: "left", marginBottom: 2 },
  intentionDesc: { fontFamily: Typography.body, fontSize: 12, textAlign: "left" },
});
