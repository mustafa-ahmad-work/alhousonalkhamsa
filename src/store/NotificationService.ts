/**
 * NotificationService — Production-Ready (Expo SDK 54 / expo-notifications ~0.32)
 *
 * Design decisions:
 * ─────────────────
 * 1. Uses `SchedulableTriggerInputTypes.DAILY` trigger — this is the correct
 *    API for SDK 54+. Unlike the old `{ hour, minute, repeats: true }` format,
 *    the DAILY trigger type NEVER fires a "catch-up" notification immediately
 *    when the scheduled time has already passed today. It always waits for the
 *    next upcoming occurrence. No scheduling lock needed.
 *
 * 2. Each reminder has a FIXED, UNIQUE identifier (e.g. 'husoon_recitation').
 *    We cancel-then-reschedule by identifier, so each reminder is fully isolated.
 *    Changing one reminder's time does NOT affect the others.
 *
 * 3. Change-detection via a persistent AsyncStorage hash. If the user's
 *    notification settings haven't changed since the last scheduling run,
 *    we skip the whole operation — no wasted cancellation/rescheduling cycles.
 *
 * 4. Android HIGH-importance channel ensures notifications break through
 *    Do-Not-Disturb and are shown as heads-up banners.
 *
 * 5. Logging: every step is logged under '[NS]' for easy debugging.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Linking, Platform } from "react-native";
import { NotificationSettings } from "../types";

// ─── Storage key for change-detection hash ──────────────────────────────────
const NOTIF_HASH_KEY = "husoon_notif_settings_hash_v2";

// ─── Android notification channel id ────────────────────────────────────────
const CHANNEL_ID = "husoon_reminders";

// ─── One stable identifier per reminder type ───────────────────────────────
// These are the canonical IDs used for cancel-by-id and reschedule.
// Keep them stable across app versions; changing them orphans old notifications.
const REMINDER_IDS = {
  recitation: "husoon_recitation",
  listening: "husoon_listening",
  weeklyPrep: "husoon_weekly_prep",
  nightlyPrep: "husoon_nightly_prep",
  dailyPrep: "husoon_daily_prep",
  memorization: "husoon_memorization",
  review: "husoon_review",
} as const;

type ReminderId = (typeof REMINDER_IDS)[keyof typeof REMINDER_IDS];

const ALL_REMINDER_IDS: ReminderId[] = Object.values(REMINDER_IDS);

// ─── Lazy-load expo-notifications (avoids web / Expo Go side-effects) ───────
let _Notifications: any = null;

function getNotifications(): any | null {
  if (Platform.OS === "web") return null;
  if (_Notifications) return _Notifications;

  // Silence Expo Go's warnings (local-only app)
  const isGo = Constants.appOwnership === "expo";
  if (isGo && !(console as any).__nsFilterInstalled) {
    const origWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("expo-notifications` functionality is not fully supported") ||
          args[0].includes("SafeAreaView has been deprecated") ||
          args[0].includes("Property \"opacity\" of AnimatedComponent"))
      )
        return;
      origWarn.apply(console, args);
    };

    const origError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Android Push notifications")
      )
        return;
      origError.apply(console, args);
    };
    (console as any).__nsFilterInstalled = true;
  }

  try {
    _Notifications = require("expo-notifications");
  } catch {
    console.warn("[NS] expo-notifications not available");
    return null;
  }

  // Set a minimal global notification handler (show everything by default).
  // With the DAILY trigger type, we no longer need a scheduling-lock mechanism
  // because DAILY triggers never emit an immediate catch-up fire.
  _Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return _Notifications;
}

// ─── Simple djb2-style hash for change detection ─────────────────────────────
function hashString(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

// ─── Validate HH:MM time string ──────────────────────────────────────────────
function parseTime(time: string): { hour: number; minute: number } | null {
  const parts = time.split(":");
  if (parts.length !== 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (
    isNaN(hour) ||
    isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  )
    return null;
  return { hour, minute };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public service
// ─────────────────────────────────────────────────────────────────────────────
export const NotificationService = {
  // ── Permissions ─────────────────────────────────────────────────────────

  /** Request permissions and set up the Android channel. Returns true if granted. */
  async registerForPushNotificationsAsync(): Promise<void> {
    if (Platform.OS === "web") return;
    const notifs = getNotifications();
    if (!notifs) return;

    try {
      const { status: existing } = await notifs.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== "granted") {
        const { status } = await notifs.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("[NS] Notification permission not granted");
        return;
      }

      await NotificationService._ensureAndroidChannel(notifs);
      console.log("[NS] Permissions granted and channel ready");
    } catch (_e) {
      console.warn("[NS] Permission setup error:", _e);
    }
  },

  async getPermissionStatus(): Promise<string> {
    if (Platform.OS === "web") return "granted";
    const notifs = getNotifications();
    if (!notifs) return "denied";
    try {
      const { status } = await notifs.getPermissionsAsync();
      return status;
    } catch {
      return "denied";
    }
  },

  async requestPermissions(): Promise<string> {
    if (Platform.OS === "web") return "granted";
    const notifs = getNotifications();
    if (!notifs) return "denied";
    try {
      const { status } = await notifs.requestPermissionsAsync();
      if (status === "granted") {
        await NotificationService._ensureAndroidChannel(notifs);
      }
      return status;
    } catch {
      return "denied";
    }
  },

  async openNotificationSettings(): Promise<void> {
    if (Platform.OS === "web") return;
    if (Platform.OS === "ios") Linking.openURL("app-settings:");
    else Linking.openSettings();
  },

  // ── Android channel ──────────────────────────────────────────────────────

  /** Idempotent — safe to call multiple times. */
  async _ensureAndroidChannel(notifs: any): Promise<void> {
    if (Platform.OS !== "android") return;
    try {
      await notifs.setNotificationChannelAsync(CHANNEL_ID, {
        name: "تنبيهات الحفظ",
        description: "تنبيهات يومية لمحطات حفظ القرآن",
        importance: notifs.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#10B981",
        sound: "default",
        enableVibrate: true,
        showBadge: false,
      });
    } catch (_e) {
      console.warn("[NS] Failed to create Android channel:", _e);
    }
  },

  // ── Cancel helpers ───────────────────────────────────────────────────────

  /** Cancel every managed reminder. Clears the hash so next call always reschedules. */
  async cancelAllFortressReminders(): Promise<void> {
    const notifs = getNotifications();
    if (!notifs) return;

    await Promise.all(
      ALL_REMINDER_IDS.map((id) =>
        notifs.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );
    await AsyncStorage.removeItem(NOTIF_HASH_KEY).catch(() => {});
    console.log("[NS] All reminders cancelled");
  },

  /** Cancel a single reminder by its reminder key. */
  async cancelReminder(reminderId: ReminderId): Promise<void> {
    const notifs = getNotifications();
    if (!notifs) return;
    await notifs.cancelScheduledNotificationAsync(reminderId).catch(() => {});
    console.log(`[NS] Cancelled ${reminderId}`);
  },

  /**
   * Force the next scheduleFortressReminders() call to always reschedule,
   * even if the settings hash appears unchanged.
   * Call this after: onboarding completion, full data reset, factory reset.
   */
  async clearSavedHash(): Promise<void> {
    await AsyncStorage.removeItem(NOTIF_HASH_KEY).catch(() => {});
  },

  // ── Main scheduling entry-point ──────────────────────────────────────────
  /**
   * Schedule (or update) all enabled daily reminders based on the current
   * NotificationSettings. Each reminder is independently isolated — enabling,
   * disabling, or changing the time of one reminder does not affect the others.
   *
   * Algorithm:
   *  1. Hash settings → compare with persisted hash → bail if unchanged.
   *  2. Check OS notification permission — bail if not granted.
   *  3. Ensure Android channel exists.
   *  4. If master switch off → cancel all + save hash.
   *  5. For every reminder slot:
   *       • if enabled → cancel old + schedule new DAILY trigger
   *       • if disabled → cancel only
   *  6. Persist the new hash.
   *
   * Why no scheduling lock?
   * The `SchedulableTriggerInputTypes.DAILY` trigger (SDK 54 / expo-notifications
   * 0.29+) schedules the notification for the next time the specified hour:minute
   * occurs — it NEVER fires a catch-up notification immediately when the time
   * has already passed today. No suppression mechanism is necessary.
   */
  async scheduleFortressReminders(
    settings: NotificationSettings,
  ): Promise<void> {
    if (Platform.OS === "web") return;

    const notifs = getNotifications();
    if (!notifs) return;

    // ── 1. Change-detection ───────────────────────────────────────────────
    const newHash = hashString(JSON.stringify(settings));
    try {
      const savedHash = await AsyncStorage.getItem(NOTIF_HASH_KEY);
      if (savedHash === newHash) {
        console.log("[NS] Settings unchanged — skipping reschedule");
        return;
      }
    } catch {
      // AsyncStorage error → proceed with rescheduling
    }

    // ── 2. Permission check ───────────────────────────────────────────────
    const { status } = await notifs.getPermissionsAsync();
    if (status !== "granted") {
      console.log("[NS] No permission — skipping schedule");
      return;
    }

    // ── 3. Ensure Android channel ─────────────────────────────────────────
    await NotificationService._ensureAndroidChannel(notifs);

    // ── 4. Master switch OFF → cancel all + save hash ────────────────────
    if (!settings.enabled) {
      await Promise.all(
        ALL_REMINDER_IDS.map((id) =>
          notifs.cancelScheduledNotificationAsync(id).catch(() => {}),
        ),
      );
      await AsyncStorage.setItem(NOTIF_HASH_KEY, newHash).catch(() => {});
      console.log("[NS] Master switch OFF — all reminders cancelled");
      return;
    }

    // ── 5. Reminder definitions ───────────────────────────────────────────
    const reminders: {
      id: ReminderId;
      title: string;
      body: string;
      enabled: boolean;
      time: string;
    }[] = [
      {
        id: REMINDER_IDS.recitation,
        title: "ورد التلاوة",
        body: "حان وقت ورد التلاوة.. جزئين يومياً بنظام الحَدر يحقق التثبيت البصري لمصحفك.",
        enabled: settings.recitationEnabled,
        time: settings.recitationTime,
      },
      {
        id: REMINDER_IDS.listening,
        title: "ورد الاستماع",
        body: "أنصت للقرآن لضبط المخارج.. حزب واحد يومياً بصوت متقن يعزز جودة حفظك.",
        enabled: settings.listeningEnabled,
        time: settings.listeningTime,
      },
      {
        id: REMINDER_IDS.weeklyPrep,
        title: "التحضير الأسبوعي",
        body: "استعد للأسبوع القادم.. قراءة صفحات الأسبوع القادم يومياً تيسّر عليك حفظها لاحقاً.",
        enabled: settings.weeklyPrepEnabled,
        time: settings.weeklyPrepTime,
      },
      {
        id: REMINDER_IDS.nightlyPrep,
        title: "التحضير الليلي",
        body: "آخر عهدك اليوم.. ٣٠ دقيقة قراءةً واستماعاً لصفحة الغد تمنحك صورة مستقرة للحفظ.",
        enabled: settings.nightlyPrepEnabled,
        time: settings.nightlyPrepTime,
      },
      {
        id: REMINDER_IDS.dailyPrep,
        title: "التحضير القبلي",
        body: "التهيؤ الذهني.. ١٥ دقيقة من تركيزك الآن هي جسرك للحفظ المتمكن والمستديم.",
        enabled: settings.dailyPrepEnabled,
        time: settings.dailyPrepTime,
      },
      {
        id: REMINDER_IDS.memorization,
        title: "الحفظ الجديد",
        body: "موعد الحفظ الجديد.. كرر الصفحة ١٥ دقيقة على الأقل لنقلها إلى الذاكرة البعيدة.",
        enabled: settings.memorizationEnabled,
        time: settings.memorizationTime,
      },
      {
        id: REMINDER_IDS.review,
        title: "المراجعة اليومية",
        body: "ثبّت ما حفظت.. المراجعة اليومية هي المرحلة المنيعة ضد التفلّت والنسيان.",
        enabled: settings.reviewEnabled,
        time: settings.reviewTime,
      },
    ];

    // ── 6. Cancel-then-reschedule each reminder independently ────────────
    // Using SchedulableTriggerInputTypes.DAILY ensures notifications are
    // scheduled for the NEXT occurrence of that time (today or tomorrow),
    // with NO immediate catch-up fire if the time already passed today.
    const TriggerType = notifs.SchedulableTriggerInputTypes ?? null;

    const results = await Promise.allSettled(
      reminders.map(async (reminder) => {
        // Always cancel the old schedule for this identifier first
        await notifs
          .cancelScheduledNotificationAsync(reminder.id)
          .catch(() => {});

        if (!reminder.enabled) {
          console.log(`[NS] ⊘ ${reminder.id} — disabled, cancelled`);
          return;
        }

        const parsed = parseTime(reminder.time);
        if (!parsed) {
          console.warn(
            `[NS] ✗ ${reminder.id} — invalid time "${reminder.time}"`,
          );
          return;
        }

        // Build the trigger — prefer the typed DAILY trigger (SDK 54+)
        // Fallback to legacy { hour, minute, repeats: true } for older SDK
        const trigger =
          TriggerType?.DAILY != null
            ? {
                type: TriggerType.DAILY as string,
                hour: parsed.hour,
                minute: parsed.minute,
              }
            : {
                hour: parsed.hour,
                minute: parsed.minute,
                repeats: true,
                channelId: CHANNEL_ID,
              };

        await notifs.scheduleNotificationAsync({
          identifier: reminder.id,
          content: {
            title: reminder.title,
            body: reminder.body,
            data: { reminderId: reminder.id },
            sound: "default",
            priority: notifs.AndroidNotificationPriority?.HIGH ?? "high",
            // Android channel
            ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
          },
          trigger,
        });

        console.log(
          `[NS] ✓ ${reminder.id} scheduled daily at ${reminder.time}`,
        );
      }),
    );

    // Log failures without crashing
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        console.warn(
          `[NS] ✗ Failed to schedule ${reminders[i].id}:`,
          result.reason,
        );
      }
    });

    // ── 7. Persist the new hash ───────────────────────────────────────────
    await AsyncStorage.setItem(NOTIF_HASH_KEY, newHash).catch(() => {});
    console.log("[NS] Scheduling complete — hash saved");
  },

  // ── Debug helper (dev builds only) ──────────────────────────────────────
  /** Returns all currently scheduled notifications. Useful during development. */
  async getScheduledNotifications(): Promise<any[]> {
    if (Platform.OS === "web") return [];
    const notifs = getNotifications();
    if (!notifs) return [];
    try {
      return await notifs.getAllScheduledNotificationsAsync();
    } catch {
      return [];
    }
  },
};
