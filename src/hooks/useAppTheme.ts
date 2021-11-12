import React from 'react';
import Cookies from 'js-cookie';

const THEME_KEY = 'arbis_current_theme';

type Theme = {
  color: string;
  backgroundColor: string;
};

type ThemeOptions = 'light' | 'dark';

export default function useAppTheme(): [
  theme: Theme,
  changeTheme: (_themeOption: ThemeOptions) => void
] {
  const savedTheme = Cookies.get(THEME_KEY) as ThemeOptions;

  const themes = React.useMemo<{ light: Theme; dark: Theme }>(
    () => ({
      light: {
        color: 'var(--color-dark)',
        backgroundColor: 'var(--color-light)',
      },
      dark: {
        color: 'var(--color-light)',
        backgroundColor: 'var(--color-dark)',
      },
    }),
    []
  );

  const [theme, setTheme] = React.useState<Theme>(themes[savedTheme || 'light']);

  const changeTheme = React.useCallback(
    (_themeOption: ThemeOptions) => {
      setTheme(themes[_themeOption]);
      Cookies.set(THEME_KEY, _themeOption);
    },
    [themes]
  );

  return [theme, changeTheme];
}
