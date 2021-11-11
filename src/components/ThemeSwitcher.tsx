import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

const THEME_KEY = 'arbis_current_theme';

export default function ThemeSwitcher() {
  const [appEl, setAppEl] = React.useState<HTMLDivElement | null>(null);

  const setEl = React.useCallback(() => {
    if (appEl === null && typeof document !== 'undefined') {
      const el = document.querySelector('#App') as HTMLDivElement;
      setAppEl(el);
      el.dataset.theme = Cookies.get(THEME_KEY) || 'light';
    }
  }, [appEl]);

  React.useEffect(() => {
    setEl();
  }, [setEl]);

  function handleThemeSwitch() {
    if (!appEl) {
      return;
    }

    if (appEl.dataset.theme === 'light') {
      appEl.dataset.theme = 'dark';
      Cookies.set(THEME_KEY, 'dark')
      return;
    }

    appEl.dataset.theme = 'light';
    Cookies.set(THEME_KEY, 'light')
  }

  if (!appEl) {
    return null;
  }

  return (
    <div className="flex">
      <div className="mr-2">
        {appEl.dataset.theme === 'light' ? (
          <FontAwesomeIcon icon={faSun} className="text-yellow-300" />
        ) : (
          <FontAwesomeIcon icon={faMoon} className="text-yellow-200" />
        )}
      </div>
      <div
        role="checkbox"
        aria-checked={appEl.dataset.theme === 'dark'}
        tabIndex={0}
        className={`bg-gray-300 shadow rounded-full flex w-16 ${
          appEl.dataset.theme === 'light' ? '' : 'justify-end bg-blue-300'
        }`}
        onClick={() => handleThemeSwitch()}
      >
        <div className="w-1/2 h-auto rounded-full bg-white" />
      </div>
    </div>
  );
}
