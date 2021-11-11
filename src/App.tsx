import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import GlobalStyle from './components/styled/GlobalStyle';
import AppContainer from './components/styled/AppContainer';
import Layout from './components/Layout';
import Home from './components/Home';
import useAppTheme from './hooks/useAppTheme';

function App() {
  const [theme] = useAppTheme();

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <div id="App" data-theme={theme}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
              </Route>
            </Routes>
          </HashRouter>
        </div>
      </AppContainer>
    </>
  );
}

export default App;
