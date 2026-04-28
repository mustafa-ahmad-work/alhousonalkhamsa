import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeState {
  themeMode: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (mode: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: "light",
      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === "light" ? "dark" : "light",
        })),
      setTheme: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "husoon-theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
