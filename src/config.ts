export const THEMES = {
  // TODO add link colors per theme, etc
  light: {
    color: 'var(--color-dark)',
    backgroundColor: 'var(--color-light)',
  },
  dark: {
    color: 'var(--color-light)',
    backgroundColor: 'var(--color-dark)',
  },
};

export const DEFAULT_THEME = THEMES.light;

export const THEME_KEY = 'arbis_current_theme';

export const FOOTER_LINKS = [
  {
    text: 'Twitter',
    href: 'https://twitter.com/arbis_finance',
  },
  {
    text: 'Discord',
    href: 'https://discord.gg/VkCZUUKmKN',
  },
  {
    text: 'Github',
    href: 'https://github.com/Arbi-s',
  },
  {
    text: 'Analytics',
    href: 'https://curlyfries.xyz',
  },
  {
    text: 'Docs',
    href: 'https://arbisfinance.gitbook.io/food-court/',
  },
];
