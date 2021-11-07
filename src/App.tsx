import React from 'react';
import GlobalStyle from './components/styled/GlobalStyle'
import AppStyles from './components/styled/AppStyles'
import useAppTheme from './hooks/useAppTheme';

function App() {
  const [theme] = useAppTheme();

  return (
    <>
      <GlobalStyle />
      <AppStyles theme={theme}>
        <div id="App" data-theme={theme}>
          <h1 className="text-center text-6xl font-semibold">henlo</h1>
        </div>
      </AppStyles>
    </>
  );
}

export default App;
