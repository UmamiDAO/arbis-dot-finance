import React from 'react';
import GlobalStyle from './components/styled/GlobalStyle';
import AppContainer from './components/styled/AppContainer';
import useAppTheme from './hooks/useAppTheme';

function App() {
  const [theme] = useAppTheme();

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <div id="App" data-theme={theme}>
          <h1 className="text-center text-6xl font-semibold">henlo</h1>
        </div>
      </AppContainer>
    </>
  );
}

export default App;
