
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ThemeColor = "blue" | "purple" | "green" | "orange" | "pink" | "default";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColor?: ThemeColor;
  storageKey?: string;
  colorKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  themeColor: "default",
  setTheme: () => null,
  setThemeColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = "default",
  storageKey = "bloghub-theme",
  colorKey = "bloghub-color",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [themeColor, setThemeColor] = useState<ThemeColor>(
    () => (localStorage.getItem(colorKey) as ThemeColor) || defaultColor
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      root.classList.add(systemTheme);
      
      // Add listener for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (theme === "system") {
          root.classList.remove("light", "dark");
          root.classList.add(mediaQuery.matches ? "dark" : "light");
        }
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme color classes
    root.classList.remove(
      "theme-blue", 
      "theme-purple", 
      "theme-green", 
      "theme-orange", 
      "theme-pink",
      "theme-default"
    );
    
    // Add the selected theme color class
    root.classList.add(`theme-${themeColor}`);
  }, [themeColor]);

  const value = {
    theme,
    themeColor,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setThemeColor: (color: ThemeColor) => {
      localStorage.setItem(colorKey, color);
      setThemeColor(color);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};
