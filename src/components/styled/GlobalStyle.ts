import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --color-dark: #212121;
    --color-light: #ffffff;
    --color-primary: #d8121b;
    --font-display: 'Barlow', serif;
    --font-body: 'Source Code Pro', monospace;
  }

  body {
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 800;
    text-transform: uppercase;
  }

  .wave {
    span {
      position: relative;
      display: inline-block;
      animation: animate 1s ease-in-out infinite;
      animation-delay: calc(.1s*var(--i))
    }
  }

  @keyframes animate {
    0% {
      transform: translateY(0px)
    }

    20% {
      transform: translateY(-16px)
    }

    40%, 100% {
      transform: translateY(0px)
    }
  }
`;

export default GlobalStyle;
