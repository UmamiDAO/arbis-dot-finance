import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Cookies from 'js-cookie';
import GlobalStyle from './components/styled/GlobalStyle';
import AppStyles from './components/styled/AppStyles';
import GlobalProvider from './contexts/GlobalProvider';
import Layout from './components/Layout';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Farms from './components/Farms';
import ThemeSwitcher from './components/ThemeSwitcher';
import { THEMES, DEFAULT_THEME, THEME_KEY } from './config';

type Theme = typeof DEFAULT_THEME;
type ThemeOptions = 'light' | 'dark';

function App() {
  const savedThemeKey: string | undefined = Cookies.get(THEME_KEY);
  const initTheme = savedThemeKey ? THEMES[savedThemeKey as ThemeOptions] : DEFAULT_THEME;
  const [theme, setTheme] = React.useState<Theme>(initTheme);

  const getTheme = React.useCallback(() => {
    if (theme.color.includes('dark')) {
      return 'light';
    }
    return 'dark';
  }, [theme]);

  const changeTheme = React.useCallback(() => {
    const newThemeKey = getTheme() === 'light' ? 'dark' : 'light';
    setTheme(THEMES[newThemeKey]);
    Cookies.set(THEME_KEY, newThemeKey);
  }, [getTheme]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GlobalProvider>
        <AppStyles>
          <div id="App">
            <HashRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="farms">
                    <Route index element={<Farms />} />
                    <Route path=":farm" element={<Farms />} />
                  </Route>
                </Route>
              </Routes>
            </HashRouter>
            <ThemeSwitcher theme={getTheme()} changeTheme={changeTheme} />
          </div>
        </AppStyles>
      </GlobalProvider>
    </ThemeProvider>
  );
}

export default App;
