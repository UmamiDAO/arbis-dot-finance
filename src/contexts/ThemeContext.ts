import React from 'react';

export type Themes = 'light' | 'dark';

const initContext = {
  theme: 'light' as Themes,
  setTheme: (_theme: Themes) => {},
};

export type ThemeContextValue = typeof initContext;

export default React.createContext(initContext);
