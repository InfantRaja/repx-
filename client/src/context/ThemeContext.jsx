import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('repx_theme') || 'light';
  });

  const applyTheme = (currentTheme) => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (currentTheme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      // System default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
  };

  useEffect(() => {
    applyTheme(theme);

    // If system theme, listen to changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('repx_theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      setTheme: () => {},
    };
  }
  return context;
};

export default ThemeContext;
