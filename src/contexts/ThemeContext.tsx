import { useEffect, useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
type Theme = 'warm' | 'ocean';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('warm');
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') as Theme;
    if (savedTheme && (savedTheme === 'warm' || savedTheme === 'ocean')) {
      setTheme(savedTheme);
    }
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prev) => prev === 'warm' ? 'ocean' : 'warm');
  };
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme
      }}>
      
      {children}
    </ThemeContext.Provider>);

}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}