import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

type Props = {
  theme: 'light' | 'dark';
  changeTheme: () => void;
};

const ThemeSwitcherStyles = styled.aside`
  --spacing: 0.5rem;

  position: fixed;
  bottom: var(--spacing);
  right: var(--spacing);
`;

export default function ThemeSwitcher({ theme, changeTheme }: Props) {
  return (
    <ThemeSwitcherStyles>
      <div className="flex items-center">
        <div className="mr-2">
          {theme === 'light' ? (
            <FontAwesomeIcon icon={faSun} className="text-yellow-400" />
          ) : (
            <FontAwesomeIcon icon={faMoon} className="text-yellow-300" />
          )}
        </div>
        <div
          role="checkbox"
          aria-checked={theme === 'dark'}
          tabIndex={0}
          className={`p-1 border-gray-300 transition-all duration-500 hover:shadow cursor-pointer rounded-full flex w-12 ${
            theme === 'light' ? 'bg-gray-300' : 'justify-end bg-blue-500'
          }`}
          onClick={() => changeTheme()}
        >
          <div className="h-4 w-4 rounded-full bg-white" />
        </div>
      </div>
    </ThemeSwitcherStyles>
  );
}
