import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, STORAGE_KEYS } from '../constants';

// Định nghĩa kiểu Theme dựa trên cấu trúc COLORS hiện tại
type Theme = typeof COLORS;

// Theme Sáng (Mặc định lấy từ constants)
const lightTheme = {
  ...COLORS,
  background: '#F5F7FA', // Màu nền sáng hiện đại hơn
  surface: '#FFFFFF',
};

// Theme Tối (Custom lại các màu nền và chữ)
const darkTheme: Theme = {
  ...COLORS,
  primary: '#64B5F6', // Sáng hơn một chút để nổi bật trên nền tối
  background: '#121212',
  surface: '#1E1E1E',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6E6E6E',
    hint: '#454545',
  },
  border: '#2C2C2C',
  divider: '#2C2C2C',
  lightBlue: '#1A2733', // Darker version of lightBlue
  lightOrange: '#332b20',
  lightGreen: '#1b3320',
  lightRed: '#332022',
};

type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME || '@theme');
      if (storedTheme === 'dark') {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME || '@theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);