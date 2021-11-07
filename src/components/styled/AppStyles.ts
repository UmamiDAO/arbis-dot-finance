import styled from 'styled-components';
import type { Themes } from '../../hooks/useAppTheme'

const AppStyles = styled.div<{ theme: Themes }>(
  ({ theme = 'light' }) => `
  color: var(--color-${theme === 'light' ? 'dark' : 'light'});
  background-color: var(--color-${theme});
`
);

export default AppStyles;
