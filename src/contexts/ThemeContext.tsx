import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName =
  | "romantic"
  | "darkElegant"
  | "minimalWhite"
  | "goldenAnniversary"
  | "galaxyLove";

export interface ThemeConfig {
  background: string;
  primaryText: string;
  secondaryText: string;
  accentGradient: string;
  cardBackground: string;
  glowColor: string;
  inputBackground: string;
  inputText: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;
  divider: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  romantic: {
    background: "bg-gradient-to-b from-pink-100 via-rose-50 to-pink-200",
    primaryText: "text-pink-800",
    secondaryText: "text-rose-700",
    accentGradient: "from-pink-500 via-rose-500 to-fuchsia-500",
    cardBackground: "bg-white/85 backdrop-blur-lg border border-pink-200/70",
    glowColor: "shadow-[0_0_35px_rgba(244,114,182,0.35)]",
    inputBackground: "bg-white/90 border-pink-200",
    inputText: "text-pink-900 placeholder:text-rose-400",
    buttonPrimary: "bg-pink-600 hover:bg-pink-700 text-white",
    buttonSecondary: "bg-rose-100 hover:bg-rose-200 text-rose-800",
    buttonDanger: "bg-rose-600 hover:bg-rose-700 text-white",
    divider: "border-pink-200/70",
  },
  darkElegant: {
    background: "bg-gradient-to-b from-neutral-950 via-neutral-900 to-slate-900",
    primaryText: "text-white",
    secondaryText: "text-neutral-300",
    accentGradient: "from-purple-500 via-fuchsia-500 to-pink-500",
    cardBackground: "bg-white/10 backdrop-blur-lg border border-white/20",
    glowColor: "shadow-[0_0_35px_rgba(168,85,247,0.35)]",
    inputBackground: "bg-black/30 border-white/20",
    inputText: "text-white placeholder:text-neutral-400",
    buttonPrimary: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white",
    buttonSecondary: "bg-white/10 hover:bg-white/20 text-white",
    buttonDanger: "bg-rose-700 hover:bg-rose-800 text-white",
    divider: "border-white/20",
  },
  minimalWhite: {
    background: "bg-gradient-to-b from-white via-rose-50 to-white",
    primaryText: "text-neutral-900",
    secondaryText: "text-neutral-600",
    accentGradient: "from-rose-400 via-pink-400 to-rose-500",
    cardBackground: "bg-white/90 backdrop-blur-sm border border-rose-100",
    glowColor: "shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    inputBackground: "bg-white border-rose-100",
    inputText: "text-neutral-900 placeholder:text-neutral-400",
    buttonPrimary: "bg-rose-500 hover:bg-rose-600 text-white",
    buttonSecondary: "bg-rose-100 hover:bg-rose-200 text-rose-800",
    buttonDanger: "bg-rose-600 hover:bg-rose-700 text-white",
    divider: "border-rose-100",
  },
  goldenAnniversary: {
    background: "bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-100",
    primaryText: "text-amber-900",
    secondaryText: "text-amber-700",
    accentGradient: "from-amber-400 via-yellow-500 to-orange-500",
    cardBackground: "bg-white/85 backdrop-blur-lg border border-amber-200/80",
    glowColor: "shadow-[0_0_35px_rgba(245,158,11,0.35)]",
    inputBackground: "bg-amber-50/80 border-amber-200",
    inputText: "text-amber-900 placeholder:text-amber-500",
    buttonPrimary: "bg-amber-600 hover:bg-amber-700 text-white",
    buttonSecondary: "bg-amber-100 hover:bg-amber-200 text-amber-900",
    buttonDanger: "bg-red-700 hover:bg-red-800 text-white",
    divider: "border-amber-300/60",
  },
  galaxyLove: {
    background: "bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-900",
    primaryText: "text-white",
    secondaryText: "text-indigo-200",
    accentGradient: "from-fuchsia-500 via-purple-500 to-pink-500",
    cardBackground: "bg-white/10 backdrop-blur-lg border border-fuchsia-400/20",
    glowColor: "shadow-[0_0_35px_rgba(217,70,239,0.4)]",
    inputBackground: "bg-black/30 border-fuchsia-400/20",
    inputText: "text-white placeholder:text-indigo-300/80",
    buttonPrimary: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white",
    buttonSecondary: "bg-indigo-500/20 hover:bg-indigo-400/30 text-indigo-100",
    buttonDanger: "bg-rose-700 hover:bg-rose-800 text-white",
    divider: "border-fuchsia-300/30",
  },
};

const THEME_STORAGE_KEY = "surprise_gift_theme";

function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && value in THEMES;
}

interface ThemeContextType {
  themeName: ThemeName;
  theme: ThemeConfig;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("romantic");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeName(storedTheme)) {
      setThemeName(storedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, [themeName]);

  const value = useMemo(
    () => ({
      themeName,
      theme: THEMES[themeName],
      setThemeName,
    }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}

export { isThemeName };
