import React from 'react';
import ThemeContext, { Themes } from './ThemeContext';

const { Provider } = ThemeContext;

type Props = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = React.useState<Themes>('light');

  return <Provider value={{ theme, setTheme }}>{children}</Provider>;
}
