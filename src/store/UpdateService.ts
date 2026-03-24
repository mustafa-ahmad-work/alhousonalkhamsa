import Constants from 'expo-constants';

/**
 * Service to check for new app versions.
 * In a real-world scenario, you would fetch this from your backend or a static JSON on GitHub.
 */
export const UpdateService = {
  CURRENT_VERSION: Constants.expoConfig?.version || '1.0.0',
  
  // Replace this with your actual update check URL (e.g., raw.githubusercontent.com/.../version.json)
  CHECK_URL: 'https://raw.githubusercontent.com/mustafa-ahmad/alhouson-alkhamsa/main/version.json',

  async checkForUpdate(): Promise<{ hasUpdate: boolean; latestVersion?: string; changelog?: string } | null> {
    try {
      // For demonstration, we simulate a fetch. 
      // In production, uncomment the real fetch below.
      
      /*
      const response = await fetch(this.CHECK_URL);
      if (!response.ok) return null;
      const data = await response.json();
      
      const hasUpdate = this.isVersionGreater(data.latestVersion, this.CURRENT_VERSION);
      return {
        hasUpdate,
        latestVersion: data.latestVersion,
        changelog: data.changelog
      };
      */

      // Simulated Logic: Change '1.1.0' to '1.0.0' to hide the banner
      const latestVersion = '1.1.0'; 
      const hasUpdate = latestVersion !== this.CURRENT_VERSION;

      return {
        hasUpdate,
        latestVersion,
        changelog: 'تحسينات واجهة الحفظ والمراجعة ودعم المظهر الداكن'
      };
    } catch (error) {
      console.warn('Failed to check for updates:', error);
      return null;
    }
  },

  isVersionGreater(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < latestParts.length; i++) {
        if (latestParts[i] > (currentParts[i] || 0)) return true;
        if (latestParts[i] < (currentParts[i] || 0)) return false;
    }
    return false;
  }
};
