
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  themeColor: "purple",
  setTheme: () => null,
  setThemeColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Define CSS variables for each theme color
const themeColorVariables = {
  default: {
    '--primary': '222.2 47.4% 11.2%',
    '--primary-foreground': '210 40% 98%',
  },
  blue: {
    '--primary': '221.2 83.2% 53.3%',
    '--primary-foreground': '210 40% 98%',
  },
  purple: {
    '--primary': '267.2 76.5% 58.2%',
    '--primary-foreground': '210 40% 98%',
  },
  green: {
    '--primary': '142.1 76.2% 36.3%',
    '--primary-foreground': '210 40% 98%',
  },
  orange: {
    '--primary': '24.6 95% 53.1%',
    '--primary-foreground': '210 40% 98%',
  },
  pink: {
    '--primary': '331.3 81.1% 60.4%',
    '--primary-foreground': '210 40% 98%',
  }
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = "purple",
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

  // Fetch default settings from Supabase on first load
  useEffect(() => {
    async function fetchDefaultSettings() {
      try {
        // Only fetch if user hasn't set their preferences yet
        if (!localStorage.getItem(storageKey) || !localStorage.getItem(colorKey)) {
          const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single();
          
          if (error) {
            if (error.code !== 'PGRST116') { // Not found is okay
              console.error("Error fetching theme settings:", error);
            }
            return;
          }
          
          if (data) {
            // If user hasn't set theme, use default from database
            if (!localStorage.getItem(storageKey) && data.default_theme) {
              setTheme(data.default_theme as Theme);
            }
            
            // If user hasn't set color, use default from database
            if (!localStorage.getItem(colorKey) && data.default_theme_color) {
              setThemeColor(data.default_theme_color as ThemeColor);
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchDefaultSettings:", error);
      }
    }
    
    fetchDefaultSettings();
  }, []);

  // Apply theme (light/dark)
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
  
  // Apply theme color
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply theme color CSS variables
    const colorVars = themeColorVariables[themeColor];
    if (colorVars) {
      Object.entries(colorVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
    
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
