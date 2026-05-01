import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Spacing, Typography } from "../../theme";
import { SettingRow, SettingSection } from "./SettingsUI";
import { PlanRangeSelector } from "../shared/PlanRangeSelector";
import { MushafEditionPicker } from "./MushafEditionPicker";

interface UserSectionProps {
  state: any;
  handleEdit: (type: any) => void;
  Colors: any;
}

export function UserAccountSection({ state, handleEdit, Colors }: UserSectionProps) {
  const rows = [
    { key: "name", label: "الاسم الكريم", value: state.user?.name || "لم يحدد" },
    { key: "goal", label: "الهدف الحالي", value: state.user?.goal || "لم يحدد" },
    { key: "dailyPages", label: "الورد اليومي (صفحات)", value: `${state.user?.dailyPages || 0} صفحات` },
  ];

  return (
    <SettingSection title="الحساب والهدف" Colors={Colors}>
      {rows.map((row, i) => (
        <SettingRow
          key={row.key}
          label={row.label}
          value={row.value}
          onPress={() => handleEdit(row.key)}
          showDivider={i < rows.length - 1}
          Colors={Colors}
        />
      ))}
    </SettingSection>
  );
}

interface MushafSectionProps {
  currentEditionId: string;
  onSelect: (id: string) => void;
  Colors: any;
}

export function MushafEditionSection({ currentEditionId, onSelect, Colors }: MushafSectionProps) {
  return (
    <SettingSection title="طبعة المصحف الشريف" Colors={Colors}>
      <Text style={[styles.sectionHint, { color: Colors.textSecondary }]}>
        اختر طبعة المصحف التي تحفظ منها. سيتم بناء الخطة بناءً على أرقام صفحات هذه الطبعة.
      </Text>
      <MushafEditionPicker currentEditionId={currentEditionId} onSelect={onSelect} />
    </SettingSection>
  );
}

interface TimerSectionProps {
  settings: any;
  handleEdit: (type: any) => void;
  Colors: any;
}

export function TimerSettingsSection({ settings, handleEdit, Colors }: TimerSectionProps) {
  const timers = [
    { key: "memorizationTimer", label: "مؤقت الحفظ", value: settings.memorizationTimerMinutes },
    { key: "reviewTimer", label: "مؤقت المراجعة", value: settings.reviewTimerMinutes },
    { key: "preparationTimer", label: "مؤقت التحضير", value: settings.preparationTimerMinutes },
    { key: "recitationTimer", label: "مؤقت التلاوة", value: settings.recitationTimerMinutes },
    { key: "listeningTimer", label: "مؤقت الاستماع", value: settings.listeningTimerMinutes },
  ];

  return (
    <SettingSection title="إعدادات المؤقتات (دقائق)" Colors={Colors}>
      {timers.map((t, i) => (
        <SettingRow
          key={t.key}
          label={t.label}
          value={`${t.value} دقيقة`}
          icon="time-outline"
          onPress={() => handleEdit(t.key)}
          showDivider={i < timers.length - 1}
          Colors={Colors}
        />
      ))}
    </SettingSection>
  );
}

interface AdvancedSectionProps {
  settings: any;
  dispatch: (action: any) => void;
  Colors: any;
}

export function AdvancedSettingsSection({ settings, dispatch, Colors }: AdvancedSectionProps) {
  return (
    <SettingSection title="إعدادات متقدمة" Colors={Colors}>
      <TouchableOpacity
        style={styles.advancedRow}
        onPress={() => dispatch({ type: "UPDATE_SETTINGS", payload: { hapticsEnabled: !settings.hapticsEnabled } })}
      >
        <View style={styles.advancedLabelCol}>
          <Text style={[styles.rowLabel, { color: Colors.textPrimary }]}>الاهتزاز والتفاعل (Haptics)</Text>
          <Text style={[styles.rowVal, { color: Colors.primary }]}>{settings.hapticsEnabled ? "مفعّل" : "معطّل"}</Text>
        </View>
        <Ionicons name={settings.hapticsEnabled ? "checkbox" : "square-outline"} size={20} color={Colors.primary} />
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: Colors.border }]} />

      <TouchableOpacity
        style={styles.advancedRow}
        onPress={() => {
          const strategies: ("spaced" | "random" | "recency")[] = ["spaced", "random", "recency"];
          const next = strategies[(strategies.indexOf(settings.reviewStrategy) + 1) % strategies.length];
          dispatch({ type: "UPDATE_SETTINGS", payload: { reviewStrategy: next } });
        }}
      >
        <View style={styles.advancedLabelCol}>
          <Text style={[styles.rowLabel, { color: Colors.textPrimary }]}>استراتيجية المراجعة</Text>
          <Text style={[styles.rowVal, { color: Colors.primary }]}>
            {settings.reviewStrategy === "spaced" ? "التكرار المتباعد (SSR)" : settings.reviewStrategy === "random" ? "عشوائي" : "الأحدث أولاً"}
          </Text>
        </View>
        <Ionicons name="git-network-outline" size={18} color={Colors.primary} />
      </TouchableOpacity>
    </SettingSection>
  );
}

const styles = StyleSheet.create({
  sectionHint: { padding: Spacing.md, fontSize: 13, lineHeight: 20, textAlign: "left" },
  advancedRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.lg },
  advancedLabelCol: { flex: 1, alignItems: "flex-start" },
  rowLabel: { fontSize: 14, marginBottom: 2 },
  rowVal: { fontSize: 12},
  divider: { height: 1, marginHorizontal: Spacing.lg },
});
