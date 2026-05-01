import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { DEV_CONFIG } from "../developerConfig";

/**
 * Interface for the detailed update information.
 */
export interface UpdateInfo {
  hasUpdate: boolean;
  isMandatory: boolean;
  isAppDisabled: boolean;
  disabledMessage?: string;
  latestVersion: string;
  changelog?: string;
  link?: string;
  minRequiredVersion?: string;
}

const CACHE_KEY = "@mafateeh_update_raw_cache";
const DISMISSED_KEY = "@mafateeh_dismissed_version";
const LAST_CHECK_KEY = "@mafateeh_last_check_time";

/**
 * Service to check for new app versions and app status.
 */
export const UpdateService = {
  CURRENT_VERSION: Constants.expoConfig?.version || (Constants as any).manifest?.version || "1.0.0",
  dismissedOptionalVersion: null as string | null,
  isChecking: false,

  async dismissUpdate(version: string) {
    this.dismissedOptionalVersion = version;
    try {
      await AsyncStorage.setItem(DISMISSED_KEY, version);
    } catch (e) {
      // ignore
    }
  },

  /**
   * Main check function that handles remote fetching and local caching.
   */
  async checkForUpdate(): Promise<UpdateInfo | null> {
    if (this.isChecking) return null;
    this.isChecking = true;

    try {
      // Ensure dismissed version is loaded
      if (!this.dismissedOptionalVersion) {
        try {
          this.dismissedOptionalVersion = await AsyncStorage.getItem(DISMISSED_KEY);
        } catch (e) {}
      }

      // Using GitHub API instead of Raw CDN to avoid aggressive caching (CDN can take 5+ mins)
      // The 'application/vnd.github.v3.raw' header tells GitHub to return the file content directly
      const freshUrl = `https://api.github.com/repos/mustafa-ahmad-work/mafateeh-tathbeet-alquran/contents/version.json?ref=main&t=${Date.now()}`;
      
      try {
        // Check if we should skip fetch (e.g. checked in last 24 hours)
        const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (lastCheck && now - parseInt(lastCheck) < twentyFourHours && !DEV_CONFIG.bypassUpdateCache) {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            const data = JSON.parse(cached);
            const info = this.processUpdateData(data);
            if (!info.isMandatory && !info.isAppDisabled) {
              return info;
            }
          }
        }
        
        const response = await fetch(freshUrl, {
          method: 'GET',
          headers: { 
            "Accept": "application/vnd.github.v3.raw",
            "Cache-Control": "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
          await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
          return this.processUpdateData(data);
        }
      } catch (error) {
        console.warn("Failed to fetch remote update, falling back to cache:", error);
      }

      // 2. Fallback to cache if offline or fetch failed (Skip if bypassing cache)
      if (!DEV_CONFIG.bypassUpdateCache) {
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            const data = JSON.parse(cached);
            return this.processUpdateData(data);
          }
        } catch (e) {}
      }

      return null;
    } finally {
      this.isChecking = false;
    }
  },

  /**
   * Processes the raw JSON from the server and determines the status.
   */
  processUpdateData(data: any): UpdateInfo {
    const latestVersion = data.latestVersion || "1.0.0";
    const minRequiredVersion = data.minRequiredVersion || "1.0.0";
    const isAppDisabled = !!data.isAppDisabled;

    let hasUpdate = this.isVersionGreater(latestVersion, this.CURRENT_VERSION);
    const isMandatory = this.isVersionGreater(minRequiredVersion, this.CURRENT_VERSION);

    // If the user dismissed this specific optional update in the current session, hide it
    if (!isMandatory && hasUpdate && this.dismissedOptionalVersion === latestVersion && !DEV_CONFIG.bypassUpdateCache) {
      hasUpdate = false;
    }

    return {
      hasUpdate,
      isMandatory,
      isAppDisabled,
      disabledMessage: data.disabledMessage || "التطبيق يخضع للصيانة، نعتذر عن الإزعاج.",
      latestVersion,
      changelog: data.changelog,
      link: data.link || "https://github.com/mustafa-ahmad-work/mafateeh-tathbeet-alquran/releases",
      minRequiredVersion,
    };
  },

  /**
   * Compares two semantic version strings.
   * Returns true if v1 > v2.
   */
  isVersionGreater(v1: string, v2: string): boolean {
    const v1Parts = v1.split(".").map((p) => parseInt(p, 10));
    const v2Parts = v2.split(".").map((p) => parseInt(p, 10));

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const p1 = v1Parts[i] || 0;
      const p2 = v2Parts[i] || 0;
      if (p1 > p2) return true;
      if (p1 < p2) return false;
    }
    return false;
  },
};
