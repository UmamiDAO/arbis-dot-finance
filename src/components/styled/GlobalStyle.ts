import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --color-dark: #212121;
    --color-light: #ffffff;
    --color-primary: #d8121b;
    --font-display: 'Sanchez', serif;
  }

  body {
    font-family: var(--font-display);
  }

  .bg-dark {
    background-color: var(--color-dark);
  }

  .bg-light {
    background-color: var(--color-light);
  }

  .bg-primary {
    background-color: var(--color-primary);
  }

  .text-primary {
    color: var(--color-primary);
  }

  .text-light {
    color: var(--color-light);
  }

  .text-dark {
    color: var(--color-dark);
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
