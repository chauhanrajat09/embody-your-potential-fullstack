import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'oled';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // For SSR/initial load - return default
    if (typeof window === 'undefined') return 'light';
    
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    
    // If there's a saved theme, apply it immediately to prevent flash
    if (savedTheme) {
      document.documentElement.classList.remove('light', 'dark', 'oled');
      document.documentElement.classList.add(savedTheme);
    }
    
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('light', 'dark', 'oled');
    
    // Add the new theme class
    root.classList.add(theme);
    
    // Log for debugging
    console.log('Theme applied:', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 