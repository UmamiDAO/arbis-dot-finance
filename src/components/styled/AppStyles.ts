import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;

  #App {
    flex: 1;
    background-color: ${props => props.theme.backgroundColor};
    color: ${props => props.theme.color};
  }
`;

export default AppContainer;
