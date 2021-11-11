import React from 'react';
import Cookies from 'js-cookie';
import ThemeContext, { Themes } from '../contexts/ThemeContext';

const THEME_KEY = 'arbis_current_theme';

export default function useAppTheme(): [theme: Themes, setTheme: (_theme: Themes) => void] {
  const { theme, setTheme } = React.useContext(ThemeContext);
  const savedTheme = Cookies.get(THEME_KEY) as Themes;

  if (savedTheme && theme !== savedTheme) {
    setTheme(savedTheme);
  }

  function handleChange(_theme: Themes) {
    if (_theme !== theme) {
      setTheme(_theme);
      Cookies.set(THEME_KEY, _theme, { expires: 90 });
    }
  }

  return [theme, handleChange]
}
