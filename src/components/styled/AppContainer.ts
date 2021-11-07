import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;

  #App {
    flex: 1;

    &[data-theme="dark"] {
      background-color: var(--color-dark);
      color: var(--color-light);
    }

    &[data-theme="light"] {
      background-color: var(--color-light);
      color: var(--color-dark);
    }
  }
`;

export default AppContainer;
