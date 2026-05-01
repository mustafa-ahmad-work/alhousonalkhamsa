import { useThemeStore } from "../store/ThemeStore";

// Design Tokens for مفاتيح حفظ القرآن (Quran Anchoring Keys)
// Refined, minimal, premium dark-first design system

export const darkColors = {
  // Base — deep, rich dark with subtle blue undertone
  background: "#07090F",
  surface: "#0F1218",
  surfaceElevated: "#151920",
  card: "#12161E",
  border: "rgba(255, 255, 255, 0.06)",
  borderLight: "rgba(255, 255, 255, 0.10)",

  // Solid surface tokens (replacing glass for no blur)
  glass: "#0F1218",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  glassElevated: "#151920",

  // Primary (Muted Emerald — elegant, not vivid)
  primary: "#2DD4A0",
  primaryLight: "#5EEAC4",
  primaryDark: "#1A9E77",
  primaryMuted: "rgba(45, 212, 160, 0.08)",
  primarySubtle: "rgba(45, 212, 160, 0.04)",

  // Gold (Warm, refined)
  gold: "#E5A93D",
  goldLight: "#F0C76C",
  goldMuted: "rgba(229, 169, 61, 0.08)",
  secondary: "#E5A93D",

  // Purple (Soft, muted)
  purple: "#9B8AFF",
  purpleLight: "#B4A7FF",
  purpleMuted: "rgba(155, 138, 255, 0.08)",

  // Blue (Calmer, deeper)
  blue: "#7B8CFF",
  blueLight: "#99A6FF",
  blueMuted: "rgba(123, 140, 255, 0.08)",

  // Red (Softer, less aggressive)
  red: "#F07070",
  redLight: "#F5A3A3",
  redMuted: "rgba(240, 112, 112, 0.08)",

  // Text — refined hierarchy
  textPrimary: "#EAEDF2",
  textSecondary: "#7A8394",
  textTertiary: "#4A5264",
  textMuted: "#2D3340",

  // Status
  success: "#2DD4A0",
  warning: "#E5A93D",
  error: "#F07070",
  info: "#7B8CFF",

  // Fortress Colors (refined, harmonious)
  fortressRecitation: "#2DD4A0",
  fortressListening: "#7B8CFF",
  fortressPreparation: "#E5A93D",
  fortressMemorization: "#F07070",
  fortressReview: "#9B8AFF",

  // Strength Colors (smoother gradient)
  strength1: "#F07070",
  strength2: "#E89555",
  strength3: "#E5A93D",
  strength4: "#7CC75C",
  strength5: "#2DD4A0",

  // Gradients — subtle, sophisticated
  gradientPrimary: ["#2DD4A0", "#1A9E77"] as [string, string],
  gradientGold: ["#E5A93D", "#C7892E"] as [string, string],
  gradientDark: ["#0F1218", "#07090F"] as [string, string],
  gradientCard: ["#151920", "#0F1218"] as [string, string],
  gradientSurface: ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"] as [
    string,
    string,
  ],
};

export const lightColors: typeof darkColors = {
  // Base
  background: "#F7F8FA",
  surface: "#FFFFFF",
  surfaceElevated: "#F0F1F4",
  card: "#FFFFFF",
  border: "rgba(0, 0, 0, 0.06)",
  borderLight: "rgba(0, 0, 0, 0.10)",

  // Glass
  glass: "#FFFFFF",
  glassBorder: "rgba(0, 0, 0, 0.08)",
  glassElevated: "#F0F1F4",

  // Primary
  primary: "#1A9E77",
  primaryLight: "#2DD4A0",
  primaryDark: "#148564",
  primaryMuted: "rgba(26, 158, 119, 0.08)",
  primarySubtle: "rgba(26, 158, 119, 0.04)",

  // Gold
  gold: "#C7892E",
  goldLight: "#E5A93D",
  goldMuted: "rgba(199, 137, 46, 0.08)",
  secondary: "#C7892E",

  // Purple
  purple: "#7C6BDB",
  purpleLight: "#9B8AFF",
  purpleMuted: "rgba(124, 107, 219, 0.08)",

  // Blue
  blue: "#5B6DD4",
  blueLight: "#7B8CFF",
  blueMuted: "rgba(91, 109, 212, 0.08)",

  // Red
  red: "#D85555",
  redLight: "#F07070",
  redMuted: "rgba(216, 85, 85, 0.08)",

  // Text
  textPrimary: "#1A1D24",
  textSecondary: "#5A6170",
  textTertiary: "#858C99",
  textMuted: "#B0B5C0",

  // Status
  success: "#1A9E77",
  warning: "#C7892E",
  error: "#D85555",
  info: "#5B6DD4",

  // Fortress Colors
  fortressRecitation: "#1A9E77",
  fortressListening: "#5B6DD4",
  fortressPreparation: "#C7892E",
  fortressMemorization: "#D85555",
  fortressReview: "#7C6BDB",

  // Strength Colors
  strength1: "#D85555",
  strength2: "#D08040",
  strength3: "#C7892E",
  strength4: "#60A840",
  strength5: "#1A9E77",

  // Gradients
  gradientPrimary: ["#2DD4A0", "#1A9E77"] as [string, string],
  gradientGold: ["#E5A93D", "#C7892E"] as [string, string],
  gradientDark: ["#F0F1F4", "#E5E7EC"] as [string, string],
  gradientCard: ["#FFFFFF", "#fefefeff"] as [string, string],
  gradientSurface: ["rgba(0,0,0,0.02)", "rgba(0,0,0,0.005)"] as [
    string,
    string,
  ],
};

export const useTheme = () => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isLight = themeMode === "light";
  return isLight ? lightColors : darkColors;
};

// Fallback for static style creation
export const Colors = darkColors;

export const Typography = {
  // Font families
  arabic: "Tajawal_700Bold",
  heading: "Tajawal_700Bold",
  body: "Tajawal_500Medium",
  quran: "Amiri_400Regular",

  // Font sizes — refined scale with more breathing room
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  "2xl": 30,
  "3xl": 36,
  "4xl": 44,
  "5xl": 54,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,

  // Font weights
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,

  // Letter spacing
  tight: -0.5,
  normal: 0,
  wide: 0.5,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  // Soft colored glow — very subtle
  emerald: {
    shadowColor: "#2DD4A0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  gold: {
    shadowColor: "#E5A93D",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
