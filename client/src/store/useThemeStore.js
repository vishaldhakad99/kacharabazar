import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('kb_theme');
  if (saved) return saved === 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useThemeStore = create((set) => ({
  isDark: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const nextTheme = !state.isDark;
      localStorage.setItem('kb_theme', nextTheme ? 'dark' : 'light');
      if (nextTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDark: nextTheme };
    });
  },
  initTheme: () => {
    const isDark = getInitialTheme();
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDark });
  },
}));

export default useThemeStore;
