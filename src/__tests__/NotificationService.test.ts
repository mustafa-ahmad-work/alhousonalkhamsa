/**
 * NotificationService.test.ts — v2
 *
 * Tests the production-ready notification scheduling logic:
 *  • Hash-based deduplication
 *  • Master switch (enabled/disabled)
 *  • Per-reminder isolation (cancel-then-reschedule)
 *  • Time parsing & validation
 *  • DAILY trigger type usage (SDK 54 / expo-notifications 0.29+)
 *  • Permission guard
 *
 * expo-notifications, AsyncStorage, and React Native are fully mocked.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

import { NotificationService } from '../store/NotificationService';
import { NotificationSettings } from '../types';

const mockScheduleNotification   = jest.fn().mockResolvedValue(undefined);
const mockCancelNotification     = jest.fn().mockResolvedValue(undefined);
const mockGetPermissions         = jest.fn().mockResolvedValue({ status: 'granted' });
const mockSetNotifChannel        = jest.fn().mockResolvedValue(undefined);
const mockSetItem                = jest.fn().mockResolvedValue(undefined);
const mockGetItem                = jest.fn().mockResolvedValue(null);
const mockRemoveItem             = jest.fn().mockResolvedValue(undefined);

// Storage key used by the service (v2)
const HASH_KEY = 'husoon_notif_settings_hash_v2';

// New reminder identifiers used in the production service
const REMINDER_IDS = {
  recitation:  'husoon_recitation',
  listening:   'husoon_listening',
  weeklyPrep:  'husoon_weekly_prep',
  nightlyPrep: 'husoon_nightly_prep',
  dailyPrep:   'husoon_daily_prep',
  memorization:'husoon_memorization',
  review:      'husoon_review',
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem:    (...args: any[]) => mockSetItem(...args),
  getItem:    (...args: any[]) => mockGetItem(...args),
  removeItem: (...args: any[]) => mockRemoveItem(...args),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler:           jest.fn(),
  getPermissionsAsync:              () => mockGetPermissions(),
  requestPermissionsAsync:          jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync:        (...args: any[]) => mockScheduleNotification(...args),
  cancelScheduledNotificationAsync: (...args: any[]) => mockCancelNotification(...args),
  setNotificationChannelAsync:      (...args: any[]) => mockSetNotifChannel(...args),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  AndroidImportance:                { HIGH: 5 },
  AndroidNotificationPriority:      { HIGH: 'high' },
  // Provide SchedulableTriggerInputTypes so the service uses the DAILY trigger
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

jest.mock('expo-constants', () => ({
  expoConfig:   { version: '1.0.0' },
  appOwnership: 'standalone',
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Linking:  { openURL: jest.fn(), openSettings: jest.fn() },
}));

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const defaultSettings: NotificationSettings = {
  enabled:              true,
  recitationEnabled:    true,
  recitationTime:       '08:00',
  listeningEnabled:     true,
  listeningTime:        '10:00',
  weeklyPrepEnabled:    true,
  weeklyPrepTime:       '18:00',
  nightlyPrepEnabled:   true,
  nightlyPrepTime:      '22:00',
  dailyPrepEnabled:     true,
  dailyPrepTime:        '05:45',
  memorizationEnabled:  true,
  memorizationTime:     '06:00',
  reviewEnabled:        true,
  reviewTime:           '16:00',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);        // No saved hash by default
  mockGetPermissions.mockResolvedValue({ status: 'granted' });
});

// ─── SECTION 1: Hash-based deduplication ─────────────────────────────────────

describe('scheduleFortressReminders — hash deduplication', () => {
  it('schedules notifications on first call (no saved hash)', async () => {
    await NotificationService.scheduleFortressReminders(defaultSettings);
    expect(mockScheduleNotification).toHaveBeenCalled();
  });

  it('skips scheduling on second call with the same settings', async () => {
    // First call — computes and saves hash
    await NotificationService.scheduleFortressReminders(defaultSettings);

    // Capture the hash that was saved under the v2 key
    const savedHash = mockSetItem.mock.calls.find(
      (c: any[]) => c[0] === HASH_KEY
    )?.[1];
    expect(savedHash).toBeDefined();

    // Second call — same settings, hash already stored
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(savedHash);
    await NotificationService.scheduleFortressReminders(defaultSettings);

    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });

  it('reschedules when settings change (hash mismatch)', async () => {
    mockGetItem.mockResolvedValue('old_stale_hash_999');
    await NotificationService.scheduleFortressReminders(defaultSettings);
    expect(mockScheduleNotification).toHaveBeenCalled();
  });

  it('persists the new hash after successful scheduling', async () => {
    await NotificationService.scheduleFortressReminders(defaultSettings);
    const savedCalls = mockSetItem.mock.calls.filter((c: any[]) => c[0] === HASH_KEY);
    expect(savedCalls).toHaveLength(1);
    expect(typeof savedCalls[0][1]).toBe('string');
    expect(savedCalls[0][1].length).toBeGreaterThan(0);
  });
});

// ─── SECTION 2: Master switch ─────────────────────────────────────────────────

describe('scheduleFortressReminders — master switch OFF', () => {
  const disabledSettings: NotificationSettings = { ...defaultSettings, enabled: false };

  it('does NOT schedule any notifications', async () => {
    await NotificationService.scheduleFortressReminders(disabledSettings);
    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });

  it('cancels all 7 reminders', async () => {
    await NotificationService.scheduleFortressReminders(disabledSettings);
    // Each of the 7 reminder IDs should be cancelled
    expect(mockCancelNotification).toHaveBeenCalledTimes(7);
  });

  it('still persists the hash (to avoid redundant cancel loops)', async () => {
    await NotificationService.scheduleFortressReminders(disabledSettings);
    const savedCalls = mockSetItem.mock.calls.filter((c: any[]) => c[0] === HASH_KEY);
    expect(savedCalls).toHaveLength(1);
  });
});

// ─── SECTION 3: Per-reminder isolation ───────────────────────────────────────

describe('scheduleFortressReminders — per-reminder isolation', () => {
  it('schedules all 7 when all reminders are enabled', async () => {
    await NotificationService.scheduleFortressReminders(defaultSettings);
    expect(mockScheduleNotification).toHaveBeenCalledTimes(7);
  });

  it('only schedules enabled reminders, cancels the disabled ones', async () => {
    const partial: NotificationSettings = {
      ...defaultSettings,
      recitationEnabled:   true,
      listeningEnabled:    false,
      weeklyPrepEnabled:   false,
      nightlyPrepEnabled:  false,
      dailyPrepEnabled:    false,
      memorizationEnabled: false,
      reviewEnabled:       false,
    };
    await NotificationService.scheduleFortressReminders(partial);
    // Only 1 reminder enabled → only 1 scheduleNotificationAsync call
    expect(mockScheduleNotification).toHaveBeenCalledTimes(1);
    // All 7 are still cancelled first (cancel-then-reschedule pattern)
    expect(mockCancelNotification).toHaveBeenCalledTimes(7);
  });

  it('cancels each reminder before rescheduling it', async () => {
    await NotificationService.scheduleFortressReminders(defaultSettings);
    // Every reminder ID must appear in the cancel calls
    const cancelledIds = mockCancelNotification.mock.calls.map((c: any[]) => c[0]);
    expect(cancelledIds).toContain(REMINDER_IDS.recitation);
    expect(cancelledIds).toContain(REMINDER_IDS.listening);
    expect(cancelledIds).toContain(REMINDER_IDS.weeklyPrep);
    expect(cancelledIds).toContain(REMINDER_IDS.nightlyPrep);
    expect(cancelledIds).toContain(REMINDER_IDS.dailyPrep);
    expect(cancelledIds).toContain(REMINDER_IDS.memorization);
    expect(cancelledIds).toContain(REMINDER_IDS.review);
  });
});

// ─── SECTION 4: Correct reminder identifiers ──────────────────────────────────

describe('scheduleFortressReminders — reminder identifiers', () => {
  it('uses the new husoon_* identifiers (not the old fortress_* ones)', async () => {
    await NotificationService.scheduleFortressReminders(defaultSettings);
    const scheduledIds = mockScheduleNotification.mock.calls.map(
      (c: any[]) => c[0].identifier
    );
    // New identifiers
    expect(scheduledIds).toContain(REMINDER_IDS.recitation);
    expect(scheduledIds).toContain(REMINDER_IDS.listening);
    expect(scheduledIds).toContain(REMINDER_IDS.memorization);
    expect(scheduledIds).toContain(REMINDER_IDS.review);
    // Old identifiers must NOT be used
    expect(scheduledIds).not.toContain('fortress_recitation');
    expect(scheduledIds).not.toContain('fortress_listening');
    expect(scheduledIds).not.toContain('fortress_memorization');
    expect(scheduledIds).not.toContain('fortress_review');
  });
});

// ─── SECTION 5: DAILY trigger type ───────────────────────────────────────────

describe('scheduleFortressReminders — DAILY trigger (SDK 54)', () => {
  it('uses type="daily" trigger when SchedulableTriggerInputTypes.DAILY is available', async () => {
    const singleEnabled: NotificationSettings = {
      ...defaultSettings,
      listeningEnabled:    false,
      weeklyPrepEnabled:   false,
      nightlyPrepEnabled:  false,
      dailyPrepEnabled:    false,
      memorizationEnabled: false,
      reviewEnabled:       false,
      recitationTime:      '08:30',
    };
    await NotificationService.scheduleFortressReminders(singleEnabled);

    const call = mockScheduleNotification.mock.calls[0][0];
    expect(call.trigger.type).toBe('daily');
    expect(call.trigger.hour).toBe(8);
    expect(call.trigger.minute).toBe(30);
    // The DAILY trigger does NOT use `repeats: true`
    expect(call.trigger.repeats).toBeUndefined();
  });

  it('correctly parses "05:45" → hour=5, minute=45', async () => {
    const singleEnabled: NotificationSettings = {
      ...defaultSettings,
      recitationEnabled:   false,
      listeningEnabled:    false,
      weeklyPrepEnabled:   false,
      nightlyPrepEnabled:  false,
      memorizationEnabled: false,
      reviewEnabled:       false,
      dailyPrepEnabled:    true,
      dailyPrepTime:       '05:45',
    };
    await NotificationService.scheduleFortressReminders(singleEnabled);

    const call = mockScheduleNotification.mock.calls[0][0];
    expect(call.trigger.hour).toBe(5);
    expect(call.trigger.minute).toBe(45);
  });

  it('skips reminders with invalid time strings (no crash)', async () => {
    const brokenSettings: NotificationSettings = {
      ...defaultSettings,
      // Disable all except recitation which has a bad time
      listeningEnabled:    false,
      weeklyPrepEnabled:   false,
      nightlyPrepEnabled:  false,
      dailyPrepEnabled:    false,
      memorizationEnabled: false,
      reviewEnabled:       false,
      recitationEnabled:   true,
      recitationTime:      'invalid',
    };
    await expect(
      NotificationService.scheduleFortressReminders(brokenSettings)
    ).resolves.not.toThrow();
    // Invalid time → the reminder is skipped, nothing scheduled
    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });
});

// ─── SECTION 6: cancelAllFortressReminders ───────────────────────────────────

describe('cancelAllFortressReminders', () => {
  it('cancels all 7 reminder IDs', async () => {
    await NotificationService.cancelAllFortressReminders();
    expect(mockCancelNotification).toHaveBeenCalledTimes(7);
  });

  it('removes the v2 hash key so next schedule always runs fresh', async () => {
    await NotificationService.cancelAllFortressReminders();
    expect(mockRemoveItem).toHaveBeenCalledWith(HASH_KEY);
  });
});

// ─── SECTION 7: clearSavedHash ───────────────────────────────────────────────

describe('clearSavedHash', () => {
  it('removes the v2 hash key from AsyncStorage', async () => {
    await NotificationService.clearSavedHash();
    expect(mockRemoveItem).toHaveBeenCalledWith(HASH_KEY);
  });
});

// ─── SECTION 8: Permission guard ─────────────────────────────────────────────

describe('scheduleFortressReminders — permission guard', () => {
  it('does not schedule when permission is denied', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'denied' });
    await NotificationService.scheduleFortressReminders(defaultSettings);
    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });

  it('does not crash when permission is undetermined', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    await expect(
      NotificationService.scheduleFortressReminders(defaultSettings)
    ).resolves.not.toThrow();
    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });
});
