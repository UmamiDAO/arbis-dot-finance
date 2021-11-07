import React from 'react';
import Cookies from 'js-cookie';

export type Themes = 'light' | 'dark';

const THEME_KEY = 'arbis_current_theme';

export default function useAppTheme() {
  const [currentTheme, setCurrentTheme] = React.useState<Themes>(
    (Cookies.get(THEME_KEY) as Themes) || 'light'
  );

  function handleThemeChange(_theme: Themes) {
    if (_theme !== currentTheme) {
      Cookies.set(THEME_KEY, _theme);
      setCurrentTheme(_theme);
    }

    return;
  }

  return [currentTheme, handleThemeChange];
}
