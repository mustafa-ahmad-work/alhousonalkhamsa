import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NotificationService } from "../store/NotificationService";
import { BorderRadius, Shadow, Spacing, Typography, useTheme } from "../theme";
import { useThemeStore } from "../store/ThemeStore";

// ── Extracted Components ─────────────────────────────────────────────────────
import { EditModal } from "../components/settings/EditModal";
import { MushafEditionPicker } from "../components/settings/MushafEditionPicker";
import { NotificationRow } from "../components/settings/NotificationRow";
import { PlanModeSelector } from "../components/settings/PlanModeSelector";
import { TimePickerModal } from "../components/settings/TimePickerModal";


// ── Types ─────────────────────────────────────────────────────────────────────

import { useSettingsLogic } from "../hooks/useSettingsLogic";

const NOTIFICATION_ROWS = [
  {
    id: "recitation",
    label: "تنبيه التلاوة",
    field: "recitationEnabled",
    timeField: "recitationTime",
  },
  {
    id: "listening",
    label: "تنبيه الاستماع",
    field: "listeningEnabled",
    timeField: "listeningTime",
  },
  {
    id: "weekly",
    label: "التحضير الأسبوعي",
    field: "weeklyPrepEnabled",
    timeField: "weeklyPrepTime",
  },
  {
    id: "nightly",
    label: "التحضير الليلي",
    field: "nightlyPrepEnabled",
    timeField: "nightlyPrepTime",
  },
  {
    id: "daily",
    label: "التحضير القبلي",
    field: "dailyPrepEnabled",
    timeField: "dailyPrepTime",
  },
  {
    id: "memorization",
    label: "تنبيه الحفظ",
    field: "memorizationEnabled",
    timeField: "memorizationTime",
  },
  {
    id: "review",
    label: "تنبيه المراجعة",
    field: "reviewEnabled",
    timeField: "reviewTime",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const {
    state,
    dispatch,
    editModalVisible,
    setEditModalVisible,
    editType,
    editValue,
    setEditValue,
    planMode,
    setPlanMode,
    dailyPages,
    setDailyPages,
    activeDaysOfWeek,
    setActiveDaysOfWeek,
    timePickerVisible,
    setTimePickerVisible,
    selectedHour,
    setSelectedHour,
    selectedMinute,
    setSelectedMinute,
    permStatus,
    setPermStatus,
    handleEdit,
    saveEdit,
    saveSelectedTime,
    applyPlanModeSettings,
    applyPlanChanges,
    handleReset,
    handleToggleTheme,
    toggleNotifField,
    currentEditionId,
    isMasterEnabled,
  } = useSettingsLogic();

  const themeMode = useThemeStore((s) => s.themeMode);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={themeMode === "dark" ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Account ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>معلومات الحساب</Text>
        <View style={styles.card}>
          {[
            { key: "name", label: "الاسم", value: state.user?.name ?? "—" },
            {
              key: "dailyPages",
              label: "طاقتك اليومية (صفحات)",
              value: `${state.user?.dailyPages} صفحة/صفحات`,
            },
          ].map(({ key, label, value }, idx, arr) => (
            <React.Fragment key={key}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleEdit(key)}
              >
                <Text style={styles.label}>{label}</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.value}>{value}</Text>
                  <Ionicons name="pencil" size={12} color={Colors.primary} />
                </View>
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Mushaf Edition ───────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          طبعة المصحف الشريف
        </Text>
        <View style={styles.card}>
          <Text
            style={[
              styles.smallValue,
              { marginBottom: Spacing.md, lineHeight: 20 },
            ]}
          >
            اختر طبعة المصحف التي تحفظ منها. سيتم بناء الخطة بناءً على أرقام
            صفحات هذه الطبعة تحديداً.
          </Text>
          <MushafEditionPicker
            currentEditionId={currentEditionId}
            onSelect={() => {}}
          />
        </View>

        {/* ── Plan Mode (Daily / Weekly) ────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          نوع الخطة وجدول الأيام
        </Text>
        <View style={styles.card}>
          <PlanModeSelector
            planMode={planMode}
            onModeChange={setPlanMode}
            dailyPages={dailyPages}
            onDailyPagesChange={setDailyPages}
            activeDaysOfWeek={activeDaysOfWeek}
            onActiveDaysChange={setActiveDaysOfWeek}
          />
          <TouchableOpacity
            style={[styles.applyBtn, { marginTop: Spacing.md }]}
            onPress={applyPlanModeSettings}
          >
            <Text style={styles.applyBtnText}>تطبيق الخطة الجديدة</Text>
            <Ionicons name="checkmark-done" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── Timers ──────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          إعدادات المؤقتات (دقائق)
        </Text>
        <View style={styles.card}>
          {[
            {
              key: "memorizationTimer",
              label: "مؤقت الحفظ",
              value: state.settings.memorizationTimerMinutes,
            },
            {
              key: "reviewTimer",
              label: "مؤقت المراجعة",
              value: state.settings.reviewTimerMinutes,
            },
            {
              key: "preparationTimer",
              label: "مؤقت التحضير",
              value: state.settings.preparationTimerMinutes,
            },
            {
              key: "recitationTimer",
              label: "مؤقت التلاوة",
              value: state.settings.recitationTimerMinutes,
            },
            {
              key: "listeningTimer",
              label: "مؤقت الاستماع",
              value: state.settings.listeningTimerMinutes,
            },
          ].map(({ key, label, value }, idx, arr) => (
            <React.Fragment key={key}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleEdit(key)}
              >
                <Text style={styles.label}>{label}</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.value}>{value} دقيقة</Text>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={Colors.primary}
                  />
                </View>
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Advanced ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          إعدادات متقدمة
        </Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() =>
              dispatch({
                type: "UPDATE_SETTINGS",
                payload: { hapticsEnabled: !state.settings.hapticsEnabled },
              })
            }
          >
            <View>
              <Text style={styles.label}>الاهتزاز والتفاعل (Haptics)</Text>
              <Text style={styles.value}>
                {state.settings.hapticsEnabled ? "مفعّل" : "معطّل"}
              </Text>
            </View>
            <Ionicons
              name={
                state.settings.hapticsEnabled ? "checkbox" : "square-outline"
              }
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => {
              const strategies: ("spaced" | "random" | "recency")[] = [
                "spaced",
                "random",
                "recency",
              ];
              const next =
                strategies[
                  (strategies.indexOf(state.settings.reviewStrategy) + 1) %
                    strategies.length
                ];
              dispatch({
                type: "UPDATE_SETTINGS",
                payload: { reviewStrategy: next },
              });
            }}
          >
            <View>
              <Text style={styles.label}>استراتيجية المراجعة</Text>
              <Text style={styles.value}>
                {state.settings.reviewStrategy === "spaced"
                  ? "التكرار المتباعد (SSR)"
                  : state.settings.reviewStrategy === "random"
                    ? "عشوائي"
                    : "الأحدث أولاً"}
              </Text>
            </View>
            <Ionicons
              name="git-network-outline"
              size={18}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() =>
              dispatch({
                type: "UPDATE_SETTINGS",
                payload: {
                  showDailyProgressOnDashboard:
                    !state.settings.showDailyProgressOnDashboard,
                },
              })
            }
          >
            <View>
              <Text style={styles.label}>إظهار شريط الإنجاز في الرئيسية</Text>
              <Text style={styles.value}>
                {state.settings.showDailyProgressOnDashboard ? "نعم" : "لا"}
              </Text>
            </View>
            <Ionicons
              name={
                state.settings.showDailyProgressOnDashboard ? "eye" : "eye-off"
              }
              size={18}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Theme ───────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          المظهر والتخصيص
        </Text>
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <View>
              <Text style={styles.label}>مظهر التطبيق</Text>
              <Text style={styles.value}>
                {themeMode === "light" ? "الوضع الفاتح" : "الوضع الداكن"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={handleToggleTheme}
            >
              <Ionicons
                name={themeMode === "light" ? "sunny" : "moon"}
                size={18}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Notifications ────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          تنبيهات مفاتيح حفظ القرآن
        </Text>

        {/* Templates */}
        <View
          style={{ marginBottom: Spacing.md, paddingHorizontal: Spacing.xs }}
        >
          <Text style={[styles.smallValue, { marginBottom: Spacing.sm }]}>
            أوضاع مقترحة للجدولة:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {[
              {
                label: "البكور (الفجر)",
                times: {
                  recitationTime: "07:00",
                  listeningTime: "09:00",
                  weeklyPrepTime: "17:00",
                  nightlyPrepTime: "21:00",
                  dailyPrepTime: "04:45",
                  memorizationTime: "05:00",
                  reviewTime: "15:00",
                },
              },
              {
                label: "قياسي (صباحي)",
                times: {
                  recitationTime: "08:00",
                  listeningTime: "10:00",
                  weeklyPrepTime: "18:00",
                  nightlyPrepTime: "22:00",
                  dailyPrepTime: "05:45",
                  memorizationTime: "06:00",
                  reviewTime: "16:00",
                },
              },
              {
                label: "متأخر",
                times: {
                  recitationTime: "10:00",
                  listeningTime: "12:00",
                  weeklyPrepTime: "20:00",
                  nightlyPrepTime: "23:00",
                  dailyPrepTime: "07:45",
                  memorizationTime: "08:00",
                  reviewTime: "17:00",
                },
              },
            ].map(({ label, times }) => (
              <TouchableOpacity
                key={label}
                style={styles.templateBtn}
                onPress={() =>
                  dispatch({
                    type: "UPDATE_SETTINGS",
                    payload: {
                      notifications: {
                        ...state.settings.notifications,
                        enabled: true,
                        recitationEnabled: true,
                        listeningEnabled: true,
                        weeklyPrepEnabled: true,
                        nightlyPrepEnabled: true,
                        dailyPrepEnabled: true,
                        memorizationEnabled: true,
                        reviewEnabled: true,
                        ...times,
                      },
                    },
                  })
                }
              >
                <Text style={styles.templateBtnText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          {/* Master toggle */}
          <View style={styles.themeRow}>
            <View>
              <Text style={styles.label}>تشغيل كافة التنبيهات</Text>
              <Text style={styles.value}>
                {isMasterEnabled ? "مفعّل" : "متوقف"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={() =>
                dispatch({
                  type: "UPDATE_SETTINGS",
                  payload: {
                    notifications: {
                      ...state.settings.notifications,
                      enabled: !isMasterEnabled,
                    },
                  },
                })
              }
            >
              <Ionicons
                name={
                  isMasterEnabled
                    ? "notifications-circle"
                    : "notifications-off-circle"
                }
                size={22}
                color={isMasterEnabled ? Colors.primary : Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          {/* Individual rows */}
          {NOTIFICATION_ROWS.map((row, idx) => (
            <NotificationRow
              key={row.id}
              label={row.label}
              field={row.field}
              timeField={row.timeField}
              notifications={state.settings.notifications as any}
              isMasterEnabled={isMasterEnabled}
              onToggle={toggleNotifField}
              onTimePress={handleEdit}
              showDivider={idx < NOTIFICATION_ROWS.length - 1}
            />
          ))}
        </View>

        {/* ── Permissions ──────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          إدارة الصلاحيات
        </Text>
        <View style={styles.card}>
          <View style={styles.permRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>ظهور التنبيهات</Text>
              <Text
                style={[
                  styles.smallValue,
                  {
                    color:
                      permStatus === "granted" ? Colors.primary : Colors.red,
                  },
                ]}
              >
                {permStatus === "granted" ? "مفعلة" : "غير مفعلة"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.permBtn,
                permStatus === "granted" && styles.permBtnDisabled,
              ]}
              disabled={permStatus === "granted"}
              onPress={async () =>
                setPermStatus(await NotificationService.requestPermissions())
              }
            >
              <Text style={styles.permBtnText}>
                {permStatus === "granted" ? "مكتمل" : "تفعيل"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => NotificationService.openNotificationSettings()}
          >
            <Ionicons
              name="settings-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={[styles.label, { flex: 1, marginLeft: 10 }]}>
              إعدادات النظام المتقدمة
            </Text>
            <Ionicons
              name="chevron-back"
              size={14}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
          {Platform.OS === "android" && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>العمل في الخلفية</Text>
                  <Text style={styles.smallValue}>
                    لضمان وصول التنبيهات حتى في وضع توفير الطاقة
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.permBtn}
                  onPress={() => Linking.openSettings()}
                >
                  <Text style={styles.permBtnText}>إعدادات البطارية</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── About ────────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          حول التطبيق
        </Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => router.push("/legal")}
          >
            <View>
              <Text style={styles.label}>الشروط والخصوصية</Text>
              <Text style={styles.value}>
                اقرأ شروط الاستخدام وسياسة الخصوصية
              </Text>
            </View>
            <Ionicons
              name="chevron-back"
              size={16}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>الإصدار</Text>
            <Text style={styles.value}>
              {Constants.expoConfig?.version || "1.0.0"} (BETA)
            </Text>
          </View>
        </View>

        {/* ── Danger Zone ──────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          البيانات
        </Text>
        <TouchableOpacity
          style={[styles.card, styles.dangerBtn]}
          onPress={handleReset}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.red} />
          <Text style={styles.dangerBtnText}>إعادة تعيين كافة البيانات</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <EditModal
        visible={editModalVisible}
        editType={editType}
        value={editValue}
        onChangeValue={setEditValue}
        onSave={saveEdit}
        onCancel={() => setEditModalVisible(false)}
      />

      <TimePickerModal
        visible={timePickerVisible}
        editType={editType}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onHourChange={setSelectedHour}
        onMinuteChange={setSelectedMinute}
        onConfirm={saveSelectedTime}
        onCancel={() => setTimePickerVisible(false)}
      />

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 56,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    backBtn: {
      width: 40,
      height: 40,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    content: { padding: Spacing.xl },
    sectionTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
      marginBottom: Spacing.sm,
      textAlign: "left",
    },
    card: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    valueRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
    label: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
    },
    value: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textPrimary,
      fontWeight: Typography.medium,
    },
    smallValue: {
      fontFamily: Typography.body,
      fontSize: 11,
      color: Colors.textSecondary,
      textAlign: "left",
      lineHeight: 16,
    },
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginVertical: Spacing.md,
    },
    themeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: Colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${Colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
    },
    dangerBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      borderColor: `${Colors.red}20`,
      backgroundColor: Colors.redMuted,
    },
    dangerBtnText: {
      color: Colors.red,
      fontFamily: Typography.heading,
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
    },
    applyBtn: {
      backgroundColor: Colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: BorderRadius.lg,
      gap: Spacing.sm,
      marginTop: Spacing.sm,
      ...Shadow.emerald,
    },
    applyBtnText: {
      color: "#FFF",
      fontFamily: Typography.heading,
      fontSize: 15,
      fontWeight: "bold",
    },
    templateBtn: {
      backgroundColor: Colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    templateBtnText: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: "500",
    },
    permRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    permBtn: {
      backgroundColor: `${Colors.primary}10`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    },
    permBtnDisabled: {
      backgroundColor: Colors.surface,
      borderColor: Colors.border,
    },
    permBtnText: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.primary,
      fontWeight: "bold",
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
    },
  });
