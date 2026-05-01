import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Spacing, Typography } from "../../theme";

interface IntentionButtonProps {
  tapped: boolean;
  onPress: () => void;
  Colors: any;
  quote?: { text: string; source: string };
}

export function IntentionButton({ tapped, onPress, Colors, quote }: IntentionButtonProps) {
  return (
    <View>
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

      {tapped && quote && (
        <View style={[styles.quoteCard, { backgroundColor: `${Colors.success}05`, borderColor: `${Colors.success}20` }]}>
          <Ionicons name="chatbubbles-outline" size={24} color={`${Colors.success}40`} />
          <Text style={[styles.quoteText, { color: Colors.textPrimary }]}>{quote.text}</Text>
          <Text style={[styles.quoteSource, { color: Colors.success }]}>— {quote.source}</Text>
        </View>
      )}
    </View>
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
  intentionTextWrap: { flex: 1, alignItems: "flex-start" },
  intentionTitle: { fontFamily: Typography.heading, fontSize: 16, textAlign: "left", marginBottom: 2 },
  intentionDesc: { fontFamily: Typography.body, fontSize: 12, textAlign: "left" },
  quoteCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: "center",
  },
  quoteText: {
    fontFamily: Typography.body,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 26,
    marginVertical: Spacing.sm,
  },
  quoteSource: {
    fontFamily: Typography.heading,
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
