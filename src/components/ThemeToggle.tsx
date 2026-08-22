import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'dayflow-theme';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const theme: Theme = isDark ? 'dark' : 'light';

    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, theme);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((current) => !current);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun
          className="h-5 w-5 text-amber-400"
          aria-hidden="true"
        />
      ) : (
        <Moon
          className="h-5 w-5 text-slate-600 dark:text-slate-300"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
